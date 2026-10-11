"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";

import { FAIXAS_CASOS, situacao, SITUACOES, type Situacao } from "@/lib/constantes";
import { decimal, numero, porcentagem } from "@/lib/formato";
import {
  casosEm,
  casosNoPeriodo,
  coberturaEm,
  listaAnos,
  naDose,
  praticamenteIgual,
  type Anos,
  type DadosRegioes,
  type Dose,
  type Modo,
  type Serie,
} from "@/lib/painel";

import { Icone } from "../Icone";
import { Selo } from "../Situacao";
import { BarraAnos } from "./BarraAnos";
import { Evolucao, type Linha } from "./Evolucao";
import { MapaPainel } from "./MapaPainel";
import { TabelaRegioes } from "./TabelaRegioes";

export type PropsPainel = {
  /** Doença do painel (ex.: "Sarampo"), na linha de contexto sob o título. */
  assunto: string;
  titulo: string;
  /** Nome do lugar do painel ("Brasil", "Pará", "Campinas (SP)"). */
  nome: string;
  anos: Anos;
  principal: Serie;
  /** Linhas de comparação no gráfico (ex.: o estado e o Brasil). */
  comparacoes: Linha[];
  /** Mapa e séries dos lugares de dentro (estados ou cidades): já prontos... */
  regioes?: DadosRegioes;
  /** ...ou baixados depois que a página abre (mapa das cidades pesa). */
  regioesUrl?: string;
  tipoRegioes?: "estado" | "cidade";
  lugares?: { href: string; rotulo: string }[];
  lugarAtual?: string;
  anoParcial: number | null;
  children?: React.ReactNode;
};

/** Período que o painel mostra ao abrir, em cada modo. */
const periodosPadrao = (anos: Anos): Record<Modo, [number, number]> => ({
  vacinacao: [Math.max(anos.cobertura[0], anos.cobertura[1] - 6), anos.cobertura[1]],
  casos: [Math.max(anos.casos[0], anos.casos[1] - 9), anos.casos[1]],
});

/** Um passo de "Ver os anos passando". */
const PASSO_MS = 800;

export function Painel(p: PropsPainel) {
  const router = useRouter();
  const idMapa = useId();
  const [modo, setModoBruto] = useState<Modo>("vacinacao");
  const [dose, setDoseBruta] = useState<Dose>(1);
  const [periodos, setPeriodos] = useState(() => periodosPadrao(p.anos));
  const [baixadas, setBaixadas] = useState<DadosRegioes | null>(null);
  const [erro, setErro] = useState(false);
  const [selecionada, setSelecionada] = useState<number | null>(null);
  const [tocando, setTocando] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [filtrosAbertos, setFiltrosAbertos] = useState(false); // só no celular
  const urlLida = useRef(false);

  // Os filtros ficam no endereço (?ver=casos&de=2015&ate=2025&dose=2): um link
  // compartilhado abre exatamente a mesma visão. Lido depois de abrir, no
  // navegador, para a página continuar pronta (estática) no servidor.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const ver: Modo = q.get("ver") === "casos" ? "casos" : "vacinacao";
    const limitesUrl = ver === "vacinacao" ? p.anos.cobertura : p.anos.casos;
    const ano = (nome: string) => {
      const v = Number(q.get(nome));
      return q.has(nome) && Number.isInteger(v) && v >= limitesUrl[0] && v <= limitesUrl[1] ? v : null;
    };
    const [de, ate] = [ano("de"), ano("ate")];
    const doseUrl: Dose = q.get("dose") === "2" ? 2 : 1;
    // Adiado para depois da primeira pintura: o painel aparece pronto e só
    // então assume os filtros do link.
    const t = setTimeout(() => {
      setModoBruto(ver);
      setDoseBruta(doseUrl);
      if (de !== null || ate !== null) {
        setPeriodos((atual) => {
          const [i, f] = [de ?? atual[ver][0], ate ?? atual[ver][1]];
          return { ...atual, [ver]: [Math.min(i, f), Math.max(i, f)] };
        });
      }
      urlLida.current = true;
    });
    return () => clearTimeout(t);
  }, [p.anos]);

  useEffect(() => {
    if (p.regioes || !p.regioesUrl) return;
    let ativo = true;
    fetch(p.regioesUrl)
      .then((r) => (r.ok ? (r.json() as Promise<DadosRegioes>) : Promise.reject(new Error(String(r.status)))))
      .then((d) => ativo && setBaixadas(d))
      .catch(() => ativo && setErro(true));
    return () => {
      ativo = false;
    };
  }, [p.regioes, p.regioesUrl]);

  // Tudo abaixo usa a cobertura da dose escolhida (naDose troca a série).
  const brutos = p.regioes ?? baixadas;
  const dados = useMemo(() => (brutos && dose === 2 ? { ...brutos, regioes: brutos.regioes.map((r) => naDose(r, 2)) } : brutos), [brutos, dose]);
  const porId = useMemo(() => new Map((dados?.regioes ?? []).map((r) => [r.id, r])), [dados]);
  const temRegioes = Boolean(p.regioes || p.regioesUrl);
  const tipo = p.tipoRegioes ?? "estado";
  const plural = tipo === "estado" ? "estados" : "cidades";
  const numUm = tipo === "estado" ? "num estado" : "numa cidade";

  const periodo = periodos[modo];
  const [inicio, fim] = periodo;
  const limites = modo === "vacinacao" ? p.anos.cobertura : p.anos.casos;

  // Mexer em qualquer filtro para o "Ver os anos passando".
  const mudarPeriodo = (v: [number, number]) => {
    setTocando(false);
    setPeriodos((atual) => ({ ...atual, [modo]: v }));
  };
  const setModo = (m: Modo) => {
    setTocando(false);
    setModoBruto(m);
  };
  const setDose = (d: Dose) => {
    setTocando(false);
    setDoseBruta(d);
  };

  useEffect(() => {
    if (!urlLida.current) return;
    const q = new URLSearchParams(window.location.search);
    for (const nome of ["ver", "de", "ate", "dose"]) q.delete(nome);
    const padrao = periodosPadrao(p.anos)[modo];
    if (modo === "casos") q.set("ver", "casos");
    if (inicio !== padrao[0] || fim !== padrao[1]) {
      q.set("de", String(inicio));
      q.set("ate", String(fim));
    }
    if (modo === "vacinacao" && dose === 2) q.set("dose", "2");
    const busca = q.toString();
    const novo = `${window.location.pathname}${busca ? `?${busca}` : ""}${window.location.hash}`;
    if (novo !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
      window.history.replaceState(window.history.state, "", novo);
    }
  }, [modo, inicio, fim, dose, p.anos]);

  // "Ver os anos passando": avança o fim do período um ano por passo, a
  // partir do primeiro ano, até o último. Sem animação de transição para
  // quem pede movimento reduzido (o CSS do mapa já respeita isso).
  useEffect(() => {
    if (!tocando) return;
    const t = setTimeout(() => {
      const proximo = fim + 1;
      setPeriodos((atual) => ({ ...atual, [modo]: [atual[modo][0], proximo] }));
      if (proximo >= limites[1]) setTocando(false);
    }, PASSO_MS);
    return () => clearTimeout(t);
  }, [tocando, fim, modo, limites]);

  function tocarOuPausar() {
    if (tocando) return setTocando(false);
    setPeriodos((atual) => ({ ...atual, [modo]: [limites[0], limites[0]] }));
    setTocando(true);
  }

  async function compartilhar() {
    const url = window.location.href;
    // No celular, o menu de compartilhar do aparelho; no computador, copia o link.
    if (window.matchMedia("(pointer: coarse)").matches && typeof navigator.share === "function") {
      try {
        await navigator.share({ title: document.title, url });
      } catch {
        // a pessoa fechou o menu: nada a fazer
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      window.prompt("Copie o link desta visão:", url);
    }
  }

  const principal: Linha = { nome: p.nome, serie: naDose(p.principal, dose) };
  const comparacoes = p.comparacoes.map((l) => ({ ...l, serie: naDose(l.serie, dose) }));
  const escolhida = selecionada !== null ? porId.get(selecionada) : undefined;
  const destaque: Linha | null = escolhida ? { nome: escolhida.nome, serie: escolhida } : null;

  const lugar = p.lugares?.find((l) => l.href === p.lugarAtual)?.rotulo ?? p.nome;
  const resumoFiltros = `${lugar} · ${modo === "vacinacao" ? `Vacinação, ${dose}ª dose` : "Casos"}`;

  return (
    // No computador: título e filtros lado a lado (grade de 2 colunas; o
    // resto ocupa as duas). No celular: os filtros viram uma barra-resumo
    // presa no topo, que abre os controles ao tocar. A barra precisa ser
    // filha direta deste bloco para ficar presa durante todo o painel.
    <div className="lg:grid lg:grid-cols-[1fr_auto] lg:items-end lg:gap-x-6 lg:[&>*:nth-child(n+3)]:col-span-2">
      <div>
        <h1 className="titulo text-[2rem] sm:text-[2.75rem]">{p.titulo}</h1>
        <p className="linha-fina mt-2">
          {modo === "vacinacao"
            ? `${p.assunto}: vacina tríplice viral, ${dose}ª dose, crianças de 1 ano`
            : `${p.assunto}: casos confirmados, pelo município onde a pessoa mora`}
        </p>
      </div>
      <div className="sticky top-0 z-30 -mx-4 mt-4 border-b border-linha bg-fundo px-4 py-2 sm:-mx-6 sm:px-6 lg:static lg:mx-0 lg:mt-0 lg:max-w-[34rem] lg:justify-self-end lg:border-0 lg:bg-transparent lg:p-0">
        <button
          type="button"
          aria-expanded={filtrosAbertos}
          aria-controls={`${idMapa}-filtros`}
          onClick={() => setFiltrosAbertos((a) => !a)}
          className="flex w-full items-center gap-3 rounded-lg border border-linha bg-folha px-4 py-2.5 text-left lg:hidden"
        >
          <span className="min-w-0 flex-1">
            <span className="rotulo block">Filtros · {`${inicio}–${fim}`}</span>
            <span className="block leading-snug font-semibold">{resumoFiltros}</span>
          </span>
          <span className="flex shrink-0 items-center gap-1 text-sm font-semibold text-azul">
            {filtrosAbertos ? "Fechar" : "Mudar"}
            <Icone nome="chevron" className={`size-4 transition-transform ${filtrosAbertos ? "rotate-180" : ""}`} />
          </span>
        </button>
        <div
          id={`${idMapa}-filtros`}
          role="group"
          aria-label="Filtros"
          className={`${filtrosAbertos ? "flex" : "hidden"} max-h-[70vh] flex-wrap items-end gap-2.5 overflow-y-auto pt-3 pb-1 lg:flex lg:max-h-none lg:overflow-visible lg:p-0`}
        >
          <label className="flex flex-col gap-1">
            <span className="rotulo">De</span>
            <select className="seletor" value={inicio} onChange={(e) => mudarPeriodo([Number(e.target.value), Math.max(Number(e.target.value), fim)])}>
              {listaAnos(limites).map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="rotulo">Até</span>
            <select className="seletor" value={fim} onChange={(e) => mudarPeriodo([Math.min(inicio, Number(e.target.value)), Number(e.target.value)])}>
              {listaAnos(limites).map((a) => (
                <option key={a} value={a}>
                  {a}
                  {a === p.anoParcial && modo === "casos" ? " (parcial)" : ""}
                </option>
              ))}
            </select>
          </label>
          {p.lugares && (
            <label className="flex flex-col gap-1">
              <span className="rotulo">Lugar</span>
              {/* Leva junto os filtros escolhidos (período, casos, dose). */}
              <select className="seletor max-w-[13rem]" value={p.lugarAtual} onChange={(e) => router.push(e.target.value + window.location.search)}>
                {p.lugares.map((l) => (
                  <option key={l.href} value={l.href}>
                    {l.rotulo}
                  </option>
                ))}
              </select>
            </label>
          )}
          <Alternador
            rotulo="Mostrar"
            valor={modo}
            aoMudar={setModo}
            opcoes={[
              { valor: "vacinacao", texto: "Vacinação" },
              { valor: "casos", texto: "Casos" },
            ]}
          />
          {modo === "vacinacao" && (
            <Alternador
              rotulo="Dose"
              valor={dose}
              aoMudar={setDose}
              opcoes={[
                { valor: 1, texto: "1ª", descricao: "1ª dose" },
                { valor: 2, texto: "2ª", descricao: "2ª dose" },
              ]}
            />
          )}
          <button type="button" onClick={compartilhar} className="botao botao-contorno min-h-11">
            <Icone nome={copiado ? "ok" : "compartilhar"} className="size-[1.125rem]" />
            {copiado ? "Link copiado" : "Compartilhar"}
          </button>
          <span className="sr-only" aria-live="polite">
            {copiado ? "Link desta visão copiado." : ""}
          </span>
          <button type="button" onClick={() => setFiltrosAbertos(false)} className="botao botao-azul min-h-11 w-full lg:hidden">
            Ver os números
          </button>
        </div>
      </div>

      <Numeros
        {...p}
        principal={principal.serie}
        comparacoes={comparacoes}
        dose={dose}
        modo={modo}
        periodo={periodo}
        dados={dados}
        plural={plural}
        temRegioes={temRegioes}
      />

      {/* Mapa */}
      {temRegioes && (
        <section aria-labelledby={idMapa} className="cartao relative mt-4 overflow-hidden">
          <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3 px-4 pt-4 sm:px-6 sm:pt-5">
            <div>
              <h2 id={idMapa} className="titulo text-[1.5rem]">
                {modo === "casos" ? `Casos de sarampo por ${tipo} em ${fim}` : `${dose === 2 ? "2ª dose" : "Vacinação"} por ${tipo} em ${fim}`}
              </h2>
              {/* Como ler, numa frase (sem passos numerados). */}
              <p className="mt-1 max-w-[62ch] text-[0.9375rem] text-tinta-2">
                {modo === "vacinacao" ? `Cada ${tipo} tem a cor da sua situação em ${fim}.` : `Quanto mais escuro, mais casos em ${fim}.`} Toque {numUm} para
                ver o número{tipo === "estado" ? " e abrir as cidades" : ""}; mude os anos na barra abaixo do mapa.
              </p>
            </div>
            <Legenda modo={modo} dados={dados} anos={p.anos} fim={fim} />
          </div>
          <div className="relative px-4 pt-3 sm:px-6">
            <div className="mx-auto max-w-[620px]">
              {dados ? (
                <MapaPainel
                  malha={dados}
                  regioes={porId}
                  modo={modo}
                  anos={p.anos}
                  periodo={periodo}
                  tipo={tipo}
                  dose={dose}
                  anoParcial={p.anoParcial}
                  aoSelecionar={setSelecionada}
                  resumo={resumoDoMapa(modo, dados, p.anos, fim, plural)}
                />
              ) : (
                <div className="grid aspect-square place-items-center rounded-lg bg-grade text-tinta-2 motion-safe:animate-pulse">
                  {erro ? "Não foi possível carregar o mapa. Recarregue a página." : "Carregando o mapa…"}
                </div>
              )}
            </div>
          </div>
          <div className="mt-2 border-t border-linha px-4 py-4 sm:px-6">
            <BarraAnos
              limites={limites}
              valor={periodo}
              aoMudar={mudarPeriodo}
              extra={
                <button
                  type="button"
                  onClick={tocarOuPausar}
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-md bg-azul px-3 text-sm font-semibold whitespace-nowrap text-white transition-colors hover:bg-azul-escuro"
                >
                  <Icone nome={tocando ? "pausar" : "tocar"} className="size-4" />
                  {tocando ? "Pausar" : "Ver os anos passando"}
                </button>
              }
            />
          </div>
        </section>
      )}

      {/* Ano a ano */}
      <section className="cartao mt-4 p-4 sm:p-6" aria-labelledby={`${idMapa}-evolucao`}>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
          <h2 id={`${idMapa}-evolucao`} className="titulo text-[1.5rem]">
            Vacinação e casos, ano a ano
          </h2>
          <p className="text-sm text-tinta-2">
            Em cima, a vacinação; embaixo, os casos.{" "}
            {temRegioes ? `Toque ${numUm} no mapa para comparar com ${p.nome}.` : "Passe o dedo ou o mouse para ver cada ano."}
          </p>
        </div>
        {!temRegioes && (
          <div className="mt-4 border-b border-linha pb-4">
            <BarraAnos limites={limites} valor={periodo} aoMudar={mudarPeriodo} />
          </div>
        )}
        <div className="mt-4">
          <Evolucao
            anos={p.anos}
            principal={principal}
            comparacoes={comparacoes}
            destaque={destaque}
            periodo={periodo}
            anoParcial={p.anoParcial}
            rotuloDose={`${dose}ª dose`}
          />
        </div>
        <TabelaDosAnos modo={modo} anos={p.anos} linhas={[principal, ...comparacoes]} />
      </section>

      {/* Tabela por estado ou cidade */}
      {temRegioes && (
        <section className="cartao mt-4 p-4 sm:p-6" aria-labelledby={`${idMapa}-tabela`}>
          <h2 id={`${idMapa}-tabela`} className="titulo text-[1.5rem]">
            {tipo === "estado" ? "Estado por estado" : "Cidade por cidade"}: {inicio} × {fim}
          </h2>
          <p className="mt-1 mb-4 text-[0.9375rem] text-tinta-2">
            Em ordem alfabética{dados ? `, ${dados.regioes.length} ${plural}` : ""}. Role a tabela para ver todos e toque no nome para abrir a página do
            lugar.
          </p>
          {dados ? (
            <TabelaRegioes regioes={dados.regioes} modo={modo} anos={p.anos} periodo={periodo} coluna={tipo === "estado" ? "Estado" : "Cidade"} />
          ) : (
            <div className="h-40 rounded-lg bg-grade motion-safe:animate-pulse" />
          )}
        </section>
      )}

      {p.children}
    </div>
  );
}

/** Botões lado a lado em que só um fica escolhido (ex.: Vacinação / Casos). */
function Alternador<T extends string | number>({
  rotulo,
  valor,
  aoMudar,
  opcoes,
}: {
  rotulo: string;
  valor: T;
  aoMudar: (v: T) => void;
  opcoes: { valor: T; texto: string; descricao?: string }[];
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="rotulo" aria-hidden="true">
        {rotulo}
      </span>
      <div role="group" aria-label={rotulo} className="alternador">
        {opcoes.map((o) => (
          <button key={o.valor} type="button" aria-pressed={valor === o.valor} aria-label={o.descricao} onClick={() => aoMudar(o.valor)}>
            {o.texto}
          </button>
        ))}
      </div>
    </div>
  );
}

function resumoDoMapa(modo: Modo, dados: DadosRegioes, anos: Anos, fim: number, plural: string) {
  if (modo === "casos") {
    const com = dados.regioes.filter((r) => (casosEm(r, anos, fim) ?? 0) > 0).length;
    return `Mapa: ${com} de ${dados.regioes.length} ${plural} com casos de sarampo em ${fim}. A tabela abaixo traz os números de cada um.`;
  }
  const c = contar(dados, anos, fim);
  return `Mapa da vacinação em ${fim}: ${c.critico} ${plural} em situação crítica, ${c.alerta} em alerta e ${c.ok} adequados. A tabela abaixo traz os números de cada um.`;
}

function contar(dados: DadosRegioes, anos: Anos, ano: number) {
  const c: Record<Situacao, number> = { ok: 0, alerta: 0, critico: 0, vazio: 0 };
  for (const r of dados.regioes) c[situacao(coberturaEm(r, anos, ano))]++;
  return c;
}

function Legenda({ modo, dados, anos, fim }: { modo: Modo; dados: DadosRegioes | null; anos: Anos; fim: number }) {
  if (modo === "casos") {
    return (
      <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[0.875rem] text-tinta-2" aria-label="Legenda: casos confirmados no ano">
        {FAIXAS_CASOS.map((f) => (
          <li key={f.rotulo} className="flex items-center gap-1.5">
            <span className="size-3.5 rounded-[3px] border border-black/10" style={{ background: f.cor }} aria-hidden="true" />
            {f.rotulo}
          </li>
        ))}
      </ul>
    );
  }
  const c = dados ? contar(dados, anos, fim) : null;
  const tinta: Record<Situacao, string> = { critico: "text-critico-tinta", alerta: "text-alerta-tinta", ok: "text-ok-tinta", vazio: "text-tinta-2" };
  const tipos: Situacao[] = c && c.vazio > 0 ? ["critico", "alerta", "ok", "vazio"] : ["critico", "alerta", "ok"];
  // Amostra da cor do mapa + ícone + palavra + quantos lugares: sem pílulas.
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[0.875rem]" aria-label="Legenda das situações">
      {tipos.map((t) => (
        <li key={t} className="inline-flex items-center gap-1.5">
          <span className="size-3.5 rounded-[3px]" style={{ background: SITUACOES[t].cor }} aria-hidden="true" />
          <span className={`inline-flex items-center gap-1 font-semibold ${tinta[t]}`}>
            {t !== "vazio" && <Icone nome={t} className="size-4" />}
            {SITUACOES[t].nome}
          </span>
          {c && <span className="text-tinta-2">{c[t]}</span>}
          <span className="sr-only">({SITUACOES[t].faixa})</span>
        </li>
      ))}
    </ul>
  );
}

/** Uma célula da faixa de números (as linhas entre elas vêm da grade). */
function Cartao({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <article className="flex flex-col gap-2 bg-folha p-4 sm:p-5">
      <p className="text-[0.9375rem] text-tinta-2">{rotulo}</p>
      {children}
    </article>
  );
}

function Numeros({
  modo,
  periodo: [inicio, fim],
  anos,
  principal,
  comparacoes,
  dados,
  plural,
  temRegioes,
  anoParcial,
  dose,
}: PropsPainel & { modo: Modo; dose: Dose; periodo: [number, number]; dados: DadosRegioes | null; plural: string; temRegioes: boolean }) {
  // Uma faixa só, com linhas de 1 px entre as células (fundo da grade
  // aparecendo). No celular: o número principal e o último na largura toda;
  // os dois do meio lado a lado.
  const grade =
    "mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-linha bg-linha lg:grid-cols-4 [&>*:first-child]:col-span-2 [&>*:last-child]:col-span-2 lg:[&>*:first-child]:col-span-1 lg:[&>*:last-child]:col-span-1";
  const parcial = (a: number) => (a === anoParcial ? " (parcial)" : "");

  if (modo === "vacinacao") {
    const v = coberturaEm(principal, anos, fim);
    const v0 = coberturaEm(principal, anos, inicio);
    const d = v !== null && v0 !== null ? v - v0 : null;
    const c = casosEm(principal, anos, fim);
    const c0 = casosEm(principal, anos, inicio);
    const s = situacao(v);
    return (
      <div className={grade}>
        <Cartao rotulo={dose === 1 ? `Crianças de 1 ano vacinadas em ${fim}` : `Crianças de 1 ano com a 2ª dose em ${fim}`}>
          <p className="numero text-[2.75rem]">{v === null ? "sem dado" : porcentagem(v)}</p>
          <Selo tipo={s}>{s === "vazio" ? "Sem dado oficial" : `${SITUACOES[s].nome} · a meta é 95%`}</Selo>
        </Cartao>
        <Cartao rotulo={inicio === fim ? "Variação" : `Desde ${inicio}`}>
          {d === null || inicio === fim ? (
            <p className="numero text-[2.75rem] text-tinta-3">—</p>
          ) : praticamenteIgual(d) ? (
            <p className="numero text-[2.75rem] text-tinta-2">igual</p>
          ) : (
            <p className={`numero flex items-center gap-1 text-[2.75rem] ${d < 0 ? "text-critico-tinta" : "text-ok-tinta"}`}>
              <Icone nome={d < 0 ? "desce" : "sobe"} className="size-9" />
              <span className="sr-only">{d < 0 ? "caiu" : "subiu"}</span>
              {decimal(Math.abs(d))}
            </p>
          )}
          <p className="text-sm text-tinta-2">
            {inicio === fim
              ? "Escolha um período com dois anos diferentes."
              : d === null
                ? `Sem número oficial em ${v0 === null ? inicio : fim}.`
                : praticamenteIgual(d)
                ? `Em ${inicio} também eram ${porcentagem(v0!)}.`
                : `pontos ${d < 0 ? "a menos" : "a mais"}. Em ${inicio} eram ${porcentagem(v0!)}.`}
          </p>
        </Cartao>
        <Cartao rotulo={`Casos de sarampo em ${fim}`}>
          <p className="numero text-[2.75rem]">{c === null ? "—" : numero(c)}</p>
          <p className="text-sm text-tinta-2">
            {c === null ? `Os casos começam em ${anos.casos[0]}.` : c0 !== null && inicio !== fim ? `Em ${inicio}: ${numero(c0)}.` : "Casos confirmados no ano."}
          </p>
        </Cartao>
        {temRegioes ? (
          <Cartao rotulo={`${plural[0].toUpperCase()}${plural.slice(1)} em ${fim}`}>
            {dados ? <Distribuicao dados={dados} anos={anos} fim={fim} /> : <div className="h-14 rounded-lg bg-grade motion-safe:animate-pulse" />}
          </Cartao>
        ) : (
          <Cartao rotulo={`Comparação em ${fim}`}>
            <ul className="space-y-1.5">
              {comparacoes.map((l) => {
                const cv = coberturaEm(l.serie, anos, fim);
                return (
                  <li key={l.nome} className="flex items-center justify-between gap-2">
                    <span className="font-semibold">{l.nome}</span>
                    <span className="flex items-center gap-2">
                      <b className="numero text-xl">{cv === null ? "—" : porcentagem(cv)}</b>
                    </span>
                  </li>
                );
              })}
            </ul>
          </Cartao>
        )}
      </div>
    );
  }

  const c = casosEm(principal, anos, fim) ?? 0;
  const c0 = casosEm(principal, anos, inicio) ?? 0;
  const d = c - c0;
  const comCasos = dados ? dados.regioes.filter((r) => (casosEm(r, anos, fim) ?? 0) > 0).length : null;
  return (
    <div className={grade}>
      <Cartao rotulo={`Casos de sarampo em ${fim}${parcial(fim)}`}>
        <p className="numero text-[2.75rem] text-casos-tinta">{numero(c)}</p>
        <p className="text-sm text-tinta-2">pessoas com sarampo confirmado</p>
      </Cartao>
      <Cartao rotulo={inicio === fim ? "Variação" : `Desde ${inicio}`}>
        {inicio === fim ? (
          <p className="numero text-[2.75rem] text-tinta-3">—</p>
        ) : (
          // Neutro: verde e vermelho ficam só para a situação da cobertura.
          <p className="numero flex items-center gap-1 text-[2.75rem]">
            {d !== 0 && <Icone nome={d > 0 ? "sobe" : "desce"} className="size-9 text-tinta-2" />}
            <span className="sr-only">{d > 0 ? "subiu" : d < 0 ? "caiu" : ""}</span>
            {numero(Math.abs(d))}
          </p>
        )}
        <p className="text-sm text-tinta-2">{inicio === fim ? "Escolha um período com dois anos diferentes." : `${d > 0 ? "casos a mais" : d < 0 ? "casos a menos" : "casos, igual"}. Em ${inicio}: ${numero(c0)}.`}</p>
      </Cartao>
      <Cartao rotulo={`Total de ${inicio} a ${fim}`}>
        <p className="numero text-[2.75rem]">{numero(casosNoPeriodo(principal, anos, [inicio, fim]))}</p>
        <p className="text-sm text-tinta-2">casos confirmados no período</p>
      </Cartao>
      {temRegioes ? (
        <Cartao rotulo={`${plural[0].toUpperCase()}${plural.slice(1)} com casos em ${fim}`}>
          {comCasos === null || !dados ? (
            <div className="h-14 rounded-lg bg-grade motion-safe:animate-pulse" />
          ) : (
            <>
              <p className="numero text-[2.75rem]">
                {comCasos} <span className="text-xl text-tinta-3">de {dados.regioes.length}</span>
              </p>
              <div className="h-3 overflow-hidden rounded-full bg-grade" aria-hidden="true">
                <div className="h-full rounded-full bg-casos" style={{ width: `${(comCasos / dados.regioes.length) * 100}%` }} />
              </div>
            </>
          )}
        </Cartao>
      ) : (
        <Cartao rotulo={`Comparação em ${fim}`}>
          <ul className="space-y-1.5">
            {comparacoes.map((l) => (
              <li key={l.nome} className="flex items-center justify-between gap-2">
                <span className="font-semibold">{l.nome}</span>
                <b className="numero text-xl">{numero(casosEm(l.serie, anos, fim) ?? 0)}</b>
              </li>
            ))}
          </ul>
        </Cartao>
      )}
    </div>
  );
}

function Distribuicao({ dados, anos, fim }: { dados: DadosRegioes; anos: Anos; fim: number }) {
  const c = contar(dados, anos, fim);
  const ordem: Situacao[] = ["critico", "alerta", "ok", "vazio"];
  const tinta: Record<Situacao, string> = { critico: "text-critico-tinta", alerta: "text-alerta-tinta", ok: "text-ok-tinta", vazio: "text-tinta-3" };
  return (
    <>
      <div className="mt-1 flex h-3.5 gap-[3px] overflow-hidden rounded-full" aria-hidden="true">
        {ordem.map((t) => c[t] > 0 && <span key={t} style={{ flex: c[t], background: SITUACOES[t].cor }} />)}
      </div>
      <ul className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
        {ordem.map(
          (t) =>
            c[t] > 0 && (
              <li key={t}>
                <b className={`text-lg ${tinta[t]}`}>{c[t]}</b> {SITUACOES[t].plural}
              </li>
            ),
        )}
      </ul>
    </>
  );
}

function TabelaDosAnos({ modo, anos, linhas }: { modo: Modo; anos: Anos; linhas: Linha[] }) {
  const lista = listaAnos(modo === "vacinacao" ? anos.cobertura : anos.casos).reverse();
  return (
    <details className="group mt-4">
      <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 py-1 text-sm font-bold text-azul hover:text-azul-escuro">
        <Icone nome="seta" className="size-4 transition-transform group-open:rotate-90" />
        Ver os números em tabela
      </summary>
      <div className="relative mt-2 max-h-80 overflow-auto rounded-lg border border-linha">
        <table className="w-full border-collapse text-left text-[0.9375rem]">
          <caption className="sr-only">{modo === "vacinacao" ? "Cobertura vacinal por ano" : "Casos de sarampo por ano"}</caption>
          <thead className="sticky top-0 bg-grade">
            <tr>
              <th scope="col" className="rotulo px-3 py-2">Ano</th>
              {linhas.map((l) => (
                <th key={l.nome} scope="col" className="rotulo px-3 py-2 text-right">
                  {l.nome}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lista.map((a) => (
              <tr key={a} className="border-t border-grade">
                <th scope="row" className="px-3 py-1.5 font-semibold">{a}</th>
                {linhas.map((l) => {
                  const v = modo === "vacinacao" ? coberturaEm(l.serie, anos, a) : casosEm(l.serie, anos, a);
                  return (
                    <td key={l.nome} className="px-3 py-1.5 text-right">
                      {v === null ? "—" : modo === "vacinacao" ? porcentagem(v) : numero(v)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
