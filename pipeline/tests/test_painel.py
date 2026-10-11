import unittest
from decimal import Decimal
from unittest import mock

from coleta import painel

VACINAS = {"021": "triplice_viral_d1"}
MAPA = {"110001": 1100015, "530010": 5300108}
UFS = {11, 53}

# Formato devolvido pelo leitor (painel.mjs): [ano, (código), referência, doses, população].
DADOS = {
    "recarregado": "2026-10-10T08:50:49.984Z",
    "brasil": [["2025", "TRIPLICE_D1", 150, 200], ["2026", "TRIPLICE_D1", 10, 20]],
    "uf": [["2025", "11", "TRIPLICE_D1", 50, 100], ["2025", "53", "TRIPLICE_D1", 100, 100], ["2026", "11", "TRIPLICE_D1", 10, 20]],
    "municipio": [
        ["2025", "110001", "TRIPLICE_D1", 45, 100],
        ["2025", "999999", "TRIPLICE_D1", 5, 0],  # código fora do IBGE: só nos totais
        ["2025", "530010", "TRIPLICE_D1", 100, 100],
        ["2026", "110001", "TRIPLICE_D1", 10, 20],
    ],
}


def coletar(dados):
    with mock.patch.object(painel, "ler_painel", return_value=dados):
        return painel.coletar(VACINAS, MAPA, UFS, ano_atual=2026)


class TestPainel(unittest.TestCase):
    def test_anos_fechados_brasil_estados_e_municipios(self):
        linhas, recarregado = coletar(DADOS)
        self.assertEqual(recarregado.year, 2026)
        self.assertEqual({l[2] for l in linhas}, {2025})  # 2026 ainda está em andamento
        por_lugar = {l[0]: l for l in linhas}
        self.assertEqual(por_lugar[1], (1, "triplice_viral_d1", 2025, 150, 200, Decimal("75.00"), "oficial"))
        self.assertEqual(por_lugar[1100015][5], Decimal("45.00"))
        self.assertEqual(por_lugar[5300108][5], Decimal("100.00"))
        self.assertNotIn(999999, por_lugar)

    def test_soma_que_nao_bate_com_o_brasil_falha(self):
        dados = {**DADOS, "uf": [["2025", "11", "TRIPLICE_D1", 50, 100]]}
        with self.assertRaises(ValueError):
            coletar(dados)

    def test_numero_invalido_falha(self):
        dados = {**DADOS, "brasil": [["2025", "TRIPLICE_D1", -1, 200]]}
        with self.assertRaises(ValueError):
            coletar(dados)

    def test_populacao_zero_deixa_cobertura_em_branco(self):
        self.assertIsNone(painel._cobertura(5, 0))


if __name__ == "__main__":
    unittest.main()
