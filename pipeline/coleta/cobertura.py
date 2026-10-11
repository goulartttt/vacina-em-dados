"""Cobertura vacinal oficial 1994–2016 (FTP do DATASUS, base do TabNet/PNI).

- CPNIBRaa.DBF: todos os municípios do Brasil num arquivo por ano.
- CPNIUFaa.DBF (até 2010): totais oficiais por estado, com população própria.
  De 2011 em diante o TabNet calcula o estado somando os municípios; fazemos igual.
- De 2017 em diante vale o TabNet (tabnet.py). Os arquivos de 2017 e 2018
  divergem do número oficial, provavelmente por serem anteriores aos
  registros atrasados (ex.: Brasil 2017, 90,85% no arquivo e 86,24% no
  TabNet); o de
  2019 parou em 20/05/2019. Até 2016, arquivo e TabNet batem município a
  município (conferido em 10/10/2026).

Regras de qualidade:
- Regiões administrativas do DF (códigos 537xxxx) somam em Brasília, que é
  o único município do DF para o IBGE.
- Se mais de 5% das doses de um total vêm de lugares sem população-alvo
  informada (comum na implantação de uma vacina), a cobertura fica em branco:
  dividir por uma população incompleta daria números absurdos (ex.: 6.692%).
"""

from collections import defaultdict
from dataclasses import dataclass, field
from datetime import datetime
from decimal import Decimal, InvalidOperation

from .dbf import ler_dbf
from .fontes import ftp_datasus

PASTA = "/dissemin/publicos/PNI/DADOS"
ANOS = range(1994, 2017)
ULTIMO_ANO_COM_ARQUIVO_UF = 2010
BRASIL = 1
BRASILIA = 5300108
PREFIXO_REGIOES_DF = "537"
LIMITE_SEM_POPULACAO = Decimal("0.05")
DUAS_CASAS = Decimal("0.01")
COLUNAS = ("territorio_id", "vacina_id", "ano", "doses", "populacao", "cobertura", "origem")


@dataclass
class Soma:
    doses: int = 0
    populacao: int = 0
    doses_sem_populacao: int = 0
    oficiais: list[Decimal | None] = field(default_factory=list)

    def somar(self, doses: int, populacao: int | None, oficial: Decimal | None = None) -> None:
        self.doses += doses
        self.populacao += populacao or 0
        self.doses_sem_populacao += 0 if populacao else doses
        self.oficiais.append(oficial)

    def cobertura(self) -> Decimal | None:
        if not self.populacao or (self.doses and Decimal(self.doses_sem_populacao) / self.doses > LIMITE_SEM_POPULACAO):
            return None
        # Uma linha só na fonte: usa o número publicado; várias: recalcula.
        oficial = self.oficiais[0] if len(self.oficiais) == 1 else None
        valor = oficial if oficial is not None else Decimal(self.doses) * 100 / self.populacao
        valor = valor.quantize(DUAS_CASAS)
        return valor if valor < 10000 else None  # limite da coluna numeric(6,2)

    def linha(self, territorio: int, vacina: str, ano: int) -> tuple:
        return (territorio, vacina, ano, self.doses, self.populacao or None, self.cobertura(), "oficial")


def _decimal(texto: str) -> Decimal | None:
    texto = texto.strip().replace(",", ".")
    if not texto:
        return None
    try:
        valor = Decimal("0" + texto if texto.startswith(".") else texto)
    except InvalidOperation:
        raise ValueError(f"número inválido: {texto!r}") from None
    if valor < 0:
        raise ValueError(f"número negativo: {texto!r}")
    return valor


def _inteiro(texto: str) -> int | None:
    valor = _decimal(texto)
    if valor is None:
        return None
    if valor != valor.to_integral_value():
        raise ValueError(f"esperava número inteiro: {texto!r}")
    return int(valor)


def _municipio(codigo: str, mapa: dict[str, int]) -> int | None:
    if codigo.startswith(PREFIXO_REGIOES_DF):
        return BRASILIA
    return mapa.get(codigo[:6])


def coletar(vacinas: dict[str, str], mapa_municipios: dict[str, int], ufs: set[int]) -> tuple[list[tuple], datetime | None]:
    """vacinas: {codigo_pni: vacina_id}. Devolve as linhas e a data mais
    recente dos arquivos na fonte."""
    linhas: list[tuple] = []
    datas: list[datetime] = []
    for ano in ANOS:
        aa = f"{ano % 100:02d}"
        conteudo, data = ftp_datasus(PASTA, f"CPNIBR{aa}.DBF")
        datas += [data] if data else []
        _, registros = ler_dbf(conteudo)

        municipios: dict[tuple[int, str], Soma] = defaultdict(Soma)
        estados: dict[tuple[int, str], Soma] = defaultdict(Soma)
        vistos: set[tuple[str, str]] = set()
        fora_do_ibge = 0
        for r in registros:
            vacina = vacinas.get(r["IMUNO"])
            if vacina is None:
                continue
            if int(r["ANO"]) != ano:
                raise ValueError(f"CPNIBR{aa}: linha do ano {r['ANO']}")
            if (r["MUNIC"], vacina) in vistos:
                raise ValueError(f"CPNIBR{aa}: município {r['MUNIC']} repetido para {vacina}")
            vistos.add((r["MUNIC"], vacina))

            doses = _inteiro(r["QT_DOSE"]) or 0
            populacao = _inteiro(r["POP"])
            oficial = _decimal(r["COBERT"]) if populacao else None
            estados[(int(r["MUNIC"][:2]), vacina)].somar(doses, populacao)
            municipio = _municipio(r["MUNIC"], mapa_municipios)
            if municipio is None:
                fora_do_ibge += 1  # entra só no total do estado
                continue
            municipios[(municipio, vacina)].somar(doses, populacao, oficial)

        if ano <= ULTIMO_ANO_COM_ARQUIVO_UF:
            estados, data_uf = _totais_oficiais_uf(aa, vacinas)
            datas += [data_uf] if data_uf else []

        brasil: dict[str, Soma] = defaultdict(Soma)
        for (uf, vacina), soma in sorted(estados.items()):
            if uf not in ufs:
                raise ValueError(f"CPNI{aa}: UF desconhecida {uf}")
            linhas.append(soma.linha(uf, vacina, ano))
            brasil[vacina].somar(soma.doses, soma.populacao)
        linhas += [soma.linha(m, v, ano) for (m, v), soma in sorted(municipios.items())]
        linhas += [soma.linha(BRASIL, v, ano) for v, soma in sorted(brasil.items())]

        resumo = ", ".join(f"{v} {s.cobertura()}%" for v, s in sorted(brasil.items())) or "nenhuma vacina"
        print(f"  {ano}: Brasil {resumo} | códigos fora do IBGE: {fora_do_ibge}")
    return linhas, max(datas, default=None)


def _totais_oficiais_uf(aa: str, vacinas: dict[str, str]) -> tuple[dict[tuple[int, str], Soma], datetime | None]:
    conteudo, data = ftp_datasus(PASTA, f"CPNIUF{aa}.DBF")
    _, registros = ler_dbf(conteudo)
    somas: dict[tuple[int, str], Soma] = {}
    for r in registros:
        vacina = vacinas.get(r["IMUNO"])
        if vacina is None:
            continue
        chave = (int(r["UF"]), vacina)
        if chave in somas:
            raise ValueError(f"CPNIUF{aa}: UF {chave[0]} repetida para {vacina}")
        populacao = _inteiro(r["POP"])
        somas[chave] = Soma()
        somas[chave].somar(_inteiro(r["QT_DOSE"]) or 0, populacao, _decimal(r["COBERT"]) if populacao else None)
    return somas, data
