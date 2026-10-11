import Link from "next/link";

import { CALENDARIO } from "@/conteudo/calendario";
import { MITOS } from "@/conteudo/mitos";

import { Icone } from "../Icone";
import { CalendarioAbas } from "./CalendarioAbas";
import { CartaoOndeVacinar } from "./CartaoOndeVacinar";
import { CartaoSarampo } from "./CartaoSarampo";
import { CarrosselMitos } from "./CarrosselMitos";

/**
 * "Entenda e se proteja": doença, mitos, calendário e onde se vacinar.
 * Composição em vez de quatro cartões iguais: à esquerda a doença e o mito
 * (empilhados), à direita o calendário (o conteúdo mais alto) e, embaixo, a
 * faixa de onde se vacinar. Nada é esticado para igualar alturas.
 */
export function Cartoes({ id = "entenda" }: { id?: string }) {
  return (
    <section id={id} aria-labelledby={`${id}-titulo`} className="scroll-mt-24">
      <h2 id={`${id}-titulo`} className="titulo text-[1.75rem] sm:text-[2.125rem]">
        Entenda e se proteja
      </h2>
      <p className="mt-2 max-w-2xl text-tinta-2">A doença, os mitos mais comuns, as vacinas de cada idade e onde tomar. Tudo de graça no SUS.</p>
      <div className="mt-6 grid items-start gap-4 lg:grid-cols-12">
        <div className="grid gap-4 lg:col-span-7">
          <CartaoSarampo />
          <CarrosselMitos mitos={MITOS} />
        </div>
        <article className="cartao lg:col-span-5">
          <div className="px-5 pt-5 pb-4 sm:px-6">
            <h3 className="titulo text-[1.375rem]">Sua vacina está em dia?</h3>
            <div className="mt-3">
              <CalendarioAbas fases={CALENDARIO} limite={3} />
            </div>
          </div>
          <div className="border-t border-linha px-5 py-3 sm:px-6">
            <Link href="/calendario" className="inline-flex items-center gap-1 text-[0.9375rem] font-semibold text-azul no-underline hover:text-azul-escuro">
              Ver o calendário completo <Icone nome="seta" className="size-4" />
            </Link>
          </div>
        </article>
        <div className="lg:col-span-12">
          <CartaoOndeVacinar />
        </div>
      </div>
    </section>
  );
}
