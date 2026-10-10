import type { Territorio } from "./dados";

// "no Pará", "na Bahia", "em São Paulo": a preposição certa de cada estado.
const PREPOSICAO_UF: Record<string, string> = {
  AC: "no", AL: "em", AP: "no", AM: "no", BA: "na", CE: "no", DF: "no", ES: "no", GO: "em", MA: "no", MT: "em",
  MS: "em", MG: "em", PA: "no", PB: "na", PR: "no", PE: "em", PI: "no", RJ: "no", RN: "no", RS: "no", RO: "em",
  RR: "em", SC: "em", SP: "em", SE: "em", TO: "no",
};

export function nomeCompleto(t: Territorio): string {
  return t.tipo === "municipio" ? `${t.nome} (${t.uf_sigla})` : t.nome;
}

/** "no Brasil", "no Pará", "em Campinas (SP)". */
export function noLugar(t: Territorio): string {
  if (t.tipo === "pais") return "no Brasil";
  if (t.tipo === "uf") return `${PREPOSICAO_UF[t.uf_sigla ?? ""] ?? "em"} ${t.nome}`;
  return `em ${nomeCompleto(t)}`;
}
