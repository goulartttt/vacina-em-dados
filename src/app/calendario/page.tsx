import type { Metadata } from "next";
import Link from "next/link";

import { Fonte } from "@/components/Fonte";
import { Icone } from "@/components/Icone";
import { QuaisVacinas } from "@/components/QuaisVacinas";
import { TopoInterno } from "@/components/Voltar";
import { CALENDARIO } from "@/conteudo/calendario";
import { AVISO_MEDICO, FONTES } from "@/conteudo/fontes";

export const metadata: Metadata = {
  title: "Calendário de vacinação por idade",
  description:
    "As vacinas do Calendário Nacional de Vacinação do SUS para criança, adolescente, adulto, idoso e gestante, com as idades e doses, segundo o Ministério da Saúde.",
};

export default function Calendario() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 sm:pt-8 lg:px-8">
      <TopoInterno voltar={{ href: "/", rotulo: "Voltar ao painel" }} itens={[{ href: "/", rotulo: "Início" }, { rotulo: "Calendário" }]} />
      <header className="max-w-3xl">
        <h1 className="titulo text-[2.25rem] sm:text-5xl">Sua vacina está em dia?</h1>
        <p className="mt-4 text-lg text-tinta-2">
          As vacinas do Calendário Nacional de Vacinação, que o SUS oferece de graça em cada fase da vida. “Conforme o histórico” quer dizer
          que depende das doses que você já tomou: leve a caderneta à UBS e a equipe confere o que falta.
          <Fonte fonte={FONTES.msCalendario} />
        </p>
      </header>

      <div className="mt-8">
        <QuaisVacinas fases={CALENDARIO} />
      </div>

      <h2 className="titulo mt-12 text-[1.75rem] sm:text-[2.125rem]">O calendário completo</h2>
      <nav aria-label="Fases da vida" className="mt-3 flex flex-wrap items-center gap-x-1 gap-y-1 text-[0.9375rem]">
        <span className="mr-2 text-tinta-2">Ir para:</span>
        {CALENDARIO.map((f, i) => (
          <span key={f.id} className="flex items-center gap-1">
            {i > 0 && (
              <span className="text-tinta-3" aria-hidden="true">
                ·
              </span>
            )}
            <a href={`#${f.id}`} className="rounded px-1.5 py-1 font-semibold text-azul hover:bg-azul-claro">
              {f.nome}
            </a>
          </span>
        ))}
      </nav>

      <div className="mt-8 space-y-5">
        {CALENDARIO.map((f) => (
          <section key={f.id} id={f.id} aria-labelledby={`${f.id}-titulo`} className="cartao scroll-mt-24 p-5 sm:p-7">
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-linha pb-3">
              <h2 id={`${f.id}-titulo`} className="titulo text-[1.75rem]">
                {f.nome} <span className="text-lg font-medium text-tinta-2">· {f.faixa}</span>
              </h2>
              <Fonte fonte={f.fonte} rotulo="Calendário oficial desta fase" />
            </div>
            {/* Idade à esquerda, vacinas à direita: lê-se como uma tabela. */}
            <dl className="divide-y divide-grade">
              {f.doses.map((d) => (
                <div key={d.quando} className="grid gap-x-6 gap-y-1 py-3 sm:grid-cols-[11rem_1fr]">
                  <dt className="font-titulo text-[1.0625rem] font-bold text-azul">{d.quando}</dt>
                  <dd>
                    <ul className="grid gap-x-6 gap-y-1 text-[0.9375rem] md:grid-cols-2">
                      {d.vacinas.map((v) => (
                        <li key={v}>{v}</li>
                      ))}
                    </ul>
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>

      <section className="mt-8 flex flex-col gap-4 border-t border-linha pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="titulo text-2xl">Falta alguma dose?</h2>
          <p className="mt-1 text-tinta-2">Veja as UBS da sua cidade, com endereço, telefone e mapa.</p>
        </div>
        <Link href="/onde-se-vacinar" className="botao botao-azul shrink-0">
          Onde se vacinar <Icone nome="seta" className="size-4" />
        </Link>
      </section>
      <p className="mt-8 text-sm text-tinta-3">
        Transcrito da página do Ministério da Saúde em 9 de outubro de 2026. Em caso de dúvida, vale o calendário oficial. {AVISO_MEDICO}
      </p>
    </div>
  );
}
