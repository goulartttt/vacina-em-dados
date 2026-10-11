"use client";

import Link from "next/link";
import { useEffect } from "react";

import { Icone } from "@/components/Icone";

// Quando os dados não chegam (ex.: a conexão com a fonte caiu por um
// instante), a pessoa vê uma mensagem clara e pode tentar de novo, em vez
// de uma tela de erro técnica. O menu e o rodapé continuam na tela.
export default function Erro({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-xl px-4 pt-16 sm:px-6">
      <h1 className="titulo text-[2rem] sm:text-4xl">Não foi possível carregar os dados agora</h1>
      <p className="mt-3 text-lg text-tinta-2">
        A conexão com a fonte dos números falhou por um instante. Isso costuma passar sozinho: tente de novo em alguns segundos.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" onClick={() => retry()} className="botao botao-azul">
          <Icone nome="virar" className="size-4" />
          Tentar de novo
        </button>
        <Link href="/" className="botao botao-contorno">
          Ir para o painel
        </Link>
      </div>
    </div>
  );
}
