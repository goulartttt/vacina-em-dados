import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Carregando } from "@/components/Carregando";
import { Cartoes } from "@/components/cartoes/Cartoes";
import { Fonte } from "@/components/Fonte";
import { Icone } from "@/components/Icone";
import { ListaUbs } from "@/components/ListaUbs";
import { Painel } from "@/components/painel/Painel";
import { RodapeDados } from "@/components/RodapeDados";
import { TopoInterno } from "@/components/Voltar";
import { FONTES } from "@/conteudo/fontes";
import { atualizacoes, BRASIL, municipios, serieCobertura, territorioPorId, territorioPorSlug, ubsDoMunicipio } from "@/lib/dados";
import { anoParcial } from "@/lib/datas";
import { data, numero } from "@/lib/formato";
import { nomeCompleto, noLugar } from "@/lib/lugares";
import { anosDoPainel, serieDe, seriesDoBrasil } from "@/lib/paineis";

const POPULACAO_PEQUENA = 200;

// As capitais saem prontas no build; os outros municípios são gerados na
// primeira visita e guardados em cache (ISR).
const CAPITAIS = [
  1100205, 1200401, 1302603, 1400100, 1501402, 1600303, 1721000, 2111300, 2211001, 2304400, 2408102, 2507507, 2611606, 2704302,
  2800308, 2927408, 3106200, 3205309, 3304557, 3550308, 4106902, 4205407, 4314902, 5002704, 5103403, 5208707, 5300108,
];

export async function generateStaticParams() {
  const todos = await municipios();
  return todos.filter((m) => CAPITAIS.includes(m.id)).map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: PageProps<"/municipios/[slug]">): Promise<Metadata> {
  const t = await territorioPorSlug((await params).slug);
  if (!t) return { title: "Município não encontrado" };
  const nome = nomeCompleto(t);
  return {
    title: `${nome}: vacinação contra o sarampo e onde se vacinar`,
    description: `Cobertura da vacina tríplice viral em ${nome}, ano a ano, comparada com a meta de 95%, o estado e o Brasil; casos de sarampo; e as UBS da cidade com endereço e telefone. Dados oficiais do Ministério da Saúde.`,
  };
}

async function Conteudo({ params }: Pick<PageProps<"/municipios/[slug]">, "params">) {
  const t = await territorioPorSlug((await params).slug);
  if (!t || t.tipo !== "municipio" || t.pai_id === null) notFound();
  const anos = await anosDoPainel();
  const [serie, series, uf, unidades, fontes, pontos] = await Promise.all([
    serieDe(t.id, anos),
    seriesDoBrasil(anos),
    territorioPorId(t.pai_id),
    ubsDoMunicipio(t.id),
    atualizacoes(),
    serieCobertura(t.id),
  ]);
  const serieUf = series.get(t.pai_id);
  const brasil = series.get(BRASIL);
  if (!uf || !serieUf || !brasil) notFound();

  const nome = nomeCompleto(t);
  const ultimo = [...pontos].reverse().find((p) => p.cobertura !== null);
  const acimaDe100 = pontos.filter((p) => (p.cobertura ?? 0) > 100).map((p) => p.ano);
  const pequena = ultimo?.populacao != null && ultimo.populacao < POPULACAO_PEQUENA;
  const cnes = fontes.find((f) => f.fonte === "cnes_ubs");

  return (
    <>
      <TopoInterno
        voltar={{ href: `/estados/${uf.slug}`, rotulo: `Voltar para ${uf.nome}` }}
        itens={[{ href: "/", rotulo: "Brasil" }, { href: `/estados/${uf.slug}`, rotulo: uf.nome }, { rotulo: t.nome }]}
      />
      <Painel
        etiqueta="Sarampo · vacina tríplice viral, 1ª dose"
        titulo={`Como está a vacinação contra o sarampo ${noLugar(t)}?`}
        nome={nome}
        anos={anos}
        principal={serie}
        comparacoes={[
          { nome: `${uf.nome} (estado)`, serie: serieUf },
          { nome: "Brasil", serie: brasil },
        ]}
        anoParcial={anoParcial(fontes, anos)}
      >
        {(acimaDe100.length > 0 || pequena || !ultimo) && (
          <section aria-label="Para ler os números" className="mt-4 grid gap-3 md:grid-cols-2">
            {!ultimo && <Nota titulo="Sem cobertura oficial">Não há cobertura oficial publicada para esta cidade no período.</Nota>}
            {acimaDe100.length > 0 && (
              <Nota titulo="Por que passa de 100%?">
                A cobertura divide as doses aplicadas pela estimativa de crianças da idade. Quando a estimativa fica abaixo do real, ou quando
                crianças de outras cidades se vacinam aqui, o resultado passa de 100%. O número é o oficial e não foi alterado.
                <Fonte fonte={FONTES.datasusCobertura} />
              </Nota>
            )}
            {pequena && (
              <Nota titulo="Cidade pequena">
                Com {numero(ultimo?.populacao ?? 0)} crianças na idade, poucas doses a mais ou a menos mudam bastante a porcentagem. Olhe a
                tendência de vários anos, não um ano isolado.
              </Nota>
            )}
          </section>
        )}
        <RodapeDados fontes={fontes} />
      </Painel>

      <section id="onde-se-vacinar" aria-labelledby="titulo-ubs" className="cartao mt-10 scroll-mt-24 p-5 sm:p-8">
        <div className="flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-2xl bg-azul-claro text-azul" aria-hidden="true">
            <Icone nome="pin" className="size-6" />
          </span>
          <h2 id="titulo-ubs" className="titulo text-3xl">
            Onde se vacinar {noLugar(t)}
          </h2>
        </div>
        <p className="mt-3 max-w-3xl text-lg text-tinta-2">
          As vacinas do calendário são de graça nas unidades básicas de saúde (UBS). Leve a caderneta de vacinação e um documento.
          <Fonte fonte={FONTES.msCalendario} />
        </p>
        <div className="mt-5">
          <ListaUbs ubs={unidades} cidade={nome} />
        </div>
        <p className="mt-5 flex items-start gap-2 rounded-2xl bg-alerta-fundo p-3.5 text-[0.9375rem] text-tinta">
          <Icone nome="alerta" className="mt-0.5 size-5 text-alerta-tinta" />
          <span>
            Ligue antes de ir: nem toda UBS tem sala de vacina aberta em todos os horários. Lista do cadastro oficial de estabelecimentos
            {cnes ? `, coletada em ${data(cnes.coletado_em)}` : ""}.
            <Fonte fonte={FONTES.cnes} rotulo="Fonte: CNES, Ministério da Saúde" />
          </span>
        </p>
      </section>
    </>
  );
}

function Nota({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-linha bg-folha p-4 text-[0.9375rem] text-tinta-2">
      <p className="mb-1 font-bold text-tinta">{titulo}</p>
      {children}
    </div>
  );
}

export default function PaginaMunicipio(props: PageProps<"/municipios/[slug]">) {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 sm:pt-8 lg:px-8">
      <Suspense fallback={<Carregando />}>
        <Conteudo params={props.params} />
      </Suspense>
      <div className="mt-14">
        <Cartoes />
      </div>
    </div>
  );
}
