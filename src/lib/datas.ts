import type { Atualizacao } from "./dados";
import type { Anos } from "./painel";

/**
 * O último ano de casos é parcial quando o arquivo do SINAN foi atualizado
 * nesse mesmo ano (o ano ainda não acabou na fonte). Usa a data da fonte,
 * não o relógio, para a página estática dar sempre o mesmo resultado.
 */
export function anoParcial(fontes: Atualizacao[], anos: Anos): number | null {
  const sinan = fontes.find((f) => f.fonte === "sinan_sarampo");
  const data = sinan?.arquivo_atualizado_em ?? sinan?.coletado_em;
  if (!data) return null;
  return new Date(data).getUTCFullYear() <= anos.casos[1] ? anos.casos[1] : null;
}
