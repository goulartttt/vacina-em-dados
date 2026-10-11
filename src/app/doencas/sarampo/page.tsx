import type { Metadata } from "next";
import Link from "next/link";

import { ListaMitos } from "@/components/cartoes/ListaMitos";
import { Fonte } from "@/components/Fonte";
import { Icone } from "@/components/Icone";
import { TopoInterno } from "@/components/Voltar";
import { AVISO_MEDICO, FONTES } from "@/conteudo/fontes";
import { MITOS } from "@/conteudo/mitos";
import { SARAMPO } from "@/conteudo/sarampo";
import { atualizacoes, BRASIL, serieCasos } from "@/lib/dados";
import { anoParcial } from "@/lib/datas";
import { numero, porcentagem } from "@/lib/formato";
import { casosEm, coberturaEm } from "@/lib/painel";
import { anosDoPainel, seriesDoBrasil } from "@/lib/paineis";

export const metadata: Metadata = {
  title: "Sarampo: sintomas, sinais de alerta e vacina",
  description:
    "O que é o sarampo, como passa de uma pessoa para outra, sintomas, sinais de alerta, complicações e quem deve tomar a vacina tríplice viral, com fontes do Ministério da Saúde, e os números do Brasil.",
};

// Verde, âmbar e vermelho ficam só para a situação da cobertura: aqui os
// quatro blocos são neutros e se distinguem pelo título.
const FICHAS = [
  { titulo: "Como pega", texto: SARAMPO.transmissao[0] },
  { titulo: "Sintomas", texto: SARAMPO.sintomas },
  { titulo: "Sinal de alerta", texto: SARAMPO.alerta },
  { titulo: "Como prevenir", texto: SARAMPO.prevencao },
];

/** Ano em que o sarampo voltou ao Brasil depois de anos quase sem casos. */
const INICIO_SURTO = 2018;

export default async function Sarampo() {
  const anos = await anosDoPainel();
  const [series, fontes, casosBrasil] = await Promise.all([seriesDoBrasil(anos), atualizacoes(), serieCasos(BRASIL)]);
  const comMortes = casosBrasil.filter((p) => p.ano >= INICIO_SURTO && (p.obitos ?? 0) > 0);
  const mortes = { total: comMortes.reduce((t, p) => t + (p.obitos ?? 0), 0), porAno: comMortes.map((p) => ({ ano: p.ano, obitos: p.obitos ?? 0 })) };
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
        <h1 className="titulo text-[2.5rem] sm:text-6xl">Sarampo</h1>
        <p className="linha-fina mt-2">Doença prevenível por vacina</p>
        <p className="mt-4 text-lg text-tinta">
          {SARAMPO.resumo}
          <Fonte fonte={SARAMPO.fonte} />
        </p>
      </header>

      {/* 1 px entre as células com o fundo da grade aparecendo: linhas finas em qualquer largura. */}
      <ul className="mt-8 grid gap-px overflow-hidden rounded-xl border border-linha bg-linha md:grid-cols-2 xl:grid-cols-4">
        {FICHAS.map((f) => (
          <li key={f.titulo} className="bg-folha p-5 sm:p-6">
            <h2 className="font-titulo text-[1.1875rem] font-bold">{f.titulo}</h2>
            <p className="mt-2 text-[0.9375rem]">{f.texto}</p>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-sm text-tinta-3">
        {SARAMPO.transmissao[1]}
        <Fonte fonte={SARAMPO.fonte} />
      </p>

      <section aria-labelledby="complicacoes" className="mt-14">
        <h2 id="complicacoes" className="titulo text-[1.75rem] sm:text-[2.125rem]">
          Por que não é uma doença leve
        </h2>
        <p className="mt-2 text-tinta-2">
          Entre as crianças que pegam sarampo, segundo o Ministério da Saúde:
          <Fonte fonte={SARAMPO.fonte} />
        </p>
        <dl className="cartao mt-5 max-w-4xl divide-y divide-linha">
          {SARAMPO.complicacoes.map((c) => (
            <div key={c.quadro} className="grid gap-x-6 gap-y-1 px-5 py-4 sm:grid-cols-[14rem_1fr] sm:px-6">
              <dt className="numero text-[1.25rem]">{c.risco}</dt>
              <dd className="text-tinta-2">{c.quadro}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="vacina" className="mt-14">
        <h2 id="vacina" className="titulo text-[1.75rem] sm:text-[2.125rem]">
          Quem deve tomar a vacina
        </h2>
        <p className="mt-2 text-tinta-2">
          A tríplice viral protege contra sarampo, caxumba e rubéola e é de graça no SUS.
          <Fonte fonte={FONTES.msCalendario} />
        </p>
        <dl className="cartao mt-5 max-w-4xl divide-y divide-linha">
          {SARAMPO.doses.map((d) => (
            <div key={d.quem} className="grid gap-x-6 gap-y-0.5 px-5 py-3.5 sm:grid-cols-[14rem_1fr] sm:px-6">
              <dt className="font-semibold">{d.quem}</dt>
              <dd className="text-tinta-2">{d.dose}</dd>
            </div>
          ))}
        </dl>
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
        <h2 id="numeros" className="titulo text-[1.75rem] sm:text-[2.125rem]">
          O sarampo no Brasil, em números
        </h2>
        <dl className="mt-5 grid gap-px overflow-hidden rounded-lg border border-linha bg-linha sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-folha p-4">
            <dt className="text-sm text-tinta-2">Crianças de 1 ano vacinadas em {ultimoCob}</dt>
            <dd className="numero mt-2 text-[2.25rem]">{cobertura === null ? "sem dado" : porcentagem(cobertura)}</dd>
          </div>
          <div className="bg-folha p-4">
            <dt className="text-sm text-tinta-2">Maior número de casos num ano</dt>
            <dd className="numero mt-2 text-[2.25rem] text-casos-tinta">{pico ? numero(pico.casos) : "—"}</dd>
            {pico && <dd className="mt-1 text-sm text-tinta-2">em {pico.ano}</dd>}
          </div>
          <div className="bg-folha p-4">
            <dt className="text-sm text-tinta-2">
              Casos em {ultimoCas}
              {parcial ? " (até agora)" : ""}
            </dt>
            <dd className="numero mt-2 text-[2.25rem]">{casosAgora === null ? "sem dado" : numero(casosAgora)}</dd>
          </div>
          <div className="bg-folha p-4">
            <dt className="text-sm text-tinta-2">Mortes por sarampo desde {INICIO_SURTO}</dt>
            <dd className="numero mt-2 text-[2.25rem]">{numero(mortes.total)}</dd>
            <dd className="mt-1 text-sm text-tinta-2">{mortes.porAno.map((m) => `${numero(m.obitos)} em ${m.ano}`).join(", ")}</dd>
          </div>
        </dl>
        <p className="mt-4 text-sm text-tinta-2">
          Vacinação: Ministério da Saúde, SI-PNI. Casos confirmados e mortes: SINAN, pelo ano dos primeiros sintomas
          <Fonte fonte={FONTES.datasusSinan} rotulo="DATASUS" />. As mortes são as registradas como “óbito pelo agravo”, os mesmos números da
          tabulação oficial do TabNet
          <Fonte fonte={FONTES.tabnetExantematicas} rotulo="TabNet" />. Boletins da época podem trazer números diferentes: o Ministério da Saúde
          ainda revisa o banco do SINAN
          <Fonte fonte={FONTES.notaSinanSarampo} rotulo="nota técnica de 2026" />.
        </p>
        <p className="mt-5">
          <Link href="/" className="botao botao-azul">
            Ver o painel do Brasil, do seu estado e da sua cidade <Icone nome="seta" className="size-4" />
          </Link>
        </p>
      </section>

      <section aria-labelledby="mitos" className="mt-14">
        <h2 id="mitos" className="titulo text-[1.75rem] sm:text-[2.125rem]">
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
