---
name: Vacina em Dados
description: Painel colorido e fácil de cobertura vacinal e casos de doenças preveníveis por vacina no Brasil, com cartões para entender e se proteger.
colors:
  fundo: "#f5f8fc"
  folha: "#ffffff"
  tinta: "#172133"
  tinta-2: "#3a475c"
  tinta-3: "#4f5d74"
  linha: "#dce4f0"
  grade: "#eef2f7"
  azul: "#2156d9"
  azul-escuro: "#1a45b0"
  azul-claro: "#e6eeff"
  lilas: "#7357e8"
  lilas-escuro: "#5b3fd6"
  lilas-claro: "#efebfe"
  ok: "#23a061"
  ok-tinta: "#11703e"
  ok-fundo: "#e3f5eb"
  alerta: "#f2a900"
  alerta-tinta: "#865300"
  alerta-fundo: "#fff4d6"
  critico: "#c62e40"
  critico-tinta: "#a51d31"
  critico-fundo: "#fde8ea"
  vazio: "#d5dbe1"
  casos: "#d9480f"
  casos-tinta: "#b03a0c"
  casos-0: "#dfe6ef"
  casos-1: "#ffe1cf"
  casos-2: "#ffad80"
  casos-3: "#f2703d"
  casos-4: "#c2410c"
  foco: "#1a45b0"
typography:
  display:
    fontFamily: "Bricolage Grotesque, Figtree, sans-serif"
    fontSize: "clamp(2.25rem, 5vw, 3rem)"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Bricolage Grotesque, Figtree, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "-0.025em"
  numero:
    fontFamily: "Bricolage Grotesque, Figtree, sans-serif"
    fontSize: "2.75rem"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Figtree, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
  nota:
    fontFamily: "Figtree, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  rotulo:
    fontFamily: "Figtree, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    letterSpacing: "0.05em"
rounded:
  botao: "0.75rem"
  cartao: "1.25rem"
  pilula: "999px"
spacing:
  gutter-mobile: "1rem"
  gutter: "2rem"
  entre-cartoes: "1rem"
  secao: "3.5rem"
components:
  cartao:
    backgroundColor: "{colors.folha}"
    rounded: "{rounded.cartao}"
  etiqueta:
    backgroundColor: "{colors.azul-claro}"
    textColor: "{colors.azul}"
    rounded: "{rounded.pilula}"
  botao-azul:
    backgroundColor: "{colors.azul}"
    textColor: "#ffffff"
    rounded: "{rounded.botao}"
  selo-adequado:
    backgroundColor: "{colors.ok-fundo}"
    textColor: "{colors.ok-tinta}"
    rounded: "{rounded.pilula}"
  selo-alerta:
    backgroundColor: "{colors.alerta-fundo}"
    textColor: "{colors.alerta-tinta}"
    rounded: "{rounded.pilula}"
  selo-critico:
    backgroundColor: "{colors.critico-fundo}"
    textColor: "{colors.critico-tinta}"
    rounded: "{rounded.pilula}"
---

# Vacina em Dados: Painel vivo

Escolhido pelo Alexandre em 09/10/2026 entre quatro direções (página de
escolha com prévias reais): a opção A, "Painel vivo", com o gráfico de linha
e a tabela por estado da opção D. Substituiu "O Laudo", que foi lido como
"relatório de empresa".

## Ideia

O site abre direto num painel colorido: título em forma de pergunta, filtros
sempre à vista, quatro números grandes com seta de subiu ou caiu, o mapa do
Brasil na largura toda e, logo abaixo, cartões para entender e se proteger.
Quem só olha os números grandes já sai sabendo a situação; quem quer mais
filtra, toca no mapa e lê o gráfico.

## Regras

- **Só tema claro.** Em saúde, o escuro foi lido como negativo. Preto só nos
  textos.
- **Página inteira.** Conteúdo até 1280 px, cartões lado a lado em grade.
  Nunca texto de um lado e gráfico do outro, nem efeito de rolagem que troca
  conteúdo.
- **Cores de situação são reservadas.** Verde (adequado, 95% ou mais), âmbar
  (alerta, 80% a 94,9%) e vermelho (crítico, abaixo de 80%) só aparecem para
  a situação da cobertura, sempre com ícone e palavra. Azul é a marca e as
  ações; lilás, os mitos; coral, os casos de doença.
- **Números grandes** em Bricolage Grotesque 800; texto em Figtree. Valores
  com uma casa decimal, arredondamento pela representação decimal.
- **Cada número diz de onde veio**, e cada frase de saúde liga a uma fonte
  oficial.
- **Interação ajuda a ler, não enfeita.** Passar o mouse mostra o resumo;
  tocar fixa a escolha e a desenha no gráfico. Toda informação do mapa e do
  gráfico também está em tabela. Movimento curto e respeitando "reduzir
  movimento".

## Peças

- **Filtros:** seletores nativos com seta azul (`.seletor`), botões
  Vacinação/Casos em pílula, barra de anos com dois controles deslizantes
  (`.faixa-anos`) e atalhos "Últimos 5 anos" e "Tudo".
- **Números grandes:** cartão de 1,25 rem de raio; o primeiro leva o tom da
  situação. No celular, o primeiro e o último ocupam a largura toda.
- **Mapa:** estados ou cidades pintados pela situação (ou pelas faixas de
  casos), guia "como ler" em 3 passos e cartão de resumo ao lado do lugar
  (embaixo do mapa no celular).
- **Ano a ano:** linha azul de 3 px com pontos na cor da situação, faixa da
  meta em verde claro, comparações em cinza com tracejados diferentes, lugar
  escolhido no mapa em lilás, período escolhido em azul-claro.
- **Cartões educativos:** doença com faixa azul; mito ou verdade em lilás com
  "Ver a resposta"; calendário em abas por fase da vida; onde se vacinar com
  a busca da cidade.
- **UBS:** cartão com nome, endereço, turno e os botões "Ver no mapa" (azul)
  e "Ligar" (contorno).
