# Vacina em Dados

@AGENTS.md

Site público, peça principal do portfólio do Alexandre. Reconstrução do zero
de um antigo TCC (repositório `data_saude`, que será apagado). O site **não**
menciona o TCC.

## Objetivo e mensagem

Fio condutor: **"quando a vacinação cai, a doença volta"**. O site informa
sobre doenças preveníveis por vacina e mostra, com dados oficiais, a
cobertura vacinal ao lado dos casos.

## Decisões (entrevista de 2026-10-09; não perguntar de novo)

- **Doenças:** sarampo (e rubéola), coqueluche, poliomielite, febre amarela,
  meningite, influenza e dengue. HIV/AIDS e malária ficam fora (talvez numa
  fase futura).
- **Abrangência:** Brasil inteiro (estado → município), abrindo em São Paulo.
  Sem dados por bairro no Brasil todo (não há fonte oficial aberta). Exceção
  a investigar: distritos da capital de São Paulo (ver rodada 4).
- **Só dados reais e oficiais.** Nada inventado. Sempre mostrar a fonte e a
  data da última atualização.
- **Cobertura vacinal 2020+:** calculada a partir dos microdados de doses do
  SI-PNI (doses ÷ população-alvo, metodologia do PNI), rotulada "calculado a
  partir de dados do Ministério da Saúde" e validada contra o painel oficial.
  Se divergir mais de 5%, mostrar só a cobertura oficial (até 2022) e, depois
  disso, apenas as doses aplicadas.
- **Funcionalidades da v1:** painel de cobertura vs. meta; gráfico cobertura ×
  casos; página por doença; "quais vacinas eu preciso?" (sem guardar dados);
  onde se vacinar (UBS do CNES; primeira a ser cortada se necessário); mitos e
  verdades com fonte; página por município (SEO); página "Sobre os dados".
- **Visual:** o estilo atual é o "Painel vivo" da rodada 4 (substituiu o
  jornalismo de dados da primeira versão). **Só tema
  claro** (decidido em 09/10 depois de ver o escuro: em saúde, o escuro foi
  lido como negativo). Só português.
- **Conteúdo de saúde:** escrito com base em fontes oficiais (Ministério da
  Saúde, OMS, SBIm), com a fonte citada em cada trecho e o aviso "não
  substitui orientação médica".
- **Hospedagem:** Vercel (`.vercel.app` por enquanto) + Supabase (projeto
  novo) + GitHub Actions para as rotinas de dados. Vercel Analytics, que não
  usa cookies.
- **Sem prazo:** qualidade acima de velocidade.
- **Rotinas de coleta em Python** (`pipeline/`): Python é o padrão para tratar
  dados de saúde. O leitor de `.dbc` foi escrito em Python puro (as
  bibliotecas existentes são AGPL ou não rodam no Python 3.14). O site
  continua em TypeScript; os dois só se encontram pelo banco.
- **Custo zero.** É projeto de portfólio, não SaaS: só planos gratuitos
  (Supabase Free, Vercel Hobby, GitHub Actions em repositório público).
  Nenhuma decisão pode depender de plano pago.
- **Nível de detalhe:** município por **ano**; estado e Brasil por **mês**.
  Cabe nos 500 MB do Supabase Free. Detalhe mensal por município só se um dia
  fizer falta e couber.
- **Ordem da etapa de dados:** uma doença de ponta a ponta antes das outras,
  começando pelo **sarampo** (cobertura da tríplice viral × casos).

### Front (entrevista de 2026-10-09, rodada 1)

- **Ordem:** front começa já, só com o sarampo; as outras doenças entram
  depois no mesmo molde. As conferências pendentes dos dados precisam estar
  resolvidas antes de publicar, não antes de construir.
- ~~Página inicial = especial jornalístico com rolagem~~ (substituído na
  rodada 4: a página inicial agora é o painel).
- **Visual:** 2 ou 3 direções visuais como protótipos navegáveis com os dados
  reais; o Alexandre escolhe ou mistura. Skills aprovadas: `dataviz`
  (gráficos) e `impeccable` (direção visual, revisão de acessibilidade).
- **Identidade:** nome público "Vacina em Dados"; logo, cores e tipografia
  saem das direções visuais.
- **Coleta automática × branch `main`:** o GitHub só agenda rotinas na branch
  padrão. A cada versão de produção, trocar a branch padrão do GitHub para a
  `PROD-Vx.y` mais recente (junto com a troca na Vercel) e avisar o
  Alexandre. Até existir a `PROD-V1.0`, a coleta roda à mão.

### Front (rodada 2)

- **HML-V1.0 = fatia do sarampo:** página inicial (especial), página do
  sarampo, página por município e "Sobre os dados". Quais vacinas, onde se
  vacinar e mitos entram nas versões seguintes da mesma demanda.
- **Mapa:** Brasil por estado; ao tocar num estado, carrega só os municípios
  dele (contornos do IBGE simplificados). Se pesar, fica só o de estados.
- **Gráficos:** SVG desenhado no servidor com `d3-scale`, `d3-shape`,
  `d3-array`; mapa com `d3-geo` e `topojson-client` (aprovados). Só a
  interação (dicas, troca de estado) roda no navegador.
- **Leitura do banco:** `fetch` na API REST do Supabase com funções tipadas,
  sem `@supabase/supabase-js`.
- **Revisão dos textos de saúde:** só o Alexandre (não há profissional de
  saúde disponível). Por isso, toda frase de saúde precisa de fonte oficial
  ligada a ela, e o aviso "não substitui orientação médica" é obrigatório.

### Front (rodada 3)

- **Vercel = dois projetos:** `vacina-em-dados` (produção, acompanha a
  `PROD-Vx.y`, aberto ao público) e `vacina-em-dados-hml` (acompanha a
  `HML-Vx.y`, protegido por login da Vercel). Framework Next.js, funções em
  São Paulo (`gru1`). Hoje o projeto de produção exige login em todos os
  links `.vercel.app`; abrir ao público quando nascer a `PROD-V1.0`.
- **Números estranhos mas reais:** mostrar a cobertura real (inclusive acima
  de 100%) com nota explicativa; em municípios com população-alvo pequena,
  aviso de que os números variam muito. Nunca limitar nem esconder.
- **Sem ranking de municípios:** cada um é comparado com a meta, o estado e o
  Brasil.
- **Imagem de compartilhamento por página** com `next/og` (ex.: cobertura do
  município e meta).
- **Sem crédito pessoal:** o site é um projeto de saúde independente. Nenhuma
  menção ao Alexandre, ao portfólio, ao GitHub ou ao LinkedIn (é o portfólio
  que fala deste projeto, nunca o contrário).
- **Interface (pedido do Alexandre):** bonita e atual, interativa, com efeitos
  visuais e movimento (não um site estático), mas sem fugir do propósito:
  informar sobre vacinação com clareza. Efeitos servem à leitura dos dados,
  nunca a atrapalham, e respeitam "reduzir movimento".

### Front (rodada 4, 09/10/2026: novo visual)

O Alexandre não gostou da primeira versão: pouca cor, cara de relatório,
texto de um lado e gráfico do outro, espaço sobrando nas laterais e o efeito
de rolagem que troca o texto e o gráfico. Gostou do mapa do Brasil. Escolheu
entre 4 opções numa página de escolha.

- **Direção: "Painel vivo" (opção A) com peças do "padrão do mercado" (D).**
  Substitui "O Laudo" e o especial com rolagem.
  - Página inicial abre no painel: título em forma de pergunta; filtros no
    topo (período, lugar, vacinação ou casos); quatro números grandes com
    seta de subiu/caiu; mapa na largura toda, com "como ler" em 3 passos,
    dica ao tocar no estado e barra de anos.
  - Da D, abaixo do mapa: gráfico de linha da evolução com a meta e tabela
    por estado (início × fim do período e variação). Filtros ficam no topo,
    não na lateral.
  - Depois: cartões educativos com cor cheia (doença com sintomas, sinal de
    alerta e prevenção; mito ou verdade; calendário por fase da vida; onde
    se vacinar com "ver no mapa" e "ligar").
  - Nunca: texto de um lado e gráfico do outro; efeito de rolagem que troca
    conteúdo; coluna estreita com laterais vazias.
- **Cores:** Azul-vacina `#2156D9` (marca, botões, filtro escolhido),
  Azul-claro `#E6EEFF` (fundo de filtros e etiquetas), Lilás `#7357E8`
  (mitos e verdades), Gelo `#F5F8FC` (fundo), Branco (cartões e mapa),
  Tinta `#172133` (textos). Cores de situação nunca viram decoração.
- **Situações da cobertura:** Adequado ≥ 95% (verde `#23A061`), Alerta de
  80% a 94,9% (âmbar `#F2A900`), Crítico < 80% (vermelho `#C62E40`), Sem
  dado (cinza `#D5DBE1`). Sempre com ícone e palavra, nunca só cor. Fonte:
  meta do Ministério da Saúde + matriz de risco de sarampo e rubéola da OPAS
  (95% ou mais não soma risco; abaixo de 80% soma o máximo).
- **Fontes:** Bricolage Grotesque (títulos e números grandes) e Figtree
  (textos e filtros).
- **Bairros e UBS do site antigo eram inventados** (números escritos à mão
  no código, telefones terminando em "-0000"). Nada disso volta. Na capital
  de São Paulo, a Prefeitura publica no TabNet municipal doses por distrito
  administrativo (pelo local de aplicação, não de moradia) e casos por
  distrito de residência: investigar como etapa própria, depois do resto.
- **UBS:** cadastro oficial do CNES (API de Dados Abertos,
  `/cnes/estabelecimentos`, tipos 1 e 2), que traz endereço, bairro, CEP,
  telefone, turno e localização. Na página da cidade: lista com filtro por
  bairro ou nome e botão "Perto de mim" (a distância é calculada no
  navegador; a localização nunca sai do aparelho). Cada UBS tem "Ligar" e
  "Ver no mapa" (Google Maps). Aviso: ligar antes para confirmar a sala de
  vacina. E-mail das unidades não é publicado.
- **Escopo desta rodada: tudo de uma vez** (visual novo em todas as páginas,
  cartões de conteúdo, mitos e verdades, calendário e UBS). Dados de 2019 em
  diante e distritos de SP ficam para as etapas seguintes.
- **Autonomia:** o Alexandre deu a direção e pediu para ser avisado só no
  fim; as demais escolhas desta rodada são minhas, registradas aqui.

## Arquitetura

- O site (Next.js) lê do Supabase **apenas no servidor**, com a chave
  publicável (`sb_publishable_...`) e RLS somente leitura. O navegador nunca
  fala com o banco. Não há API própria: a API REST do Supabase já é só leitura.
- As rotinas de coleta (`pipeline/`, rodando no GitHub Actions) baixam das
  fontes oficiais, resumem por município/ano/mês e gravam no Supabase
  conectando direto no Postgres com um **usuário próprio** que só escreve nas
  tabelas de dados (nunca a `service_role`, que ignora o RLS). A senha desse
  usuário só existe nos segredos do GitHub e no `.env.local`.
- Pacotes Python das rotinas (ambiente isolado em `pipeline/`): só `psycopg`
  (travado por hash). O leitor de `.dbc`/`.dbf` é próprio (`pipeline/coleta/`).
  `duckdb` foi aprovado para os arquivos grandes de doses de 2020+, mas só
  entra quando essa etapa começar.
- As páginas são estáticas e revalidadas quando os dados mudam.
- Supabase: projeto `anbkpeqjppandeekgkvx`. O MCP do Supabase em `.mcp.json`
  fica travado nesse projeto; é por ele que as tabelas são criadas e
  conferidas (Security Advisor).

### Front (como está montado)

- Visual "Painel vivo" (rodada 4; `DESIGN.md`); produto em `PRODUCT.md`.
  Fontes: Bricolage Grotesque (títulos e números) e Figtree (texto). Cores
  e classes (`.titulo`, `.numero`, `.cartao`, `.botao`, `.seletor`,
  `.etiqueta`, `.faixa-anos`) em `src/app/globals.css`.
- Dados: `src/lib/dados.ts` (só servidor, `use cache` + `cacheLife("days")`);
  `src/lib/paineis.ts` monta as séries do painel; `src/lib/painel.ts` tem os
  tipos e contas usados no servidor e no navegador (séries em listas
  alinhadas aos anos). Situações e faixas em `src/lib/constantes.ts`.
- Painel (`src/components/painel/`, no navegador): `Painel` junta filtros
  (De, Até, Lugar, Vacinação/Casos), números grandes, `MapaPainel` (passar o
  mouse mostra o resumo, clicar fixa e desenha a linha no gráfico),
  `BarraAnos` (dois controles deslizantes nativos), `Evolucao` (gráfico em
  duas larguras) e `TabelaRegioes` (ordem alfabética, sem ranking).
  Cobertura e casos nunca no mesmo eixo.
- Página do estado: as cidades (mapa + séries) vêm de `/mapas/[uf]`, baixado
  depois que a página abre (SP: ~280 KB).
- Conteúdo em `src/conteudo/` (fontes, mitos, calendário, sarampo); cartões
  em `src/components/cartoes/`; UBS em `ListaUbs` (filtro por bairro e
  "Perto de mim"; `Permissions-Policy: geolocation=(self)`).
- Rotas: `/`, `/estados/[uf]`, `/municipios/[slug]` (capitais no build, demais
  por ISR), `/doencas/sarampo`, `/mitos-e-verdades`, `/calendario`,
  `/onde-se-vacinar`, `/sobre-os-dados`, `/mapas/[uf]`, `/indice-municipios`
  (lista da busca), imagens de compartilhamento, `sitemap.xml` e `robots.txt`.
- Óbitos ficam fora do site até a conferência com o Ministério.
- Componentes da primeira versão (Laudo, Rolagem, gráficos do servidor)
  foram retirados do código; uma cópia ficou fora do projeto, na pasta
  temporária da sessão de 09/10.

## Fontes de dados

| Dado | Fonte |
|---|---|
| Cobertura vacinal 1994–2018 | FTP DATASUS `dissemin/publicos/PNI/DADOS` (CPNI*.DBF). O arquivo de 2019 parou em 20/05/2019: **incompleto, não usar**. Layout muda entre anos (antigos: MUNIC 7 dígitos, FX_ETARIA, DOSE; recentes: MUNIC 6 dígitos). Códigos em `PNI/AUXILIARES/COBIMUNO.CNV` (tríplice viral D1 = 021, D2 = 098) |
| Cobertura oficial 2019–2022 | A localizar (TabNet ou painel do Ministério em infoms.saude.gov.br) |
| Doses 2020+ | Portal de Dados Abertos do SUS (`dadosabertos.saude.gov.br`, tag DPNI): arquivos mensais, uma linha por dose |
| População-alvo da cobertura (crianças < 1 e 1 ano) | SINASC, nascidos vivos (FTP DATASUS) |
| Coqueluche, sarampo/rubéola, meningite, difteria, tétano, PFA (pólio) | FTP DATASUS `SINAN/DADOS/{FINAIS,PRELIM}` (COQU, EXAN, MENI, DIFT, TETA, PFAN) |
| Dengue | InfoDengue API (`info.dengue.mat.br/api/alertcity`) |
| Febre amarela | API de Dados Abertos `/arboviroses/febre-amarela-*` |
| Influenza (SRAG) | API de Dados Abertos `/vigilancia-e-meio-ambiente/srag-2019-2026` |
| UBS | API de Dados Abertos: lista `/assistencia-a-saude/unidade-basicas-de-saude` (offset conta itens, 1.000 por vez) cruzada com `/cnes/estabelecimentos` (tipos 1 e 2, `status=1`, 20 por vez). Fica só quem está nas duas (UBS oficial e ativa): 42.360 em 10/2026. Tabela `ubs`, trocada estado por estado |
| População e mapas | IBGE (`servicodados.ibge.gov.br`) |

A documentação da API de Dados Abertos fica em
`https://apidadosabertos.saude.gov.br/static/swagger.json`.

## Regras dos dados (decididas em 2026-10-09)

- **Cobertura 1994–2018:** município = número oficial do arquivo `CPNIBR`.
  Estado até 2010 = arquivo oficial `CPNIUF` (população própria, diferente da
  soma dos municípios); de 2011 em diante = soma dos municípios (o TabNet faz
  igual). Brasil = soma dos estados.
- **Cobertura em branco** quando mais de 5% das doses vêm de lugares sem
  população-alvo informada (ex.: 1999, implantação da tríplice viral). As
  doses continuam guardadas. Tríplice viral só existe nos dados a partir de
  1999; antes disso a vacina era a monovalente contra sarampo (código 018,
  ainda não carregada).
- **DF:** regiões administrativas (códigos `537xxxx`) somam em Brasília.
- **Casos (SINAN):** ano/mês pela data dos primeiros sintomas; município e UF
  de residência; confirmado pela classificação final (sarampo = `CLASSI_FIN`
  1); óbito = `EVOLUCAO` 2. Brasil e estados têm linha mesmo com zero casos;
  município sem linha = zero casos.
- **A conferir antes de publicar:** cobertura 2017–2018 contra o TabNet
  online e óbitos por sarampo (SINAN dá 21 em 2019; o Ministério divulgou 15).

## Comandos

- `npm run dev`, `npm run build`, `npm run lint`
- Rotinas de dados (dentro de `pipeline/`, com o ambiente `.venv` ativo):
  `python -m coleta territorios|cobertura|sarampo|ubs|tudo` e
  `python -m unittest discover -s tests`.
- Instalar dependências Python: `pip install --require-hashes -r requirements.txt`.
- Nova senha do usuário `coleta`: `python pipeline/definir_senha_coleta.py`
  (imprime só o verificador SCRAM para o `alter role`).

## Regras do projeto

- Antes de escrever código Next.js, consultar `node_modules/next/dist/docs/`
  (versão 16.4, com mudanças em relação ao que o modelo conhece).
- Antes de mexer no banco, carregar a skill `supabase-postgres-best-practices`.
- Branches: trilhos `HML-Vx.y` e `PROD-Vx.y`. A primeira demanda nasce da
  `main` e vira `HML-V1.0`. Nunca trabalhar direto na `main`.
- Commits: só quando o Alexandre pedir, em português, sem mencionar IA e sem
  `Co-Authored-By`.
- Quando precisar que o Alexandre faça algo: dizer o quê, por quê e dar o
  passo a passo.
- Mudanças no banco: sempre por arquivo em `supabase/migrations/` (o mesmo SQL
  aplicado pelo MCP) e explicadas ao Alexandre, que está aprendendo banco.
  O MCP recusa sozinho comandos "destrutivos" (ex.: `drop`) porque a extensão
  do VS Code não mostra a confirmação extra; nesses casos, avisar e combinar.

## Segurança (prioridade máxima, pedido do Alexandre)

Vale para banco, API, rotinas e front. Não só o básico.

- **Banco:** RLS em toda tabela; público só com `select`; escrita só pelo
  usuário `coleta`, restrito às tabelas de dados; objetos novos em `public`
  nascem fechados (default privileges revogados); GraphQL desligado.
  Depois de toda migração: Security Advisor + teste real de escrita com a
  chave pública (tem que dar `permission denied`).
- **Segredos:** nunca no Git, no chat ou no histórico de SQL. Senhas geradas
  por script local, gravadas direto no `.env.local` e nos segredos do GitHub.
  Nunca ler nem imprimir o `.env.local`.
- **Rotinas:** dados baixados são entrada não confiável (validar formato e
  valores; o banco também valida com `check`). SQL sempre parametrizado ou
  via `COPY`. Conexão com TLS. GitHub Actions com `permissions` mínimas e
  actions fixadas por hash.
- **Site:** chave publicável só no servidor; cabeçalhos de segurança (CSP etc.)
  em `next.config.ts`; nenhum dado sensível no navegador.
- **Revisão:** rodar a skill `security-review` antes de cada commit relevante.
- **Certificado:** `pipeline/supabase-ca.crt` é público (só confere a
  identidade do Supabase) e fica no Git. Vale até **abril de 2031**; trocar
  antes disso. "Enforce SSL" está ligado no Supabase.

## Onde paramos (09/10/2026, fim da sessão)

- Rodada 4 (novo visual "Painel vivo", mitos, calendário, UBS) pronta e
  **não commitada** (o Alexandre pediu tudo local). Roda com
  `npx next dev --port 3001` (no PowerShell, `npm run dev -- --port` perde o `--`).
- Banco: tabela `ubs` criada (migração `20261009150000_ubs.sql`) e
  preenchida; Security Advisor limpo; escrita com a chave pública recusada.
- 10/10: pente fino depois de um erro ao abrir (queda passageira de DNS ao
  chamar o Supabase, num servidor de dev antigo). Agora a leitura do banco
  tenta 3 vezes, há `app/error.tsx` com "Tentar de novo", e todos os botões e
  filtros foram testados clicando de verdade (35 testes, computador e
  celular). Endereço inexistente responde 200 com `noindex` (comportamento
  documentado do Next com streaming; `dynamicParams` não existe com Cache
  Components).
- Falta o Alexandre validar no navegador. Próximas etapas de dados:
  cobertura 2019+ (para o "de 2018 até hoje"), conferir 2017–2018 e óbitos no
  TabNet, distritos da capital de SP, outras 6 doenças. Depois: commit,
  `HML-V1.0`, projeto HML na Vercel.
