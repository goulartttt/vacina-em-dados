"use client";

import { scaleLinear, type ScaleLinear } from "d3-scale";
import { line } from "d3-shape";
import { useId, useState } from "react";

import { META_COBERTURA, situacao, SITUACOES } from "@/lib/constantes";
import { numero, numeroCompacto, porcentagem } from "@/lib/formato";
import { casosEm, coberturaEm, listaAnos, type Anos, type Modo, type Serie } from "@/lib/painel";

// Gráfico ano a ano. Vacinação: linhas com a faixa da meta; casos: barras.
// Os dois nunca dividem um eixo. O período escolhido nos filtros fica
// destacado em azul-claro. Desenhado em duas larguras (celular e tela
// grande) para o texto dos eixos não encolher.

export type Linha = { nome: string; serie: Serie };

type Props = {
  modo: Modo;
  anos: Anos;
  principal: Linha;
  comparacoes: Linha[];
  destaque: Linha | null;
  periodo: [number, number];
  anoParcial: number | null;
};

const COR_COMPARACAO = "var(--tinta-3)";
// Cada linha de comparação com um tracejado próprio (estado: traços; Brasil: pontos).
const TRACOS = ["7 4", "2 4"];

export function Evolucao(props: Props) {
  const { modo, principal, comparacoes, destaque, anoParcial } = props;
  return (
    <figure>
      <ul className="mb-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-tinta-2" aria-label="Legenda">
        {modo === "vacinacao" ? (
          <>
            <li className="flex items-center gap-2">
              <span className="h-[3px] w-6 rounded-full bg-azul" aria-hidden="true" />
              <b className="text-tinta">{principal.nome}</b>
            </li>
            {destaque && (
              <li className="flex items-center gap-2">
                <span className="h-[3px] w-6 rounded-full bg-lilas" aria-hidden="true" />
                {destaque.nome} (escolhido no mapa)
              </li>
            )}
            {comparacoes.map((c, i) => (
              <li key={i} className="flex items-center gap-2">
                <svg viewBox="0 0 24 4" className="h-1 w-6" aria-hidden="true">
                  <line x1="0" x2="24" y1="2" y2="2" stroke={COR_COMPARACAO} strokeWidth={2.5} strokeDasharray={TRACOS[i % TRACOS.length]} />
                </svg>
                {c.nome}
              </li>
            ))}
            <li className="flex items-center gap-2">
              <span className="h-3 w-6 rounded-[3px] border-t-2 border-dashed border-ok bg-ok-fundo" aria-hidden="true" />
              Faixa da meta (95% ou mais)
            </li>
          </>
        ) : (
          <>
            <li className="flex items-center gap-2">
              <span className="size-3 rounded-[3px] bg-casos" aria-hidden="true" />
              <span>
                Casos confirmados por ano: <b className="text-tinta">{principal.nome}</b>
              </span>
            </li>
            {anoParcial && <li>{anoParcial}: ano em andamento, número parcial</li>}
          </>
        )}
        <li className="flex items-center gap-2">
          <span className="h-3 w-6 rounded-[3px] bg-azul-claro" aria-hidden="true" />
          Período escolhido
        </li>
      </ul>
      <div className="sm:hidden">
        <Desenho {...props} largura={360} altura={modo === "vacinacao" ? 250 : 210} />
      </div>
      <div className="hidden sm:block">
        <Desenho {...props} largura={860} altura={modo === "vacinacao" ? 330 : 270} />
      </div>
    </figure>
  );
}

function Desenho({ modo, anos, principal, comparacoes, destaque, periodo, anoParcial, largura, altura }: Props & { largura: number; altura: number }) {
  const idDica = useId();
  const [ano, setAno] = useState<number | null>(null);
  const estreito = largura < 500;
  const margem = { esquerda: estreito ? 40 : 48, direita: 12, topo: 16, base: 30 };
  const lista = listaAnos(modo === "vacinacao" ? anos.cobertura : anos.casos);
  const x = scaleLinear()
    .domain([lista[0] - 0.5, lista[lista.length - 1] + 0.5])
    .range([margem.esquerda, largura - margem.direita]);
  const passo = x(1) - x(0);
  const baseY = altura - margem.base;
  const [inicio, fim] = periodo;

  // Um ano a cada "salto", mais o último. O rótulo regular perto demais do
  // último sai, para os dois não se sobreporem (ex.: 2020 e 2022 no celular).
  const salto = estreito ? (lista.length > 12 ? 4 : 2) : lista.length > 20 ? 4 : 2;
  const ultimoAno = lista[lista.length - 1];
  const LARGURA_ROTULO = 40; // "2022" no tamanho do eixo, com folga
  const marcasX = lista.filter(
    (a) => a === ultimoAno || ((a - lista[0]) % salto === 0 && x(ultimoAno) - x(a) >= LARGURA_ROTULO),
  );

  const dicaTexto = (a: number) => {
    if (modo === "vacinacao") {
      const linhas = [principal, ...(destaque ? [destaque] : []), ...comparacoes].map((l) => {
        const v = coberturaEm(l.serie, anos, a);
        return `${l.nome}: ${v === null ? "sem dado" : `${porcentagem(v)} (${SITUACOES[situacao(v)].nome.toLowerCase()})`}`;
      });
      return [`${a}`, ...linhas];
    }
    const linhas = [principal, ...comparacoes].map((l) => {
      const v = casosEm(l.serie, anos, a) ?? 0;
      return `${l.nome}: ${numero(v)} ${v === 1 ? "caso" : "casos"}`;
    });
    return [`${a}${a === anoParcial ? " (parcial)" : ""}`, ...linhas];
  };

  function aoTeclar(e: React.KeyboardEvent) {
    const i = ano === null ? -1 : lista.indexOf(ano);
    let proximo: number | null = null;
    if (e.key === "ArrowRight") proximo = lista[Math.min(lista.length - 1, i + 1)];
    else if (e.key === "ArrowLeft") proximo = lista[Math.max(0, i < 0 ? lista.length - 1 : i - 1)];
    else if (e.key === "Home") proximo = lista[0];
    else if (e.key === "End") proximo = lista[lista.length - 1];
    else if (e.key === "Escape") return setAno(null);
    else return;
    e.preventDefault();
    setAno(proximo);
  }

  const dica = ano !== null ? dicaTexto(ano) : null;
  const resumo =
    modo === "vacinacao"
      ? `Gráfico de linha da cobertura vacinal de ${lista[0]} a ${lista[lista.length - 1]}, com a faixa da meta de 95%.`
      : `Gráfico de barras dos casos confirmados de sarampo de ${lista[0]} a ${lista[lista.length - 1]}.`;

  return (
    <div
      className="relative rounded-xl focus-visible:outline-offset-4"
      tabIndex={0}
      aria-label={`${resumo} Use as setas para percorrer os anos.`}
      aria-describedby={idDica}
      onKeyDown={aoTeclar}
      onPointerLeave={() => setAno(null)}
      onBlur={() => setAno(null)}
    >
      <svg viewBox={`0 0 ${largura} ${altura}`} className="grafico block h-auto w-full" aria-hidden="true">
        {/* Período escolhido */}
        <rect
          x={x(Math.max(inicio, lista[0])) - passo / 2}
          width={Math.max(0, x(Math.min(fim, lista[lista.length - 1])) - x(Math.max(inicio, lista[0])) + passo)}
          y={margem.topo - 6}
          height={baseY - margem.topo + 6}
          fill="var(--azul-claro)"
          opacity={0.75}
          rx={6}
        />
        {modo === "vacinacao" ? (
          <Linhas {...{ anos, principal, comparacoes, destaque, x, baseY, margem, largura, estreito }} />
        ) : (
          <Barras {...{ anos, principal, periodo, anoParcial, x, passo, baseY, margem, largura, estreito }} />
        )}
        {/* Eixo dos anos */}
        <line className="eixo" x1={margem.esquerda} x2={largura - margem.direita} y1={baseY} y2={baseY} />
        {marcasX.map((a) => (
          <text key={a} x={x(a)} y={baseY + 19} textAnchor="middle" className={a === inicio || a === fim ? "forte" : undefined}>
            {a}
          </text>
        ))}
        {ano !== null && <line x1={x(ano)} x2={x(ano)} y1={margem.topo} y2={baseY} stroke="var(--tinta-3)" strokeDasharray="3 3" />}
        {/* Áreas de toque, uma por ano */}
        {lista.map((a) => (
          <rect key={a} x={x(a) - passo / 2} y={margem.topo} width={passo} height={baseY - margem.topo} fill="transparent" onPointerEnter={() => setAno(a)} onPointerDown={() => setAno(a)} />
        ))}
      </svg>
      <div id={idDica} aria-live="polite" className="sr-only">
        {dica?.join(". ")}
      </div>
      {dica && ano !== null && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 z-10 rounded-xl border border-linha bg-folha px-3 py-2 text-[0.8125rem] whitespace-nowrap shadow-[0_10px_28px_-10px_rgb(23_33_51/0.35)]"
          style={{
            left: `${(x(ano) / largura) * 100}%`,
            transform: `translateX(${x(ano) / largura > 0.6 ? "calc(-100% - 10px)" : "10px"})`,
          }}
        >
          <p className="font-bold text-tinta">{dica[0]}</p>
          {dica.slice(1).map((l, i) => (
            <p key={i} className="text-tinta-2">
              {l}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

type Escala = ScaleLinear<number, number>;

function Linhas({
  anos,
  principal,
  comparacoes,
  destaque,
  x,
  baseY,
  margem,
  largura,
  estreito,
}: {
  anos: Anos;
  principal: Linha;
  comparacoes: Linha[];
  destaque: Linha | null;
  x: Escala;
  baseY: number;
  margem: { esquerda: number; direita: number; topo: number };
  largura: number;
  estreito: boolean;
}) {
  const todas = [principal, ...comparacoes, ...(destaque ? [destaque] : [])];
  const valores = todas.flatMap((l) => l.serie.cob).filter((v): v is number => v !== null);
  const menor = Math.min(60, Math.floor(((valores.length ? Math.min(...valores) : 60) - 5) / 10) * 10);
  const maior = Math.max(110, Math.ceil(((valores.length ? Math.max(...valores) : 110) + 5) / 10) * 10);
  const y = scaleLinear().domain([menor, maior]).range([baseY, margem.topo]);
  const anosLista = listaAnos(anos.cobertura);
  const desenho = (s: Serie) =>
    line<number>()
      .defined((a) => coberturaEm(s, anos, a) !== null)
      .x((a) => x(a))
      .y((a) => y(coberturaEm(s, anos, a) ?? 0))(anosLista) ?? undefined;

  return (
    <g>
      {y.ticks(estreito ? 4 : 6).map((v) => (
        <g key={v}>
          <line className="grade-linha" x1={margem.esquerda} x2={largura - margem.direita} y1={y(v)} y2={y(v)} />
          <text x={margem.esquerda - 8} y={y(v) + 4} textAnchor="end">
            {v}%
          </text>
        </g>
      ))}
      <rect x={margem.esquerda} width={largura - margem.esquerda - margem.direita} y={y(maior)} height={y(META_COBERTURA) - y(maior)} fill="var(--ok-fundo)" opacity={0.65} />
      <line x1={margem.esquerda} x2={largura - margem.direita} y1={y(META_COBERTURA)} y2={y(META_COBERTURA)} stroke="var(--ok)" strokeWidth={1.5} strokeDasharray="6 4" />
      {/* No alto da faixa, à esquerda: ali a linha nunca passa (começa abaixo da meta). */}
      <text x={margem.esquerda + 8} y={y(maior) + 16} style={{ fill: "var(--ok-tinta)", fontWeight: 700 }}>
        {estreito ? "meta: 95% ou mais" : "faixa da meta: 95% ou mais"}
      </text>
      {comparacoes.map((c, i) => (
        <path key={i} d={desenho(c.serie)} fill="none" stroke={COR_COMPARACAO} strokeWidth={2} strokeDasharray={TRACOS[i % TRACOS.length]} strokeLinecap="round" />
      ))}
      {destaque && <path d={desenho(destaque.serie)} fill="none" stroke="var(--lilas)" strokeWidth={2.5} strokeLinejoin="round" />}
      <path d={desenho(principal.serie)} fill="none" stroke="var(--azul)" strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
      {anosLista.map((a) => {
        const v = coberturaEm(principal.serie, anos, a);
        if (v === null) return null;
        return <circle key={a} cx={x(a)} cy={y(v)} r={estreito ? 3.5 : 4.5} fill={SITUACOES[situacao(v)].cor} stroke="var(--folha)" strokeWidth={2} />;
      })}
    </g>
  );
}

function Barras({
  anos,
  principal,
  periodo,
  anoParcial,
  x,
  passo,
  baseY,
  margem,
  largura,
  estreito,
}: {
  anos: Anos;
  principal: Linha;
  periodo: [number, number];
  anoParcial: number | null;
  x: Escala;
  passo: number;
  baseY: number;
  margem: { esquerda: number; direita: number; topo: number };
  largura: number;
  estreito: boolean;
}) {
  const anosLista = listaAnos(anos.casos);
  const maior = Math.max(10, ...principal.serie.cas);
  const y = scaleLinear().domain([0, maior]).nice(4).range([baseY, margem.topo + 14]);
  const larguraBarra = Math.min(28, passo * 0.68);
  const [inicio, fim] = periodo;
  return (
    <g>
      {y.ticks(4).map((v) => (
        <g key={v}>
          {v > 0 && <line className="grade-linha" x1={margem.esquerda} x2={largura - margem.direita} y1={y(v)} y2={y(v)} />}
          <text x={margem.esquerda - 8} y={y(v) + 4} textAnchor="end">
            {numeroCompacto(v)}
          </text>
        </g>
      ))}
      {anosLista.map((a) => {
        const v = casosEm(principal.serie, anos, a) ?? 0;
        if (v === 0) return null;
        const dentro = a >= inicio && a <= fim;
        const topo = Math.min(y(v), baseY - 2);
        return (
          <g key={a}>
            <rect
              x={x(a) - larguraBarra / 2}
              y={topo}
              width={larguraBarra}
              height={baseY - topo}
              rx={Math.min(4, larguraBarra / 3)}
              fill={dentro ? "var(--casos)" : "var(--casos-2)"}
              opacity={a === anoParcial ? 0.6 : 1}
            />
            {dentro && !estreito && (
              <text x={x(a)} y={topo - 6} textAnchor="middle" className="forte" style={{ fontSize: 11 }}>
                {numeroCompacto(v)}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
}
