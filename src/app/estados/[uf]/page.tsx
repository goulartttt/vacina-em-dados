import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Carregando } from "@/components/Carregando";
import { Cartoes } from "@/components/cartoes/Cartoes";
import { Icone } from "@/components/Icone";
import { Painel } from "@/components/painel/Painel";
import { RodapeDados } from "@/components/RodapeDados";
import { TopoInterno } from "@/components/Voltar";
import { atualizacoes, BRASIL, estados, municipios, territorioPorSlug } from "@/lib/dados";
import { anoParcial } from "@/lib/datas";
import { noLugar } from "@/lib/lugares";
import { anosDoPainel, seriesDoBrasil } from "@/lib/paineis";

const DISTRITO_FEDERAL = 53; // um município só: o mapa de cidades não faz sentido

export async function generateStaticParams() {
  return (await estados()).map((u) => ({ uf: u.slug }));
}

export async function generateMetadata({ params }: PageProps<"/estados/[uf]">): Promise<Metadata> {
  const t = await territorioPorSlug((await params).uf);
  if (!t) return { title: "Estado não encontrado" };
  return {
    title: `${t.nome}: vacinação contra o sarampo`,
    description: `Vacinação contra o sarampo ${noLugar(t)} ano a ano e cidade por cidade, comparada com a meta de 95%, e os casos da doença. Dados oficiais.`,
  };
}

async function Conteudo({ params }: Pick<PageProps<"/estados/[uf]">, "params">) {
  const t = await territorioPorSlug((await params).uf);
  if (!t || t.tipo !== "uf") notFound();
  const anos = await anosDoPainel();
  const [series, ufs, fontes, cidades] = await Promise.all([seriesDoBrasil(anos), estados(), atualizacoes(), municipios()]);
  const serie = series.get(t.id);
  const brasil = series.get(BRASIL);
  if (!serie || !brasil) notFound();
  const unica = t.id === DISTRITO_FEDERAL ? cidades.find((m) => m.pai_id === t.id) : undefined;

  return (
    <>
      <TopoInterno voltar={{ href: "/", rotulo: "Voltar para o Brasil" }} itens={[{ href: "/", rotulo: "Brasil" }, { rotulo: t.nome }]} />
      <Painel
        assunto="Sarampo"
        titulo={`Como está a vacinação contra o sarampo ${noLugar(t)}?`}
        nome={t.nome}
        anos={anos}
        principal={serie}
        comparacoes={[{ nome: "Brasil", serie: brasil }]}
        regioesUrl={unica ? undefined : `/mapas/${t.slug}`}
        tipoRegioes="cidade"
        lugares={[{ href: "/", rotulo: "Brasil" }, ...ufs.map((u) => ({ href: `/estados/${u.slug}`, rotulo: u.nome }))]}
        lugarAtual={`/estados/${t.slug}`}
        anoParcial={anoParcial(fontes, anos)}
      >
        <RodapeDados fontes={fontes} />
      </Painel>
      {unica && (
        <p className="mt-6">
          <Link href={`/municipios/${unica.slug}`} className="botao botao-azul">
            Ver {unica.nome} e as UBS <Icone nome="seta" className="size-4" />
          </Link>
        </p>
      )}
    </>
  );
}

export default function PaginaEstado(props: PageProps<"/estados/[uf]">) {
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
