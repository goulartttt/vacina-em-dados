"""Download das fontes oficiais, com cache local em pipeline/dados/."""

import ftplib
import gzip
import json
import time
import urllib.error
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


def https(url: str, formulario: bytes | None = None, tentativas: int = 3) -> bytes:
    """Baixa (GET) ou envia um formulário (POST). Falhas de rede passageiras
    ganham novas tentativas, com espera crescente (os sites do governo oscilam)."""
    if not url.startswith("https://"):
        raise ValueError("só aceitamos fontes via HTTPS")
    cabecalhos = {"Content-Type": "application/x-www-form-urlencoded"} if formulario is not None else {}
    pedido = urllib.request.Request(url, data=formulario, headers=cabecalhos)
    for tentativa in range(1, tentativas + 1):
        try:
            with urllib.request.urlopen(pedido, timeout=TIMEOUT) as resposta:
                return resposta.read()
        except (urllib.error.URLError, TimeoutError, ConnectionError):
            if tentativa == tentativas:
                raise
            time.sleep(5 * tentativa)
    raise AssertionError("inalcançável")


def json_https(url: str) -> object:
    corpo = https(url)
    if corpo[:2] == b"\x1f\x8b":  # o IBGE responde em gzip mesmo sem pedirmos
        corpo = gzip.decompress(corpo)
    return json.loads(corpo)
