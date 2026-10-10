import type { Metadata } from "next";

import { Fonte } from "@/components/Fonte";
import { Icone } from "@/components/Icone";
import { Selo } from "@/components/Situacao";
import { TopoInterno } from "@/components/Voltar";
import { FONTES } from "@/conteudo/fontes";
import { SITUACOES } from "@/lib/constantes";
import { atualizacoes } from "@/lib/dados";
import { data } from "@/lib/formato";

export const metadata: Metadata = {
  title: "Sobre os dados",
  description: "De onde vêm os números do Vacina em Dados, como são calculados, quando foram atualizados e quais são as limitações.",
};

const METODO = [
  {
    titulo: "Cobertura vacinal",
    texto:
      "Doses aplicadas divididas pela população-alvo, vezes 100. Para o sarampo, o indicador é a 1ª dose da tríplice viral em crianças de 1 ano, o mesmo usado pelo Ministério da Saúde desde 2000.",
    fonte: FONTES.datasusCobertura,
  },
  {
    titulo: "Meta de 95%",
    texto: "É a meta de cobertura da tríplice viral do Ministério da Saúde, o limiar recomendado pela Organização Pan-Americana da Saúde para evitar surtos.",
    fonte: FONTES.opasReverificacao,
  },
  {
    titulo: "Municípios, estados e Brasil",
    texto:
      "O número de cada município é o oficial, sem ajustes. Até 2010, o estado usa o total oficial publicado para ele, com população própria; de 2011 em diante, o estado é a soma dos municípios, como o TabNet do Ministério faz. O Brasil é a soma dos estados.",
    fonte: FONTES.datasusPni,
  },
  {
    titulo: "Casos de sarampo",
    texto:
      "Casos com classificação final de sarampo nas notificações de doenças exantemáticas do SINAN, contados pelo município onde a pessoa mora e pelo ano dos primeiros sintomas. Município sem registro no ano tem zero casos confirmados. No mapa, as cores mostram o número de casos no ano (não é taxa por habitante).",
    fonte: FONTES.datasusSinan,
  },
  {
    titulo: "Onde se vacinar",
    texto:
      "Entram as unidades da lista oficial de UBS do Ministério da Saúde que estão ativas no cadastro de estabelecimentos (CNES), com o endereço, o telefone, o turno e a localização cadastrados. O e-mail das unidades não é publicado. A distância do “Perto de mim” é em linha reta.",
    fonte: FONTES.cnes,
  },
];

const LIMITES = [
  "A cobertura oficial vai até 2018. O arquivo público de 2019 parou em maio daquele ano e está incompleto, por isso não é usado. Os anos seguintes entram no site depois de conferidos com o painel oficial.",
  "Quando mais de 5% das doses de um total vêm de lugares sem população-alvo informada (comum no ano de implantação de uma vacina), a cobertura fica em branco: dividir por uma população incompleta daria números falsos. As doses continuam registradas.",
  "Até 2010, o Distrito Federal aparece nos arquivos dividido em regiões administrativas. Aqui elas são somadas em Brasília, que é o único município do DF para o IBGE.",
  "A cobertura conta onde a vacina foi aplicada. Por isso uma cidade que vacina crianças de cidades vizinhas pode passar de 100%. O número é mostrado como foi publicado, com a explicação ao lado.",
  "Em municípios pequenos, poucas doses mudam muito a porcentagem. A página da cidade avisa quando a população-alvo é pequena.",
  "Os casos dos anos recentes são preliminares e ainda podem ser revisados pelo Ministério da Saúde. O ano em andamento aparece como parcial.",
  "Os óbitos por sarampo ainda não aparecem no site: os números do SINAN estão sendo conferidos com os balanços oficiais.",
  "Não há dados oficiais abertos de vacinação por bairro para o Brasil. Por isso o site vai até o município.",
];

export default async function SobreOsDados() {
  const fontes = await atualizacoes();
  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 sm:pt-8 lg:px-8">
      <TopoInterno voltar={{ href: "/", rotulo: "Voltar ao painel" }} itens={[{ href: "/", rotulo: "Início" }, { rotulo: "Sobre os dados" }]} />
      <header className="max-w-3xl">
        <span className="etiqueta">Transparência</span>
        <h1 className="titulo mt-3 text-[2.75rem] sm:text-6xl">Sobre os dados</h1>
        <p className="mt-4 text-lg text-tinta-2">
          Todos os números deste site vêm de fontes públicas oficiais. Nada é estimado por nós sem aviso, e cada número mostra de onde veio.
        </p>
      </header>

      <section aria-labelledby="situacoes" className="cartao mt-10 p-5 sm:p-8">
        <h2 id="situacoes" className="titulo text-3xl">
          As três situações
        </h2>
        <p className="mt-2 max-w-3xl text-tinta-2">
          A cor de cada lugar segue a meta de 95% do Ministério da Saúde e a matriz de risco de sarampo e rubéola da OPAS, em que cobertura de 95%
          ou mais não soma risco e abaixo de 80% soma o máximo. A OPAS usa mais faixas no meio; aqui elas foram juntadas em “alerta”.
          <Fonte fonte={FONTES.opasRisco} />
        </p>
        <ul className="mt-5 grid gap-3 sm:grid-cols-3">
          {(["ok", "alerta", "critico"] as const).map((s) => (
            <li key={s} className="rounded-2xl bg-fundo p-4">
              <Selo tipo={s} />
              <p className="numero mt-3 text-2xl">{SITUACOES[s].faixa}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="fontes" className="mt-12">
        <h2 id="fontes" className="titulo text-3xl">
          Fontes e atualização
        </h2>
        <div className="mt-5 overflow-x-auto rounded-2xl border border-linha bg-folha">
          <table className="w-full min-w-[40rem] border-collapse text-left text-[0.9375rem]">
            <caption className="sr-only">Fontes de dados, data do arquivo na fonte e data da última coleta</caption>
            <thead className="bg-grade">
              <tr>
                <th scope="col" className="rotulo px-4 py-3">Fonte</th>
                <th scope="col" className="rotulo px-3 py-3">Arquivo na fonte</th>
                <th scope="col" className="rotulo px-4 py-3">Coletado em</th>
              </tr>
            </thead>
            <tbody>
              {fontes.map((f) => (
                <tr key={f.fonte} className="border-t border-grade">
                  <th scope="row" className="px-4 py-3 font-semibold">{f.descricao}</th>
                  <td className="px-3 py-3 text-tinta-2">{f.arquivo_atualizado_em ? data(f.arquivo_atualizado_em) : "—"}</td>
                  <td className="px-4 py-3 text-tinta-2">{data(f.coletado_em)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-tinta-3">Os dados são baixados direto das fontes oficiais; a tabela mostra a data de cada arquivo e de cada coleta.</p>
      </section>

      <section aria-labelledby="metodo" className="mt-12">
        <h2 id="metodo" className="titulo text-3xl">
          Como os números são calculados
        </h2>
        <dl className="mt-5 grid gap-4 md:grid-cols-2">
          {METODO.map((m) => (
            <div key={m.titulo} className="cartao p-5">
              <dt className="font-titulo text-xl font-extrabold">{m.titulo}</dt>
              <dd className="mt-1.5 text-tinta-2">
                {m.texto}
                <Fonte fonte={m.fonte} />
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="limites" className="mt-12">
        <h2 id="limites" className="titulo text-3xl">
          Limitações
        </h2>
        <ul className="mt-5 grid gap-3 md:grid-cols-2">
          {LIMITES.map((l) => (
            <li key={l} className="flex gap-3 rounded-2xl bg-folha p-4 text-tinta-2">
              <Icone nome="alerta" className="mt-0.5 size-5 text-alerta-tinta" />
              {l}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="privacidade" className="cartao mt-12 p-5 sm:p-8">
        <h2 id="privacidade" className="titulo text-3xl">
          Privacidade
        </h2>
        <p className="mt-3 max-w-3xl text-tinta-2">
          O site não pede cadastro, não usa cookies e não guarda nada do que você digita. O botão “Perto de mim” usa a sua localização só no seu
          aparelho, para calcular a distância até as UBS: ela não é enviada nem guardada. Os dados de saúde mostrados são agregados por
          município, estado e país, sem nenhuma informação pessoal. A contagem de visitas é anônima.
        </p>
      </section>
    </div>
  );
}
