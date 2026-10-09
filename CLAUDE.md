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

## Arquitetura

- O site (Next.js) lê do Supabase **apenas no servidor**, com a chave anônima
  e RLS somente leitura. O navegador nunca fala com o banco.
- As rotinas de coleta (`pipeline/`, rodando no GitHub Actions) baixam das
  fontes oficiais, resumem por município/ano/mês e gravam no Supabase com a
  chave `service_role`, que só existe nos segredos do GitHub.
- As páginas são estáticas e revalidadas quando os dados mudam.

## Fontes de dados

| Dado | Fonte |
|---|---|
| Cobertura vacinal 1994–2019 | FTP DATASUS `dissemin/publicos/PNI/DADOS` (CPNI*.DBF) |
| Cobertura até 2022 | TabNet PNI |
| Doses 2020+ | OpenDataSUS / API de Dados Abertos `/vacinacao/doses-aplicadas-pni-AAAA` |
| Coqueluche, sarampo/rubéola, meningite, difteria, tétano, PFA (pólio) | FTP DATASUS `SINAN/DADOS/{FINAIS,PRELIM}` (COQU, EXAN, MENI, DIFT, TETA, PFAN) |
| Dengue | InfoDengue API (`info.dengue.mat.br/api/alertcity`) |
| Febre amarela | API de Dados Abertos `/arboviroses/febre-amarela-*` |
| Influenza (SRAG) | API de Dados Abertos `/vigilancia-e-meio-ambiente/srag-2019-2026` |
| UBS | API de Dados Abertos `/assistencia-a-saude/unidade-basicas-de-saude` |
| População e mapas | IBGE (`servicodados.ibge.gov.br`) |

A documentação da API de Dados Abertos fica em
`https://apidadosabertos.saude.gov.br/static/swagger.json`.

## Comandos

- `npm run dev`, `npm run build`, `npm run lint`

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
