"use client";

import { useId, useMemo, useState } from "react";

import type { Ubs } from "@/lib/dados";
import { decimal, nomeProprio, normalizar, telefone } from "@/lib/formato";

import { Icone } from "./Icone";

const POR_VEZ = 12;

// Turnos do CNES ("ATENDIMENTOS NOS TURNOS DA MANHA E A TARDE") em linguagem simples.
function turnoAmigavel(t: string | null): string | null {
  if (!t) return null;
  const s = normalizar(t);
  if (s.includes("24 horas")) return "Aberta 24 horas";
  const manha = s.includes("manha");
  const tarde = s.includes("tarde");
  const noite = s.includes("noite");
  if (manha && tarde && noite) return "Manhã, tarde e noite";
  if (manha && tarde) return "Manhã e tarde";
  if (manha && noite) return "Manhã e noite";
  if (tarde && noite) return "Tarde e noite";
  if (manha) return "Só de manhã";
  if (tarde) return "Só à tarde";
  if (noite) return "Só à noite";
  if (s.includes("intermitente")) return "Horário variável";
  return null;
}

// Distância em linha reta (fórmula de haversine), em km.
function distancia(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const r = (g: number) => (g * Math.PI) / 180;
  const dLat = r(b.lat - a.lat);
  const dLon = r(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

function linkDoMapa(u: Ubs, cidade: string) {
  const busca = u.latitude != null && u.longitude != null ? `${u.latitude},${u.longitude}` : [u.nome, u.endereco, u.bairro, cidade].filter(Boolean).join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(busca)}`;
}

type Estado = "parado" | "procurando" | "pronto" | "negado" | "erro";

/**
 * UBS da cidade, com filtro por bairro ou nome e "Perto de mim". A
 * localização é usada só neste aparelho para calcular a distância: não é
 * enviada nem guardada.
 */
export function ListaUbs({ ubs, cidade }: { ubs: Ubs[]; cidade: string }) {
  const id = useId();
  const [filtro, setFiltro] = useState("");
  const [quantas, setQuantas] = useState(POR_VEZ);
  const [local, setLocal] = useState<{ lat: number; lon: number } | null>(null);
  const [estado, setEstado] = useState<Estado>("parado");

  const bairros = useMemo(() => [...new Set(ubs.map((u) => u.bairro).filter((b): b is string => Boolean(b)))].sort((a, b) => a.localeCompare(b, "pt-BR")), [ubs]);

  const lista = useMemo(() => {
    const termo = normalizar(filtro);
    const filtradas = termo ? ubs.filter((u) => normalizar(`${u.nome} ${u.bairro ?? ""}`).includes(termo)) : ubs;
    const comDistancia = filtradas.map((u) => ({
      u,
      km: local && u.latitude != null && u.longitude != null ? distancia(local, { lat: u.latitude, lon: u.longitude }) : null,
    }));
    if (local) comDistancia.sort((a, b) => (a.km ?? Infinity) - (b.km ?? Infinity));
    return comDistancia;
  }, [ubs, filtro, local]);

  function pertoDeMim() {
    if (!("geolocation" in navigator)) return setEstado("erro");
    setEstado("procurando");
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setLocal({ lat: p.coords.latitude, lon: p.coords.longitude });
        setEstado("pronto");
        setQuantas(POR_VEZ);
      },
      (e) => setEstado(e.code === e.PERMISSION_DENIED ? "negado" : "erro"),
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 },
    );
  }

  const aviso: Record<Estado, string | null> = {
    parado: null,
    procurando: "Procurando a sua localização…",
    pronto: "Pronto: as UBS estão em ordem de distância, da mais perto para a mais longe (em linha reta).",
    negado: "Você não autorizou o uso da localização. Tudo bem: filtre pelo nome do bairro.",
    erro: "Não foi possível descobrir a sua localização agora. Filtre pelo nome do bairro.",
  };

  if (ubs.length === 0) {
    return <p className="rounded-lg bg-fundo p-4 text-tinta-2">Ainda não há UBS desta cidade no cadastro carregado. Procure a secretaria de saúde do município.</p>;
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="flex min-h-12 flex-1 items-center gap-2 rounded-lg border border-campo bg-folha px-4 focus-within:border-azul">
          <Icone nome="busca" className="size-5 text-tinta-3" />
          <span className="sr-only">Filtrar por bairro ou nome da UBS</span>
          <input
            type="search"
            list={`${id}-bairros`}
            value={filtro}
            onChange={(e) => {
              setFiltro(e.target.value);
              setQuantas(POR_VEZ);
            }}
            placeholder="Bairro ou nome da UBS"
            className="w-full min-w-0 bg-transparent text-base placeholder:text-tinta-3 focus:outline-none"
          />
          <datalist id={`${id}-bairros`}>
            {bairros.map((b) => (
              <option key={b} value={b} />
            ))}
          </datalist>
        </label>
        <button type="button" onClick={pertoDeMim} className="botao botao-contorno min-h-12" disabled={estado === "procurando"}>
          <Icone nome="local" className="size-5" />
          Perto de mim
        </button>
      </div>
      <p className="mt-2 text-sm text-tinta-3" aria-live="polite">
        {aviso[estado] ?? "Sua localização é usada só neste aparelho para calcular a distância. O site não guarda nem envia."}
      </p>

      <p className="mt-4 text-sm font-semibold text-tinta-2">
        {lista.length === ubs.length ? `${ubs.length} UBS` : `${lista.length} de ${ubs.length} UBS`}
      </p>
      {lista.length === 0 ? (
        <p className="mt-2 rounded-lg bg-fundo p-4 text-tinta-2">Nenhuma UBS com “{filtro}”. Confira a grafia ou tente outro bairro.</p>
      ) : (
        <ul className="mt-2 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {lista.slice(0, quantas).map(({ u, km }) => {
            const turno = turnoAmigavel(u.turno);
            return (
              <li key={u.cnes} className="flex flex-col gap-2 rounded-lg border border-linha bg-folha p-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="leading-snug font-bold">{nomeProprio(u.nome)}</h3>
                  {km !== null && <span className="shrink-0 text-[0.875rem] font-semibold text-azul">{km < 1 ? `${Math.round(km * 1000)} m` : `${decimal(km)} km`}</span>}
                </div>
                <p className="text-[0.9375rem] text-tinta-2">
                  {u.endereco ? nomeProprio(u.endereco) : "Endereço não informado"}
                  {u.bairro && ` · ${nomeProprio(u.bairro)}`}
                </p>
                {turno && (
                  <p className="flex items-center gap-1.5 text-sm text-tinta-2">
                    <Icone nome="relogio" className="size-4 text-tinta-3" />
                    {turno}
                  </p>
                )}
                <div className="mt-auto flex flex-wrap gap-2 pt-1">
                  <a href={linkDoMapa(u, cidade)} target="_blank" rel="noopener noreferrer" className="botao botao-azul min-h-10 px-3 text-sm">
                    <Icone nome="pin" className="size-4" />
                    Ver no mapa
                    <span className="sr-only">(abre o Google Maps em nova aba)</span>
                  </a>
                  {u.telefone && (
                    <a href={`tel:+55${u.telefone}`} className="botao botao-contorno min-h-10 px-3 text-sm">
                      <Icone nome="fone" className="size-4" />
                      Ligar <span className="font-semibold">{telefone(u.telefone)}</span>
                    </a>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {lista.length > quantas && (
        <button type="button" onClick={() => setQuantas((q) => q + POR_VEZ)} className="botao botao-contorno mt-4 w-full sm:w-auto">
          Mostrar mais {Math.min(POR_VEZ, lista.length - quantas)} UBS
        </button>
      )}
    </div>
  );
}
