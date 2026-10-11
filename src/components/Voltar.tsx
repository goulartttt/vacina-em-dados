import Link from "next/link";

import { Icone } from "./Icone";

/** Botão de voltar no topo das páginas internas. */
export function Voltar({ href, rotulo }: { href: string; rotulo: string }) {
  return (
    <Link
      href={href}
      className="group inline-flex min-h-10 items-center gap-2 rounded-md border border-linha bg-folha px-3 py-2 text-sm font-semibold text-tinta-2 no-underline transition-colors hover:border-azul hover:text-azul"
    >
      <Icone nome="seta" className="size-4 rotate-180 transition-transform group-hover:-translate-x-0.5" />
      {rotulo}
    </Link>
  );
}

/** "Você está em": Brasil / Estado / Cidade. */
export function Migalhas({ itens }: { itens: { href?: string; rotulo: string }[] }) {
  return (
    <nav aria-label="Você está em" className="text-sm font-semibold text-tinta-3">
      <ol className="flex flex-wrap items-center gap-1.5">
        {itens.map((i, n) => (
          <li key={n} className={n > 0 ? "flex items-center gap-1.5 before:content-['/']" : undefined}>
            {i.href ? (
              <Link href={i.href} className="no-underline hover:text-azul">
                {i.rotulo}
              </Link>
            ) : (
              <span aria-current="page" className="text-tinta-2">
                {i.rotulo}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Topo das páginas internas: voltar + onde a pessoa está. */
export function TopoInterno({ voltar, itens }: { voltar: { href: string; rotulo: string }; itens: { href?: string; rotulo: string }[] }) {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-x-5 gap-y-3">
      <Voltar {...voltar} />
      <Migalhas itens={itens} />
    </div>
  );
}
