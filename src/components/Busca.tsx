"use client";

import { useRouter } from "next/navigation";
import { useId, useMemo, useState } from "react";

import { normalizar } from "@/lib/formato";

import { Icone } from "./Icone";

type Item = [nome: string, uf: string, slug: string];

let indice: Promise<Item[]> | null = null;
// Baixa uma vez só; se falhar, esquece a tentativa para poder baixar de novo.
const carregar = () =>
  (indice ??= fetch("/indice-municipios")
    .then((r) => (r.ok ? (r.json() as Promise<Item[]>) : Promise.reject(new Error(String(r.status)))))
    .catch((erro) => {
      indice = null;
      throw erro;
    }));

/**
 * Busca de cidade (combobox acessível, padrão ARIA 1.2). A lista de
 * municípios só é baixada quando a pessoa toca no campo. "destino" leva
 * direto a uma parte da página da cidade (ex.: "#onde-se-vacinar").
 */
export function Busca({ grande = false, destino = "", rotulo = "Buscar cidade" }: { grande?: boolean; destino?: string; rotulo?: string }) {
  const router = useRouter();
  const id = useId();
  const [lista, setLista] = useState<Item[] | null>(null);
  const [texto, setTexto] = useState("");
  const [ativo, setAtivo] = useState(0);
  const [aberta, setAberta] = useState(false);
  const [erro, setErro] = useState(false);

  const resultados = useMemo(() => {
    const termo = normalizar(texto);
    if (!lista || termo.length < 2) return [];
    const comeca: Item[] = [];
    const contem: Item[] = [];
    for (const item of lista) {
      const nome = normalizar(item[0]);
      if (nome.startsWith(termo)) comeca.push(item);
      else if (nome.includes(termo)) contem.push(item);
      if (comeca.length >= 8) break;
    }
    return [...comeca, ...contem].slice(0, 8);
  }, [lista, texto]);

  function preparar() {
    if (lista) return;
    setErro(false);
    carregar()
      .then(setLista)
      .catch(() => setErro(true));
  }

  function ir(item: Item) {
    setAberta(false);
    setTexto(`${item[0]} (${item[1]})`);
    router.push(`/municipios/${item[2]}${destino}`);
  }

  function aoTeclar(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setAberta(true);
      setAtivo((a) => Math.min(resultados.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setAtivo((a) => Math.max(0, a - 1));
    } else if (e.key === "Enter" && resultados[ativo]) {
      e.preventDefault();
      ir(resultados[ativo]);
    } else if (e.key === "Escape") {
      setAberta(false);
    }
  }

  const mostrarLista = aberta && texto.trim().length >= 2;
  const idLista = `${id}-lista`;

  return (
    <div className="relative w-full">
      <label htmlFor={`${id}-campo`} className="sr-only">
        {rotulo}
      </label>
      <div
        className={`flex items-center gap-2 rounded-full border border-[#d3ddeb] bg-[#f0f4fa] transition-colors focus-within:border-azul focus-within:bg-folha ${
          grande ? "px-5 py-3.5" : "px-4 py-2"
        }`}
      >
        <Icone nome="busca" className={`text-tinta-3 ${grande ? "size-5" : "size-4"}`} />
        <input
          id={`${id}-campo`}
          type="text"
          role="combobox"
          aria-expanded={mostrarLista}
          aria-controls={idLista}
          aria-autocomplete="list"
          aria-activedescendant={mostrarLista && resultados[ativo] ? `${id}-${ativo}` : undefined}
          autoComplete="off"
          spellCheck={false}
          placeholder={grande ? "Digite o nome da sua cidade" : "Buscar sua cidade"}
          value={texto}
          onFocus={() => {
            preparar();
            setAberta(true);
          }}
          onChange={(e) => {
            setTexto(e.target.value);
            setAtivo(0);
            setAberta(true);
          }}
          onKeyDown={aoTeclar}
          onBlur={() => setTimeout(() => setAberta(false), 120)}
          className={`w-full min-w-0 bg-transparent text-tinta placeholder:text-tinta-3 focus:outline-none ${grande ? "text-lg" : "text-base"}`}
        />
      </div>
      {mostrarLista && (
        <ul
          id={idLista}
          role="listbox"
          aria-label="Cidades encontradas"
          className="absolute inset-x-0 top-[calc(100%+6px)] z-40 overflow-hidden rounded-2xl border border-linha bg-folha py-1.5 shadow-[0_16px_36px_-12px_rgb(23_33_51/0.35)]"
        >
          {erro ? (
            <li className="px-4 py-2.5 text-sm text-tinta-2">Não foi possível carregar a lista. Confira a conexão e tente de novo.</li>
          ) : !lista ? (
            <li className="px-4 py-2.5 text-sm text-tinta-3">Carregando cidades…</li>
          ) : resultados.length === 0 ? (
            <li className="px-4 py-2.5 text-sm text-tinta-2">Nenhuma cidade com esse nome. Confira a grafia.</li>
          ) : (
            resultados.map((item, i) => (
              <li
                key={item[2]}
                id={`${id}-${i}`}
                role="option"
                aria-selected={i === ativo}
                onPointerDown={(e) => e.preventDefault()}
                onClick={() => ir(item)}
                onPointerEnter={() => setAtivo(i)}
                className={`flex cursor-pointer items-baseline justify-between gap-3 px-4 py-2 ${i === ativo ? "bg-azul-claro" : ""}`}
              >
                <span className="truncate text-tinta">{item[0]}</span>
                <span className="text-sm font-bold text-tinta-3">{item[1]}</span>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
