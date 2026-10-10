import { FONTES, type Fonte } from "./fontes";

// Mitos e verdades. Cada resposta resume, em linguagem simples, a resposta
// oficial do Ministério da Saúde (perguntas frequentes sobre vacinação e
// página do sarampo). Conferido em 9 de outubro de 2026.

export type Mito = { id: string; mito: string; verdade: string; fonte: Fonte; sarampo?: boolean };

export const MITOS: Mito[] = [
  {
    id: "autismo",
    mito: "Vacinas causam autismo.",
    verdade:
      "Não causam. O estudo de 1998 que levantou essa suspeita tinha falhas graves e foi retirado pela própria revista que o publicou.",
    fonte: FONTES.msAutismo,
    sarampo: true,
  },
  {
    id: "doenca-leve",
    mito: "Sarampo é doença leve, de criança.",
    verdade:
      "Cerca de 1 em cada 20 crianças com sarampo tem pneumonia, a causa mais comum de morte pela doença em crianças pequenas.",
    fonte: FONTES.msSarampo,
    sarampo: true,
  },
  {
    id: "quase-erradicada",
    mito: "Se a doença quase não existe mais, não preciso me vacinar.",
    verdade:
      "Os vírus continuam circulando em outras partes do mundo e atravessam fronteiras. Por isso não dá para relaxar com a vacinação.",
    fonte: FONTES.msPerguntas,
    sarampo: true,
  },
  {
    id: "ja-teve",
    mito: "Quem já teve sarampo não precisa se vacinar.",
    verdade:
      "Precisa. A vacina do SUS também protege de outras doenças, como caxumba e rubéola (tríplice viral) e catapora (tetraviral).",
    fonte: FONTES.msPerguntas,
    sarampo: true,
  },
  {
    id: "higiene",
    mito: "Com higiene e saneamento, as doenças somem e a vacina deixa de ser necessária.",
    verdade:
      "Higiene e saneamento ajudam, mas não substituem a vacina. Se a vacinação parar, as doenças que ela previne voltam.",
    fonte: FONTES.msPerguntas,
  },
  {
    id: "varias-vacinas",
    mito: "Tomar várias vacinas no mesmo dia sobrecarrega a criança.",
    verdade:
      "Seguindo as recomendações, várias vacinas juntas não aumentam as reações. E ainda diminuem as idas ao posto e o número de picadas.",
    fonte: FONTES.msPerguntas,
  },
  {
    id: "resfriado",
    mito: "Quem está resfriado ou com rinite não pode se vacinar.",
    verdade: "Pode. A vacina só fica para depois em caso de doença aguda grave com febre.",
    fonte: FONTES.msPerguntas,
  },
  {
    id: "ovo",
    mito: "Quem tem alergia a ovo não pode tomar nenhuma vacina.",
    verdade:
      "Só quem tem alergia grave ao ovo, como reação anafilática, não deve tomar as vacinas que contêm ovo. Quem decide é o médico.",
    fonte: FONTES.msPerguntas,
  },
  {
    id: "mercurio",
    mito: "O mercúrio das vacinas faz mal à saúde.",
    verdade:
      "Não há evidência de risco na pequena quantidade de tiomersal, um conservante com mercúrio usado em algumas vacinas, principalmente em frascos de várias doses.",
    fonte: FONTES.msPerguntas,
  },
];
