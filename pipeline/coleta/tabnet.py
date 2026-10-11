"""Cobertura vacinal oficial 2017–2022 pelo TabNet do DATASUS.

O TabNet "Imunizações - Cobertura" é a versão mais recente da base do
Ministério e vai até 2022 (última atualização em maio de 2023). Os arquivos do FTP
(cobertura.py) ficam até 2016: os de 2017 e 2018 estão desatualizados. De
2023 em diante, o Ministério publica só em painéis.

- O formulário do TabNet já traz cada opção pronta (linha, coluna, medida e
  anos). A consulta envia essas opções exatamente como vêm na página, sem
  montar nem alterar nenhuma.
- O TabNet publica só a porcentagem: doses e população ficam em branco.
- Estado e Brasil vêm prontos da fonte (o TabNet soma os municípios, como
  fazemos de 2011 em diante).
- Cobertura 0 fica em branco: a fonte devolve 0 tanto para "nenhuma dose"
  quanto para "sem população-alvo", e as duas coisas não dá para separar.
"""

import html
import re
import urllib.parse
from decimal import Decimal

from . import fontes

BASE = "https://tabnet.datasus.gov.br/cgi/"
DEF = "bd_pni/cpnibr.def"
URL = f"{BASE}dhdat.exe?{DEF}"
ANOS = range(2017, 2023)
BRASIL = 1
BRASILIA = 5300108
PREFIXO_REGIOES_DF = "537"
DUAS_CASAS = Decimal("0.01")
CODIGO_UF = re.compile(r"\d{2}")
CODIGO_MUNICIPIO = re.compile(r"\d{6}")
TOTAL = "Total"


def _texto(conteudo: bytes) -> str:
    return conteudo.decode("latin-1")  # o TabNet responde em ISO-8859-1


def _opcao(pagina: str, padrao: str) -> str:
    """Valor de uma opção do formulário. Pode aparecer em mais de uma lista
    (ex.: "Ano" na linha e na coluna), mas sempre com o mesmo valor."""
    achadas = set(re.findall(r'<option value="(' + padrao + r')"', pagina, re.IGNORECASE))
    if len(achadas) != 1:
        raise ValueError(f"TabNet: esperava 1 opção para {padrao!r}, achei {len(achadas)}")
    return html.unescape(achadas.pop())


def _celula(texto: str) -> Decimal | None:
    m = re.fullmatch(r"\s*\{v:\s*([0-9.]+)\s*,f:\s*'[^']*'\s*\}\s*", texto)
    if m is None:
        if texto.strip() in ("", "null"):
            return None
        raise ValueError(f"TabNet: célula inesperada {texto!r}")
    return Decimal(m.group(1))


def ler_tabela(resposta: str) -> dict[str, dict[int, Decimal | None]]:
    """Lê a tabela que o TabNet desenha com o Google Charts:
    {rótulo da linha: {ano: valor}}."""
    colunas = re.findall(r"data\.addColumn\('(?:string|number)','([^']*)'\)", resposta)
    inicio = resposta.find("data.addRows([")
    if not colunas or inicio < 0:
        raise ValueError("TabNet: resposta sem tabela (a consulta pode ter falhado)")
    anos = [int(c) if c.strip().isdigit() else None for c in colunas[1:]]
    corpo = resposta[inicio:resposta.index("]);", inicio)]
    tabela: dict[str, dict[int, Decimal | None]] = {}
    for rotulo, resto in re.findall(r'\[\s*"((?:[^"\\]|\\.)*)"\s*,(.*?)\]\s*(?=,\s*\[|$)', corpo, re.DOTALL):
        celulas = re.findall(r"\{[^}]*\}|null", resto)
        if len(celulas) != len(anos):
            raise ValueError(f"TabNet: linha {rotulo!r} com {len(celulas)} células, esperava {len(anos)}")
        rotulo = rotulo.replace("\\'", "'").strip()
        if rotulo in tabela:
            raise ValueError(f"TabNet: linha repetida {rotulo!r}")
        tabela[rotulo] = {ano: _celula(c) for ano, c in zip(anos, celulas) if ano is not None}
    return tabela


def _consultar(pagina: str, linha: str, medida: str, anos: range) -> dict[str, dict[int, Decimal | None]]:
    campos = [("Linha", linha), ("Coluna", _opcao(pagina, r"Ano\|CO_ANO\|[^\"]*")), ("Incremento", medida)]
    campos += [("PAno", _opcao(pagina, rf"{ano}\|{ano}\|\d")) for ano in anos]
    # Filtros: todos em "todas as categorias" (Brasil inteiro).
    campos += [(nome, "TODAS_AS_CATEGORIAS__") for nome in re.findall(r'<SELECT[^>]*NAME="(S[^"]+)"', pagina, re.IGNORECASE)]
    campos += [("nomedef", DEF), ("grafico", "")]
    formulario = urllib.parse.urlencode(campos, encoding="latin-1").encode("ascii")
    return ler_tabela(_texto(fontes.https(f"{BASE}webtabx.exe?{DEF}", formulario, tentativas=5)))


def _cobertura(valor: Decimal | None) -> Decimal | None:
    if not valor:
        return None
    valor = valor.quantize(DUAS_CASAS)
    return valor if valor < 10000 else None  # limite da coluna numeric(6,2)


def atualizacao(pagina: str) -> str | None:
    """Ex.: "maio de 2023", do aviso "Última atualização dos dados" do TabNet."""
    m = re.search(r"ltima atualiza..o dos dados:\s*([a-zç]+ de \d{4})", pagina, re.IGNORECASE)
    return m.group(1).lower() if m else None


def coletar(vacinas: dict[str, str], mapa_municipios: dict[str, int], ufs: set[int], anos: range = ANOS) -> tuple[list[tuple], str | None]:
    """vacinas: {codigo_pni: vacina_id}. Devolve linhas no formato de
    cobertura.COLUNAS (doses e população em branco) e a data da última
    atualização informada pelo TabNet."""
    pagina = _texto(fontes.https(URL, tentativas=5))
    por_uf = _opcao(pagina, r"Unidade da Federa[^\"|]*\|CO_UF\|[^\"]*br_uf\.cnv")
    por_municipio = _opcao(pagina, r"Munic[^\"|]*\|CONCAT[^\"]*")
    linhas: list[tuple] = []
    for codigo, vacina in sorted(vacinas.items()):
        medida = _opcao(pagina, rf"[^\"]*FATO\.CO_IMUNO = '{codigo}' then NU_POPULACAO[^\"]*")
        estados = _consultar(pagina, por_uf, medida, anos)
        municipios = _consultar(pagina, por_municipio, medida, anos)
        if estados.get(TOTAL) != municipios.get(TOTAL):
            raise ValueError(f"TabNet {vacina}: total do Brasil diferente entre estados e municípios")

        linhas += [(BRASIL, vacina, ano, None, None, _cobertura(v), "oficial") for ano, v in estados[TOTAL].items()]
        for rotulo, valores in estados.items():
            if rotulo == TOTAL:
                continue
            uf = int(_codigo(rotulo, CODIGO_UF))
            if uf not in ufs:
                raise ValueError(f"TabNet: UF desconhecida {rotulo!r}")
            linhas += [(uf, vacina, ano, None, None, _cobertura(v), "oficial") for ano, v in valores.items()]

        vistos: set[int] = set()
        fora_do_ibge = 0
        for rotulo, valores in municipios.items():
            if rotulo == TOTAL:
                continue
            codigo_municipio = _codigo(rotulo, CODIGO_MUNICIPIO)
            municipio = BRASILIA if codigo_municipio.startswith(PREFIXO_REGIOES_DF) else mapa_municipios.get(codigo_municipio)
            if municipio is None:
                fora_do_ibge += 1
                continue
            if municipio in vistos:
                # Porcentagens não se somam: sem doses e população não dá para juntar.
                raise ValueError(f"TabNet: dois códigos para o município {municipio}")
            vistos.add(municipio)
            linhas += [(municipio, vacina, ano, None, None, _cobertura(v), "oficial") for ano, v in valores.items()]

        resumo = ", ".join(f"{ano} {_cobertura(v)}%" for ano, v in estados[TOTAL].items())
        print(f"  TabNet {vacina}: Brasil {resumo} | {len(vistos)} municípios | códigos fora do IBGE: {fora_do_ibge}")
    return linhas, atualizacao(pagina)


def _codigo(rotulo: str, formato: re.Pattern[str]) -> str:
    codigo = rotulo.split(" ", 1)[0]
    if not formato.fullmatch(codigo):
        raise ValueError(f"TabNet: linha sem código válido {rotulo!r}")
    return codigo
