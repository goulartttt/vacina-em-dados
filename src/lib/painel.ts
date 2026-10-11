// Tipos e contas do painel, usados no servidor e no navegador.
// As séries vão como listas alinhadas aos anos (compactas no envio):
// cob[i] é a cobertura de anos.cobertura[0] + i; cas[i], os casos de
// anos.casos[0] + i.

export type Serie = { cob: (number | null)[]; cas: number[] };
export type Anos = { cobertura: [number, number]; casos: [number, number] };
export type Regiao = Serie & { id: number; nome: string; href: string };
export type Malha = { altura: number; formas: [id: number, d: string][] };
export type DadosRegioes = Malha & { regioes: Regiao[] };
export type Modo = "vacinacao" | "casos";

export const listaAnos = ([inicio, fim]: [number, number]) => Array.from({ length: fim - inicio + 1 }, (_, i) => inicio + i);

export function coberturaEm(s: Serie, anos: Anos, ano: number): number | null {
  if (ano < anos.cobertura[0] || ano > anos.cobertura[1]) return null;
  return s.cob[ano - anos.cobertura[0]] ?? null;
}

export function casosEm(s: Serie, anos: Anos, ano: number): number | null {
  if (ano < anos.casos[0] || ano > anos.casos[1]) return null;
  return s.cas[ano - anos.casos[0]] ?? 0;
}

/** Diferença que, com uma casa decimal, vira 0,0 ponto: conta como "igual"
 *  (não faz sentido mostrar seta e cor de queda para 93,12% → 93,10%). */
export const praticamenteIgual = (diferenca: number) => Math.abs(diferenca) < 0.05;

export function casosNoPeriodo(s: Serie, anos: Anos, [inicio, fim]: [number, number]): number {
  let total = 0;
  for (let a = inicio; a <= fim; a++) total += casosEm(s, anos, a) ?? 0;
  return total;
}
