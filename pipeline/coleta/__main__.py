"""Rotinas de coleta. Uso (dentro de pipeline/):

    python -m coleta territorios   # IBGE: Brasil, estados e municípios
    python -m coleta cobertura     # PNI 1994–2018
    python -m coleta sarampo       # SINAN: casos de sarampo
    python -m coleta ubs           # CNES: unidades básicas de saúde ativas
    python -m coleta tudo
"""

import sys
from datetime import date

from . import banco, cobertura, sinan, territorios, ubs

FTP = "ftp://ftp.datasus.gov.br"


def carregar_territorios(conn) -> None:
    linhas = territorios.coletar()
    n = banco.upsert(conn, "territorios", territorios.COLUNAS, ("id",), linhas)
    banco.registrar_atualizacao(conn, "ibge_localidades", "IBGE: lista de estados e municípios",
                                territorios.URL_MUNICIPIOS, None)
    print(f"territórios: {n}")


def _contexto(conn):
    # O DATASUS usa o código do município sem o dígito verificador (6 dígitos).
    mapa = {str(i)[:6]: i for (i,) in banco.ler(conn, "select id from public.territorios where tipo = 'municipio'")}
    ufs = {i for (i,) in banco.ler(conn, "select id from public.territorios where tipo = 'uf'")}
    if not mapa or len(ufs) != 27:
        raise RuntimeError("carregue os territórios antes (python -m coleta territorios)")
    return mapa, ufs


def carregar_cobertura(conn) -> None:
    mapa, ufs = _contexto(conn)
    vacinas = dict(banco.ler(conn, "select codigo_pni, id from public.vacinas"))
    linhas, data = cobertura.coletar(vacinas, mapa, ufs)
    for vacina in vacinas.values():
        n = banco.substituir(conn, "cobertura_anual", cobertura.COLUNAS,
                             {"vacina_id": vacina, "origem": "oficial"},
                             (l for l in linhas if l[1] == vacina))
        print(f"cobertura {vacina}: {n} linhas")
    banco.registrar_atualizacao(conn, "pni_cobertura_1994_2018",
                                "Ministério da Saúde, SI-PNI: cobertura vacinal 1994–2018 (base do TabNet)",
                                f"{FTP}{cobertura.PASTA}", data)


def carregar_agravo(conn, agravo: sinan.Agravo) -> None:
    mapa, ufs = _contexto(conn)
    anual, mensal, data = sinan.coletar(agravo, mapa, ufs, date.today().year)
    filtro = {"doenca_id": agravo.doenca_id}
    print(f"{agravo.doenca_id}: {banco.substituir(conn, 'casos_anual', sinan.COLUNAS_ANUAL, filtro, anual)} linhas anuais, "
          f"{banco.substituir(conn, 'casos_mensal', sinan.COLUNAS_MENSAL, filtro, mensal)} mensais")
    banco.registrar_atualizacao(conn, f"sinan_{agravo.doenca_id}",
                                f"Ministério da Saúde, SINAN: casos confirmados de {agravo.doenca_id}",
                                f"{FTP}/dissemin/publicos/SINAN/DADOS", data)


def carregar_ubs(conn) -> None:
    mapa, ufs = _contexto(conn)
    oficiais = ubs.lista_oficial()
    print(f"lista oficial de UBS: {len(oficiais)}")
    por_uf: dict[int, list[tuple]] = {}
    for uf in sorted(ufs):
        # Um estado por vez: se a API falhar no meio, os dados anteriores
        # daquele estado continuam no site, em vez de sumirem.
        try:
            ativos = ubs.ativos_da_uf(uf)
        except Exception as erro:  # noqa: BLE001 (registra e segue para o próximo estado)
            print(f"UBS da UF {uf}: falhou ({erro}); dados anteriores mantidos")
            continue
        linhas = ubs.linhas_da_uf(uf, oficiais, ativos, mapa)
        print(f"UBS da UF {uf}: {len(linhas)} ativas de {len(ativos)} estabelecimentos")
        if linhas:
            por_uf[uf] = linhas
    # Baixar tudo leva vários minutos, e o banco encerra conexões paradas.
    # Por isso a gravação usa uma conexão nova, aberta só agora.
    total = 0
    with banco.conectar() as nova:
        for uf, linhas in por_uf.items():
            total += banco.substituir(nova, "ubs", ubs.COLUNAS, {"uf_id": uf}, linhas)
        banco.registrar_atualizacao(nova, "cnes_ubs",
                                    "Ministério da Saúde, CNES: unidades básicas de saúde ativas",
                                    ubs.URL_LISTA, None)
    print(f"UBS ativas gravadas: {total}")


ROTINAS = {
    "territorios": carregar_territorios,
    "cobertura": carregar_cobertura,
    "sarampo": lambda conn: carregar_agravo(conn, sinan.SARAMPO),
    "ubs": carregar_ubs,
}


def main(argv: list[str]) -> None:
    pedido = argv[1] if len(argv) > 1 else ""
    if pedido not in (*ROTINAS, "tudo"):
        sys.exit(__doc__)
    with banco.conectar() as conn:
        for nome, rotina in ROTINAS.items():
            if pedido in (nome, "tudo"):
                print(f"== {nome}")
                rotina(conn)


if __name__ == "__main__":
    main(sys.argv)
