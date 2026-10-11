import "server-only";

import { geoArea, geoConicEqualArea, geoPath } from "d3-geo";
import type { Feature, FeatureCollection, Geometry, Position } from "geojson";
import { cacheLife, cacheTag } from "next/cache";

import { LARGURA_MAPA, type Forma } from "./mapa-base";
import { buscar } from "./rede";

// Contornos oficiais do IBGE (qualidade mínima, já simplificados), desenhados
// em SVG no servidor: o navegador recebe só os caminhos prontos.

const API = "https://servicodados.ibge.gov.br/api/v3/malhas";

async function baixar(caminho: string): Promise<FeatureCollection> {
  "use cache";
  cacheLife("max");
  cacheTag("malhas");
  const resposta = await buscar(`${API}/${caminho}&qualidade=minima&formato=application/vnd.geo%2Bjson`);
  if (!resposta.ok) throw new Error(`Falha ao baixar malha do IBGE: HTTP ${resposta.status}`);
  return (await resposta.json()) as FeatureCollection;
}

// O d3-geo trabalha na esfera e espera o anel externo no sentido horário.
// O GeoJSON do IBGE segue a norma (anti-horário); sem inverter, cada estado
// viraria "o planeta inteiro menos o estado".
function corrigirSentido(feature: Feature<Geometry>): Feature<Geometry> {
  if (geoArea(feature) <= 2 * Math.PI) return feature;
  const inverter = (aneis: Position[][]) => aneis.map((anel) => [...anel].reverse());
  const g = feature.geometry;
  if (g.type === "Polygon") return { ...feature, geometry: { ...g, coordinates: inverter(g.coordinates) } };
  if (g.type === "MultiPolygon") return { ...feature, geometry: { ...g, coordinates: g.coordinates.map(inverter) } };
  return feature;
}

function desenhar(colecao: FeatureCollection): { formas: Forma[]; altura: number } {
  const features = colecao.features.map(corrigirSentido);
  const corrigida: FeatureCollection = { type: "FeatureCollection", features };
  // Cônica equivalente de Albers: preserva as áreas, o certo para mapa coroplético.
  const projecao = geoConicEqualArea().parallels([-2, -22]).rotate([54, 0]).fitWidth(LARGURA_MAPA, corrigida);
  const caminho = geoPath(projecao).digits(1);
  const [[, y0], [, y1]] = caminho.bounds(corrigida);
  return {
    altura: Math.ceil(y1 - y0 + 2),
    formas: features.map((f) => ({ id: Number(f.properties?.codarea), d: caminho(f) ?? "" })),
  };
}

export async function mapaEstados() {
  "use cache";
  cacheLife("max");
  return desenhar(await baixar("paises/BR?intrarregiao=UF"));
}

export async function mapaMunicipios(ufId: number) {
  "use cache";
  cacheLife("max");
  return desenhar(await baixar(`estados/${ufId}?intrarregiao=municipio`));
}
