"""UBS para "onde se vacinar": a lista oficial de unidades básicas de saúde,
completada com o cadastro de estabelecimentos (CNES).

Duas consultas à API de Dados Abertos do Ministério da Saúde:
1. a lista oficial de UBS, que inclui unidades já desativadas e não traz
   telefone nem número do endereço;
2. os estabelecimentos ativos dos tipos 1 (posto de saúde) e 2 (centro de
   saúde/unidade básica), estado por estado, com telefone, número e turno.
Vai para o site só quem está nas duas: UBS oficial e ativa.
"""

import itertools
import re
from datetime import date
from decimal import Decimal, InvalidOperation

from . import fontes

API = "https://apidadosabertos.saude.gov.br"
URL_LISTA = f"{API}/assistencia-a-saude/unidade-basicas-de-saude"
URL_CNES = f"{API}/cnes/estabelecimentos"
TIPOS = (1, 2)
LOTE_LISTA = 1000
LOTE_CNES = 20  # máximo aceito pela API do CNES
LIMITE_ITENS = 500_000  # trava contra laço infinito se a API mudar a paginação

COLUNAS = ("cnes", "uf_id", "municipio_id", "nome", "endereco", "bairro", "cep",
           "telefone", "turno", "latitude", "longitude", "atualizado_em")


def _paginas(url: str, chave: str, lote: int):
    """Percorre uma lista paginada (o offset da API conta itens, não páginas)."""
    for inicio in itertools.count(0, lote):
        if inicio > LIMITE_ITENS:
            raise RuntimeError(f"paginação sem fim em {url}")
        separador = "&" if "?" in url else "?"
        itens = fontes.json_https(f"{url}{separador}limit={lote}&offset={inicio}")[chave]
        yield from itens
        if len(itens) < lote:
            return


def lista_oficial() -> dict[int, dict]:
    return {int(u["cnes"]): u for u in _paginas(URL_LISTA, "ubs", LOTE_LISTA)}


def ativos_da_uf(uf: int) -> dict[int, dict]:
    ativos: dict[int, dict] = {}
    for tipo in TIPOS:
        url = f"{URL_CNES}?codigo_tipo_unidade={tipo}&codigo_uf={uf}&status=1"
        for e in _paginas(url, "estabelecimentos", LOTE_CNES):
            ativos[int(e["codigo_cnes"])] = e
    return ativos


# ---------------------------------------------------------------- limpeza
# Os dados vêm de fora: tudo é conferido antes de ir para o banco (que
# também confere, com "check").

def texto(valor: object, limite: int) -> str | None:
    if not isinstance(valor, str):
        return None
    limpo = " ".join(valor.split())
    return limpo[:limite] if limpo else None


def telefone(valor: object) -> str | None:
    """DDD + número, só dígitos (ex.: "(11) 5178-2988" -> "1151782988")."""
    if not isinstance(valor, str):
        return None
    digitos = re.sub(r"\D", "", valor)
    if len(digitos) in (11, 12) and digitos.startswith("0"):  # 0 de longa distância
        digitos = digitos[1:]
    if len(digitos) in (10, 11) and digitos[0] != "0" and digitos[1] != "0":
        return digitos
    return None


def cep(valor: object) -> str | None:
    digitos = re.sub(r"\D", "", str(valor or ""))
    return digitos if len(digitos) == 8 else None


def coordenada(valor: object, minimo: float, maximo: float) -> Decimal | None:
    """Aceita número ou texto com vírgula ("-8,21811"). Zero ou fora do
    Brasil vira vazio: é erro de cadastro, não localização."""
    if valor is None or valor == "":
        return None
    try:
        numero = Decimal(str(valor).replace(",", ".")).quantize(Decimal("0.00001"))
    except InvalidOperation:
        return None
    return numero if numero != 0 and minimo <= numero <= maximo else None


def _data(valor: object) -> date | None:
    try:
        return date.fromisoformat(str(valor)[:10])
    except ValueError:
        return None


def montar(uf: int, oficial: dict, ativo: dict, municipios: dict[str, int]) -> tuple | None:
    """Uma linha da tabela ubs, ou None se faltar o essencial."""
    municipio = municipios.get(str(ativo.get("codigo_municipio") or oficial.get("ibge") or "")[:6])
    nome = texto(ativo.get("nome_fantasia"), 160) or texto(oficial.get("nome"), 160)
    if municipio is None or nome is None or len(nome) < 2:
        return None
    logradouro = texto(ativo.get("endereco_estabelecimento"), 160) or texto(oficial.get("logradouro"), 160)
    numero = texto(ativo.get("numero_estabelecimento"), 20)
    if numero and numero.upper() in ("S/N", "SN", "0"):
        numero = "s/n"
    endereco = f"{logradouro}, {numero}" if logradouro and numero else logradouro
    lat = coordenada(ativo.get("latitude_estabelecimento_decimo_grau"), -34, 6) or coordenada(oficial.get("latitude"), -34, 6)
    lon = coordenada(ativo.get("longitude_estabelecimento_decimo_grau"), -75, -28) or coordenada(oficial.get("longitude"), -75, -28)
    if lat is None or lon is None:
        lat = lon = None
    return (
        int(ativo["codigo_cnes"]),
        uf,
        municipio,
        nome,
        endereco[:200] if endereco else None,
        texto(ativo.get("bairro_estabelecimento"), 100) or texto(oficial.get("bairro"), 100),
        cep(ativo.get("codigo_cep_estabelecimento")),
        telefone(ativo.get("numero_telefone_estabelecimento")),
        texto(ativo.get("descricao_turno_atendimento"), 120),
        lat,
        lon,
        _data(ativo.get("data_atualizacao")),
    )


def linhas_da_uf(uf: int, oficiais: dict[int, dict], ativos: dict[int, dict], municipios: dict[str, int]) -> list[tuple]:
    linhas = []
    for cnes, ativo in ativos.items():
        oficial = oficiais.get(cnes)
        if oficial is None:  # estabelecimento ativo, mas fora da lista oficial de UBS
            continue
        linha = montar(uf, oficial, ativo, municipios)
        if linha:
            linhas.append(linha)
    return linhas
