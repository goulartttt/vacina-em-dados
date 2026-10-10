import "server-only";

import {
  BRASIL,
  casosBrasilEEstados,
  casosMunicipiosDaUf,
  coberturaBrasilEEstados,
  coberturaMunicipiosDaUf,
  estados,
  municipios,
  serieCasos,
  serieCobertura,
  type Territorio,
} from "./dados";
import { mapaEstados, mapaMunicipios } from "./mapas";
import type { Anos, DadosRegioes, Serie } from "./painel";

// Monta, no servidor, os dados que o painel do navegador recebe.

/** Anos com dado: cobertura oficial do Brasil (sem anos em branco) e casos. */
export async function anosDoPainel(): Promise<Anos> {
  const [cob, cas] = await Promise.all([serieCobertura(BRASIL), serieCasos(BRASIL)]);
  const comDado = cob.filter((p) => p.cobertura !== null).map((p) => p.ano);
  const anosCasos = cas.map((p) => p.ano);
  return {
    cobertura: [Math.min(...comDado), Math.max(...comDado)],
    casos: [Math.min(...anosCasos), Math.max(...anosCasos)],
  };
}

function montarSeries(
  cob: { territorio_id: number; ano: number; cobertura: number | null }[],
  cas: { territorio_id: number; ano: number; casos: number }[],
  anos: Anos,
): Map<number, Serie> {
  const series = new Map<number, Serie>();
  const serie = (id: number) => {
    let s = series.get(id);
    if (!s) {
      s = {
        cob: Array(anos.cobertura[1] - anos.cobertura[0] + 1).fill(null),
        cas: Array(anos.casos[1] - anos.casos[0] + 1).fill(0),
      };
      series.set(id, s);
    }
    return s;
  };
  for (const l of cob) {
    if (l.ano >= anos.cobertura[0] && l.ano <= anos.cobertura[1]) serie(l.territorio_id).cob[l.ano - anos.cobertura[0]] = l.cobertura;
  }
  for (const l of cas) {
    if (l.ano >= anos.casos[0] && l.ano <= anos.casos[1]) serie(l.territorio_id).cas[l.ano - anos.casos[0]] = l.casos;
  }
  return series;
}

/** Séries do Brasil e de todos os estados. */
export async function seriesDoBrasil(anos: Anos) {
  const [cob, cas] = await Promise.all([coberturaBrasilEEstados(), casosBrasilEEstados()]);
  return montarSeries(cob, cas, anos);
}

/** Série de um território (município: cobertura e casos próprios). */
export async function serieDe(id: number, anos: Anos): Promise<Serie> {
  const [cob, cas] = await Promise.all([serieCobertura(id), serieCasos(id)]);
  const s = montarSeries(
    cob.map((p) => ({ territorio_id: id, ano: p.ano, cobertura: p.cobertura })),
    cas.map((p) => ({ territorio_id: id, ano: p.ano, casos: p.casos })),
    anos,
  ).get(id);
  return s ?? emBranco(anos);
}

function emBranco(anos: Anos): Serie {
  return {
    cob: Array(anos.cobertura[1] - anos.cobertura[0] + 1).fill(null),
    cas: Array(anos.casos[1] - anos.casos[0] + 1).fill(0),
  };
}

/** Mapa e séries dos 27 estados (página inicial). */
export async function regioesDoBrasil(anos: Anos): Promise<DadosRegioes> {
  const [series, ufs, malha] = await Promise.all([seriesDoBrasil(anos), estados(), mapaEstados()]);
  return {
    altura: malha.altura,
    formas: malha.formas.map((f) => [f.id, f.d]),
    regioes: ufs.map((u) => ({ id: u.id, nome: u.nome, href: `/estados/${u.slug}`, ...(series.get(u.id) ?? emBranco(anos)) })),
  };
}

/** Mapa e séries dos municípios de um estado (página do estado). */
export async function regioesDaUf(uf: Territorio, anos: Anos): Promise<DadosRegioes> {
  const [cob, cas, todos, malha] = await Promise.all([
    coberturaMunicipiosDaUf(uf.id),
    casosMunicipiosDaUf(uf.id),
    municipios(),
    mapaMunicipios(uf.id),
  ]);
  const series = montarSeries(cob, cas, anos);
  return {
    altura: malha.altura,
    formas: malha.formas.map((f) => [f.id, f.d]),
    regioes: todos
      .filter((m) => m.pai_id === uf.id)
      .map((m) => ({ id: m.id, nome: m.nome, href: `/municipios/${m.slug}`, ...(series.get(m.id) ?? emBranco(anos)) })),
  };
}
