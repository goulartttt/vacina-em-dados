import type { Metadata } from "next";

import { Busca } from "@/components/Busca";
import { Fonte } from "@/components/Fonte";
import { Icone, type NomeIcone } from "@/components/Icone";
import { TopoInterno } from "@/components/Voltar";
import { FONTES } from "@/conteudo/fontes";

export const metadata: Metadata = {
  title: "Onde se vacinar",
  description: "Encontre as unidades básicas de saúde (UBS) da sua cidade, com endereço, telefone e mapa, a partir do cadastro oficial do Ministério da Saúde.",
};

const PASSOS: { icone: NomeIcone; titulo: string; texto: string }[] = [
  { icone: "busca", titulo: "Digite a sua cidade", texto: "A página da cidade mostra todas as UBS ativas no cadastro oficial." },
  { icone: "local", titulo: "Ache a mais perto", texto: "Filtre pelo bairro ou toque em “Perto de mim” para ordenar pela distância." },
  { icone: "fone", titulo: "Ligue antes de ir", texto: "Confirme o horário da sala de vacina e leve a caderneta e um documento." },
];

export default function OndeSeVacinar() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 sm:pt-8 lg:px-8">
      <TopoInterno voltar={{ href: "/", rotulo: "Voltar ao painel" }} itens={[{ href: "/", rotulo: "Início" }, { rotulo: "Onde se vacinar" }]} />
      <section className="cartao p-6 sm:p-10">
        <span className="grid size-14 place-items-center rounded-2xl bg-azul-claro text-azul" aria-hidden="true">
          <Icone nome="pin" className="size-7" />
        </span>
        <h1 className="titulo mt-4 text-[2.5rem] sm:text-6xl">Onde se vacinar</h1>
        <p className="mt-3 max-w-2xl text-lg text-tinta-2">
          As vacinas do calendário são de graça nas unidades básicas de saúde (UBS).
          <Fonte fonte={FONTES.msCalendario} /> Digite a sua cidade para ver as unidades, com endereço, telefone e mapa.
        </p>
        <div className="mt-6 max-w-2xl">
          <Busca grande destino="#onde-se-vacinar" rotulo="Buscar a cidade para ver as UBS" />
        </div>
      </section>
      <ol className="mt-6 grid gap-4 md:grid-cols-3">
        {PASSOS.map((p, i) => (
          <li key={p.titulo} className="cartao p-5">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-full bg-azul font-bold text-white" aria-hidden="true">
                {i + 1}
              </span>
              <Icone nome={p.icone} className="size-6 text-azul" />
            </div>
            <h2 className="titulo mt-3 text-xl">{p.titulo}</h2>
            <p className="mt-1 text-tinta-2">{p.texto}</p>
          </li>
        ))}
      </ol>
      <p className="mt-8 text-sm text-tinta-3">
        A lista vem do cadastro oficial de estabelecimentos de saúde (CNES): só entram unidades básicas que estão ativas.
        <Fonte fonte={FONTES.cnes} rotulo="Fonte: CNES, Ministério da Saúde" />
      </p>
    </div>
  );
}
