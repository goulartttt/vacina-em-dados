"""Download das fontes oficiais, com cache local em pipeline/dados/."""

import ftplib
import gzip
import json
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

CACHE = Path(__file__).resolve().parent.parent / "dados"
FTP_DATASUS = "ftp.datasus.gov.br"
TIMEOUT = 120


class ArquivoNaoEncontrado(Exception):
    pass


def ftp_datasus(pasta: str, nome: str, usar_cache: bool = True) -> tuple[bytes, datetime | None]:
    """Baixa um arquivo do FTP do DATASUS. Procura o nome sem diferenciar
    maiúsculas (o FTP mistura .DBF e .dbf). Devolve o conteúdo e a data do
    arquivo na fonte."""
    with ftplib.FTP(FTP_DATASUS, timeout=TIMEOUT) as ftp:
        ftp.login()
        ftp.cwd(pasta)
        reais = {n.upper(): n for n in ftp.nlst()}
        if nome.upper() not in reais:
            raise ArquivoNaoEncontrado(f"{pasta}/{nome}")
        real = reais[nome.upper()]
        data = _data_ftp(ftp, real)
        # A data no nome do cache faz um arquivo republicado ser baixado de novo.
        versao = f"{data:%Y%m%d%H%M%S}_" if data else ""
        destino = CACHE / pasta.strip("/").replace("/", "_") / f"{versao}{nome.upper()}"
        if usar_cache and destino.exists():
            return destino.read_bytes(), data
        partes: list[bytes] = []
        ftp.retrbinary(f"RETR {real}", partes.append)
    conteudo = b"".join(partes)
    destino.parent.mkdir(parents=True, exist_ok=True)
    destino.write_bytes(conteudo)
    return conteudo, data


def ftp_listar(pasta: str) -> list[str]:
    with ftplib.FTP(FTP_DATASUS, timeout=TIMEOUT) as ftp:
        ftp.login()
        ftp.cwd(pasta)
        return ftp.nlst()


def _data_ftp(ftp: ftplib.FTP, nome: str) -> datetime | None:
    try:
        resposta = ftp.sendcmd(f"MDTM {nome}")  # "213 AAAAMMDDhhmmss"
        return datetime.strptime(resposta.split()[1][:14], "%Y%m%d%H%M%S").replace(tzinfo=timezone.utc)
    except (ftplib.error_perm, ValueError, IndexError):
        return None


def json_https(url: str) -> object:
    if not url.startswith("https://"):
        raise ValueError("só aceitamos fontes via HTTPS")
    with urllib.request.urlopen(url, timeout=TIMEOUT) as resposta:
        corpo = resposta.read()
    if corpo[:2] == b"\x1f\x8b":  # o IBGE responde em gzip mesmo sem pedirmos
        corpo = gzip.decompress(corpo)
    return json.loads(corpo)
