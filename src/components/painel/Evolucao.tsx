"use client";

import { scaleLinear, type ScaleLinear } from "d3-scale";
import { line } from "d3-shape";
import { useId, useState } from "react";

import { META_COBERTURA, situacao, SITUACOES } from "@/lib/constantes";
import { numero, numeroCompacto, porcentagem } from "@/lib/formato";
import { casosEm, coberturaEm, listaAnos, type Anos, type Serie } from "@/lib/painel";

// As duas partes da história no mesmo gráfico, uma sobre a outra e com os
// mesmos anos: em cima a vacinação (linhas e faixa da meta), embaixo os casos
// confirmados (barras). Cada parte tem o próprio eixo: cobertura e casos
// nunca dividem uma escala. Os destaques (menor cobertura e pico de casos)
// saem dos próprios dados. Desenhado em duas larguras (celular e tela
// grande) para o texto dos eixos não encolher.

export type Linha = { nome: string; serie: Serie };

type Props = {
  anos: Anos;
  principal: Linha;
  comparacoes: Linha[];
  destaque: Linha | null;
  periodo: [number, number];
  anoParcial: number | null;
  /** Ex.: "1ª dose". */
  rotuloDose: string;
};

type Ponto = { ano: number; valor: number };
type Escala = ScaleLinear<number, number>;
type Margem = { esquerda: number; direita: number; topo: number; base: number };

const COR_COMPARACAO = "var(--tinta-3)";
// Cada linha de comparação com um tracejado próprio (estado: traços; Brasil: pontos).
const TRACOS = ["7 4", "2 4"];
const LARGURA_ROTULO = 40; // "2022" no tamanho do eixo, com folga
// Contorno da cor do fundo em volta do texto: lê-se mesmo sobre as linhas.
const HALO = { stroke: "var(--folha)", strokeWidth: 4, paintOrder: "stroke" } as const;

/** Menor cobertura e maior número de casos da série (o primeiro, se empatar). */
function destaques(anos: Anos, s: Serie) {
  let menor: Ponto | null = null;
  for (const ano of listaAnos(anos.cobertura)) {
    const v = coberturaEm(s, anos, ano);
    if (v !== null && (menor === null || v < menor.valor)) menor = { ano, valor: v };
  }
  let pico: Ponto | null = null;
  for (const ano of listaAnos(anos.casos)) {
    const v = casosEm(s, anos, ano) ?? 0;
    if (v > 0 && (pico === null || v > pico.valor)) pico = { ano, valor: v };
  }
  return { menor, pico };
}

export function Evolucao(props: Props) {
  const { principal, comparacoes, destaque, anoParcial, rotuloDose } = props;
  return (
    <figure>
      <ul className="mb-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-tinta-2" aria-label="Legenda">
        <li className="flex items-center gap-2">
          <span className="h-[3px] w-6 rounded-full bg-azul" aria-hidden="true" />
          <span>
            <b className="text-tinta">{principal.nome}</b>, vacinação ({rotuloDose})
          </span>
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
          <svg viewBox="0 0 24 12" className="h-3 w-6" aria-hidden="true">
            <rect width="24" height="12" fill="var(--ok-fundo)" />
            <line x1="0" x2="24" y1="1" y2="1" stroke="var(--ok)" strokeWidth={2} strokeDasharray="4 3" />
          </svg>
          Faixa da meta (95% ou mais)
        </li>
        <li className="flex items-center gap-2">
          <span className="size-3 rounded-[3px] bg-casos" aria-hidden="true" />
          Casos confirmados: {principal.nome}
          {anoParcial ? ` (${anoParcial}, parcial)` : ""}
        </li>
        <li className="flex items-center gap-2">
          <span className="h-3 w-6 rounded-[3px] bg-azul-claro" aria-hidden="true" />
          Período escolhido
        </li>
      </ul>
      <div className="sm:hidden">
        <Desenho {...props} largura={360} alturaCobertura={210} alturaCasos={120} />
      </div>
      <div className="hidden sm:block">
        <Desenho {...props} largura={860} alturaCobertura={290} alturaCasos={160} />
      </div>
    </figure>
  );
}

function Desenho({
  anos,
  principal,
  comparacoes,
  destaque,
  periodo,
  anoParcial,
  largura,
  alturaCobertura,
  alturaCasos,
}: Props & { largura: number; alturaCobertura: number; alturaCasos: number }) {
  const idDica = useId();
  const [ano, setAno] = useState<number | null>(null);
  const estreito = largura < 500;
  const margem: Margem = { esquerda: estreito ? 40 : 48, direita: 12, topo: 16, base: 30 };
  // Duas faixas, uma sobre a outra, com espaço para o título dos casos entre elas.
  const baseCobertura = margem.topo + alturaCobertura;
  const topoCasos = baseCobertura + 34;
  const baseCasos = topoCasos + alturaCasos;
  const altura = baseCasos + margem.base;

  const lista = listaAnos([Math.min(anos.cobertura[0], anos.casos[0]), Math.max(anos.cobertura[1], anos.casos[1])]);
  const ultimoAno = lista[lista.length - 1];
  const x = scaleLinear()
    .domain([lista[0] - 0.5, ultimoAno + 0.5])
    .range([margem.esquerda, largura - margem.direita]);
  const passo = x(1) - x(0);
  const [inicio, fim] = periodo;
  const { menor, pico } = destaques(anos, principal.serie);

  // Um ano a cada "salto", mais o último. O rótulo regular perto demais do
  // último sai, para os dois não se sobreporem (ex.: 2020 e 2022 no celular).
  const salto = estreito ? (lista.length > 12 ? 4 : 2) : lista.length > 20 ? 4 : 2;
  const marcasX = lista.filter((a) => a === ultimoAno || ((a - lista[0]) % salto === 0 && x(ultimoAno) - x(a) >= LARGURA_ROTULO));

  const dicaTexto = (a: number) => {
    const linhas: string[] = [];
    if (a >= anos.cobertura[0] && a <= anos.cobertura[1]) {
      for (const l of [principal, ...(destaque ? [destaque] : []), ...comparacoes]) {
        const v = coberturaEm(l.serie, anos, a);
        linhas.push(`${l.nome}: ${v === null ? "sem dado" : `${porcentagem(v)} (${SITUACOES[situacao(v)].nome.toLowerCase()})`}`);
      }
    }
    if (a >= anos.casos[0] && a <= anos.casos[1]) {
      const c = casosEm(principal.serie, anos, a) ?? 0;
      linhas.push(`Casos: ${numero(c)}${a === anoParcial ? " (parcial)" : ""}`);
    }
    return [`${a}`, ...linhas];
  };

  function aoTeclar(e: React.KeyboardEvent) {
    const i = ano === null ? -1 : lista.indexOf(ano);
    let proximo: number | null = null;
    if (e.key === "ArrowRight") proximo = lista[Math.min(lista.length - 1, i + 1)];
    else if (e.key === "ArrowLeft") proximo = lista[Math.max(0, i < 0 ? lista.length - 1 : i - 1)];
    else if (e.key === "Home") proximo = lista[0];
    else if (e.key === "End") proximo = ultimoAno;
    else if (e.key === "Escape") return setAno(null);
    else return;
    e.preventDefault();
    setAno(proximo);
  }

  const dica = ano !== null ? dicaTexto(ano) : null;
  const resumo =
    `Gráfico de ${lista[0]} a ${ultimoAno}. Em cima, a cobertura vacinal com a faixa da meta de 95%; embaixo, os casos confirmados de sarampo.` +
    (menor ? ` Menor cobertura: ${porcentagem(menor.valor)} em ${menor.ano}.` : "") +
    (pico ? ` Pico de casos: ${numero(pico.valor)} em ${pico.ano}.` : " Nenhum caso confirmado no período.");

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
        {/* Período escolhido, nas duas faixas */}
        <rect
          x={x(Math.max(inicio, lista[0])) - passo / 2}
          width={Math.max(0, x(Math.min(fim, ultimoAno)) - x(Math.max(inicio, lista[0])) + passo)}
          y={margem.topo - 6}
          height={baseCasos - margem.topo + 6}
          fill="var(--azul-claro)"
          opacity={0.75}
          rx={6}
        />
        <Linhas {...{ anos, principal, comparacoes, destaque, menor, x, margem, largura, estreito }} base={baseCobertura} />
        <line className="eixo" x1={margem.esquerda} x2={largura - margem.direita} y1={baseCobertura} y2={baseCobertura} />
        <text x={margem.esquerda} y={topoCasos - 12} className="forte">
          Casos confirmados de sarampo
        </text>
        <Barras {...{ anos, principal, periodo, anoParcial, pico, x, passo, margem, largura, estreito }} topo={topoCasos} base={baseCasos} />
        {/* Eixo dos anos, comum às duas faixas */}
        <line className="eixo" x1={margem.esquerda} x2={largura - margem.direita} y1={baseCasos} y2={baseCasos} />
        {marcasX.map((a) => (
          <text key={a} x={x(a)} y={baseCasos + 19} textAnchor="middle" className={a === inicio || a === fim ? "forte" : undefined}>
            {a}
          </text>
        ))}
        {ano !== null && <line x1={x(ano)} x2={x(ano)} y1={margem.topo} y2={baseCasos} stroke="var(--tinta-3)" strokeDasharray="3 3" />}
        {/* Áreas de toque, uma por ano, cobrindo as duas faixas */}
        {lista.map((a) => (
          <rect
            key={a}
            x={x(a) - passo / 2}
            y={margem.topo}
            width={passo}
            height={baseCasos - margem.topo}
            fill="transparent"
            onPointerEnter={() => setAno(a)}
            onPointerDown={() => setAno(a)}
          />
        ))}
      </svg>
      <div id={idDica} aria-live="polite" className="sr-only">
        {dica?.join(". ")}
      </div>
      {dica && ano !== null && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 z-10 rounded-md border border-linha bg-folha px-3 py-2 text-[0.8125rem] whitespace-nowrap shadow-[0_8px_20px_-10px_rgb(38_54_64/0.35)]"
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

/** Texto do destaque: à direita do ponto, ou à esquerda perto da borda direita. */
function Nota({ cx, y, largura, children }: { cx: number; y: number; largura: number; children: React.ReactNode }) {
  const aEsquerda = cx > largura * 0.62;
  return (
    <text x={cx + (aEsquerda ? -10 : 10)} y={y} textAnchor={aEsquerda ? "end" : "start"} className="forte" style={HALO}>
      {children}
    </text>
  );
}

function Linhas({
  anos,
  principal,
  comparacoes,
  destaque,
  menor,
  x,
  base,
  margem,
  largura,
  estreito,
}: {
  anos: Anos;
  principal: Linha;
  comparacoes: Linha[];
  destaque: Linha | null;
  menor: Ponto | null;
  x: Escala;
  base: number;
  margem: Margem;
  largura: number;
  estreito: boolean;
}) {
  const todas = [principal, ...comparacoes, ...(destaque ? [destaque] : [])];
  const valores = todas.flatMap((l) => l.serie.cob).filter((v): v is number => v !== null);
  // Folga embaixo do menor valor para caber o destaque "menor: …".
  const piso = Math.min(60, Math.floor(((valores.length ? Math.min(...valores) : 60) - 10) / 10) * 10);
  const teto = Math.max(110, Math.ceil(((valores.length ? Math.max(...valores) : 110) + 5) / 10) * 10);
  const y = scaleLinear().domain([piso, teto]).range([base, margem.topo]);
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
      <rect x={margem.esquerda} width={largura - margem.esquerda - margem.direita} y={y(teto)} height={y(META_COBERTURA) - y(teto)} fill="var(--ok-fundo)" opacity={0.65} />
      <line x1={margem.esquerda} x2={largura - margem.direita} y1={y(META_COBERTURA)} y2={y(META_COBERTURA)} stroke="var(--ok)" strokeWidth={1.5} strokeDasharray="6 4" />
      {/* No alto da faixa, à esquerda: ali a linha nunca passa (começa abaixo da meta). */}
      <text x={margem.esquerda + 8} y={y(teto) + 16} style={{ fill: "var(--ok-tinta)", fontWeight: 700 }}>
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
      {menor && (
        <g>
          <circle cx={x(menor.ano)} cy={y(menor.valor)} r={estreito ? 7 : 8.5} fill="none" stroke="var(--tinta)" strokeWidth={1.5} />
          {/* Embaixo do ponto (há folga no eixo); se não couber, em cima. */}
          <Nota cx={x(menor.ano)} y={y(menor.valor) + 22 <= base - 4 ? y(menor.valor) + 22 : y(menor.valor) - 12} largura={largura}>
            {estreito ? `menor: ${porcentagem(menor.valor)} (${menor.ano})` : `menor cobertura: ${porcentagem(menor.valor)} em ${menor.ano}`}
          </Nota>
        </g>
      )}
    </g>
  );
}

function Barras({
  anos,
  principal,
  periodo,
  anoParcial,
  pico,
  x,
  passo,
  topo,
  base,
  margem,
  largura,
  estreito,
}: {
  anos: Anos;
  principal: Linha;
  periodo: [number, number];
  anoParcial: number | null;
  pico: Ponto | null;
  x: Escala;
  passo: number;
  topo: number;
  base: number;
  margem: Margem;
  largura: number;
  estreito: boolean;
}) {
  const anosLista = listaAnos(anos.casos);
  if (!pico) {
    return (
      <text x={(margem.esquerda + largura - margem.direita) / 2} y={(topo + base) / 2} textAnchor="middle">
        Nenhum caso confirmado de {anos.casos[0]} a {anos.casos[1]}
      </text>
    );
  }
  const y = scaleLinear().domain([0, Math.max(10, pico.valor)]).nice(4).range([base, topo + 16]);
  const larguraBarra = Math.min(28, passo * 0.68);
  const [inicio, fim] = periodo;
  return (
    <g>
      {y.ticks(estreito ? 3 : 4).map((v) => (
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
        const alto = Math.min(y(v), base - 2);
        return (
          <g key={a}>
            <rect
              x={x(a) - larguraBarra / 2}
              y={alto}
              width={larguraBarra}
              height={base - alto}
              rx={Math.min(4, larguraBarra / 3)}
              fill={dentro ? "var(--casos)" : "var(--casos-2)"}
              opacity={a === anoParcial ? 0.6 : 1}
            />
            {dentro && !estreito && a !== pico.ano && (
              <text x={x(a)} y={alto - 6} textAnchor="middle" className="forte" style={{ fontSize: 11 }}>
                {numeroCompacto(v)}
              </text>
            )}
          </g>
        );
      })}
      <Nota cx={x(pico.ano)} y={Math.min(y(pico.valor), base - 2) - 6} largura={largura}>
        {estreito ? `pico: ${numero(pico.valor)} (${pico.ano})` : `pico: ${numero(pico.valor)} casos em ${pico.ano}`}
      </Nota>
    </g>
  );
}
