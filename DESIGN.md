---
name: Vacina em Dados
description: Observatório de cobertura vacinal e casos de doenças preveníveis por vacina no Brasil, com leitura clara e conteúdo para entender e se proteger.
colors:
  fundo: "#fafaf7"
  folha: "#ffffff"
  tinta: "#263640"
  tinta-2: "#596a73"
  tinta-3: "#66757c"
  linha: "#dfe6e8"
  campo: "#ccd7da"
  grade: "#eef2f2"
  azul: "#245a73"
  azul-escuro: "#1b4558"
  azul-claro: "#e8f0f3"
  lilas: "#69578b"
  lilas-escuro: "#54446f"
  lilas-claro: "#f2eff6"
  ok: "#3a8a5c"
  ok-tinta: "#247548"
  ok-fundo: "#e8f2ec"
  alerta: "#d9a23a"
  alerta-tinta: "#8a5a00"
  alerta-fundo: "#faf1de"
  critico: "#b9364a"
  critico-tinta: "#b42335"
  critico-fundo: "#f8e8ea"
  vazio: "#d9dfe1"
  casos: "#c65f35"
  casos-tinta: "#a44a25"
  casos-0: "#e9edec"
  casos-1: "#f5dccd"
  casos-2: "#e6a784"
  casos-3: "#cf774d"
  casos-4: "#a2441f"
  foco: "#1b4558"
typography:
  display:
    fontFamily: "Bricolage Grotesque, Figtree, sans-serif"
    fontSize: "2.75rem"
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: "-0.022em"
  display-celular:
    fontFamily: "Bricolage Grotesque, Figtree, sans-serif"
    fontSize: "2rem"
    fontWeight: 700
  secao:
    fontFamily: "Bricolage Grotesque, Figtree, sans-serif"
    fontSize: "2.125rem"
    fontWeight: 700
  secao-celular:
    fontFamily: "Bricolage Grotesque, Figtree, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 700
  bloco:
    fontFamily: "Bricolage Grotesque, Figtree, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
  cartao:
    fontFamily: "Bricolage Grotesque, Figtree, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 700
  item:
    fontFamily: "Bricolage Grotesque, Figtree, sans-serif"
    fontSize: "1.1875rem"
    fontWeight: 700
  numero:
    fontFamily: "Bricolage Grotesque, Figtree, sans-serif"
    fontSize: "2.75rem"
    fontWeight: 700
    lineHeight: 1
    fontFeature: "tnum"
  corpo:
    fontFamily: "Figtree, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
  corpo-menor:
    fontFamily: "Figtree, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
  nota:
    fontFamily: "Figtree, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
  rotulo:
    fontFamily: "Figtree, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
  grafico:
    fontFamily: "Figtree, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
rounded:
  amostra: "3px"
  selo: "0.25rem"
  botao: "0.5rem"
  cartao: "0.75rem"
spacing:
  gutter-mobile: "1rem"
  gutter: "2rem"
  entre-cartoes: "1rem"
  secao: "3.5rem"
components:
  cartao:
    backgroundColor: "{colors.folha}"
    borderColor: "{colors.linha}"
    rounded: "{rounded.cartao}"
  botao-azul:
    backgroundColor: "{colors.azul}"
    textColor: "#ffffff"
    rounded: "{rounded.botao}"
  botao-contorno:
    backgroundColor: "{colors.folha}"
    textColor: "{colors.azul}"
    rounded: "{rounded.botao}"
  alternador:
    backgroundColor: "{colors.folha}"
    borderColor: "{colors.campo}"
    rounded: "{rounded.botao}"
  selo-adequado:
    backgroundColor: "{colors.ok-fundo}"
    textColor: "{colors.ok-tinta}"
    rounded: "{rounded.selo}"
  selo-alerta:
    backgroundColor: "{colors.alerta-fundo}"
    textColor: "{colors.alerta-tinta}"
    rounded: "{rounded.selo}"
  selo-critico:
    backgroundColor: "{colors.critico-fundo}"
    textColor: "{colors.critico-tinta}"
    rounded: "{rounded.selo}"
---

# Vacina em Dados: saúde pública contemporânea

Direção definida pelo Alexandre em 11/10/2026 (paleta e regras no pedido
dele), refinando o "Painel vivo" de 09/10: a estrutura, os filtros, o mapa, o
gráfico e todas as funções continuam; sai a cara de template (pílulas,
cartões iguais, sombras, cores competindo, rótulos acima dos títulos).

## Ideia

Credibilidade de um observatório de dados com a acolhida de uma campanha de
saúde. Neutros quentes dominam; o azul-petróleo é a marca e as ações; as
outras cores só aparecem com função. O dado é o destaque, não a decoração.

## Regras

- **Só tema claro.** Em saúde, o escuro foi lido como negativo.
- **Página inteira.** Conteúdo até 1280 px. Nunca texto de um lado e gráfico
  do outro, nem efeito de rolagem que troca conteúdo.
- **Cores com função fixa.** Azul-petróleo: marca, navegação, links, ações.
  Terracota: casos de doença. Roxo discreto: mitos e verdades (texto e
  acentos, nunca um bloco roxo). Verde, âmbar e vermelho: **só** a situação
  da cobertura (adequado ≥ 95%, alerta 80% a 94,9%, crítico < 80%), sempre
  com ícone e palavra. Nada de verde em "como prevenir" nem de vermelho em
  "sinal de alerta": esses textos são neutros.
- **Situação: dois tons.** A cor base preenche mapa, pontos e barras; a
  "tinta" (mais escura) é para texto sobre o fundo suave, com contraste AA.
- **Sem rótulo acima do título.** O contexto vem numa linha fina logo abaixo
  (ex.: "Sarampo: vacina tríplice viral, 1ª dose, crianças de 1 ano").
- **Sem grade de cartões iguais.** Números numa faixa única com linhas de
  1 px; listas de leitura (mitos, método, complicações, doses, calendário)
  em linhas divididas; composições assimétricas quando o conteúdo tem alturas
  diferentes.
- **Formas.** Cartão 12 px, botão e campo 8 px, selo 4 px. Pílula nenhuma.
  Sombra só no que flutua (resumo do mapa, dica do gráfico, sugestões da
  busca), curta e suave. Nada de vidro, brilho ou gradiente.
- **Títulos** em Bricolage Grotesque 700 (o 800 gritava); texto em Figtree.
  Rótulos em caixa normal, sem o espaçado em caixa alta de painel genérico.
  Números de tabela em algarismos tabulares.
- **Cada número diz de onde veio**, e cada frase de saúde liga a uma fonte
  oficial.
- **Interação ajuda a ler, não enfeita.** Toda informação do mapa e do
  gráfico também está em tabela. Movimento curto e respeitando "reduzir
  movimento".

## Peças

- **Filtros:** seletores nativos (`.seletor`), escolhas em faixa única com
  separadores (`.alternador`: Vacinação/Casos, 1ª/2ª), "Compartilhar" em
  contorno. Barra de anos com dois controles deslizantes e os botões "Ver os
  anos passando" (cheio, o único destaque), "Últimos 5 anos" e "Tudo". No
  celular, barra-resumo presa no topo que abre os controles.
- **Números grandes:** faixa única com 4 células e linhas de 1 px; a
  situação aparece no selo, não no fundo da célula.
- **Mapa:** estados ou cidades pintados pela situação (ou pela escala de
  casos); "como ler" numa frase sob o título; legenda com amostra da cor,
  ícone, palavra e quantos lugares; resumo ao lado do lugar.
- **Vacinação e casos, ano a ano:** duas faixas com os mesmos anos (linha da
  cobertura com a faixa da meta em cima, barras de casos embaixo), destaques
  automáticos de menor cobertura e pico de casos.
- **Tabela por estado ou cidade:** altura fixa (25 rem) com rolagem própria e
  cabeçalho parado.
- **Entenda e se proteja:** à esquerda a doença (três colunas) e o mito da
  vez; à direita o calendário em abas sublinhadas; embaixo, a faixa "Onde se
  vacinar" com a busca. Nada esticado para igualar alturas.
- **UBS:** cartão com nome, endereço, turno e os botões "Ver no mapa" (cheio)
  e "Ligar" (contorno).
