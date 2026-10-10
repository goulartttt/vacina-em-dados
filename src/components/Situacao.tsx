import { situacao, SITUACOES, type Situacao } from "@/lib/constantes";

import { Icone } from "./Icone";

const ESTILO: Record<Situacao, string> = {
  ok: "bg-ok-fundo text-ok-tinta",
  alerta: "bg-alerta-fundo text-alerta-tinta",
  critico: "bg-critico-fundo text-critico-tinta",
  vazio: "bg-grade text-tinta-3",
};

/** Situação da cobertura: sempre ícone + palavra, nunca só cor. */
export function Selo({ tipo, children, className = "" }: { tipo: Situacao; children?: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.8125rem] leading-none font-bold whitespace-nowrap ${ESTILO[tipo]} ${className}`}>
      {tipo !== "vazio" && <Icone nome={tipo} className="size-4" />}
      {children ?? SITUACOES[tipo].nome}
    </span>
  );
}

export function SituacaoDaCobertura({ cobertura, className }: { cobertura: number | null; className?: string }) {
  return <Selo tipo={situacao(cobertura)} className={className} />;
}
