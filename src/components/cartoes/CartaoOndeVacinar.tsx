import { FONTES } from "@/conteudo/fontes";

import { Busca } from "../Busca";
import { Fonte } from "../Fonte";
import { Icone } from "../Icone";

/** Atalho para a lista de UBS da cidade. */
export function CartaoOndeVacinar() {
  return (
    <article className="cartao flex flex-col">
      <div className="flex flex-col gap-3 px-5 pt-5 pb-4">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-azul-claro text-azul" aria-hidden="true">
            <Icone nome="pin" className="size-6" />
          </span>
          <h3 className="titulo text-[1.5rem]">Onde se vacinar</h3>
        </div>
        <p className="text-[0.9375rem] text-tinta-2">
          As vacinas do calendário são de graça nas unidades básicas de saúde (UBS). Digite a sua cidade para ver endereço, telefone e mapa
          de cada uma.
        </p>
        <Busca destino="#onde-se-vacinar" rotulo="Buscar a cidade para ver as UBS" />
      </div>
      <div className="mt-auto border-t border-grade px-5 py-3">
        <Fonte fonte={FONTES.cnes} rotulo="Fonte: CNES, Ministério da Saúde" />
      </div>
    </article>
  );
}
