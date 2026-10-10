"use client";

import { useId, useRef, useState } from "react";

import type { Fase } from "@/conteudo/calendario";

import { Fonte } from "../Fonte";

/**
 * Calendário em abas, uma por fase da vida (padrão de abas da WAI-ARIA:
 * setas trocam de aba). Com "limite", mostra só as primeiras idades.
 */
export function CalendarioAbas({ fases, limite, inicial = 0 }: { fases: Fase[]; limite?: number; inicial?: number }) {
  const id = useId();
  const [atual, setAtual] = useState(inicial);
  const abas = useRef<(HTMLButtonElement | null)[]>([]);
  const fase = fases[atual];
  const doses = limite ? fase.doses.slice(0, limite) : fase.doses;

  function aoTeclar(e: React.KeyboardEvent) {
    const n = fases.length;
    const proxima = e.key === "ArrowRight" ? (atual + 1) % n : e.key === "ArrowLeft" ? (atual - 1 + n) % n : e.key === "Home" ? 0 : e.key === "End" ? n - 1 : null;
    if (proxima === null) return;
    e.preventDefault();
    setAtual(proxima);
    abas.current[proxima]?.focus();
  }

  return (
    <div>
      <div role="tablist" aria-label="Fase da vida" className="flex flex-wrap gap-1.5" onKeyDown={aoTeclar}>
        {fases.map((f, i) => (
          <button
            key={f.id}
            ref={(el) => {
              abas.current[i] = el;
            }}
            id={`${id}-aba-${f.id}`}
            type="button"
            role="tab"
            aria-selected={i === atual}
            aria-controls={`${id}-painel`}
            tabIndex={i === atual ? 0 : -1}
            onClick={() => setAtual(i)}
            className={`rounded-full px-3 py-1.5 text-sm font-bold transition-colors ${i === atual ? "bg-azul text-white" : "bg-grade text-tinta-2 hover:bg-azul-claro hover:text-azul"}`}
          >
            {f.nome}
          </button>
        ))}
      </div>
      <div id={`${id}-painel`} role="tabpanel" aria-labelledby={`${id}-aba-${fase.id}`} className="@container mt-3">
        <p className="text-sm text-tinta-2">
          {fase.nome}: {fase.faixa}
        </p>
        <ol className="mt-2 grid gap-2">
          {doses.map((d) => (
            <li key={d.quando} className="grid gap-x-3 rounded-xl bg-fundo px-3 py-2.5 @md:grid-cols-[8.5rem_1fr]">
              <b className="font-titulo">{d.quando}</b>
              <ul className="text-[0.9375rem]">
                {d.vacinas.map((v) => (
                  <li key={v}>{v}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
        {limite && fase.doses.length > limite && (
          <p className="mt-2 text-sm text-tinta-3">e mais {fase.doses.length - limite} idades no calendário completo.</p>
        )}
        <p className="mt-2">
          <Fonte fonte={fase.fonte} rotulo={`Calendário oficial: ${fase.nome.toLowerCase()}`} />
        </p>
      </div>
    </div>
  );
}
