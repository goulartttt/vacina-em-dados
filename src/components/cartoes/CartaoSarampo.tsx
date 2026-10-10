import Link from "next/link";

import { SARAMPO } from "@/conteudo/sarampo";

import { Fonte } from "../Fonte";
import { Icone } from "../Icone";

/** Cartão da doença: sintomas, sinal de alerta e prevenção. */
export function CartaoSarampo() {
  return (
    <article className="cartao flex flex-col overflow-hidden">
      <div className="flex items-center justify-between gap-3 bg-azul px-5 py-4 text-white">
        <h3 className="titulo text-[1.75rem]">Sarampo</h3>
        <span className="text-sm font-semibold opacity-90">passa pelo ar</span>
      </div>
      <dl className="grid gap-3 px-5 py-4 text-[0.9375rem]">
        <div>
          <dt className="rotulo">Sintomas</dt>
          <dd className="mt-0.5">{SARAMPO.sintomasCurto}</dd>
        </div>
        <div>
          <dt className="rotulo flex items-center gap-1.5 text-critico-tinta">
            <Icone nome="critico" className="size-4" />
            Sinal de alerta
          </dt>
          <dd className="mt-0.5">{SARAMPO.alertaCurto}</dd>
        </div>
        <div>
          <dt className="rotulo flex items-center gap-1.5 text-ok-tinta">
            <Icone nome="ok" className="size-4" />
            Como prevenir
          </dt>
          <dd className="mt-0.5">{SARAMPO.prevencao}</dd>
        </div>
      </dl>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-grade px-5 py-3">
        <Fonte fonte={SARAMPO.fonte} />
        <Link href="/doencas/sarampo" className="inline-flex items-center gap-1 text-sm font-bold text-azul no-underline hover:text-azul-escuro">
          Saiba mais <Icone nome="seta" className="size-4" />
        </Link>
      </div>
    </article>
  );
}
