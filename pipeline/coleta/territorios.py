"""Brasil, estados e municípios a partir da API de localidades do IBGE."""

import re
import unicodedata

from .fontes import json_https

URL_UFS = "https://servicodados.ibge.gov.br/api/v1/localidades/estados"
URL_MUNICIPIOS = "https://servicodados.ibge.gov.br/api/v1/localidades/municipios?view=nivelado"
BRASIL = 1

COLUNAS = ("id", "tipo", "nome", "uf_sigla", "pai_id", "slug")


def slug(texto: str) -> str:
    sem_acento = unicodedata.normalize("NFKD", texto).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", sem_acento.lower()).strip("-")


def coletar() -> list[tuple]:
    ufs = json_https(URL_UFS)
    municipios = json_https(URL_MUNICIPIOS)
    if len(ufs) != 27 or len(municipios) < 5500:
        raise ValueError(f"resposta inesperada do IBGE: {len(ufs)} UFs, {len(municipios)} municípios")

    linhas = [(BRASIL, "pais", "Brasil", None, None, "brasil")]
    for uf in sorted(ufs, key=lambda u: u["id"]):
        linhas.append((uf["id"], "uf", uf["nome"], uf["sigla"], BRASIL, uf["sigla"].lower()))
    for m in sorted(municipios, key=lambda m: m["municipio-id"]):
        sigla = m["UF-sigla"]
        linhas.append((
            m["municipio-id"], "municipio", m["municipio-nome"], sigla, m["UF-id"],
            f"{slug(m['municipio-nome'])}-{sigla.lower()}",
        ))
    if len({l[5] for l in linhas}) != len(linhas):
        raise ValueError("slugs repetidos")
    return linhas
