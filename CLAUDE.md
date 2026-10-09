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
  Sem dados por bairro (não há fonte oficial aberta).
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
- **Visual:** jornalismo de dados (referências: especiais da Folha, Nexo, Our
  World in Data) com toques de campanha nas partes educativas. Tema claro e
  escuro seguindo o sistema. Só português.
- **Conteúdo de saúde:** escrito com base em fontes oficiais (Ministério da
  Saúde, OMS, SBIm), com a fonte citada em cada trecho e o aviso "não
  substitui orientação médica".
- **Hospedagem:** Vercel (`.vercel.app` por enquanto) + Supabase (projeto
  novo) + GitHub Actions para as rotinas de dados. Vercel Analytics, que não
  usa cookies.
- **Sem prazo:** qualidade acima de velocidade.
- **Rotinas de coleta em Python** (`pipeline/`): há bibliotecas prontas para
  ler os `.dbc` do DATASUS. O site continua em TypeScript; os dois só se
  encontram pelo banco.
- **Custo zero.** É projeto de portfólio, não SaaS: só planos gratuitos
  (Supabase Free, Vercel Hobby, GitHub Actions em repositório público).
  Nenhuma decisão pode depender de plano pago.
- **Nível de detalhe:** município por **ano**; estado e Brasil por **mês**.
  Cabe nos 500 MB do Supabase Free. Detalhe mensal por município só se um dia
  fizer falta e couber.
- **Ordem da etapa de dados:** uma doença de ponta a ponta antes das outras,
  começando pelo **sarampo** (cobertura da tríplice viral × casos).

## Arquitetura

- O site (Next.js) lê do Supabase **apenas no servidor**, com a chave anônima
  e RLS somente leitura. O navegador nunca fala com o banco.
- As rotinas de coleta (`pipeline/`, rodando no GitHub Actions) baixam das
  fontes oficiais, resumem por município/ano/mês e gravam no Supabase
  conectando direto no Postgres com um **usuário próprio** que só escreve nas
  tabelas de dados (nunca a `service_role`, que ignora o RLS). A senha desse
  usuário só existe nos segredos do GitHub e no `.env.local`.
- Pacotes Python das rotinas (ambiente isolado em `pipeline/`): `pyreaddbc`
  (ler `.dbc` do DATASUS), `duckdb` (resumir os arquivos grandes de doses) e
  `psycopg` (gravar em lote no Postgres). Aprovados em 2026-10-09.
- As páginas são estáticas e revalidadas quando os dados mudam.
- Supabase: projeto `anbkpeqjppandeekgkvx`. O MCP do Supabase em `.mcp.json` fica travado nesse projeto;
  é por ele que as tabelas são criadas e conferidas (Security Advisor).

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
| UBS | API de Dados Abertos `/assistencia-a-saude/unidade-basicas-de-saude` |
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
  `python -m coleta territorios|cobertura|sarampo|tudo` e
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
