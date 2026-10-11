-- Cobertura oficial de 2017 a 2022 pelo TabNet do DATASUS.
-- O TabNet publica só a porcentagem, sem as doses nem a população-alvo.
-- Por isso "doses" deixa de ser obrigatória (como "populacao" já era).
-- Tirar o "not null" só muda a regra da coluna: nenhuma linha é regravada.
alter table public.cobertura_anual alter column doses drop not null;

comment on column public.cobertura_anual.doses is
  'Doses aplicadas. Em branco quando a fonte publica só a cobertura (TabNet, 2017–2022).';

-- A fonte "pni_cobertura_1994_2018" foi dividida em "pni_cobertura_arquivos"
-- (1994–2016) e "pni_cobertura_tabnet" (2017–2022), gravadas pela rotina de
-- cobertura. A linha antiga sairia na tabela "Fontes e atualização" do site.
delete from public.atualizacoes where fonte = 'pni_cobertura_1994_2018';
