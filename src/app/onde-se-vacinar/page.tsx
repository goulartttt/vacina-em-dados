import type { Metadata } from "next";

import { Busca } from "@/components/Busca";
import { Fonte } from "@/components/Fonte";
import { TopoInterno } from "@/components/Voltar";
import { FONTES } from "@/conteudo/fontes";

export const metadata: Metadata = {
  title: "Onde se vacinar",
  description: "Encontre as unidades básicas de saúde (UBS) da sua cidade, com endereço, telefone e mapa, a partir do cadastro oficial do Ministério da Saúde.",
};

// Aqui a ordem importa (é o caminho até a vacina), por isso os passos são numerados.
const PASSOS = [
  { titulo: "Digite a sua cidade", texto: "A página da cidade mostra todas as UBS ativas no cadastro oficial." },
  { titulo: "Ache a mais perto", texto: "Filtre pelo bairro ou toque em “Perto de mim” para ordenar pela distância." },
  { titulo: "Ligue antes de ir", texto: "Confirme o horário da sala de vacina e leve a caderneta e um documento." },
];

export default function OndeSeVacinar() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 sm:pt-8 lg:px-8">
      <TopoInterno voltar={{ href: "/", rotulo: "Voltar ao painel" }} itens={[{ href: "/", rotulo: "Início" }, { rotulo: "Onde se vacinar" }]} />
      <section className="max-w-3xl">
        <h1 className="titulo text-[2.25rem] sm:text-5xl">Onde se vacinar</h1>
        <p className="mt-3 text-lg text-tinta-2">
          As vacinas do calendário são de graça nas unidades básicas de saúde (UBS).
          <Fonte fonte={FONTES.msCalendario} /> Digite a sua cidade para ver as unidades, com endereço, telefone e mapa.
        </p>
        <div className="mt-6">
          <Busca grande destino="#onde-se-vacinar" rotulo="Buscar a cidade para ver as UBS" />
        </div>
      </section>
      <ol className="mt-10 grid gap-px overflow-hidden rounded-xl border border-linha bg-linha md:grid-cols-3">
        {PASSOS.map((p, i) => (
          <li key={p.titulo} className="bg-folha p-5 sm:p-6">
            <p className="numero text-lg text-azul">{i + 1}.</p>
            <h2 className="mt-1 font-titulo text-[1.1875rem] font-bold">{p.titulo}</h2>
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
