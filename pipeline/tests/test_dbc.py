import unittest

from coleta.dbc import explode


class TestExplode(unittest.TestCase):
    def test_exemplo_do_formato(self):
        # Exemplo publicado no blast.c (Mark Adler).
        self.assertEqual(explode(bytes.fromhex("000482 24258f807f")), b"AIAIAIAIAIAIA")

    def test_cabecalho_invalido(self):
        with self.assertRaises(ValueError):
            explode(bytes([2, 4, 0]))


if __name__ == "__main__":
    unittest.main()
