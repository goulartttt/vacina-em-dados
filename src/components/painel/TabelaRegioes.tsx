"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { situacao } from "@/lib/constantes";
import { normalizar, numero, pontos, porcentagem } from "@/lib/formato";
import { casosEm, casosNoPeriodo, coberturaEm, praticamenteIgual, type Anos, type Modo, type Regiao } from "@/lib/painel";

import { Icone } from "../Icone";
import { Selo } from "../Situacao";

// Os números de cada estado (ou cidade) no início e no fim do período.
// Em ordem alfabética: é para achar o seu lugar, não um ranking.
export function TabelaRegioes({
  regioes,
  modo,
  anos,
  periodo: [inicio, fim],
  coluna,
}: {
  regioes: Regiao[];
  modo: Modo;
  anos: Anos;
  periodo: [number, number];
  coluna: string;
}) {
  const [filtro, setFiltro] = useState("");
  const ordenadas = useMemo(() => [...regioes].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")), [regioes]);
  const termo = normalizar(filtro);
  const visiveis = termo ? ordenadas.filter((r) => normalizar(r.nome).includes(termo)) : ordenadas;
  const comFiltro = regioes.length > 30;
  const celula = "px-3 py-2.5 text-right whitespace-nowrap";

  return (
    <div>
      {comFiltro && (
        <label className="mb-3 flex max-w-sm items-center gap-2 rounded-lg border border-linha bg-folha px-3 py-2 focus-within:border-azul">
          <Icone nome="busca" className="size-4 text-tinta-3" />
          <span className="sr-only">Filtrar {coluna.toLowerCase()}</span>
          <input
            type="search"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            placeholder={`Filtrar ${coluna.toLowerCase()} pelo nome`}
            className="w-full min-w-0 bg-transparent placeholder:text-tinta-3 focus:outline-none"
          />
        </label>
      )}
      {/* Altura fixa com rolagem própria: a página não fica enorme e quem
          quiser ver todos rola dentro da tabela (o cabeçalho fica parado). */}
      <div tabIndex={0} aria-label="Tabela com rolagem" className="max-h-[25rem] overflow-auto rounded-lg border border-linha">
        <table className="w-full min-w-[34rem] border-collapse text-left text-[0.9375rem]">
          <caption className="sr-only">
            {modo === "vacinacao" ? `Cobertura vacinal em ${inicio} e ${fim}` : `Casos de sarampo em ${inicio} e ${fim}`}, por {coluna.toLowerCase()}
          </caption>
          <thead className="sticky top-0 z-10 bg-grade">
            <tr>
              <th scope="col" className="rotulo px-3 py-2.5">{coluna}</th>
              {modo === "vacinacao" ? (
                <>
                  <th scope="col" className={`rotulo ${celula}`}>{inicio}</th>
                  <th scope="col" className={`rotulo ${celula}`}>{fim}</th>
                  <th scope="col" className={`rotulo ${celula}`}>Variação</th>
                  <th scope="col" className="rotulo px-3 py-2.5">Situação em {fim}</th>
                </>
              ) : (
                <>
                  <th scope="col" className={`rotulo ${celula}`}>Casos em {inicio}</th>
                  <th scope="col" className={`rotulo ${celula}`}>Casos em {fim}</th>
                  <th scope="col" className={`rotulo ${celula}`}>Total no período</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {visiveis.map((r) => {
              const nome = (
                <th scope="row" className="px-3 py-2.5 font-semibold">
                  <Link href={r.href} className="text-tinta no-underline hover:text-azul hover:underline">
                    {r.nome}
                  </Link>
                </th>
              );
              if (modo === "casos") {
                return (
                  <tr key={r.id} className="border-t border-grade">
                    {nome}
                    <td className={celula}>{numero(casosEm(r, anos, inicio) ?? 0)}</td>
                    <td className={`${celula} font-bold`}>{numero(casosEm(r, anos, fim) ?? 0)}</td>
                    <td className={celula}>{numero(casosNoPeriodo(r, anos, [inicio, fim]))}</td>
                  </tr>
                );
              }
              const v0 = coberturaEm(r, anos, inicio);
              const v = coberturaEm(r, anos, fim);
              const d = v !== null && v0 !== null ? v - v0 : null;
              return (
                <tr key={r.id} className="border-t border-grade">
                  {nome}
                  <td className={celula}>{v0 === null ? "—" : porcentagem(v0)}</td>
                  <td className={`${celula} font-bold`}>{v === null ? "—" : porcentagem(v)}</td>
                  <td className={`${celula} ${d === null || praticamenteIgual(d) ? "" : d < 0 ? "text-critico-tinta" : "text-ok-tinta"}`}>
                    {d === null || inicio === fim ? (
                      "—"
                    ) : praticamenteIgual(d) ? (
                      "igual"
                    ) : (
                      <span className="inline-flex items-center gap-1">
                        <Icone nome={d < 0 ? "desce" : "sobe"} className="size-3.5" />
                        <span className="sr-only">{d < 0 ? "caiu" : "subiu"}</span>
                        {pontos(d)}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <Selo tipo={situacao(v)} />
                  </td>
                </tr>
              );
            })}
            {visiveis.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-4 text-tinta-2">
                  Nenhum nome com “{filtro}”. Confira a grafia.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
