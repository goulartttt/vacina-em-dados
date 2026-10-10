import type { Metadata } from "next";
import Link from "next/link";

import { ListaMitos } from "@/components/cartoes/ListaMitos";
import { Fonte } from "@/components/Fonte";
import { Icone, type NomeIcone } from "@/components/Icone";
import { TopoInterno } from "@/components/Voltar";
import { AVISO_MEDICO, FONTES } from "@/conteudo/fontes";
import { MITOS } from "@/conteudo/mitos";
import { SARAMPO } from "@/conteudo/sarampo";
import { atualizacoes, BRASIL } from "@/lib/dados";
import { anoParcial } from "@/lib/datas";
import { numero, porcentagem } from "@/lib/formato";
import { casosEm, coberturaEm } from "@/lib/painel";
import { anosDoPainel, seriesDoBrasil } from "@/lib/paineis";

export const metadata: Metadata = {
  title: "Sarampo: sintomas, sinais de alerta e vacina",
  description:
    "O que é o sarampo, como passa de uma pessoa para outra, sintomas, sinais de alerta, complicações e quem deve tomar a vacina tríplice viral, com fontes do Ministério da Saúde, e os números do Brasil.",
};

const FICHAS: { icone: NomeIcone; titulo: string; texto: string; estilo: string; tinta: string }[] = [
  { icone: "vento", titulo: "Como pega", texto: SARAMPO.transmissao[0], estilo: "bg-azul-claro border-[#cddcff]", tinta: "text-azul" },
  { icone: "alerta", titulo: "Sintomas", texto: SARAMPO.sintomas, estilo: "bg-folha border-linha", tinta: "text-tinta-2" },
  { icone: "critico", titulo: "Sinal de alerta", texto: SARAMPO.alerta, estilo: "bg-critico-fundo border-critico-borda", tinta: "text-critico-tinta" },
  { icone: "ok", titulo: "Como prevenir", texto: SARAMPO.prevencao, estilo: "bg-ok-fundo border-ok-borda", tinta: "text-ok-tinta" },
];

export default async function Sarampo() {
  const anos = await anosDoPainel();
  const [series, fontes] = await Promise.all([seriesDoBrasil(anos), atualizacoes()]);
  const brasil = series.get(BRASIL);
  const ultimoCob = anos.cobertura[1];
  const cobertura = brasil ? coberturaEm(brasil, anos, ultimoCob) : null;
  const pico = brasil ? brasil.cas.reduce((m, v, i) => (v > m.casos ? { casos: v, ano: anos.casos[0] + i } : m), { casos: 0, ano: anos.casos[0] }) : null;
  const ultimoCas = anos.casos[1];
  const casosAgora = brasil ? casosEm(brasil, anos, ultimoCas) : null;
  const parcial = anoParcial(fontes, anos) === ultimoCas;

  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 sm:pt-8 lg:px-8">
      <TopoInterno voltar={{ href: "/", rotulo: "Voltar ao painel" }} itens={[{ href: "/", rotulo: "Início" }, { rotulo: "Sarampo" }]} />

      <header className="max-w-3xl">
        <span className="etiqueta">Doença prevenível por vacina</span>
        <h1 className="titulo mt-3 text-[3rem] sm:text-7xl">Sarampo</h1>
        <p className="mt-4 text-xl text-tinta-2">
          {SARAMPO.resumo}
          <Fonte fonte={SARAMPO.fonte} />
        </p>
      </header>

      <ul className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {FICHAS.map((f) => (
          <li key={f.titulo} className={`rounded-[1.25rem] border p-5 ${f.estilo}`}>
            <h2 className={`flex items-center gap-2 font-titulo text-xl font-extrabold ${f.tinta}`}>
              <Icone nome={f.icone} className="size-6" />
              {f.titulo}
            </h2>
            <p className="mt-2 text-tinta">{f.texto}</p>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-sm text-tinta-3">
        {SARAMPO.transmissao[1]}
        <Fonte fonte={SARAMPO.fonte} />
      </p>

      <section aria-labelledby="complicacoes" className="mt-14">
        <h2 id="complicacoes" className="titulo text-3xl sm:text-4xl">
          Por que não é uma doença leve
        </h2>
        <p className="mt-2 text-lg text-tinta-2">
          Entre as crianças que pegam sarampo, segundo o Ministério da Saúde:
          <Fonte fonte={SARAMPO.fonte} />
        </p>
        <ul className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {SARAMPO.complicacoes.map((c) => (
            <li key={c.quadro} className="cartao p-5">
              <p className="numero text-[1.75rem] text-critico-tinta">{c.risco}</p>
              <p className="mt-2 text-tinta-2">{c.quadro}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="vacina" className="mt-14">
        <h2 id="vacina" className="titulo text-3xl sm:text-4xl">
          Quem deve tomar a vacina
        </h2>
        <p className="mt-2 text-lg text-tinta-2">
          A tríplice viral protege contra sarampo, caxumba e rubéola e é de graça no SUS.
          <Fonte fonte={FONTES.msCalendario} />
        </p>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {SARAMPO.doses.map((d) => (
            <li key={d.quem} className="cartao p-4">
              <p className="text-sm font-semibold text-tinta-2">{d.quem}</p>
              <p className="numero mt-1 text-2xl text-ok-tinta">{d.dose}</p>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-tinta-2">
          {SARAMPO.gestantes}
          <Fonte fonte={SARAMPO.fonte} />
        </p>
        <p className="mt-5 flex flex-wrap gap-3">
          <Link href="/calendario" className="botao botao-azul">
            Ver o calendário completo <Icone nome="seta" className="size-4" />
          </Link>
          <Link href="/onde-se-vacinar" className="botao botao-contorno">
            <Icone nome="pin" className="size-4" /> Onde se vacinar
          </Link>
        </p>
      </section>

      <section aria-labelledby="numeros" className="cartao mt-14 p-5 sm:p-8">
        <h2 id="numeros" className="titulo text-3xl sm:text-4xl">
          O sarampo no Brasil, em números
        </h2>
        <dl className="mt-5 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-fundo p-4">
            <dt className="text-sm font-semibold text-tinta-2">Crianças de 1 ano vacinadas em {ultimoCob}</dt>
            <dd className="numero mt-2 text-[2.5rem]">{cobertura === null ? "—" : porcentagem(cobertura)}</dd>
          </div>
          <div className="rounded-2xl bg-fundo p-4">
            <dt className="text-sm font-semibold text-tinta-2">Maior número de casos num ano</dt>
            <dd className="numero mt-2 text-[2.5rem] text-casos-tinta">{pico ? numero(pico.casos) : "—"}</dd>
            {pico && <dd className="text-sm text-tinta-2">em {pico.ano}</dd>}
          </div>
          <div className="rounded-2xl bg-fundo p-4">
            <dt className="text-sm font-semibold text-tinta-2">
              Casos em {ultimoCas}
              {parcial ? " (até agora)" : ""}
            </dt>
            <dd className="numero mt-2 text-[2.5rem]">{casosAgora === null ? "—" : numero(casosAgora)}</dd>
          </div>
        </dl>
        <p className="mt-4 text-sm text-tinta-3">
          Vacinação: Ministério da Saúde, SI-PNI. Casos confirmados: SINAN.
          <Fonte fonte={FONTES.datasusSinan} rotulo="DATASUS" />
        </p>
        <p className="mt-5">
          <Link href="/" className="botao botao-azul">
            Ver o painel do Brasil, do seu estado e da sua cidade <Icone nome="seta" className="size-4" />
          </Link>
        </p>
      </section>

      <section aria-labelledby="mitos" className="mt-14">
        <h2 id="mitos" className="titulo text-3xl sm:text-4xl">
          Mitos sobre o sarampo
        </h2>
        <div className="mt-5">
          <ListaMitos mitos={MITOS.filter((m) => m.sarampo)} />
        </div>
      </section>

      <p className="mt-12 text-sm text-tinta-3">{AVISO_MEDICO}</p>
    </div>
  );
}
