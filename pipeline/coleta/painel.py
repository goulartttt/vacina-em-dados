"""Cobertura vacinal oficial de 2023 em diante, pelo painel do Ministério da Saúde.

De 2023 em diante o Ministério publica a cobertura só em painéis (Qlik). O
leitor (painel.mjs) abre a página pública num Chrome sem janela e devolve
doses e população por ano, vacina e lugar; aqui os dados são conferidos e
viram linhas da tabela.

- Painel "por ocorrência" (onde a vacina foi aplicada), a mesma base da série
  de 1994 a 2022. O painel "por residência" dá o mesmo total do Brasil, mas
  divide as cidades de outro jeito e quebraria a série.
- O próprio Ministério põe o 2022 do TabNet e o 2023 do painel lado a lado
  (infoms.saude.gov.br/content/Default/Tabela_comparativa_CV_2022_2023.pdf).
- Só entram anos fechados: no ano em andamento o painel usa a população
  proporcional aos meses, e os registros ainda estão chegando.
"""

import json
import re
import subprocess
from datetime import datetime
from decimal import Decimal
from pathlib import Path

URL = ("https://infoms.saude.gov.br/extensions/SEIDIGI_DEMAS_VACINACAO_CALENDARIO_NACIONAL_COBERTURA_OCORRENCIA/"
       "SEIDIGI_DEMAS_VACINACAO_CALENDARIO_NACIONAL_COBERTURA_OCORRENCIA.html")
LEITOR = Path(__file__).resolve().parent / "painel.mjs"
PRIMEIRO_ANO = 2023
# Nome de cada vacina no painel ("Referência Imunobiológico").
REFERENCIAS = {"triplice_viral_d1": "TRIPLICE_D1", "triplice_viral_d2": "TRIPLICE_D2"}
BRASIL = 1
DUAS_CASAS = Decimal("0.01")
TEMPO_MAXIMO = 900


def ler_painel(referencias: list[str]) -> dict:
    resultado = subprocess.run(["node", str(LEITOR), URL, *referencias], capture_output=True, timeout=TEMPO_MAXIMO, check=False)
    if resultado.returncode != 0:
        raise RuntimeError(f"leitor do painel falhou: {resultado.stderr.decode('utf-8', 'replace')[-500:]}")
    return json.loads(resultado.stdout)


def _inteiro(valor: object) -> int:
    if not isinstance(valor, (int, float)) or valor != valor or valor < 0 or valor != int(valor):
        raise ValueError(f"painel: número inválido {valor!r}")
    return int(valor)


def _cobertura(doses: int, populacao: int) -> Decimal | None:
    if not populacao:
        return None
    valor = (Decimal(doses) * 100 / populacao).quantize(DUAS_CASAS)
    return valor if valor < 10000 else None  # limite da coluna numeric(6,2)


def _linhas(bruto: list, nivel: str, ref_para_vacina: dict[str, str], anos: range) -> list[tuple[int, str, str, int, int]]:
    """(ano, código, vacina, doses, população) já conferidos."""
    formato = {"brasil": None, "uf": re.compile(r"\d{2}"), "municipio": re.compile(r"\d{6}")}[nivel]
    saida = []
    for linha in bruto:
        if len(linha) != (4 if formato is None else 5):
            raise ValueError(f"painel ({nivel}): linha com formato inesperado {linha!r}")
        ano_txt, *meio, doses, populacao = linha
        codigo, ref = (None, meio[0]) if formato is None else meio
        if not re.fullmatch(r"\d{4}", str(ano_txt)) or ref not in ref_para_vacina:
            raise ValueError(f"painel ({nivel}): ano ou vacina inesperados {linha!r}")
        if formato is not None and not formato.fullmatch(str(codigo)):
            raise ValueError(f"painel ({nivel}): código inválido {codigo!r}")
        ano = int(ano_txt)
        if ano in anos:
            saida.append((ano, codigo, ref_para_vacina[ref], _inteiro(doses), _inteiro(populacao)))
    return saida


def coletar(vacinas: dict[str, str], mapa_municipios: dict[str, int], ufs: set[int], ano_atual: int) -> tuple[list[tuple], datetime | None]:
    """vacinas: {codigo_pni: vacina_id}. Devolve linhas no formato de
    cobertura.COLUNAS e a data em que o painel foi atualizado."""
    ref_para_vacina = {REFERENCIAS[v]: v for v in vacinas.values() if v in REFERENCIAS}
    if not ref_para_vacina:
        return [], None
    anos = range(PRIMEIRO_ANO, ano_atual)
    dados = ler_painel(sorted(ref_para_vacina))
    brasil = _linhas(dados["brasil"], "brasil", ref_para_vacina, anos)
    estados = _linhas(dados["uf"], "uf", ref_para_vacina, anos)
    municipios = _linhas(dados["municipio"], "municipio", ref_para_vacina, anos)

    # Conferência: estados e municípios somam exatamente o total do Brasil.
    total = {(a, v): (d, p) for a, _, v, d, p in brasil}
    for nome, partes in (("estados", estados), ("municípios", municipios)):
        soma: dict[tuple[int, str], list[int]] = {}
        for a, _, v, d, p in partes:
            s = soma.setdefault((a, v), [0, 0])
            s[0] += d
            s[1] += p
        if {k: tuple(s) for k, s in soma.items()} != total:
            raise ValueError(f"painel: a soma dos {nome} não bate com o total do Brasil")

    linhas = [(BRASIL, v, a, d, p, _cobertura(d, p), "oficial") for a, _, v, d, p in brasil]
    for a, codigo, v, d, p in estados:
        if int(codigo) not in ufs:
            raise ValueError(f"painel: UF desconhecida {codigo}")
        linhas.append((int(codigo), v, a, d, p, _cobertura(d, p), "oficial"))
    vistos: set[tuple[int, str, int]] = set()
    fora_do_ibge = 0
    for a, codigo, v, d, p in municipios:
        municipio = mapa_municipios.get(codigo)
        if municipio is None:
            fora_do_ibge += 1  # entra só nos totais do estado e do Brasil
            continue
        if (municipio, v, a) in vistos:
            raise ValueError(f"painel: município {municipio} repetido em {a}")
        vistos.add((municipio, v, a))
        linhas.append((municipio, v, a, d, p, _cobertura(d, p), "oficial"))

    for a, _, v, d, p in sorted(brasil):
        print(f"  painel {v} {a}: Brasil {_cobertura(d, p)}% ({d:,} doses / {p:,} crianças)")
    print(f"  painel: {len(vistos)} linhas de municípios | códigos fora do IBGE: {fora_do_ibge}")
    recarregado = dados.get("recarregado")
    return linhas, datetime.fromisoformat(recarregado.replace("Z", "+00:00")) if recarregado else None
