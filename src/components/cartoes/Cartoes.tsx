import Link from "next/link";

import { CALENDARIO } from "@/conteudo/calendario";
import { MITOS } from "@/conteudo/mitos";

import { Icone } from "../Icone";
import { CalendarioAbas } from "./CalendarioAbas";
import { CartaoOndeVacinar } from "./CartaoOndeVacinar";
import { CartaoSarampo } from "./CartaoSarampo";
import { CarrosselMitos } from "./CarrosselMitos";

/** "Entenda e se proteja": doença, mitos, calendário e onde se vacinar. */
export function Cartoes({ id = "entenda" }: { id?: string }) {
  return (
    <section id={id} aria-labelledby={`${id}-titulo`} className="scroll-mt-24">
      <h2 id={`${id}-titulo`} className="titulo text-3xl sm:text-4xl">
        Entenda e se proteja
      </h2>
      <p className="mt-2 max-w-2xl text-lg text-tinta-2">A doença, os mitos mais comuns, as vacinas de cada idade e onde tomar. Tudo de graça no SUS.</p>
      <div className="mt-6 grid items-stretch gap-4 md:grid-cols-2 xl:grid-cols-4">
        <CartaoSarampo />
        <CarrosselMitos mitos={MITOS} />
        <article className="cartao flex flex-col">
          <div className="flex flex-col gap-3 px-5 pt-5 pb-4">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-2xl bg-azul-claro text-azul" aria-hidden="true">
                <Icone nome="calendario" className="size-6" />
              </span>
              <h3 className="titulo text-[1.5rem]">Sua vacina está em dia?</h3>
            </div>
            <CalendarioAbas fases={CALENDARIO} limite={3} />
          </div>
          <div className="mt-auto border-t border-grade px-5 py-3">
            <Link href="/calendario" className="inline-flex items-center gap-1 text-sm font-bold text-azul no-underline hover:text-azul-escuro">
              Ver o calendário completo <Icone nome="seta" className="size-4" />
            </Link>
          </div>
        </article>
        <CartaoOndeVacinar />
      </div>
    </section>
  );
}
