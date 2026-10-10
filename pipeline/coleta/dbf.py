"""Leitura de arquivos .dbf (dBase) usando só a biblioteca padrão."""

import struct
from collections.abc import Iterator
from dataclasses import dataclass


@dataclass(frozen=True)
class Campo:
    nome: str
    tipo: str
    tamanho: int


def ler_dbf(conteudo: bytes, encoding: str = "latin-1") -> tuple[list[Campo], Iterator[dict[str, str]]]:
    """Devolve as colunas e um iterador de linhas (valores como texto, sem espaços)."""
    total, header_len, record_len = struct.unpack("<IHH", conteudo[4:12])
    campos, pos = [], 32
    while conteudo[pos] != 0x0D:
        d = conteudo[pos:pos + 32]
        campos.append(Campo(d[:11].split(b"\0")[0].decode("ascii"), chr(d[11]), d[16]))
        pos += 32

    esperado = header_len + total * record_len
    if len(conteudo) < esperado:
        raise ValueError(f"arquivo incompleto: {len(conteudo)} bytes, esperado {esperado}")

    def linhas() -> Iterator[dict[str, str]]:
        for i in range(total):
            inicio = header_len + i * record_len
            registro = conteudo[inicio:inicio + record_len]
            if registro[0] == 0x2A:  # "*" marca linha apagada
                continue
            p, linha = 1, {}
            for c in campos:
                linha[c.nome] = registro[p:p + c.tamanho].decode(encoding).strip()
                p += c.tamanho
            yield linha

    return campos, linhas()
