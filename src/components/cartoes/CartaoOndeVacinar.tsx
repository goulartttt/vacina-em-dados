import { FONTES } from "@/conteudo/fontes";

import { Busca } from "../Busca";
import { Fonte } from "../Fonte";

/** Faixa larga: o texto de um lado e a busca da cidade do outro. */
export function CartaoOndeVacinar() {
  return (
    <article className="cartao grid items-center gap-x-8 gap-y-4 px-5 py-5 sm:px-6 md:grid-cols-[1fr_minmax(0,26rem)]">
      <div>
        <h3 className="titulo text-[1.375rem]">Onde se vacinar</h3>
        <p className="mt-1.5 max-w-[60ch] text-[0.9375rem] text-tinta-2">
          As vacinas do calendário são de graça nas unidades básicas de saúde (UBS). Digite a sua cidade para ver endereço, telefone e mapa de
          cada uma.
          <Fonte fonte={FONTES.cnes} rotulo="Fonte: CNES" />
        </p>
      </div>
      <Busca destino="#onde-se-vacinar" rotulo="Buscar a cidade para ver as UBS" />
    </article>
  );
}
