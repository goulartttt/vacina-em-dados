import type { Metadata } from "next";
import Link from "next/link";

import { Fonte } from "@/components/Fonte";
import { Icone } from "@/components/Icone";
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
        <span className="etiqueta">Calendário Nacional de Vacinação</span>
        <h1 className="titulo mt-3 text-[2.5rem] sm:text-6xl">Sua vacina está em dia?</h1>
        <p className="mt-4 text-lg text-tinta-2">
          As vacinas que o SUS oferece de graça em cada fase da vida. “Conforme o histórico” quer dizer que depende das doses que você já
          tomou: leve a caderneta à UBS e a equipe confere o que falta.
          <Fonte fonte={FONTES.msCalendario} />
        </p>
      </header>

      <nav aria-label="Fases da vida" className="mt-8">
        <ul className="flex flex-wrap gap-2">
          {CALENDARIO.map((f) => (
            <li key={f.id}>
              <a href={`#${f.id}`} className="block rounded-full border border-linha bg-folha px-4 py-2 font-bold text-tinta-2 no-underline hover:border-azul hover:text-azul">
                {f.nome}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-8 space-y-6">
        {CALENDARIO.map((f) => (
          <section key={f.id} id={f.id} aria-labelledby={`${f.id}-titulo`} className="cartao scroll-mt-24 p-5 sm:p-7">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 id={`${f.id}-titulo`} className="titulo text-3xl">
                {f.nome} <span className="text-xl font-semibold text-tinta-3">· {f.faixa}</span>
              </h2>
              <Fonte fonte={f.fonte} rotulo="Calendário oficial desta fase" />
            </div>
            <ol className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {f.doses.map((d) => (
                <li key={d.quando} className="rounded-2xl bg-fundo p-4">
                  <p className="flex items-center gap-2 font-titulo text-lg font-extrabold text-azul">
                    <Icone nome="calendario" className="size-5" />
                    {d.quando}
                  </p>
                  <ul className="mt-2 space-y-1 text-[0.9375rem]">
                    {d.vacinas.map((v) => (
                      <li key={v} className="flex gap-2">
                        <Icone nome="ok" className="mt-[3px] size-4 text-ok" />
                        {v}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>

      <section className="cartao mt-8 flex flex-col gap-4 bg-azul p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <h2 className="titulo text-3xl">Falta alguma dose?</h2>
          <p className="mt-1 text-lg opacity-90">Veja as UBS da sua cidade, com endereço, telefone e mapa.</p>
        </div>
        <Link href="/onde-se-vacinar" className="botao shrink-0 bg-folha text-azul hover:bg-azul-claro">
          Onde se vacinar <Icone nome="seta" className="size-4" />
        </Link>
      </section>
      <p className="mt-8 text-sm text-tinta-3">
        Transcrito da página do Ministério da Saúde em 9 de outubro de 2026. Em caso de dúvida, vale o calendário oficial. {AVISO_MEDICO}
      </p>
    </div>
  );
}
