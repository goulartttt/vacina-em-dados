import Link from "next/link";

import { FONTES } from "@/conteudo/fontes";
import type { Atualizacao } from "@/lib/dados";
import { data } from "@/lib/formato";

import { Fonte } from "./Fonte";

/** De onde vêm os números do painel e quando foram atualizados. */
export function RodapeDados({ fontes }: { fontes: Atualizacao[] }) {
  const pni = fontes.find((f) => f.fonte === "pni_cobertura_1994_2018");
  const sinan = fontes.find((f) => f.fonte === "sinan_sarampo");
  return (
    <div className="mt-4 rounded-2xl bg-folha/60 px-1 py-2 text-sm text-tinta-3">
      <p>
        <b className="text-tinta-2">Fontes:</b> vacinação, Ministério da Saúde, SI-PNI
        {pni?.arquivo_atualizado_em ? ` (arquivo de ${data(pni.arquivo_atualizado_em)})` : ""}
        <Fonte fonte={FONTES.datasusPni} rotulo="DATASUS" />; casos, SINAN, por local de moradia e data dos primeiros sintomas
        {sinan?.arquivo_atualizado_em ? ` (atualizado em ${data(sinan.arquivo_atualizado_em)})` : ""}
        <Fonte fonte={FONTES.datasusSinan} rotulo="DATASUS" />; faixas de situação, meta do Ministério da Saúde e matriz de risco da OPAS
        <Fonte fonte={FONTES.opasRisco} rotulo="OPAS" />.
      </p>
      <p className="mt-1">
        A cobertura oficial de 2019 em diante ainda não está no site. <Link href="/sobre-os-dados">Como os números são calculados</Link>.
      </p>
    </div>
  );
}
