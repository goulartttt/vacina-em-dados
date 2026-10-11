import type { Metadata } from "next";

import { ListaMitos } from "@/components/cartoes/ListaMitos";
import { Fonte } from "@/components/Fonte";
import { TopoInterno } from "@/components/Voltar";
import { AVISO_MEDICO, FONTES } from "@/conteudo/fontes";
import { MITOS } from "@/conteudo/mitos";

export const metadata: Metadata = {
  title: "Mitos e verdades sobre as vacinas",
  description: "Vacina causa autismo? Várias vacinas no mesmo dia fazem mal? As respostas do Ministério da Saúde para os mitos mais comuns sobre vacinação.",
};

export default function MitosEVerdades() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 sm:pt-8 lg:px-8">
      <TopoInterno voltar={{ href: "/", rotulo: "Voltar ao painel" }} itens={[{ href: "/", rotulo: "Início" }, { rotulo: "Mitos e verdades" }]} />
      <header className="max-w-3xl">
        <h1 className="titulo text-[2.25rem] sm:text-5xl">Mitos e verdades sobre as vacinas</h1>
        <p className="mt-4 text-lg text-tinta-2">
          Se a vacinação para, as doenças que ela previne voltam.
          <Fonte fonte={FONTES.msPerguntas} /> Leia cada frase, pense se é verdade e toque para ver a resposta oficial.
        </p>
      </header>
      <div className="mt-8">
        <ListaMitos mitos={MITOS} />
      </div>
      <p className="mt-10 text-sm text-tinta-3">
        As respostas resumem, em linguagem simples, as perguntas frequentes sobre vacinação do Ministério da Saúde. {AVISO_MEDICO}
      </p>
    </div>
  );
}
