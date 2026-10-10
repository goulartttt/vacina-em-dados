import unittest
from decimal import Decimal

from coleta.cobertura import BRASILIA, Soma, _decimal, _municipio


class TestCobertura(unittest.TestCase):
    def test_numeros_nos_formatos_do_datasus(self):
        self.assertEqual(_decimal("24,05"), Decimal("24.05"))
        self.assertEqual(_decimal(",01"), Decimal("0.01"))
        self.assertEqual(_decimal("114.1700"), Decimal("114.1700"))
        self.assertIsNone(_decimal(""))
        with self.assertRaises(ValueError):
            _decimal("-3")

    def test_usa_numero_oficial_quando_ha_uma_linha(self):
        s = Soma()
        s.somar(155008, 167268, Decimal("92.67"))
        self.assertEqual(s.cobertura(), Decimal("92.67"))

    def test_recalcula_quando_soma_varias_linhas(self):
        s = Soma()
        s.somar(50, 100, Decimal("50"))
        s.somar(30, 100, Decimal("30"))
        self.assertEqual(s.cobertura(), Decimal("40.00"))

    def test_populacao_incompleta_deixa_cobertura_em_branco(self):
        s = Soma()
        s.somar(2_600_000, None)  # doses sem população-alvo (caso de 1999)
        s.somar(30_000, 39_189)
        self.assertIsNone(s.cobertura())
        self.assertEqual(s.doses, 2_630_000)  # as doses continuam guardadas

    def test_regioes_administrativas_do_df_viram_brasilia(self):
        self.assertEqual(_municipio("5370001", {}), BRASILIA)
        self.assertEqual(_municipio("3550308", {"355030": 3550308}), 3550308)
        self.assertIsNone(_municipio("999999", {}))


if __name__ == "__main__":
    unittest.main()
