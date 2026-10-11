import type { Metadata } from "next";

import { Fonte } from "@/components/Fonte";
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
    titulo: "De 2017 a 2022",
    texto:
      "Município, estado e Brasil vêm prontos do TabNet do Ministério da Saúde, atualizado pela última vez em maio de 2023. Os arquivos públicos de 2017 e 2018 divergem dele (em 2017, 90,85% no arquivo contra 86,24% no TabNet), por isso não são usados. A base é revisada com registros que chegam atrasados, por isso reportagens da época podem citar valores diferentes.",
    fonte: FONTES.tabnetCobertura,
  },
  {
    titulo: "De 2023 em diante",
    texto:
      "Vem do painel de cobertura vacinal do Ministério da Saúde, na versão por local de aplicação, a mesma base dos anos anteriores. O próprio Ministério põe o 2022 do TabNet e o 2023 do painel lado a lado, numa tabela comparativa publicada com os painéis. O painel também traz as doses e a população-alvo. O ano em andamento fica de fora até fechar: nele, o painel usa a população proporcional aos meses e os registros ainda estão chegando.",
    fonte: FONTES.painelCobertura,
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
  "O Ministério também publica a cobertura por local de moradia. O total do Brasil é o mesmo; nas cidades, os números mudam. Aqui fica a versão por local de aplicação, para a série não mudar de critério no meio.",
  "De 2017 a 2022, o TabNet publica só a porcentagem, sem as doses e a população-alvo. Quando ele mostra 0%, o site mostra “sem dado”: a fonte usa 0 tanto para nenhuma dose registrada quanto para população-alvo ausente, e não dá para separar os dois casos.",  "Quando mais de 5% das doses de um total vêm de lugares sem população-alvo informada (comum no ano de implantação de uma vacina), a cobertura fica em branco: dividir por uma população incompleta daria números falsos. As doses continuam registradas.",
  "Até 2010, o Distrito Federal aparece nos arquivos dividido em regiões administrativas. Aqui elas são somadas em Brasília, que é o único município do DF para o IBGE.",
  "A cobertura conta onde a vacina foi aplicada. Por isso uma cidade que vacina crianças de cidades vizinhas pode passar de 100%. O número é mostrado como foi publicado, com a explicação ao lado.",
  "Em municípios pequenos, poucas doses mudam muito a porcentagem. A página da cidade avisa quando a população-alvo é pequena.",
  "Os casos dos anos recentes são preliminares e ainda podem ser revisados pelo Ministério da Saúde. O ano em andamento aparece como parcial.",
  "As mortes por sarampo são as registradas no SINAN como “óbito pelo agravo”, conferidas com a tabulação oficial do TabNet. Boletins publicados na época podem trazer números diferentes: em 2026 o Ministério da Saúde pediu aos estados a revisão do banco de doenças exantemáticas do SINAN, e os números ainda podem mudar.",
  "Não há dados oficiais abertos de vacinação por bairro para o Brasil. Por isso o site vai até o município.",
];

export default async function SobreOsDados() {
  const fontes = await atualizacoes();
  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 sm:pt-8 lg:px-8">
      <TopoInterno voltar={{ href: "/", rotulo: "Voltar ao painel" }} itens={[{ href: "/", rotulo: "Início" }, { rotulo: "Sobre os dados" }]} />
      <header className="max-w-3xl">
        <h1 className="titulo text-[2.25rem] sm:text-5xl">Sobre os dados</h1>
        <p className="mt-4 text-lg text-tinta-2">
          Todos os números deste site vêm de fontes públicas oficiais. Nada é estimado por nós sem aviso, e cada número mostra de onde veio.
        </p>
      </header>

      <section aria-labelledby="situacoes" className="cartao mt-10 p-5 sm:p-8">
        <h2 id="situacoes" className="titulo text-[1.75rem]">
          As três situações
        </h2>
        <p className="mt-2 max-w-3xl text-tinta-2">
          A cor de cada lugar segue a meta de 95% do Ministério da Saúde e a matriz de risco de sarampo e rubéola da OPAS, em que cobertura de 95%
          ou mais não soma risco e abaixo de 80% soma o máximo. A OPAS usa mais faixas no meio; aqui elas foram juntadas em “alerta”.
          <Fonte fonte={FONTES.opasRisco} />
        </p>
        <ul className="mt-5 grid divide-y divide-linha border-y border-linha sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {(["ok", "alerta", "critico"] as const).map((s) => (
            <li key={s} className="py-4 sm:px-5 sm:first:pl-0">
              <Selo tipo={s} />
              <p className="numero mt-3 text-[1.5rem]">{SITUACOES[s].faixa}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="fontes" className="mt-12">
        <h2 id="fontes" className="titulo text-[1.75rem]">
          Fontes e atualização
        </h2>
        <div className="mt-5 overflow-x-auto rounded-xl border border-linha bg-folha">
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
        <h2 id="metodo" className="titulo text-[1.75rem]">
          Como os números são calculados
        </h2>
        <dl className="cartao mt-5 max-w-4xl divide-y divide-linha">
          {METODO.map((m) => (
            <div key={m.titulo} className="grid gap-x-8 gap-y-1 px-5 py-5 sm:px-6 md:grid-cols-[13rem_1fr]">
              <dt className="font-titulo text-[1.125rem] font-bold">{m.titulo}</dt>
              <dd className="text-tinta-2">
                {m.texto}
                <Fonte fonte={m.fonte} />
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="limites" className="mt-12">
        <h2 id="limites" className="titulo text-[1.75rem]">
          Limitações
        </h2>
        <ul className="mt-5 max-w-4xl list-disc space-y-3 pl-5 text-tinta-2 marker:text-tinta-3">
          {LIMITES.map((l) => (
            <li key={l} className="pl-1">
              {l}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="privacidade" className="cartao mt-12 p-5 sm:p-8">
        <h2 id="privacidade" className="titulo text-[1.75rem]">
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
