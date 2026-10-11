"use client";

import Link from "next/link";
import { useRef, useState } from "react";

import { FAIXAS_CASOS, faixaCasos, situacao, SITUACOES } from "@/lib/constantes";
import { numero, pontos, porcentagem } from "@/lib/formato";
import { LARGURA_MAPA } from "@/lib/mapa-base";
import { casosEm, coberturaEm, praticamenteIgual, type Anos, type Dose, type Malha, type Modo, type Regiao } from "@/lib/painel";

import { Icone } from "../Icone";
import { Selo } from "../Situacao";

type Alvo = { id: number; x: number; y: number };

type Props = {
  malha: Malha;
  regioes: Map<number, Regiao>;
  modo: Modo;
  anos: Anos;
  periodo: [number, number];
  tipo: "estado" | "cidade";
  dose: Dose;
  anoParcial: number | null;
  resumo: string;
  aoSelecionar: (id: number | null) => void;
};

// Mapa clicável. Passar o mouse mostra o resumo do lugar; tocar ou clicar
// fixa a escolha (e a linha do lugar aparece no gráfico). A tabela abaixo
// do mapa traz os mesmos números para quem usa teclado ou leitor de tela.
export function MapaPainel({ malha, regioes, modo, anos, periodo, tipo, dose, anoParcial, resumo, aoSelecionar }: Props) {
  const [passando, setPassando] = useState<Alvo | null>(null);
  const [fixo, setFixo] = useState<Alvo | null>(null);
  const silencio = useRef(false);
  const [, fim] = periodo;
  // Com um lugar fixado (clique), o resumo dele fica: passar o mouse em
  // outro só destaca o contorno. Assim dá para chegar ao link e ao fechar.
  const alvo = fixo ?? passando;
  const muitas = malha.formas.length > 100;

  const cor = (r: Regiao | undefined) => {
    if (!r) return "var(--vazio)";
    if (modo === "vacinacao") return SITUACOES[situacao(coberturaEm(r, anos, fim))].cor;
    return FAIXAS_CASOS[faixaCasos(casosEm(r, anos, fim) ?? 0)].cor;
  };

  function alvoDe(e: React.SyntheticEvent<SVGPathElement>, id: number): Alvo {
    const b = e.currentTarget.getBBox();
    return { id, x: ((b.x + b.width / 2) / LARGURA_MAPA) * 100, y: ((b.y + b.height / 2) / malha.altura) * 100 };
  }

  function fixar(a: Alvo | null) {
    setFixo(a);
    // Fechar apaga o resumo de "passando o mouse" e silencia o lugar que
    // ficou embaixo do cursor; o resumo volta quando o mouse for a outro.
    if (!a) {
      setPassando(null);
      silencio.current = true;
    }
    aoSelecionar(a?.id ?? null);
  }

  const ordem = fixo ? [...malha.formas.filter(([id]) => id !== fixo.id), ...malha.formas.filter(([id]) => id === fixo.id)] : malha.formas;

  return (
    // Sair do mapa pelo cartão de resumo não o fecha: dá para chegar ao link.
    <div className="relative" onPointerLeave={() => setPassando(null)}>
      <svg viewBox={`0 0 ${LARGURA_MAPA} ${malha.altura}`} className="block h-auto w-full touch-manipulation" role="img" aria-label={resumo}>
        {ordem.map(([id, d]) => {
          const ativo = fixo?.id === id;
          return (
            <path
              key={id}
              d={d}
              fill={cor(regioes.get(id))}
              stroke={ativo ? "var(--tinta)" : "#fff"}
              strokeWidth={ativo ? 2.5 : muitas ? 0.5 : 1.2}
              vectorEffect="non-scaling-stroke"
              className="mapa-forma cursor-pointer hover:[stroke:var(--tinta)] hover:[stroke-width:1.5]"
              onPointerEnter={(e) => {
                if (e.pointerType === "mouse" && !silencio.current) setPassando(alvoDe(e, id));
              }}
              onPointerLeave={() => {
                silencio.current = false;
              }}
              onClick={(e) => fixar(fixo?.id === id ? null : alvoDe(e, id))}
            />
          );
        })}
      </svg>
      {alvo && (
        <span
          className="pointer-events-none absolute size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-tinta bg-folha"
          style={{ left: `${alvo.x}%`, top: `${alvo.y}%` }}
          aria-hidden="true"
        />
      )}
      {alvo && regioes.get(alvo.id) && (
        <Detalhe
          key={alvo.id}
          alvo={alvo}
          regiao={regioes.get(alvo.id)!}
          modo={modo}
          anos={anos}
          periodo={periodo}
          tipo={tipo}
          dose={dose}
          anoParcial={anoParcial}
          fixo={fixo?.id === alvo.id}
          aoFechar={() => fixar(null)}
        />
      )}
    </div>
  );
}

function Detalhe({
  alvo,
  regiao,
  modo,
  anos,
  periodo: [inicio, fim],
  tipo,
  dose,
  anoParcial,
  fixo,
  aoFechar,
}: {
  alvo: Alvo;
  regiao: Regiao;
  modo: Modo;
  anos: Anos;
  periodo: [number, number];
  tipo: "estado" | "cidade";
  dose: Dose;
  anoParcial: number | null;
  fixo: boolean;
  aoFechar: () => void;
}) {
  const esquerda = alvo.x > 55;
  const estilo = {
    "--x": `${alvo.x}%`,
    "--y": `${alvo.y}%`,
    "--tx": esquerda ? "calc(-100% - 18px)" : "18px",
    "--ty": alvo.y < 25 ? "-12%" : alvo.y > 75 ? "-88%" : "-50%",
  } as React.CSSProperties;

  let corpo: React.ReactNode;
  if (modo === "vacinacao") {
    const v = coberturaEm(regiao, anos, fim);
    const v0 = coberturaEm(regiao, anos, inicio);
    const diferenca = v !== null && v0 !== null && inicio !== fim ? v - v0 : null;
    corpo = (
      <>
        <div className="flex items-center justify-between gap-3">
          <b className="text-[1.0625rem] leading-tight">{regiao.nome}</b>
          <Selo tipo={situacao(v)} />
        </div>
        <p className="mt-1">
          <span className="numero text-[2rem]">{v === null ? "sem dado" : porcentagem(v)}</span>{" "}
          <span className="text-sm text-tinta-2">
            das crianças de 1 ano {dose === 1 ? "vacinadas" : "com a 2ª dose"} em {fim}
          </span>
        </p>
        {diferenca !== null &&
          (praticamenteIgual(diferenca) ? (
            <p className="mt-1 text-sm font-semibold text-tinta-2">igual a {inicio}</p>
          ) : (
            <p className={`mt-1 flex items-center gap-1 text-sm font-semibold ${diferenca < 0 ? "text-critico-tinta" : "text-ok-tinta"}`}>
              <Icone nome={diferenca < 0 ? "desce" : "sobe"} className="size-4" />
              {`${diferenca < 0 ? "caiu" : "subiu"} ${pontos(diferenca)} desde ${inicio}`}
            </p>
          ))}
      </>
    );
  } else {
    const c = casosEm(regiao, anos, fim) ?? 0;
    const c0 = casosEm(regiao, anos, inicio) ?? 0;
    corpo = (
      <>
        <b className="text-[1.0625rem] leading-tight">{regiao.nome}</b>
        <p className="mt-1">
          <span className="numero text-[2rem]">{numero(c)}</span>{" "}
          <span className="text-sm text-tinta-2">
            {c === 1 ? "caso" : "casos"} de sarampo em {fim}
            {fim === anoParcial ? " (parcial)" : ""}
          </span>
        </p>
        {inicio !== fim && <p className="mt-1 text-sm text-tinta-2">Em {inicio}: {numero(c0)}</p>}
      </>
    );
  }

  return (
    <div
      className="aparece relative z-10 mt-3 w-full rounded-lg border border-linha bg-folha p-4 shadow-[0_12px_28px_-14px_rgb(38_54_64/0.4)] sm:absolute sm:top-(--y) sm:left-(--x) sm:mt-0 sm:w-72 sm:translate-x-(--tx) sm:translate-y-(--ty)"
      style={estilo}
    >
      {corpo}
      <div className="mt-3 flex items-center justify-between gap-2 border-t border-grade pt-3">
        <Link href={regiao.href} className="inline-flex items-center gap-1.5 text-sm font-bold text-azul no-underline hover:text-azul-escuro">
          {tipo === "estado" ? `Ver ${regiao.nome} e as cidades` : `Ver ${regiao.nome}`}
          <Icone nome="seta" className="size-4" />
        </Link>
        {fixo && (
          <button type="button" onClick={aoFechar} className="rounded-md p-1.5 text-tinta-2 hover:bg-grade hover:text-tinta" aria-label="Fechar">
            <Icone nome="fechar" className="size-4" />
          </button>
        )}
      </div>
    </div>
  );
}
