"use client";

import Link from "next/link";
import { useState } from "react";

import type { Mito } from "@/conteudo/mitos";

import { Fonte } from "../Fonte";
import { Icone } from "../Icone";

/** Um mito por vez: a pessoa pensa, toca para ver a resposta e passa ao
 *  próximo. O roxo só marca o assunto e o veredito. */
export function CarrosselMitos({ mitos }: { mitos: Mito[] }) {
  const [indice, setIndice] = useState(0);
  const [aberto, setAberto] = useState(false);
  const m = mitos[indice];

  return (
    <article className="cartao">
      <div className="px-5 pt-5 pb-4 sm:px-6">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-semibold text-lilas">Mito ou verdade?</h3>
          <span className="text-sm text-tinta-2">
            {indice + 1} de {mitos.length}
          </span>
        </div>
        <p className="titulo mt-2 text-[1.375rem] leading-snug">“{m.mito}”</p>
        <div aria-live="polite" className="mt-3">
          {aberto ? (
            <div className="aparece rounded-lg bg-lilas-claro px-4 py-3">
              <p className="text-[0.9375rem]">
                <b className="font-titulo text-lilas-escuro">Mito.</b> {m.verdade}
              </p>
              <p className="mt-1.5">
                <Fonte fonte={m.fonte} />
              </p>
            </div>
          ) : (
            <button type="button" onClick={() => setAberto(true)} className="botao border border-lilas text-lilas hover:bg-lilas-claro">
              Ver a resposta
            </button>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-linha px-5 py-2.5 sm:px-6">
        <button
          type="button"
          onClick={() => {
            setIndice((i) => (i + 1) % mitos.length);
            setAberto(false);
          }}
          className="inline-flex items-center gap-1.5 text-[0.9375rem] font-semibold text-lilas hover:text-lilas-escuro"
        >
          <Icone nome="virar" className="size-4" />
          Próximo mito
        </button>
        <Link href="/mitos-e-verdades" className="inline-flex items-center gap-1 text-[0.9375rem] font-semibold text-lilas no-underline hover:text-lilas-escuro">
          Ver todos <Icone nome="seta" className="size-4" />
        </Link>
      </div>
    </article>
  );
}
