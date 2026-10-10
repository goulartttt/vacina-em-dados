import type { Fonte } from "./fontes";

// Calendário Nacional de Vacinação do SUS, por fase da vida, transcrito da
// página do Ministério da Saúde (gov.br/saude/pt-br/vacinacao/calendario),
// conferida em 9 de outubro de 2026. Cada fase aponta para o calendário
// oficial dela. "Conforme o histórico" = depende das doses que a pessoa já
// tomou: quem confere é a equipe da UBS, com a caderneta.

export type Dose = { quando: string; vacinas: string[] };
export type Fase = { id: string; nome: string; faixa: string; fonte: Fonte; doses: Dose[] };

const pdf = (arquivo: string, nome: string): Fonte => ({
  id: `calendario-${arquivo}`,
  titulo: `Calendário Nacional de Vacinação: ${nome}`,
  orgao: "Ministério da Saúde",
  url: `https://www.gov.br/saude/pt-br/vacinacao/arquivos/calendario-nacional-de-vacinacao-${arquivo}`,
});

export const CALENDARIO: Fase[] = [
  {
    id: "crianca",
    nome: "Criança",
    faixa: "do nascimento aos 9 anos",
    fonte: pdf("crianca", "criança"),
    doses: [
      { quando: "Ao nascer", vacinas: ["Hepatite B (1 dose)", "BCG (dose única)"] },
      {
        quando: "2 meses",
        vacinas: ["Penta (1ª dose)", "Poliomielite inativada, VIP (1ª dose)", "Rotavírus humano (1ª dose)", "Pneumocócica 20-valente (1ª dose)"],
      },
      { quando: "3 meses", vacinas: ["Meningocócica C (1ª dose)"] },
      {
        quando: "4 meses",
        vacinas: ["Penta (2ª dose)", "Poliomielite inativada, VIP (2ª dose)", "Rotavírus humano (2ª dose)", "Pneumocócica 10-valente (2ª dose)"],
      },
      { quando: "5 meses", vacinas: ["Meningocócica C (2ª dose)"] },
      {
        quando: "6 meses",
        vacinas: ["Penta (3ª dose)", "Poliomielite inativada, VIP (3ª dose)", "Influenza trivalente (1ª dose)", "Covid-19 (1ª dose)"],
      },
      { quando: "6 a 8 meses", vacinas: ["Febre amarela (1 dose, só em casos excepcionais)"] },
      { quando: "7 meses", vacinas: ["Covid-19 (2ª dose)"] },
      { quando: "9 meses", vacinas: ["Covid-19 (3ª dose)", "Febre amarela (1ª dose)"] },
      {
        quando: "12 meses",
        vacinas: ["Pneumocócica 20-valente (reforço)", "Meningocócica ACWY (1 dose)", "Tríplice viral: sarampo, caxumba e rubéola (1ª dose)"],
      },
      {
        quando: "15 meses",
        vacinas: ["DTP (1º reforço)", "Poliomielite inativada, VIP (1º reforço)", "Tríplice viral (2ª dose)", "Varicela (1ª dose)", "Hepatite A (1 dose)"],
      },
      { quando: "4 anos", vacinas: ["DTP (2º reforço)", "Poliomielite inativada, VIP (2º reforço)", "Varicela (2ª dose)", "Febre amarela (reforço)"] },
      { quando: "5 anos", vacinas: ["Pneumocócica 20-valente (1 dose, só para povos indígenas sem histórico vacinal)"] },
      { quando: "9 anos", vacinas: ["HPV4 (1 dose)"] },
    ],
  },
  {
    id: "adolescente",
    nome: "Adolescente e jovem",
    faixa: "de 10 a 24 anos",
    fonte: pdf("adolescentes-jovens", "adolescentes e jovens"),
    doses: [
      {
        quando: "Conforme o histórico",
        vacinas: [
          "HPV4 (1 dose)",
          "Hepatite B (3 doses)",
          "Febre amarela (1 dose)",
          "Tríplice viral (2 doses)",
          "Varicela (2 doses, só trabalhadores da saúde e povos indígenas)",
          "Pneumocócica 20-valente (1 dose, só povos indígenas sem histórico vacinal)",
        ],
      },
      { quando: "10 anos", vacinas: ["Dengue (2 doses, com 3 meses entre elas)"] },
      { quando: "11 anos", vacinas: ["Meningocócica ACWY (1 dose)"] },
      { quando: "14 anos", vacinas: ["dT, dupla adulto (3º reforço)"] },
      { quando: "24 anos", vacinas: ["dT, dupla adulto (4º reforço)"] },
    ],
  },
  {
    id: "adulto",
    nome: "Adulto",
    faixa: "de 25 a 59 anos",
    fonte: pdf("adulto", "adulto"),
    doses: [
      {
        quando: "Conforme o histórico",
        vacinas: [
          "Hepatite B (3 doses)",
          "dT, dupla adulto (3 doses; reforço aos 34 anos e depois a cada 10 anos)",
          "Febre amarela (1 dose)",
          "Tríplice viral (2 doses até 29 anos; 1 dose de 30 a 59 anos; 2 doses para trabalhadores da saúde)",
          "Varicela (2 doses, só trabalhadores da saúde e povos indígenas)",
          "Pneumocócica 20-valente (1 dose, só povos indígenas sem histórico vacinal)",
        ],
      },
    ],
  },
  {
    id: "idoso",
    nome: "Idoso",
    faixa: "60 anos ou mais",
    fonte: pdf("idoso", "idoso"),
    doses: [
      { quando: "Todo ano", vacinas: ["Influenza (1 dose por ano)"] },
      { quando: "A cada 6 meses", vacinas: ["Covid-19 (1 dose)"] },
      {
        quando: "Conforme o histórico",
        vacinas: [
          "Hepatite B (3 doses)",
          "dT, dupla adulto (3 doses; reforço a cada 10 anos)",
          "Febre amarela (1 dose, só para quem nunca tomou e tem alto risco)",
          "Tríplice viral (2 doses, só trabalhadores da saúde)",
          "Varicela (2 doses, só trabalhadores da saúde e povos indígenas)",
          "Pneumocócica 20-valente (1 dose, para quem nunca tomou e está acamado ou vive em instituição, e povos indígenas)",
        ],
      },
    ],
  },
  {
    id: "gestante",
    nome: "Gestante",
    faixa: "durante a gravidez",
    fonte: pdf("gestante", "gestante"),
    doses: [
      {
        quando: "Ao saber da gravidez",
        vacinas: [
          "Hepatite B (3 doses, conforme o histórico)",
          "dT, dupla adulto (3 doses, conforme o histórico)",
          "Influenza (1 dose por temporada)",
          "Covid-19 (1 dose por gestação)",
          "Febre amarela (1 dose, só em casos excepcionais)",
        ],
      },
      { quando: "A partir da 20ª semana", vacinas: ["dTpa (1 dose por gestação)"] },
      { quando: "A partir da 28ª semana", vacinas: ["VSR, vírus sincicial respiratório (1 dose por gestação)"] },
    ],
  },
];
