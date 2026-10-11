import type { Mito } from "@/conteudo/mitos";

import { Fonte } from "../Fonte";
import { Icone } from "../Icone";

/** Lista de mitos para ler em sequência: cada frase abre a resposta ao
 *  tocar (funciona sem JavaScript). O roxo marca só o veredito. */
export function ListaMitos({ mitos }: { mitos: Mito[] }) {
  return (
    <ol className="cartao max-w-4xl divide-y divide-linha">
      {mitos.map((m) => (
        <li key={m.id}>
          <details className="group">
            <summary className="flex cursor-pointer list-none items-start gap-4 px-5 py-5 hover:bg-fundo sm:px-7">
              <span className="min-w-0 flex-1">
                <span className="titulo block text-[1.25rem] leading-snug sm:text-[1.375rem]">“{m.mito}”</span>
                <span className="mt-2 inline-flex items-center gap-1 text-[0.9375rem] font-semibold text-lilas group-open:hidden">
                  Ver a resposta <Icone nome="chevron" className="size-4" />
                </span>
              </span>
            </summary>
            <div className="aparece px-5 pb-6 sm:px-7">
              <p className="max-w-[65ch]">
                <b className="font-titulo text-lilas-escuro">Mito.</b> {m.verdade}
              </p>
              <p className="mt-2">
                <Fonte fonte={m.fonte} />
              </p>
            </div>
          </details>
        </li>
      ))}
    </ol>
  );
}
