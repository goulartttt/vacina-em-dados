import type { Mito } from "@/conteudo/mitos";

import { Fonte } from "../Fonte";
import { Icone } from "../Icone";

/** Grade de mitos: cada cartão revela a resposta ao tocar (funciona sem JavaScript). */
export function ListaMitos({ mitos }: { mitos: Mito[] }) {
  return (
    <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {mitos.map((m) => (
        <li key={m.id} className="cartao flex flex-col border-[#ddd5fc] bg-lilas-claro p-5">
          <span className="w-fit rounded-md bg-folha px-2 py-0.5 text-xs font-extrabold tracking-[0.08em] text-lilas-escuro">É VERDADE?</span>
          <p className="titulo mt-3 text-[1.375rem] leading-[1.2]">“{m.mito}”</p>
          <details className="group mt-auto pt-4">
            <summary className="botao w-full cursor-pointer list-none bg-lilas text-white hover:bg-lilas-escuro group-open:hidden">
              Ver a resposta
            </summary>
            <div className="aparece rounded-2xl bg-folha p-4">
              <p className="flex items-center gap-1.5 text-sm font-extrabold tracking-[0.04em] text-lilas-escuro">
                <Icone nome="fechar" className="size-4" />
                MITO
              </p>
              <p className="mt-1.5">{m.verdade}</p>
              <p className="mt-2">
                <Fonte fonte={m.fonte} />
              </p>
            </div>
          </details>
        </li>
      ))}
    </ul>
  );
}
