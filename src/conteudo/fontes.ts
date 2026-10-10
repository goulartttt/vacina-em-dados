// Fontes oficiais citadas no site. Todo texto de saúde aponta para uma delas.
// Conferidas em 9 de outubro de 2026.

export type Fonte = { id: string; titulo: string; orgao: string; url: string };

export const FONTES = {
  msSarampo: {
    id: "msSarampo",
    titulo: "Sarampo",
    orgao: "Ministério da Saúde",
    url: "https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/s/sarampo",
  },
  msCalendario: {
    id: "msCalendario",
    titulo: "Calendário Nacional de Vacinação",
    orgao: "Ministério da Saúde",
    url: "https://www.gov.br/saude/pt-br/vacinacao/calendario",
  },
  msPerguntas: {
    id: "msPerguntas",
    titulo: "Perguntas frequentes sobre vacinação",
    orgao: "Ministério da Saúde",
    url: "https://www.gov.br/saude/pt-br/vacinacao/faq",
  },
  msAutismo: {
    id: "msAutismo",
    titulo: "Vacinas causam autismo?",
    orgao: "Ministério da Saúde",
    url: "https://www.gov.br/saude/pt-br/vacinacao/faq/vacinas/vacinas-causam-autismo",
  },
  opasReverificacao: {
    id: "opasReverificacao",
    titulo: "OPAS reverifica o Brasil como país livre do sarampo (12/11/2024)",
    orgao: "Organização Pan-Americana da Saúde",
    url: "https://www.paho.org/en/news/12-11-2024-paho-re-verifies-brazil-measles-free-country",
  },
  opasRisco: {
    id: "opasRisco",
    titulo: "Matriz da ferramenta de análise de risco de sarampo e rubéola",
    orgao: "Organização Pan-Americana da Saúde",
    url: "https://www.paho.org/pt/topicos/imunizacao/ferramenta-analise-risco-sarampo-e-rubeola",
  },
  datasusCobertura: {
    id: "datasusCobertura",
    titulo: "Nota técnica: Imunizações, cobertura desde 1994",
    orgao: "Ministério da Saúde, DATASUS",
    url: "http://tabnet.datasus.gov.br/cgi/pni/Imun_cobertura_desde_1994.pdf",
  },
  // Os arquivos ficam no FTP do DATASUS, que os navegadores não abrem mais;
  // o link aponta para a página oficial de transferência de arquivos.
  datasusPni: {
    id: "datasusPni",
    titulo: "Cobertura vacinal 1994–2019 (arquivos do SI-PNI)",
    orgao: "Ministério da Saúde, DATASUS",
    url: "https://datasus.saude.gov.br/transferencia-de-arquivos/",
  },
  datasusSinan: {
    id: "datasusSinan",
    titulo: "Notificações de doenças exantemáticas (SINAN)",
    orgao: "Ministério da Saúde, DATASUS",
    url: "https://datasus.saude.gov.br/transferencia-de-arquivos/",
  },
  cnes: {
    id: "cnes",
    titulo: "Unidades básicas de saúde e cadastro de estabelecimentos (CNES)",
    orgao: "Ministério da Saúde, API de Dados Abertos",
    url: "https://apidadosabertos.saude.gov.br/",
  },
  ibge: {
    id: "ibge",
    titulo: "Localidades e malhas territoriais",
    orgao: "IBGE",
    url: "https://servicodados.ibge.gov.br/api/docs",
  },
} satisfies Record<string, Fonte>;

export const AVISO_MEDICO =
  "As informações deste site são educativas e não substituem a orientação de um profissional de saúde.";
