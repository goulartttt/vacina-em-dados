"""Casos confirmados das doenças do SINAN (FTP do DATASUS).

Regras (iguais às do TabNet do Ministério):
- ano e mês = data dos primeiros sintomas (DT_SIN_PRI);
- município e UF = de residência (ID_MN_RESI / SG_UF);
- confirmado = classificação final do agravo (ex.: sarampo = CLASSI_FIN 1);
- óbito = evolução "óbito pelo agravo" (ex.: exantemáticas = EVOLUCAO 2).
Os arquivos são separados por ano de notificação; um caso com sintomas em
dezembro pode estar no arquivo do ano seguinte, por isso somamos todos.
"""

from collections import Counter
from dataclasses import dataclass
from datetime import datetime

from .dbc import dbc_para_dbf
from .dbf import ler_dbf
from .fontes import ArquivoNaoEncontrado, ftp_datasus

PASTAS = ("/dissemin/publicos/SINAN/DADOS/FINAIS", "/dissemin/publicos/SINAN/DADOS/PRELIM")
BRASIL = 1
COLUNAS_ANUAL = ("territorio_id", "doenca_id", "ano", "casos", "obitos")
COLUNAS_MENSAL = ("territorio_id", "doenca_id", "ano", "mes", "casos", "obitos")


@dataclass(frozen=True)
class Agravo:
    doenca_id: str
    prefixo: str           # nome do arquivo no FTP, ex.: EXAN
    classificacao: str     # valor de CLASSI_FIN que confirma a doença
    obito: str             # valor de EVOLUCAO para óbito pelo agravo
    primeiro_ano: int


SARAMPO = Agravo("sarampo", "EXAN", "1", "2", 2007)


def coletar(agravo: Agravo, mapa_municipios: dict[str, int], ufs: set[int], ultimo_ano: int) -> tuple[list[tuple], list[tuple], datetime | None]:
    casos: Counter = Counter()   # (territorio, ano, mes) -> casos
    obitos: Counter = Counter()
    datas: list[datetime] = []
    for ano_arquivo in range(agravo.primeiro_ano, ultimo_ano + 1):
        nome = f"{agravo.prefixo}BR{ano_arquivo % 100:02d}.dbc"
        conteudo, data = _baixar(nome)
        if conteudo is None:
            print(f"  {nome}: ainda não publicado")
            continue
        datas += [data] if data else []
        _, registros = ler_dbf(dbc_para_dbf(conteudo))
        confirmados = 0
        for r in registros:
            if r["CLASSI_FIN"] != agravo.classificacao:
                continue
            data_sintomas = r["DT_SIN_PRI"] or r["DT_NOTIFIC"]
            ano, mes = int(data_sintomas[:4]), int(data_sintomas[4:6])
            if not (agravo.primeiro_ano <= ano <= ultimo_ano and 1 <= mes <= 12):
                continue  # ano anterior à série (incompleto) ou data inválida
            confirmados += 1
            morreu = r["EVOLUCAO"] == agravo.obito
            for territorio in _territorios(r, mapa_municipios, ufs):
                casos[(territorio, ano, mes)] += 1
                obitos[(territorio, ano, mes)] += morreu
        print(f"  {nome}: {confirmados} confirmados")

    anual: Counter = Counter()
    anual_obitos: Counter = Counter()
    for (territorio, ano, _mes), n in casos.items():
        anual[(territorio, ano)] += n
        anual_obitos[(territorio, ano)] += obitos[(territorio, ano, _mes)]

    # Brasil e estados recebem linha mesmo com zero casos (gráfico sem buracos).
    # Município sem linha = zero casos.
    anos = range(agravo.primeiro_ano, ultimo_ano + 1)
    agregados = [BRASIL, *sorted(ufs)]
    linhas_anual = [
        (t, agravo.doenca_id, a, anual[(t, a)], anual_obitos[(t, a)])
        for (t, a) in sorted(set(anual) | {(t, a) for t in agregados for a in anos})
    ]
    linhas_mensal = [
        (t, agravo.doenca_id, a, m, casos[(t, a, m)], obitos[(t, a, m)])
        for t in agregados for a in anos for m in range(1, 13)
    ]
    for a in anos:
        print(f"  {agravo.doenca_id} {a}: {anual[(BRASIL, a)]} casos, {anual_obitos[(BRASIL, a)]} óbitos")
    return linhas_anual, linhas_mensal, max(datas, default=None)


def _baixar(nome: str):
    for pasta in PASTAS:  # a versão final, quando existe, vale mais que a preliminar
        try:
            return ftp_datasus(pasta, nome)
        except ArquivoNaoEncontrado:
            continue
    return None, None


def _territorios(r: dict[str, str], mapa_municipios: dict[str, int], ufs: set[int]) -> list[int]:
    territorios = [BRASIL]
    municipio = mapa_municipios.get(r["ID_MN_RESI"][:6])
    uf = int(r["SG_UF"]) if r["SG_UF"].isdigit() else None
    if municipio is not None:
        uf = municipio // 100000
        territorios.append(municipio)
    if uf in ufs:
        territorios.append(uf)
    return territorios
