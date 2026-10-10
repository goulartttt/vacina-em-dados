const inteiro = new Intl.NumberFormat("pt-BR");
const umaCasa = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const compacto = new Intl.NumberFormat("pt-BR", { notation: "compact", maximumFractionDigits: 1 });
const dataLonga = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long", year: "numeric", timeZone: "America/Sao_Paulo" });
const curta = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "America/Sao_Paulo" });

// 90,85 guardado em binário vira 90,8499...; arredondar pela representação
// decimal dá 90,9, como no número oficial.
const umaDecimal = (n: number) => Math.round(Number((n * 10).toPrecision(12))) / 10;

export const numero = (n: number) => inteiro.format(n);
export const porcentagem = (n: number) => `${umaCasa.format(umaDecimal(n))}%`;
export const decimal = (n: number) => umaCasa.format(umaDecimal(n));
export const numeroCompacto = (n: number) => compacto.format(n);
export const data = (iso: string) => dataLonga.format(new Date(iso));
export const dataCurta = (iso: string) => curta.format(new Date(iso));

/** Diferença em pontos percentuais, sem sinal (a seta diz a direção). */
export const pontos = (n: number) => {
  const v = Math.abs(umaDecimal(n));
  return `${umaCasa.format(v)} ${v === 1 ? "ponto" : "pontos"}`;
};

const normalizar = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
export { normalizar };

// Nomes do CNES vêm em maiúsculas ("UBS JARDIM DAS LARANJEIRAS"). Para ler
// melhor: só a primeira letra maiúscula, preservando siglas conhecidas.
const SIGLAS = new Set(["ubs", "usf", "esf", "psf", "ama", "cs", "ubsf", "caps", "upa", "ame", "nasf", "sus", "cais", "ciams", "smsa", "dsei", "pa", "ps", "csf", "cms", "ue", "ubsi"]);
const LIGACOES = new Set(["de", "da", "do", "das", "dos", "e", "em", "a", "o", "na", "no", "nas", "nos"]);
const ROMANO = /^(i{1,3}|iv|v|vi{1,3}|ix|x{1,3}|xi{1,3}|xiv|xv)$/i;

export function nomeProprio(texto: string): string {
  return texto
    .toLowerCase()
    .split(/(\s+|-|\/)/)
    .map((p, i) => {
      if (!/[a-zà-ú0-9]/i.test(p)) return p;
      if (SIGLAS.has(p) || ROMANO.test(p) || /\d/.test(p)) return p.toUpperCase();
      if (i > 0 && LIGACOES.has(p)) return p;
      return p.charAt(0).toUpperCase() + p.slice(1);
    })
    .join("");
}

/** "1151782988" -> "(11) 5178-2988". */
export function telefone(digitos: string): string {
  const ddd = digitos.slice(0, 2);
  const resto = digitos.slice(2);
  const corte = resto.length - 4;
  return `(${ddd}) ${resto.slice(0, corte)}-${resto.slice(corte)}`;
}
