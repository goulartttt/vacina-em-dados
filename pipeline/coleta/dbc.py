"""Leitura dos arquivos .dbc do DATASUS.

Um .dbc é um .dbf comprimido com o algoritmo "implode" da PKWARE:
  [cabeçalho do .dbf, sem compressão][4 bytes de CRC][dados comprimidos]

A descompressão é uma tradução para Python do blast.c de Mark Adler
(zlib/contrib/blast, licença zlib). Escrita aqui para evitar dependências:
as bibliotecas existentes são AGPL ou não têm versão para o Python atual.
"""

from functools import cache

_MAXBITS = 13

# Tabelas fixas do formato, copiadas do blast.c. Cada byte é compacto:
# 4 bits baixos = tamanho do código, 4 bits altos = repetições - 1.
_LITLEN = bytes([
    11, 124, 8, 7, 28, 7, 188, 13, 76, 4, 10, 8, 12, 10, 12, 10, 8, 23, 8,
    9, 7, 6, 7, 8, 7, 6, 55, 8, 23, 24, 12, 11, 7, 9, 11, 12, 6, 7, 22, 5,
    7, 24, 6, 11, 9, 6, 7, 22, 7, 11, 38, 7, 9, 8, 25, 11, 8, 11, 9, 12,
    8, 12, 5, 38, 5, 38, 5, 11, 7, 5, 6, 21, 6, 10, 53, 8, 7, 24, 10, 27,
    44, 253, 253, 253, 252, 252, 252, 13, 12, 45, 12, 45, 12, 61, 12, 45,
    44, 173,
])
_LENLEN = bytes([2, 35, 36, 53, 38, 23])
_DISTLEN = bytes([2, 20, 53, 230, 247, 151, 248])
_BASE = (3, 2, 4, 5, 6, 7, 8, 9, 10, 12, 16, 24, 40, 72, 136, 264)
_EXTRA = (0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8)


@cache
def _huffman(rep: bytes) -> dict[tuple[int, int], int]:
    """Monta a tabela {(tamanho, código): símbolo} de um código canônico."""
    lengths = []
    for b in rep:
        lengths += [b & 15] * ((b >> 4) + 1)
    count = [0] * (_MAXBITS + 1)
    for n in lengths:
        count[n] += 1
    tabela, code, symbol_order = {}, 0, sorted(
        (n, s) for s, n in enumerate(lengths) if n
    )
    # Códigos canônicos: em ordem de tamanho e, dentro dele, de símbolo.
    prev_len = 0
    for n, s in symbol_order:
        code <<= n - prev_len
        tabela[(n, code)] = s
        code += 1
        prev_len = n
    return tabela


class _Bits:
    """Lê bits do menos para o mais significativo de cada byte."""

    __slots__ = ("data", "pos", "buf", "cnt")

    def __init__(self, data: bytes, pos: int):
        self.data, self.pos, self.buf, self.cnt = data, pos, 0, 0

    def get(self, need: int) -> int:
        while self.cnt < need:
            if self.pos >= len(self.data):
                raise ValueError("dados comprimidos terminaram antes do fim")
            self.buf |= self.data[self.pos] << self.cnt
            self.pos += 1
            self.cnt += 8
        val = self.buf & ((1 << need) - 1)
        self.buf >>= need
        self.cnt -= need
        return val

    def decode(self, tabela: dict[tuple[int, int], int]) -> int:
        # O formato guarda os códigos com os bits invertidos.
        code = 0
        for n in range(1, _MAXBITS + 1):
            code = (code << 1) | (self.get(1) ^ 1)
            symbol = tabela.get((n, code))
            if symbol is not None:
                return symbol
        raise ValueError("código inválido nos dados comprimidos")


def explode(data: bytes, start: int = 0) -> bytes:
    """Descomprime um fluxo PKWARE "implode" a partir de data[start]."""
    lit_t, len_t, dist_t = (_huffman(t) for t in (_LITLEN, _LENLEN, _DISTLEN))
    bits = _Bits(data, start)
    lit = bits.get(8)
    if lit > 1:
        raise ValueError("cabeçalho de compressão inválido (literais)")
    dict_bits = bits.get(8)
    if not 4 <= dict_bits <= 6:
        raise ValueError("cabeçalho de compressão inválido (dicionário)")

    out = bytearray()
    while True:
        if bits.get(1):
            symbol = bits.decode(len_t)
            length = _BASE[symbol] + bits.get(_EXTRA[symbol])
            if length == 519:  # código de fim
                return bytes(out)
            shift = 2 if length == 2 else dict_bits
            dist = (bits.decode(dist_t) << shift) + bits.get(shift) + 1
            if dist > len(out):
                raise ValueError("referência antes do início dos dados")
            start_copy = len(out) - dist
            if dist >= length:
                out += out[start_copy:start_copy + length]
            else:  # cópia sobreposta: repete o trecho byte a byte
                for i in range(length):
                    out.append(out[start_copy + i])
        else:
            out.append(bits.decode(lit_t) if lit else bits.get(8))


def dbc_para_dbf(dbc: bytes) -> bytes:
    """Converte o conteúdo de um .dbc no .dbf equivalente."""
    header_len = int.from_bytes(dbc[8:10], "little")
    return dbc[:header_len] + explode(dbc, header_len + 4)
