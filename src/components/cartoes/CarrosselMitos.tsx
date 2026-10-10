"use client";

import Link from "next/link";
import { useState } from "react";

import type { Mito } from "@/conteudo/mitos";

import { Fonte } from "../Fonte";
import { Icone } from "../Icone";

/** Um mito por vez: a pessoa pensa, toca para ver a verdade e passa ao próximo. */
export function CarrosselMitos({ mitos }: { mitos: Mito[] }) {
  const [indice, setIndice] = useState(0);
  const [aberto, setAberto] = useState(false);
  const m = mitos[indice];

  return (
    <article className="cartao flex flex-col border-[#ddd5fc] bg-lilas-claro">
      <div className="flex flex-col gap-3 px-5 pt-5 pb-4">
        <div className="flex items-center justify-between">
          <h3 className="rotulo text-lilas-escuro">Mito ou verdade?</h3>
          <span className="text-sm font-semibold text-tinta-3">
            {indice + 1} de {mitos.length}
          </span>
        </div>
        <p className="titulo text-[1.5rem] leading-[1.15]">“{m.mito}”</p>
        <div aria-live="polite">
          {aberto ? (
            <div className="aparece rounded-2xl bg-folha p-4">
              <p className="mb-1.5 inline-block rounded-md bg-lilas px-2 py-0.5 text-xs font-extrabold tracking-[0.08em] text-white">MITO</p>
              <p className="text-[0.9375rem]">{m.verdade}</p>
              <p className="mt-2">
                <Fonte fonte={m.fonte} />
              </p>
            </div>
          ) : (
            <button type="button" onClick={() => setAberto(true)} className="botao w-full bg-lilas text-white hover:bg-lilas-escuro">
              Ver a resposta
            </button>
          )}
        </div>
      </div>
      <div className="mt-auto flex items-center justify-between gap-2 border-t border-[#ddd5fc] px-5 py-3">
        <button
          type="button"
          onClick={() => {
            setIndice((i) => (i + 1) % mitos.length);
            setAberto(false);
          }}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-lilas-escuro hover:underline"
        >
          <Icone nome="virar" className="size-4" />
          Próximo mito
        </button>
        <Link href="/mitos-e-verdades" className="inline-flex items-center gap-1 text-sm font-bold text-lilas-escuro no-underline hover:underline">
          Ver todos <Icone nome="seta" className="size-4" />
        </Link>
      </div>
    </article>
  );
}
