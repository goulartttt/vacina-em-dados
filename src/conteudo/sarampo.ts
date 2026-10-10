import { FONTES } from "./fontes";

// Textos do sarampo, todos da página oficial do Ministério da Saúde
// (FONTES.msSarampo) e do Calendário Nacional de Vacinação.

export const SARAMPO = {
  resumo:
    "Uma doença infecciosa altamente contagiosa, que já foi uma das grandes causas de morte de crianças no mundo, e que a vacina evita.",
  transmissao: [
    "Pelo ar: quando a pessoa doente tosse, espirra, fala ou respira. Uma pessoa com sarampo pode transmitir a doença para até 90% das pessoas próximas que não estão protegidas.",
    "A transmissão pode acontecer desde 6 dias antes até 4 dias depois do aparecimento das manchas vermelhas no corpo, ou seja, antes mesmo de a pessoa saber que está doente.",
  ],
  sintomas:
    "Manchas vermelhas que começam na cabeça e descem pelo corpo, com febre alta (acima de 38,5 °C) e pelo menos um destes sinais: tosse seca, coriza, olhos irritados ou pequenas manchas brancas dentro da boca.",
  sintomasCurto:
    "Manchas vermelhas que começam na cabeça e descem pelo corpo, febre acima de 38,5 °C, tosse seca, coriza ou olhos irritados.",
  alerta:
    "Febre que continua depois do aparecimento das manchas, principalmente em crianças menores de 5 anos. Em caso de suspeita, procure uma unidade de saúde.",
  alertaCurto: "Febre que continua depois das manchas. Procure uma unidade de saúde.",
  prevencao: "Vacina tríplice viral, de graça no SUS: 1ª dose aos 12 meses e 2ª dose aos 15 meses.",
  complicacoes: [
    { risco: "cerca de 1 em cada 20 crianças", quadro: "Pneumonia, a causa mais comum de morte por sarampo em crianças pequenas" },
    { risco: "cerca de 1 em cada 10 crianças", quadro: "Infecção no ouvido, que pode deixar perda auditiva permanente" },
    { risco: "1 a 4 em cada 1.000 crianças", quadro: "Encefalite (inflamação do cérebro); cerca de 10% desses casos podem morrer" },
    { risco: "1 a 3 em cada 1.000 crianças", quadro: "Morte" },
  ],
  /** Quem deve ter a tríplice viral, segundo o Calendário Nacional de Vacinação. */
  doses: [
    { quem: "Bebês de 12 meses", dose: "1ª dose" },
    { quem: "Bebês de 15 meses", dose: "2ª dose" },
    { quem: "Até 29 anos", dose: "2 doses, conforme a caderneta" },
    { quem: "De 30 a 59 anos", dose: "1 dose" },
    { quem: "Trabalhador da saúde", dose: "2 doses, em qualquer idade" },
  ],
  gestantes: "Gestantes não tomam a vacina durante a gravidez; quem não estiver vacinada toma depois do parto.",
  fonte: FONTES.msSarampo,
};
