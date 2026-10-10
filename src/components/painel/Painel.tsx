"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useState } from "react";

import { FAIXAS_CASOS, situacao, SITUACOES, type Situacao } from "@/lib/constantes";
import { decimal, numero, porcentagem } from "@/lib/formato";
import { casosEm, casosNoPeriodo, coberturaEm, listaAnos, type Anos, type DadosRegioes, type Modo, type Serie } from "@/lib/painel";

import { Icone } from "../Icone";
import { Selo } from "../Situacao";
import { BarraAnos } from "./BarraAnos";
import { Evolucao, type Linha } from "./Evolucao";
import { MapaPainel } from "./MapaPainel";
import { TabelaRegioes } from "./TabelaRegioes";

export type PropsPainel = {
  etiqueta: string;
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

const TOM: Record<Situacao, string> = {
  ok: "border-ok-borda bg-[#f3fbf6]",
  alerta: "border-alerta-borda bg-[#fffaeb]",
  critico: "border-critico-borda bg-[#fff5f6]",
  vazio: "border-linha bg-folha",
};

export function Painel(p: PropsPainel) {
  const router = useRouter();
  const idMapa = useId();
  const [modo, setModo] = useState<Modo>("vacinacao");
  const [periodos, setPeriodos] = useState<Record<Modo, [number, number]>>({
    vacinacao: [Math.max(p.anos.cobertura[0], p.anos.cobertura[1] - 6), p.anos.cobertura[1]],
    casos: [Math.max(p.anos.casos[0], p.anos.casos[1] - 9), p.anos.casos[1]],
  });
  const [baixadas, setBaixadas] = useState<DadosRegioes | null>(null);
  const [erro, setErro] = useState(false);
  const [selecionada, setSelecionada] = useState<number | null>(null);

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

  const dados = p.regioes ?? baixadas;
  const porId = useMemo(() => new Map((dados?.regioes ?? []).map((r) => [r.id, r])), [dados]);
  const temRegioes = Boolean(p.regioes || p.regioesUrl);
  const tipo = p.tipoRegioes ?? "estado";
  const plural = tipo === "estado" ? "estados" : "cidades";
  const numUm = tipo === "estado" ? "num estado" : "numa cidade";

  const periodo = periodos[modo];
  const [inicio, fim] = periodo;
  const limites = modo === "vacinacao" ? p.anos.cobertura : p.anos.casos;
  const mudarPeriodo = (v: [number, number]) => setPeriodos((atual) => ({ ...atual, [modo]: v }));

  const principal: Linha = { nome: p.nome, serie: p.principal };
  const escolhida = selecionada !== null ? porId.get(selecionada) : undefined;
  const destaque: Linha | null = escolhida ? { nome: escolhida.nome, serie: escolhida } : null;

  return (
    <div>
      {/* Título e filtros */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="etiqueta">{p.etiqueta}</span>
          <h1 className="titulo mt-3 text-[2.25rem] sm:text-5xl">{p.titulo}</h1>
        </div>
        <div role="group" aria-label="Filtros" className="flex flex-wrap items-end gap-2.5">
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
              <select className="seletor max-w-[13rem]" value={p.lugarAtual} onChange={(e) => router.push(e.target.value)}>
                {p.lugares.map((l) => (
                  <option key={l.href} value={l.href}>
                    {l.rotulo}
                  </option>
                ))}
              </select>
            </label>
          )}
          <div className="flex flex-col gap-1">
            <span className="rotulo">Mostrar</span>
            <div className="flex rounded-xl bg-azul-claro p-1">
              {(
                [
                  ["vacinacao", "Vacinação"],
                  ["casos", "Casos"],
                ] as const
              ).map(([valor, rotulo]) => (
                <button
                  key={valor}
                  type="button"
                  aria-pressed={modo === valor}
                  onClick={() => setModo(valor)}
                  className={`min-h-9 rounded-[0.6rem] px-4 font-bold transition-colors ${modo === valor ? "bg-azul text-white" : "text-azul hover:bg-folha"}`}
                >
                  {rotulo}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Numeros {...p} modo={modo} periodo={periodo} dados={dados} plural={plural} temRegioes={temRegioes} />

      {/* Mapa */}
      {temRegioes && (
        <section aria-labelledby={idMapa} className="cartao relative mt-4 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 pt-4 sm:px-6 sm:pt-5">
            <h2 id={idMapa} className="titulo text-2xl">
              {modo === "vacinacao" ? `Vacinação por ${tipo} em ${fim}` : `Casos de sarampo por ${tipo} em ${fim}`}
            </h2>
            <Legenda modo={modo} dados={dados} anos={p.anos} fim={fim} />
          </div>
          <div className="relative px-4 pt-3 sm:px-6">
            <ol className="mb-3 grid gap-2 rounded-2xl bg-azul-claro p-3.5 text-sm font-medium sm:grid-cols-3 xl:absolute xl:top-3 xl:left-6 xl:z-0 xl:w-60 xl:grid-cols-1">
              {[
                modo === "vacinacao" ? `Cada ${tipo} tem a cor da sua situação em ${fim}.` : `Quanto mais escuro, mais casos em ${fim}.`,
                `Toque ${numUm} para ver o número${tipo === "estado" ? " e abrir as cidades" : ""}.`,
                "Mude os anos na barra abaixo do mapa.",
              ].map((t, i) => (
                <li key={t} className="flex gap-2">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-azul text-xs font-bold text-white" aria-hidden="true">
                    {i + 1}
                  </span>
                  {t}
                </li>
              ))}
            </ol>
            <div className="mx-auto max-w-[620px]">
              {dados ? (
                <MapaPainel
                  malha={dados}
                  regioes={porId}
                  modo={modo}
                  anos={p.anos}
                  periodo={periodo}
                  tipo={tipo}
                  anoParcial={p.anoParcial}
                  aoSelecionar={setSelecionada}
                  resumo={resumoDoMapa(modo, dados, p.anos, fim, plural)}
                />
              ) : (
                <div className="grid aspect-square place-items-center rounded-2xl bg-grade text-tinta-3 motion-safe:animate-pulse">
                  {erro ? "Não foi possível carregar o mapa. Recarregue a página." : "Carregando o mapa…"}
                </div>
              )}
            </div>
          </div>
          <div className="mt-2 border-t border-grade px-4 py-4 sm:px-6">
            <BarraAnos limites={limites} valor={periodo} aoMudar={mudarPeriodo} />
          </div>
        </section>
      )}

      {/* Ano a ano */}
      <section className="cartao mt-4 p-4 sm:p-6" aria-labelledby={`${idMapa}-evolucao`}>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
          <h2 id={`${idMapa}-evolucao`} className="titulo text-2xl">
            Ano a ano
          </h2>
          <p className="text-sm text-tinta-2">
            {modo === "vacinacao"
              ? temRegioes
                ? `Toque ${numUm} no mapa para comparar com ${p.nome}.`
                : "Passe o dedo ou o mouse sobre o gráfico para ver cada ano."
              : "Passe o dedo ou o mouse sobre as barras para ver cada ano."}
          </p>
        </div>
        {!temRegioes && (
          <div className="mt-4 border-b border-grade pb-4">
            <BarraAnos limites={limites} valor={periodo} aoMudar={mudarPeriodo} />
          </div>
        )}
        <div className="mt-4">
          <Evolucao modo={modo} anos={p.anos} principal={principal} comparacoes={p.comparacoes} destaque={destaque} periodo={periodo} anoParcial={p.anoParcial} />
        </div>
        <TabelaDosAnos modo={modo} anos={p.anos} linhas={[principal, ...p.comparacoes]} />
      </section>

      {/* Tabela por estado ou cidade */}
      {temRegioes && (
        <section className="cartao mt-4 p-4 sm:p-6" aria-labelledby={`${idMapa}-tabela`}>
          <h2 id={`${idMapa}-tabela`} className="titulo text-2xl">
            {tipo === "estado" ? "Estado por estado" : "Cidade por cidade"}: {inicio} × {fim}
          </h2>
          <p className="mt-1 mb-4 text-sm text-tinta-2">Em ordem alfabética. Toque no nome para abrir a página do lugar.</p>
          {dados ? (
            <TabelaRegioes regioes={dados.regioes} modo={modo} anos={p.anos} periodo={periodo} coluna={tipo === "estado" ? "Estado" : "Cidade"} />
          ) : (
            <div className="h-40 rounded-xl bg-grade motion-safe:animate-pulse" />
          )}
        </section>
      )}

      {p.children}
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
      <ul className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.8125rem] font-semibold text-tinta-2" aria-label="Legenda: casos confirmados no ano">
        {FAIXAS_CASOS.map((f) => (
          <li key={f.rotulo} className="flex items-center gap-1.5">
            <span className="size-3.5 rounded-[4px] border border-black/10" style={{ background: f.cor }} aria-hidden="true" />
            {f.rotulo}
          </li>
        ))}
      </ul>
    );
  }
  const c = dados ? contar(dados, anos, fim) : null;
  const estilo: Record<Situacao, string> = {
    critico: "border-critico text-critico-tinta bg-critico-fundo",
    alerta: "border-alerta text-alerta-tinta bg-alerta-fundo",
    ok: "border-ok text-ok-tinta bg-ok-fundo",
    vazio: "border-vazio text-tinta-3 bg-grade",
  };
  const tipos: Situacao[] = c && c.vazio > 0 ? ["critico", "alerta", "ok", "vazio"] : ["critico", "alerta", "ok"];
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Legenda das situações">
      {tipos.map((t) => (
        <li key={t} className={`inline-flex items-center gap-1.5 rounded-full border-[1.5px] px-3 py-1 text-[0.8125rem] font-bold ${estilo[t]}`}>
          {t !== "vazio" && <Icone nome={t} className="size-4" />}
          {SITUACOES[t].nome}
          {c && ` · ${c[t]}`}
          <span className="sr-only">({SITUACOES[t].faixa})</span>
        </li>
      ))}
    </ul>
  );
}

function Cartao({ rotulo, children, className = "" }: { rotulo: string; children: React.ReactNode; className?: string }) {
  return (
    <article className={`flex flex-col gap-2 rounded-[1.25rem] border p-4 sm:p-5 ${className || "border-linha bg-folha"}`}>
      <p className="text-sm font-semibold text-tinta-2">{rotulo}</p>
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
}: PropsPainel & { modo: Modo; periodo: [number, number]; dados: DadosRegioes | null; plural: string; temRegioes: boolean }) {
  // No celular: o número principal e o quarto cartão na largura toda; os
  // dois do meio lado a lado (menos rolagem).
  const grade =
    "mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4 [&>*:first-child]:col-span-2 [&>*:last-child]:col-span-2 lg:[&>*:first-child]:col-span-1 lg:[&>*:last-child]:col-span-1";
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
        <Cartao rotulo={`Crianças de 1 ano vacinadas em ${fim}`} className={TOM[s]}>
          <p className="numero text-[2.75rem]">{v === null ? "sem dado" : porcentagem(v)}</p>
          <Selo tipo={s}>{s === "vazio" ? "Sem dado oficial" : `${SITUACOES[s].nome} · a meta é 95%`}</Selo>
        </Cartao>
        <Cartao rotulo={inicio === fim ? "Variação" : `Desde ${inicio}`}>
          {d === null || inicio === fim ? (
            <p className="numero text-[2.75rem] text-tinta-3">—</p>
          ) : (
            <p className={`numero flex items-center gap-1 text-[2.75rem] ${d < 0 ? "text-critico-tinta" : "text-ok-tinta"}`}>
              <Icone nome={d < 0 ? "desce" : "sobe"} className="size-9" />
              <span className="sr-only">{d < 0 ? "caiu" : "subiu"}</span>
              {decimal(Math.abs(d))}
            </p>
          )}
          <p className="text-sm text-tinta-2">
            {d === null || inicio === fim ? "Escolha um período com dois anos diferentes." : `pontos ${d < 0 ? "a menos" : "a mais"}. Em ${inicio} eram ${porcentagem(v0!)}.`}
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
      <Cartao rotulo={`Casos de sarampo em ${fim}${parcial(fim)}`} className="border-[#ffd2bd] bg-[#fff6f1]">
        <p className="numero text-[2.75rem] text-casos-tinta">{numero(c)}</p>
        <p className="text-sm text-tinta-2">pessoas com sarampo confirmado</p>
      </Cartao>
      <Cartao rotulo={inicio === fim ? "Variação" : `Desde ${inicio}`}>
        {inicio === fim ? (
          <p className="numero text-[2.75rem] text-tinta-3">—</p>
        ) : (
          <p className={`numero flex items-center gap-1 text-[2.75rem] ${d > 0 ? "text-critico-tinta" : d < 0 ? "text-ok-tinta" : ""}`}>
            {d !== 0 && <Icone nome={d > 0 ? "sobe" : "desce"} className="size-9" />}
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
      <div className="mt-2 max-h-80 overflow-auto rounded-xl border border-linha">
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
