import Link from "next/link";

import { Busca } from "@/components/Busca";
import { Cartoes } from "@/components/cartoes/Cartoes";
import { Painel } from "@/components/painel/Painel";
import { RodapeDados } from "@/components/RodapeDados";
import { atualizacoes, BRASIL, estados } from "@/lib/dados";
import { anoParcial } from "@/lib/datas";
import { anosDoPainel, regioesDoBrasil, seriesDoBrasil } from "@/lib/paineis";

export default async function Inicio() {
  const anos = await anosDoPainel();
  const [regioes, series, ufs, fontes] = await Promise.all([regioesDoBrasil(anos), seriesDoBrasil(anos), estados(), atualizacoes()]);
  const brasil = series.get(BRASIL);
  if (!brasil) throw new Error("Série do Brasil ausente no banco.");

  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 sm:pt-8 lg:px-8">
      <Painel
        assunto="Sarampo"
        titulo="Como está a vacinação contra o sarampo no Brasil?"
        nome="Brasil"
        anos={anos}
        principal={brasil}
        comparacoes={[]}
        regioes={regioes}
        tipoRegioes="estado"
        lugares={[{ href: "/", rotulo: "Brasil" }, ...ufs.map((u) => ({ href: `/estados/${u.slug}`, rotulo: u.nome }))]}
        lugarAtual="/"
        anoParcial={anoParcial(fontes, anos)}
      >
        <RodapeDados fontes={fontes} />
      </Painel>

      <section aria-labelledby="sua-cidade" className="cartao mt-10 grid gap-6 p-5 sm:p-8 lg:grid-cols-[1fr_1.1fr] lg:items-center">
        <div>
          <h2 id="sua-cidade" className="titulo text-[1.75rem] sm:text-[2.125rem]">
            E a sua cidade?
          </h2>
          <p className="mt-2 text-tinta-2">Veja a vacinação, os casos e as UBS mais perto de você.</p>
          <div className="mt-5 max-w-xl">
            <Busca grande />
          </div>
        </div>
        <nav aria-label="Estados">
          <p className="rotulo mb-2">Ou escolha o estado</p>
          <ul className="flex flex-wrap gap-1.5">
            {ufs.map((u) => (
              <li key={u.id}>
                <Link
                  href={`/estados/${u.slug}`}
                  title={u.nome}
                  className="grid h-10 min-w-12 place-items-center rounded-md border border-linha bg-folha px-2 font-semibold text-tinta-2 no-underline transition-colors hover:border-azul hover:bg-azul-claro hover:text-azul"
                >
                  <span aria-hidden="true">{u.uf_sigla}</span>
                  <span className="sr-only">{u.nome}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </section>

      <div className="mt-14">
        <Cartoes />
      </div>
    </div>
  );
}
