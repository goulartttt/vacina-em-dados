import type { Fonte as TipoFonte } from "@/conteudo/fontes";

import { Icone } from "./Icone";

/** Citação curta ligada a uma fonte oficial, no fim de um trecho.
 *  py-0.5 dá ao alvo de toque pelo menos 24 px de altura; "relative" segura
 *  o texto só para leitor de tela dentro do link. */
export function Fonte({ fonte, rotulo }: { fonte: TipoFonte; rotulo?: string }) {
  return (
    <a
      href={fonte.url}
      target="_blank"
      rel="noopener noreferrer"
      title={fonte.titulo}
      className="group relative ml-1 inline-flex items-baseline gap-1 py-0.5 text-[0.8125rem] font-semibold text-tinta-2 no-underline hover:text-azul"
    >
      <Icone nome="fonte" className="size-3.5 translate-y-[2px]" />
      <span className="underline decoration-linha group-hover:decoration-current">{rotulo ?? `Fonte: ${fonte.orgao}`}</span>
      <span className="sr-only">(abre em nova aba)</span>
    </a>
  );
}
