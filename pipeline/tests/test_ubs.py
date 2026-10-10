import unittest
from datetime import date
from decimal import Decimal

from coleta.ubs import cep, coordenada, linhas_da_uf, montar, telefone

MUNICIPIOS = {"355030": 3550308}

OFICIAL = {"ibge": "355030", "bairro": "IGUATEMI", "logradouro": "RUA LUIZA", "cnes": "5576989",
           "uf": "35", "latitude": "-23,59687", "longitude": "-46,43922", "nome": "UBS JARDIM"}
ATIVO = {
    "codigo_cnes": 5576989, "nome_fantasia": "AMA 12H  JARDIM DAS LARANJEIRAS", "codigo_municipio": 355030,
    "endereco_estabelecimento": "RUA LUIZA DE JESUS FERREIRA", "numero_estabelecimento": "S/N",
    "bairro_estabelecimento": "IGUATEMI", "codigo_cep_estabelecimento": "08380048",
    "numero_telefone_estabelecimento": "(11) 5178-2988", "descricao_turno_atendimento": "ATENDIMENTOS NOS TURNOS DA MANHA E A TARDE",
    "latitude_estabelecimento_decimo_grau": -23.596877303229654, "longitude_estabelecimento_decimo_grau": -46.439221349429815,
    "endereco_email_estabelecimento": "nao@guardar.br", "data_atualizacao": "2026-02-27",
}


class TestLimpeza(unittest.TestCase):
    def test_telefone(self):
        self.assertEqual(telefone("(11) 5178-2988"), "1151782988")
        self.assertEqual(telefone("11 21418838"), "1121418838")
        self.assertEqual(telefone("011 98765-4321"), "11987654321")
        self.assertIsNone(telefone("5178-2988"))  # sem DDD
        self.assertIsNone(telefone("0800 123 4567"))
        self.assertIsNone(telefone(None))

    def test_cep(self):
        self.assertEqual(cep("08380-048"), "08380048")
        self.assertIsNone(cep("123"))

    def test_coordenada(self):
        self.assertEqual(coordenada("-8,21811", -34, 6), Decimal("-8.21811"))
        self.assertEqual(coordenada(-23.596877303229654, -34, 6), Decimal("-23.59688"))
        self.assertIsNone(coordenada(0, -34, 6))
        self.assertIsNone(coordenada("40,1", -34, 6))  # fora do Brasil
        self.assertIsNone(coordenada("abc", -34, 6))


class TestMontar(unittest.TestCase):
    def test_linha_completa_sem_email(self):
        linha = montar(35, OFICIAL, ATIVO, MUNICIPIOS)
        self.assertEqual(linha[:4], (5576989, 35, 3550308, "AMA 12H JARDIM DAS LARANJEIRAS"))
        self.assertEqual(linha[4], "RUA LUIZA DE JESUS FERREIRA, s/n")
        self.assertEqual(linha[7], "1151782988")
        self.assertEqual(linha[11], date(2026, 2, 27))
        self.assertNotIn("nao@guardar.br", linha)

    def test_municipio_desconhecido_fica_de_fora(self):
        self.assertIsNone(montar(35, OFICIAL, {**ATIVO, "codigo_municipio": 999999}, {}))

    def test_so_entra_quem_esta_na_lista_oficial(self):
        ativos = {5576989: ATIVO, 1: {**ATIVO, "codigo_cnes": 1}}
        linhas = linhas_da_uf(35, {5576989: OFICIAL}, ativos, MUNICIPIOS)
        self.assertEqual([l[0] for l in linhas], [5576989])


if __name__ == "__main__":
    unittest.main()
