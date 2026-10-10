-- Unidades básicas de saúde (UBS) para "onde se vacinar".
-- Dados públicos do cadastro oficial de estabelecimentos (CNES): nome,
-- endereço, telefone e localização da unidade. Nenhum dado pessoal; o e-mail
-- das unidades não é guardado.

create table public.ubs (
  cnes          integer  primary key check (cnes between 1 and 9999999),
  uf_id         integer  not null references public.territorios (id),
  municipio_id  integer  not null references public.territorios (id),
  nome          text     not null check (char_length(nome) between 2 and 160),
  endereco      text     check (char_length(endereco) <= 200),
  bairro        text     check (char_length(bairro) <= 100),
  cep           text     check (cep ~ '^[0-9]{8}$'),
  telefone      text     check (telefone ~ '^[1-9][0-9]{9,10}$'),  -- DDD + número
  turno         text     check (char_length(turno) <= 120),
  latitude      numeric(8, 5) check (latitude between -34 and 6),
  longitude     numeric(8, 5) check (longitude between -75 and -28),
  atualizado_em date
);
-- A página da cidade lista as UBS do município; a rotina troca um estado por vez.
create index ubs_municipio_id_idx on public.ubs (municipio_id);
create index ubs_uf_id_idx on public.ubs (uf_id);

-- Segurança (mesmo padrão das outras tabelas): RLS ligado, público só lê,
-- só o usuário "coleta" escreve. Como as tabelas novas nascem fechadas
-- (default privileges do esquema inicial), as permissões vêm explícitas.
alter table public.ubs enable row level security;

grant select on public.ubs to anon, authenticated;
create policy leitura_publica on public.ubs for select to anon, authenticated using (true);

grant select, insert, update, delete on public.ubs to coleta;
create policy escrita_coleta on public.ubs for all to coleta using (true) with check (true);
