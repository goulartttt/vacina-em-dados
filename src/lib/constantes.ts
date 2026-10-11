// Constantes que servem ao servidor e ao navegador.
export const BRASIL = 1;
export const VACINA_SARAMPO = "triplice_viral_d1";
export const VACINA_SARAMPO_D2 = "triplice_viral_d2";
export const DOENCA_SARAMPO = "sarampo";
/** Meta de cobertura do Ministério da Saúde para a tríplice viral. */
export const META_COBERTURA = 95;
/** Abaixo disto, a matriz de risco de sarampo e rubéola da OPAS soma o risco máximo. */
export const LIMITE_CRITICO = 80;

export type Situacao = "ok" | "alerta" | "critico" | "vazio";

export function situacao(cobertura: number | null | undefined): Situacao {
  if (cobertura == null) return "vazio";
  return cobertura >= META_COBERTURA ? "ok" : cobertura >= LIMITE_CRITICO ? "alerta" : "critico";
}

/** Nome, faixa e cores de cada situação (sempre com ícone e palavra). */
export const SITUACOES: Record<Situacao, { nome: string; plural: string; faixa: string; cor: string }> = {
  critico: { nome: "Crítico", plural: "críticos", faixa: "abaixo de 80%", cor: "var(--critico)" },
  alerta: { nome: "Alerta", plural: "em alerta", faixa: "de 80% a 94,9%", cor: "var(--alerta)" },
  ok: { nome: "Adequado", plural: "adequados", faixa: "95% ou mais", cor: "var(--ok)" },
  vazio: { nome: "Sem dado", plural: "sem dado", faixa: "sem número oficial", cor: "var(--vazio)" },
};

/** Faixas de casos no mapa (número de casos confirmados no ano, não taxa). */
export const FAIXAS_CASOS = [
  { ate: 0, rotulo: "Nenhum caso", cor: "var(--casos-0)" },
  { ate: 9, rotulo: "1 a 9", cor: "var(--casos-1)" },
  { ate: 99, rotulo: "10 a 99", cor: "var(--casos-2)" },
  { ate: 999, rotulo: "100 a 999", cor: "var(--casos-3)" },
  { ate: Infinity, rotulo: "1.000 ou mais", cor: "var(--casos-4)" },
] as const;

export const faixaCasos = (n: number) => FAIXAS_CASOS.findIndex((f) => n <= f.ate);
