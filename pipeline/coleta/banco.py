"""Conexão com o Postgres do Supabase como usuário "coleta" e gravação em lote."""

import os
from collections.abc import Iterable, Sequence
from datetime import datetime
from pathlib import Path

import psycopg
from psycopg import sql

RAIZ = Path(__file__).resolve().parent.parent.parent
CERTIFICADO_CA = Path(__file__).resolve().parent.parent / "supabase-ca.crt"


def _config(nome: str) -> str:
    """Lê do ambiente (GitHub Actions) ou do .env.local (computador local)."""
    if os.environ.get(nome):
        return os.environ[nome]
    env_local = RAIZ / ".env.local"
    if env_local.exists():
        for linha in env_local.read_text(encoding="utf-8").splitlines():
            chave, _, valor = linha.partition("=")
            if chave.strip() == nome and valor.strip():
                return valor.strip()
    raise RuntimeError(f"configuração ausente: {nome} (veja .env.example)")


def conectar() -> psycopg.Connection:
    # TLS sempre. Com o certificado do Supabase, também confere que o
    # servidor é mesmo o Supabase (protege contra intermediários).
    tls = {"sslmode": "verify-full", "sslrootcert": str(CERTIFICADO_CA)} if CERTIFICADO_CA.exists() else {"sslmode": "require"}
    return psycopg.connect(
        host=_config("COLETA_DB_HOST"),
        port=5432,  # pooler em modo sessão (aceita COPY)
        dbname="postgres",
        user=f"coleta.{_config('SUPABASE_PROJECT_REF')}",
        password=_config("COLETA_DB_PASSWORD"),
        application_name="vacina-em-dados-coleta",
        connect_timeout=30,
        # Cada "with conn.transaction()" vira uma transação de verdade
        # (BEGIN/COMMIT), e não uma sub-transação de uma transação aberta.
        autocommit=True,
        **tls,
    )


def ler(conn: psycopg.Connection, consulta: str) -> list[tuple]:
    with conn.cursor() as cur:
        cur.execute(consulta)
        return cur.fetchall()


def upsert(conn: psycopg.Connection, tabela: str, colunas: Sequence[str], chave: Sequence[str], linhas: Iterable[tuple]) -> int:
    """Insere ou atualiza pela chave (usado em territórios, que outras tabelas referenciam)."""
    linhas = list(linhas)
    atualizar = [c for c in colunas if c not in chave]
    comando = sql.SQL("insert into {t} ({c}) values ({v}) on conflict ({k}) do update set {s}").format(
        t=sql.Identifier("public", tabela),
        c=sql.SQL(", ").join(map(sql.Identifier, colunas)),
        v=sql.SQL(", ").join(sql.Placeholder() * len(colunas)),
        k=sql.SQL(", ").join(map(sql.Identifier, chave)),
        s=sql.SQL(", ").join(sql.SQL("{0} = excluded.{0}").format(sql.Identifier(c)) for c in atualizar),
    )
    with conn.transaction(), conn.cursor() as cur:
        cur.executemany(comando, linhas)
    return len(linhas)


def substituir(conn: psycopg.Connection, tabela: str, colunas: Sequence[str], filtro: dict[str, object], linhas: Iterable[tuple]) -> int:
    """Troca, numa transação só, todas as linhas que batem com o filtro
    (ex.: {"doenca_id": "sarampo"}). Quem lê o site nunca vê a troca pela
    metade: ou vê os dados antigos, ou os novos."""
    if not filtro:
        raise ValueError("filtro obrigatório para não apagar a tabela inteira")
    onde = sql.SQL(" and ").join(sql.SQL("{} = {}").format(sql.Identifier(c), sql.Placeholder()) for c in filtro)
    destino = sql.Identifier("public", tabela)
    temporaria = sql.Identifier(f"carga_{tabela}")
    lista = sql.SQL(", ").join(map(sql.Identifier, colunas))
    total = 0
    with conn.transaction(), conn.cursor() as cur:
        # O Postgres não aceita COPY direto em tabela com RLS. Então o COPY
        # (rápido) vai para uma tabela temporária, que some no fim da
        # transação, e o INSERT passa pelas regras de RLS normalmente.
        cur.execute(sql.SQL("create temp table {} (like {}) on commit drop").format(temporaria, destino))
        with cur.copy(sql.SQL("copy {} ({}) from stdin").format(temporaria, lista)) as cp:
            for linha in linhas:
                cp.write_row(linha)
                total += 1
        cur.execute(sql.SQL("delete from {} where {}").format(destino, onde), list(filtro.values()))
        cur.execute(sql.SQL("insert into {} ({c}) select {c} from {}").format(destino, temporaria, c=lista))
    return total


def registrar_atualizacao(conn: psycopg.Connection, fonte: str, descricao: str, url: str, arquivo_atualizado_em: datetime | None) -> None:
    upsert(
        conn, "atualizacoes",
        ("fonte", "descricao", "url", "arquivo_atualizado_em", "coletado_em"), ("fonte",),
        [(fonte, descricao, url, arquivo_atualizado_em, datetime.now().astimezone())],
    )
