"use client";

import Link from "next/link";
import { useId, useState } from "react";

import type { Dose, Fase } from "@/conteudo/calendario";

import { Fonte } from "./Fonte";
import { Icone } from "./Icone";

// "Quais vacinas eu preciso?": a partir da idade (e de estar grávida), mostra
// o que o Calendário Nacional prevê. Usa só o calendário transcrito do
// Ministério da Saúde; a conta é feita aqui no navegador e nada é guardado
// nem enviado. Não substitui a conferência da caderneta na UBS.

type Unidade = "meses" | "anos";

/** Idade de cada linha do calendário, em meses ("Ao nascer" = 0). Linhas sem
 *  idade fixa ("Conforme o histórico", "Todo ano"...) devolvem null. */
export function mesesDaDose(quando: string): number | null {
  if (quando === "Ao nascer") return 0;
  const faixa = /^(\d+) a (\d+) meses$/.exec(quando);
  if (faixa) return Number(faixa[1]);
  const meses = /^(\d+) meses$/.exec(quando);
  if (meses) return Number(meses[1]);
  const anos = /^(\d+) anos?$/.exec(quando);
  if (anos) return Number(anos[1]) * 12;
  return null;
}

/** Fase do calendário para a idade (em meses), como nas faixas do Ministério. */
export function faseDaIdade(fases: Fase[], idadeMeses: number, gestante: boolean): Fase {
  const por = (id: string) => fases.find((f) => f.id === id)!;
  if (gestante) return por("gestante");
  if (idadeMeses < 10 * 12) return por("crianca");
  if (idadeMeses < 25 * 12) return por("adolescente");
  if (idadeMeses < 60 * 12) return por("adulto");
  return por("idoso");
}

export function separar(fase: Fase, idadeMeses: number) {
  const comIdade = fase.doses.filter((d) => mesesDaDose(d.quando) !== null);
  const nesta = comIdade.filter((d) => mesesDaDose(d.quando) === idadeMeses);
  const antes = comIdade.filter((d) => mesesDaDose(d.quando)! < idadeMeses);
  const proximas = comIdade.filter((d) => mesesDaDose(d.quando)! > idadeMeses).slice(0, 2);
  const semIdade = fase.doses.filter((d) => mesesDaDose(d.quando) === null);
  return { nesta, antes, proximas, semIdade };
}

export function QuaisVacinas({ fases }: { fases: Fase[] }) {
  const id = useId();
  const [idade, setIdade] = useState("");
  const [unidade, setUnidade] = useState<Unidade>("anos");
  const [gestante, setGestante] = useState(false);

  const n = Number(idade.replace(",", "."));
  const valida = idade.trim() !== "" && Number.isInteger(n) && n >= 0 && n <= (unidade === "anos" ? 120 : 119);
  const idadeMeses = valida ? (unidade === "anos" ? n * 12 : n) : null;
  const fase = idadeMeses !== null ? faseDaIdade(fases, idadeMeses, gestante) : null;
  const partes = fase && idadeMeses !== null ? separar(fase, idadeMeses) : null;
  const idadeTexto = valida ? `${n} ${unidade === "anos" ? (n === 1 ? "ano" : "anos") : n === 1 ? "mês" : "meses"}` : "";

  return (
    <section id="quais-vacinas" aria-labelledby={`${id}-titulo`} className="cartao scroll-mt-24 p-5 sm:p-7">
      <h2 id={`${id}-titulo`} className="titulo text-[1.5rem]">
        Quais vacinas eu preciso?
      </h2>
      <p className="mt-1 max-w-[62ch] text-tinta-2">
        Informe a idade de quem vai se vacinar. A conta é feita no seu aparelho: nada é guardado nem enviado.
      </p>

      <form className="mt-4 flex flex-wrap items-end gap-3" onSubmit={(e) => e.preventDefault()}>
        <label className="flex flex-col gap-1">
          <span className="rotulo">Idade</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={unidade === "anos" ? 120 : 119}
            step={1}
            value={idade}
            onChange={(e) => setIdade(e.target.value)}
            placeholder="Ex.: 2"
            aria-describedby={`${id}-ajuda`}
            className="seletor w-28 bg-none pr-3"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="rotulo">Em</span>
          <select className="seletor" value={unidade} onChange={(e) => setUnidade(e.target.value as Unidade)}>
            <option value="anos">anos</option>
            <option value="meses">meses (bebês)</option>
          </select>
        </label>
        <label className="flex min-h-11 items-center gap-2 rounded-lg border border-campo bg-folha px-3">
          <input type="checkbox" checked={gestante} onChange={(e) => setGestante(e.target.checked)} className="size-4 accent-[var(--azul)]" />
          <span className="font-semibold">Está grávida</span>
        </label>
      </form>
      <p id={`${id}-ajuda`} className="mt-2 text-sm text-tinta-2">
        Para bebês com menos de 2 anos, use meses (ex.: 15 meses).
        {idade.trim() !== "" && !valida && <span className="ml-1 font-semibold text-tinta">Digite um número inteiro, sem vírgula.</span>}
      </p>

      <div aria-live="polite">
        {fase && partes && (
          <div className="aparece mt-5 border-t border-linha pt-5">
            <p className="font-semibold">
              {gestante ? "Na gravidez" : `Com ${idadeTexto}`}, pelo Calendário Nacional de Vacinação ({fase.nome.toLowerCase()}, {fase.faixa}):
            </p>
            {partes.nesta.length > 0 && (
              <div className="mt-3 rounded-lg bg-azul-claro px-4 py-3">
                <Lista titulo={`Previstas para esta idade (${idadeTexto})`} doses={partes.nesta} />
              </div>
            )}
            <div className="mt-4 grid gap-x-8 gap-y-5 md:grid-cols-2">
              {partes.antes.length > 0 && (
                <Lista titulo={fase.id === "crianca" ? "Antes desta idade, já deveria ter tomado" : "Previstas antes desta idade"} doses={partes.antes} />
              )}
              {partes.proximas.length > 0 && <Lista titulo="Próximas doses" doses={partes.proximas} />}
              {partes.semIdade.length > 0 && (
                <Lista titulo={fase.id === "gestante" ? "Durante a gravidez" : "Conforme a caderneta (depende das doses que já tomou)"} doses={partes.semIdade} />
              )}
            </div>
            <p className="mt-5 text-[0.9375rem] text-tinta-2">
              Leve a caderneta de vacinação a uma UBS: a equipe confere o que já foi tomado e aplica o que falta, de graça.
              <Fonte fonte={fase.fonte} rotulo={`Calendário oficial: ${fase.nome.toLowerCase()}`} />
            </p>
            <p className="mt-3">
              <Link href="/onde-se-vacinar" className="botao botao-azul">
                Onde se vacinar <Icone nome="seta" className="size-4" />
              </Link>
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function Lista({ titulo, doses }: { titulo: string; doses: Dose[] }) {
  return (
    <div>
      <h3 className="font-semibold">{titulo}</h3>
      <dl className="mt-1.5 divide-y divide-grade">
        {doses.map((d) => (
          <div key={d.quando} className="grid gap-x-4 py-2 sm:grid-cols-[9rem_1fr]">
            <dt className="font-titulo font-bold text-azul">{d.quando}</dt>
            <dd>
              <ul className="text-[0.9375rem]">
                {d.vacinas.map((v) => (
                  <li key={v}>{v}</li>
                ))}
              </ul>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
