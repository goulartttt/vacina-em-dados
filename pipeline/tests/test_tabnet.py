import unittest
from decimal import Decimal

from coleta.tabnet import _cobertura, ler_tabela

# Trecho real de uma resposta do TabNet (cobertura da tríplice viral D1).
RESPOSTA = """
        data.addColumn('string','Munic\xedpio');
        data.addColumn('number','2019');
        data.addColumn('number','2022');
        data.addColumn('number',' Total');
        data.addRows([
           [" Total" ,{v: 93.1182808204 ,f: '93,12'} ,{v: 80.7043866288 ,f: '80,70'} ,{v: 88.259190432 ,f: '88,26'} ]
         , ["110001 ALTA FLORESTA D\\'OESTE" ,{v: 136.440677966 ,f: '136,44'} ,{v: 123.123123123 ,f: '123,12'} ,{v: 119.2 ,f: '119,20'} ]
         , ["530010 BRASILIA" ,{v: 85.7094776521 ,f: '85,71'} ,{v: 0.0 ,f: '0,00'} ,{v: 85.03 ,f: '85,03'} ]
        ]);
"""


class TestTabnet(unittest.TestCase):
    def test_le_linhas_e_anos(self):
        tabela = ler_tabela(RESPOSTA)
        self.assertEqual(list(tabela), ["Total", "110001 ALTA FLORESTA D'OESTE", "530010 BRASILIA"])
        self.assertEqual(tabela["Total"], {2019: Decimal("93.1182808204"), 2022: Decimal("80.7043866288")})

    def test_cobertura_arredonda_e_zero_fica_em_branco(self):
        self.assertEqual(_cobertura(Decimal("93.1182808204")), Decimal("93.12"))
        self.assertIsNone(_cobertura(Decimal("0.0")))
        self.assertIsNone(_cobertura(None))

    def test_resposta_sem_tabela_falha(self):
        with self.assertRaises(ValueError):
            ler_tabela("<html>Erro na consulta</html>")


if __name__ == "__main__":
    unittest.main()
