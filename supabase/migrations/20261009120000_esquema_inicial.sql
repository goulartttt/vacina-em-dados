-- Esquema inicial do Vacina em Dados.
-- Guarda dados públicos já resumidos (nenhum dado pessoal).
-- O site só lê; quem escreve é o usuário "coleta", usado pelas rotinas de dados.

-- ---------------------------------------------------------------------------
-- Territórios: Brasil, estados e municípios numa tabela só.
-- O id é o código do IBGE, cujo tamanho já diz o tipo:
--   1 = Brasil, 2 dígitos = estado (35 = SP), 7 dígitos = município (3550308).
-- ---------------------------------------------------------------------------
create table public.territorios (
  id        integer primary key,
  tipo      text    not null check (tipo in ('pais', 'uf', 'municipio')),
  nome      text    not null,
  uf_sigla  text    check (uf_sigla ~ '^[A-Z]{2}$'),
  pai_id    integer references public.territorios (id),
  slug      text    not null unique,  -- endereço da página, ex.: sao-paulo-sp
  check ((tipo = 'pais') = (pai_id is null))
);
create index territorios_pai_id_idx on public.territorios (pai_id);

-- ---------------------------------------------------------------------------
-- Catálogos fixos: doenças, vacinas (indicadores de cobertura) e a ligação
-- entre elas. Uma vacina pode proteger de várias doenças e vice-versa.
-- ---------------------------------------------------------------------------
create table public.doencas (
  id    text primary key,  -- ex.: sarampo
  nome  text not null
);

create table public.vacinas (
  id           text primary key,          -- ex.: triplice_viral_d1
  nome         text not null,
  codigo_pni   text not null unique,      -- código do Ministério (ex.: 021)
  publico_alvo text not null,
  meta         numeric(5, 2) not null check (meta > 0 and meta <= 100)
);

create table public.doenca_vacina (
  doenca_id  text references public.doencas (id),
  vacina_id  text references public.vacinas (id),
  primary key (doenca_id, vacina_id)
);
create index doenca_vacina_vacina_id_idx on public.doenca_vacina (vacina_id);

-- ---------------------------------------------------------------------------
-- Cobertura vacinal por ano. Uma linha = um território, uma vacina, um ano.
-- "origem" separa o número publicado pelo Ministério do calculado por nós.
-- Cobertura acima de 100% existe de verdade (a população é uma estimativa).
-- ---------------------------------------------------------------------------
create table public.cobertura_anual (
  territorio_id integer  not null references public.territorios (id),
  vacina_id     text     not null references public.vacinas (id),
  ano           smallint not null check (ano between 1994 and 2100),
  doses         integer  not null check (doses >= 0),
  populacao     integer  check (populacao >= 0),
  cobertura     numeric(6, 2) check (cobertura >= 0),
  origem        text     not null check (origem in ('oficial', 'calculada')),
  primary key (territorio_id, vacina_id, ano)
);
-- Para o mapa: "todos os municípios, vacina X, ano Y".
create index cobertura_anual_vacina_ano_idx on public.cobertura_anual (vacina_id, ano);

-- ---------------------------------------------------------------------------
-- Casos confirmados. Por ano em todos os territórios; por mês só em Brasil
-- e estados (para caber no plano gratuito). Município = de residência.
-- ---------------------------------------------------------------------------
create table public.casos_anual (
  territorio_id integer  not null references public.territorios (id),
  doenca_id     text     not null references public.doencas (id),
  ano           smallint not null check (ano between 1994 and 2100),
  casos         integer  not null check (casos >= 0),
  obitos        integer  check (obitos >= 0),
  primary key (territorio_id, doenca_id, ano)
);
create index casos_anual_doenca_ano_idx on public.casos_anual (doenca_id, ano);

create table public.casos_mensal (
  territorio_id integer  not null references public.territorios (id),
  doenca_id     text     not null references public.doencas (id),
  ano           smallint not null check (ano between 1994 and 2100),
  mes           smallint not null check (mes between 1 and 12),
  casos         integer  not null check (casos >= 0),
  obitos        integer  check (obitos >= 0),
  primary key (territorio_id, doenca_id, ano, mes)
);
create index casos_mensal_doenca_idx on public.casos_mensal (doenca_id, ano, mes);

-- ---------------------------------------------------------------------------
-- De onde veio cada dado e quando foi coletado (o "atualizado em" do site).
-- ---------------------------------------------------------------------------
create table public.atualizacoes (
  fonte                 text primary key,  -- ex.: pni_cobertura_1994_2018
  descricao             text not null,
  url                   text not null,
  arquivo_atualizado_em timestamptz,       -- data do arquivo na fonte
  coletado_em           timestamptz not null default now()
);

-- Dados iniciais dos catálogos (sarampo primeiro).
insert into public.doencas (id, nome) values
  ('sarampo', 'Sarampo');

insert into public.vacinas (id, nome, codigo_pni, publico_alvo, meta) values
  ('triplice_viral_d1', 'Tríplice viral (1ª dose)', '021', 'Crianças de 1 ano', 95),
  ('triplice_viral_d2', 'Tríplice viral (2ª dose)', '098', 'Crianças de 1 ano', 95);

insert into public.doenca_vacina (doenca_id, vacina_id) values
  ('sarampo', 'triplice_viral_d1'),
  ('sarampo', 'triplice_viral_d2');

-- ---------------------------------------------------------------------------
-- Segurança
-- ---------------------------------------------------------------------------

-- 1) RLS ligado em todas as tabelas: sem uma regra explícita, ninguém acessa.
alter table public.territorios     enable row level security;
alter table public.doencas         enable row level security;
alter table public.vacinas         enable row level security;
alter table public.doenca_vacina   enable row level security;
alter table public.cobertura_anual enable row level security;
alter table public.casos_anual     enable row level security;
alter table public.casos_mensal    enable row level security;
alter table public.atualizacoes    enable row level security;

-- 2) O público (chave anônima do site) só pode ler.
--    O Supabase dá todas as permissões por padrão; aqui tiramos as de escrita.
revoke insert, update, delete, truncate, references, trigger
  on public.territorios, public.doencas, public.vacinas, public.doenca_vacina,
     public.cobertura_anual, public.casos_anual, public.casos_mensal,
     public.atualizacoes
  from anon, authenticated;
grant select
  on public.territorios, public.doencas, public.vacinas, public.doenca_vacina,
     public.cobertura_anual, public.casos_anual, public.casos_mensal,
     public.atualizacoes
  to anon, authenticated;

create policy leitura_publica on public.territorios     for select to anon, authenticated using (true);
create policy leitura_publica on public.doencas         for select to anon, authenticated using (true);
create policy leitura_publica on public.vacinas         for select to anon, authenticated using (true);
create policy leitura_publica on public.doenca_vacina   for select to anon, authenticated using (true);
create policy leitura_publica on public.cobertura_anual for select to anon, authenticated using (true);
create policy leitura_publica on public.casos_anual     for select to anon, authenticated using (true);
create policy leitura_publica on public.casos_mensal    for select to anon, authenticated using (true);
create policy leitura_publica on public.atualizacoes    for select to anon, authenticated using (true);

-- 3) Usuário das rotinas de coleta: entra no banco, mas só escreve nas
--    tabelas de dados. Não mexe nos catálogos nem na estrutura.
--    Nasce SEM senha (não consegue entrar). A senha é definida depois por um
--    script local, que não a mostra nem a deixa em histórico de SQL.
create role coleta login connection limit 3;
grant usage on schema public to coleta;
grant select on public.doencas, public.vacinas, public.doenca_vacina to coleta;
grant select, insert, update, delete
  on public.territorios, public.cobertura_anual, public.casos_anual,
     public.casos_mensal, public.atualizacoes
  to coleta;

create policy leitura_coleta on public.doencas       for select to coleta using (true);
create policy leitura_coleta on public.vacinas       for select to coleta using (true);
create policy leitura_coleta on public.doenca_vacina for select to coleta using (true);
create policy escrita_coleta on public.territorios     for all to coleta using (true) with check (true);
create policy escrita_coleta on public.cobertura_anual for all to coleta using (true) with check (true);
create policy escrita_coleta on public.casos_anual     for all to coleta using (true) with check (true);
create policy escrita_coleta on public.casos_mensal    for all to coleta using (true) with check (true);
create policy escrita_coleta on public.atualizacoes    for all to coleta using (true) with check (true);

-- 4) Seguro por padrão: o Supabase libera automaticamente para o público
--    tudo o que é criado em "public". Invertemos: tabelas, sequências e
--    funções futuras nascem fechadas até alguém liberar de propósito.
alter default privileges for role postgres in schema public
  revoke all on tables from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke all on sequences from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke execute on functions from anon, authenticated;
-- A permissão de "todo mundo" (public) executar funções é global no Postgres,
-- então só pode ser retirada sem o "in schema".
alter default privileges for role postgres
  revoke execute on functions from public;

-- 5) GraphQL: a extensão pg_graphql já vem desligada neste projeto e deve
--    continuar assim. O site usa só a API REST; porta sem uso é só mais
--    superfície de ataque.
