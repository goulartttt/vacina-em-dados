import { ImageResponse } from "next/og";

import { META_COBERTURA, situacao, type Situacao } from "./constantes";
import type { PontoCobertura } from "./dados";
import { porcentagem } from "./formato";

// Imagem de pré-visualização (WhatsApp, redes sociais): o número do último
// ano com a situação e a curva da cobertura com a faixa da meta.

export const TAMANHO = { width: 1200, height: 630 };

// A fonte dos títulos do site, em TTF (o formato que o gerador de imagens
// aceita), baixada uma vez no servidor. Se o Google Fonts falhar, a imagem
// sai com a fonte padrão em vez de quebrar o build.
type Peso = 600 | 800;
const FONTES = (async () => {
  const css = await (await fetch("https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@600;800")).text();
  // Cada @font-face traz o peso e o endereço; outras linhas podem aparecer
  // entre os dois (ex.: font-stretch), então lemos bloco por bloco.
  const arquivos = [...css.matchAll(/@font-face\s*{[^}]*?font-weight:\s*(\d+);[^}]*?src:\s*url\((.+?)\)/g)];
  return Promise.all(
    arquivos.map(async ([, peso, url]) => ({
      name: "Bricolage Grotesque",
      data: await (await fetch(url)).arrayBuffer(),
      weight: Number(peso) as Peso,
      style: "normal" as const,
    })),
  );
})().catch(() => []);

// Mesmas cores do site (globals.css).
const COR = {
  fundo: "#f5f8fc",
  folha: "#ffffff",
  tinta: "#172133",
  tinta2: "#3a475c",
  azul: "#2156d9",
  linha: "#dce4f0",
  okFundo: "#e3f5eb",
  ok: "#23a061",
};

const SELO: Record<Situacao, { texto: string; fundo: string; tinta: string }> = {
  ok: { texto: "Adequado: atingiu a meta de 95%", fundo: "#e3f5eb", tinta: "#11703e" },
  alerta: { texto: "Alerta: abaixo da meta de 95%", fundo: "#fff4d6", tinta: "#865300" },
  critico: { texto: "Crítico: abaixo de 80%", fundo: "#fde8ea", tinta: "#a51d31" },
  vazio: { texto: "Sem dado oficial", fundo: "#eef2f7", tinta: "#4f5d74" },
};

function curva(serie: PontoCobertura[], largura: number, altura: number) {
  const pontos = serie.filter((p) => p.cobertura !== null) as (PontoCobertura & { cobertura: number })[];
  if (pontos.length < 2) return { d: "", y95: altura / 2 };
  const anos = [pontos[0].ano, pontos[pontos.length - 1].ano];
  const menor = Math.min(60, ...pontos.map((p) => p.cobertura));
  const maior = Math.max(120, ...pontos.map((p) => p.cobertura));
  const x = (a: number) => ((a - anos[0]) / (anos[1] - anos[0])) * largura;
  const y = (v: number) => altura - ((v - menor) / (maior - menor)) * altura;
  return {
    d: pontos.map((p, i) => `${i ? "L" : "M"}${x(p.ano).toFixed(1)},${y(p.cobertura).toFixed(1)}`).join(""),
    y95: y(META_COBERTURA),
  };
}

export async function imagemDoLugar({ titulo, subtitulo, serie }: { titulo: string; subtitulo: string; serie: PontoCobertura[] }) {
  const ultimo = [...serie].reverse().find((p) => p.cobertura !== null);
  const valor = ultimo?.cobertura ?? null;
  const selo = SELO[situacao(valor)];
  const { d, y95 } = curva(serie, 520, 260);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: COR.fundo,
          padding: 64,
          color: COR.tinta,
          fontFamily: "Bricolage Grotesque",
          fontWeight: 600,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 30, fontWeight: 800 }}>
          <div style={{ display: "flex", width: 44, height: 44, borderRadius: 12, background: COR.azul }} />
          Vacina em Dados
        </div>
        <div style={{ display: "flex", flex: 1, marginTop: 28, gap: 48 }}>
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <div style={{ display: "flex", fontSize: titulo.length > 22 ? 58 : 72, fontWeight: 800, lineHeight: 1.02, letterSpacing: -2 }}>{titulo}</div>
            <div style={{ display: "flex", fontSize: 28, color: COR.tinta2, marginTop: 16 }}>{subtitulo}</div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 12, marginTop: "auto" }}>
              <div style={{ display: "flex", fontSize: 96, fontWeight: 800, letterSpacing: -3, lineHeight: 1 }}>{valor !== null ? porcentagem(valor) : "—"}</div>
              <div style={{ display: "flex", fontSize: 28, padding: "8px 18px", borderRadius: 999, background: selo.fundo, color: selo.tinta }}>{selo.texto}</div>
            </div>
            <div style={{ display: "flex", fontSize: 24, color: COR.tinta2, marginTop: 10 }}>
              Crianças de 1 ano vacinadas{ultimo ? ` em ${ultimo.ano}` : ""} · Ministério da Saúde
            </div>
          </div>
          <div style={{ display: "flex", width: 560, background: COR.folha, border: `2px solid ${COR.linha}`, borderRadius: 24, padding: 20 }}>
            <svg width="520" height="300" viewBox="0 -20 520 300">
              <rect x="0" y="-20" width="520" height={y95 + 20} fill={COR.okFundo} />
              <line x1="0" x2="520" y1={y95} y2={y95} stroke={COR.ok} strokeWidth="3" strokeDasharray="10 8" />
              <path d={d} fill="none" stroke={COR.azul} strokeWidth="7" strokeLinejoin="round" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>
    ),
    // Sem a fonte (Google Fonts fora do ar), usa a padrão do gerador em vez de falhar.
    { ...TAMANHO, ...((await FONTES).length ? { fonts: await FONTES } : {}) },
  );
}
