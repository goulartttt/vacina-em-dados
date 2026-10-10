import "server-only";

import { cacheLife, cacheTag } from "next/cache";

// Leitura do Supabase pela API REST, só no servidor e só leitura (RLS).
// Os dados mudam no máximo uma vez por semana (rotina de coleta), então
// tudo fica em cache por dias e é regenerado em segundo plano.

export type Territorio = {
  id: number;
  tipo: "pais" | "uf" | "municipio";
  nome: string;
  uf_sigla: string | null;
  pai_id: number | null;
  slug: string;
};

export type PontoCobertura = {
  ano: number;
  doses: number;
  populacao: number | null;
  cobertura: number | null;
};

export type PontoCasos = { ano: number; casos: number; obitos: number | null };
export type PontoCasosMes = PontoCasos & { mes: number };

export type Atualizacao = {
  fonte: string;
  descricao: string;
  url: string;
  arquivo_atualizado_em: string | null;
  coletado_em: string;
};

import { BRASIL, DOENCA_SARAMPO, META_COBERTURA, VACINA_SARAMPO } from "./constantes";

export { BRASIL, DOENCA_SARAMPO, META_COBERTURA, VACINA_SARAMPO };

const PAGINA = 1000; // limite de linhas por resposta da API do Supabase

function config() {
  const url = process.env.SUPABASE_URL;
  const chave = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !chave) {
    throw new Error("Configure SUPABASE_URL e SUPABASE_PUBLISHABLE_KEY (veja .env.example).");
  }
  return { url, chave };
}

const TENTATIVAS = 3;
const espera = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Falhas passageiras (rede caiu, DNS não respondeu, banco ocupado com 5xx)
// ganham novas tentativas com espera crescente, em vez de derrubar a página.
// Erro 4xx é problema de consulta: falha na hora, sem insistir.
async function buscar(endereco: string, headers: Record<string, string>): Promise<Response> {
  for (let tentativa = 1; ; tentativa++) {
    try {
      const resposta = await fetch(endereco, { headers, signal: AbortSignal.timeout(20_000) });
      if (resposta.status < 500 || tentativa === TENTATIVAS) return resposta;
    } catch (erro) {
      if (tentativa === TENTATIVAS) throw erro;
    }
    await espera(500 * 2 ** (tentativa - 1));
  }
}

async function consultar<T>(tabela: string, filtros: Record<string, string>): Promise<T[]> {
  const { url, chave } = config();
  const parametros = new URLSearchParams(filtros).toString();
  const linhas: T[] = [];
  for (let inicio = 0; ; inicio += PAGINA) {
    const resposta = await buscar(`${url}/rest/v1/${tabela}?${parametros}`, {
      apikey: chave,
      Range: `${inicio}-${inicio + PAGINA - 1}`,
    });
    if (!resposta.ok) {
      throw new Error(`Falha ao ler ${tabela}: HTTP ${resposta.status}`);
    }
    const pagina = (await resposta.json()) as T[];
    linhas.push(...pagina);
    if (pagina.length < PAGINA) return linhas;
  }
}

function emCache(tag: string) {
  cacheLife("days");
  cacheTag("dados", tag);
}

export async function territorioPorSlug(slug: string): Promise<Territorio | null> {
  "use cache";
  emCache("territorios");
  const [t] = await consultar<Territorio>("territorios", { slug: `eq.${slug}`, select: "*" });
  return t ?? null;
}

export async function territorioPorId(id: number): Promise<Territorio | null> {
  "use cache";
  emCache("territorios");
  const [t] = await consultar<Territorio>("territorios", { id: `eq.${id}`, select: "*" });
  return t ?? null;
}

export async function estados(): Promise<Territorio[]> {
  "use cache";
  emCache("territorios");
  return consultar<Territorio>("territorios", { tipo: "eq.uf", select: "*", order: "nome" });
}

export async function municipios(): Promise<Territorio[]> {
  "use cache";
  emCache("territorios");
  return consultar<Territorio>("territorios", { tipo: "eq.municipio", select: "*", order: "id" });
}

export async function serieCobertura(territorioId: number, vacinaId = VACINA_SARAMPO): Promise<PontoCobertura[]> {
  "use cache";
  emCache("cobertura");
  return consultar<PontoCobertura>("cobertura_anual", {
    territorio_id: `eq.${territorioId}`,
    vacina_id: `eq.${vacinaId}`,
    select: "ano,doses,populacao,cobertura",
    order: "ano",
  });
}

/** Cobertura de um ano para todos os territórios de um tipo (mapa). */
export async function coberturaDoAno(ano: number, vacinaId = VACINA_SARAMPO): Promise<Map<number, number | null>> {
  "use cache";
  emCache("cobertura");
  const linhas = await consultar<{ territorio_id: number; cobertura: number | null }>("cobertura_anual", {
    ano: `eq.${ano}`,
    vacina_id: `eq.${vacinaId}`,
    select: "territorio_id,cobertura",
  });
  return new Map(linhas.map((l) => [l.territorio_id, l.cobertura]));
}

export async function serieCasos(territorioId: number, doencaId = DOENCA_SARAMPO): Promise<PontoCasos[]> {
  "use cache";
  emCache("casos");
  return consultar<PontoCasos>("casos_anual", {
    territorio_id: `eq.${territorioId}`,
    doenca_id: `eq.${doencaId}`,
    select: "ano,casos,obitos",
    order: "ano",
  });
}

export async function serieCasosMensal(territorioId: number, doencaId = DOENCA_SARAMPO): Promise<PontoCasosMes[]> {
  "use cache";
  emCache("casos");
  return consultar<PontoCasosMes>("casos_mensal", {
    territorio_id: `eq.${territorioId}`,
    doenca_id: `eq.${doencaId}`,
    select: "ano,mes,casos,obitos",
    order: "ano,mes",
  });
}

type LinhaCobertura = { territorio_id: number; ano: number; cobertura: number | null };
type LinhaCasos = { territorio_id: number; ano: number; casos: number };

// Os códigos do IBGE agrupam: Brasil = 1, estados < 100, e o município
// começa pelo código do estado (3550308 é de SP, 35). Por isso um intervalo
// de códigos traz "Brasil e estados" ou "municípios de um estado".
const BRASIL_E_ESTADOS = { territorio_id: "lt.100" };
const daUf = (uf: number) => ({ and: `(territorio_id.gte.${uf * 100000},territorio_id.lte.${uf * 100000 + 99999})` });

export async function coberturaBrasilEEstados(vacinaId = VACINA_SARAMPO): Promise<LinhaCobertura[]> {
  "use cache";
  emCache("cobertura");
  return consultar<LinhaCobertura>("cobertura_anual", { ...BRASIL_E_ESTADOS, vacina_id: `eq.${vacinaId}`, select: "territorio_id,ano,cobertura" });
}

export async function casosBrasilEEstados(doencaId = DOENCA_SARAMPO): Promise<LinhaCasos[]> {
  "use cache";
  emCache("casos");
  return consultar<LinhaCasos>("casos_anual", { ...BRASIL_E_ESTADOS, doenca_id: `eq.${doencaId}`, select: "territorio_id,ano,casos" });
}

export async function coberturaMunicipiosDaUf(uf: number, vacinaId = VACINA_SARAMPO): Promise<LinhaCobertura[]> {
  "use cache";
  emCache("cobertura");
  return consultar<LinhaCobertura>("cobertura_anual", { ...daUf(uf), vacina_id: `eq.${vacinaId}`, select: "territorio_id,ano,cobertura" });
}

export async function casosMunicipiosDaUf(uf: number, doencaId = DOENCA_SARAMPO): Promise<LinhaCasos[]> {
  "use cache";
  emCache("casos");
  return consultar<LinhaCasos>("casos_anual", { ...daUf(uf), doenca_id: `eq.${doencaId}`, select: "territorio_id,ano,casos" });
}

export type Ubs = {
  cnes: number;
  nome: string;
  endereco: string | null;
  bairro: string | null;
  cep: string | null;
  telefone: string | null;
  turno: string | null;
  latitude: number | null;
  longitude: number | null;
};

export async function ubsDoMunicipio(municipioId: number): Promise<Ubs[]> {
  "use cache";
  emCache("ubs");
  return consultar<Ubs>("ubs", {
    municipio_id: `eq.${municipioId}`,
    select: "cnes,nome,endereco,bairro,cep,telefone,turno,latitude,longitude",
    order: "nome",
  });
}

export async function atualizacoes(): Promise<Atualizacao[]> {
  "use cache";
  emCache("atualizacoes");
  return consultar<Atualizacao>("atualizacoes", { select: "*" });
}
