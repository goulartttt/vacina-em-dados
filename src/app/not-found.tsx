import Link from "next/link";

import { Busca } from "@/components/Busca";

export default function NaoEncontrado() {
  return (
    <div className="mx-auto max-w-xl px-4 pt-20 sm:px-6">
      <h1 className="titulo text-5xl">Página não encontrada</h1>
      <p className="mt-3 text-lg text-tinta-2">O endereço pode ter mudado. Procure a cidade pelo nome ou volte para o painel.</p>
      <div className="mt-6">
        <Busca grande />
      </div>
      <p className="mt-6">
        <Link href="/" className="botao botao-azul">
          Ir para o painel
        </Link>
      </p>
    </div>
  );
}
