# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Público geral brasileiro, lendo principalmente no celular. Quer entender se a
vacinação está em dia na sua cidade e por que isso importa para a própria
família. Leitores secundários: jornalistas, estudantes e profissionais de
saúde que procuram o número de um município.

## Product Purpose

Informar sobre doenças preveníveis por vacina mostrando, com dados oficiais,
que **quando a vacinação cai, a doença volta**. Sucesso: o leitor termina com
clareza e ação: entendeu o que aconteceu e vai conferir a própria vacina e a
da família.

## Positioning

Junta, município por município, a cobertura vacinal oficial (SI-PNI) e os casos
confirmados (SINAN) numa mesma leitura, com fonte e data em cada número. Os
painéis oficiais mostram os dois separadamente e sem narrativa.

## Operating Context

Leitura casual, chegada por busca ("cobertura vacinal + nome da cidade") ou por
link compartilhado no WhatsApp e redes sociais. Página inicial em formato de
painel colorido (mapa, filtros, números grandes) seguido de cartões para
entender e se proteger; páginas por estado, cidade (com as UBS) e doença.

## Capabilities and Constraints

- Só dados reais e oficiais (Ministério da Saúde, IBGE). Nada inventado;
  sempre fonte e data da última atualização.
- Brasil, estados e 5.571 municípios. Município por ano; estado e Brasil por
  mês. Sem dados por bairro.
- Primeira versão: sarampo (tríplice viral × casos). Depois coqueluche,
  poliomielite, febre amarela, meningite, influenza e dengue.
- "Quais vacinas eu preciso?" calcula no navegador e não guarda nada.
- Só português. Só tema claro: em saúde, o escuro foi lido como negativo.
- Custo zero (planos gratuitos). Sem login, sem cookies.
- Números estranhos mas reais (cobertura acima de 100%, municípios minúsculos)
  aparecem com explicação, nunca escondidos. Sem ranking de municípios.

## Brand Commitments

- Nome público: **Vacina em Dados**.
- Projeto independente: nenhuma autoria, crédito pessoal ou link para portfólio,
  GitHub ou LinkedIn.
- Não pode parecer: propaganda de governo, alarmista, painel técnico frio ou
  infantil (cartaz de posto de saúde).

## Evidence on Hand

- Banco Supabase com cobertura da tríplice viral 1999–2025 (oficial) e casos de
  sarampo 2007–2026 (SINAN), por município, estado e Brasil.
- Fatos-âncora dos dados: cobertura da 1ª dose abaixo da meta de 95% a partir de
  2017 (Brasil 95,4% em 2016, 86,2% em 2017, 74,9% em 2021), com volta a 95,9% em 2024 e 93,1% em 2025; 9.323 casos de sarampo em 2018
  (8.791 no Amazonas) e 21.967 em 2019, depois de anos com quase nenhum.
- Não existe: depoimentos, fotos próprias, logo. Textos de saúde precisam de
  fonte oficial em cada trecho (sem revisor da área de saúde).

## Product Principles

1. O dado prova; o texto explica. Nenhuma afirmação sem fonte.
2. Clareza antes de impacto: o efeito visual serve à leitura, nunca a disputa.
3. Respeito ao leitor: sem medo, sem infantilizar, sem tom de governo.
4. A cidade do leitor sempre a um toque de distância.
5. Honestidade com as limitações dos dados.

## Accessibility & Inclusion

Leitores de todas as idades e escolaridades, muitos em celulares modestos e
redes lentas. Contraste AA, navegação por teclado, tabela como alternativa a
todo gráfico, respeito a "reduzir movimento" e páginas leves.
