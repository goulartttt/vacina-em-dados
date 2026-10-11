import Link from "next/link";

import { SARAMPO } from "@/conteudo/sarampo";

import { Fonte } from "../Fonte";
import { Icone } from "../Icone";

const ITENS = [
  { titulo: "Sintomas", texto: SARAMPO.sintomasCurto },
  { titulo: "Sinal de alerta", texto: SARAMPO.alertaCurto },
  { titulo: "Como prevenir", texto: SARAMPO.prevencao },
];

/** A doença em três colunas: sintomas, sinal de alerta e prevenção. */
export function CartaoSarampo() {
  return (
    <article className="cartao">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-5 pt-5 sm:px-6">
        <h3 className="titulo text-[1.375rem]">
          Sarampo <span className="text-base font-medium tracking-normal text-tinta-2">· passa pelo ar</span>
        </h3>
        <Link href="/doencas/sarampo" className="inline-flex items-center gap-1 text-[0.9375rem] font-semibold text-azul no-underline hover:text-azul-escuro">
          Tudo sobre o sarampo <Icone nome="seta" className="size-4" />
        </Link>
      </div>
      <dl className="mt-4 grid border-t border-linha sm:grid-cols-3 sm:divide-x sm:divide-linha">
        {ITENS.map((i) => (
          <div key={i.titulo} className="border-b border-linha px-5 py-4 last:border-b-0 sm:border-b-0 sm:px-6">
            <dt className="font-semibold">{i.titulo}</dt>
            <dd className="mt-1 text-[0.9375rem] text-tinta-2">{i.texto}</dd>
          </div>
        ))}
      </dl>
      <div className="border-t border-linha px-5 py-2.5 sm:px-6">
        <Fonte fonte={SARAMPO.fonte} />
      </div>
    </article>
  );
}
