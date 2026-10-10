# Vacina em Dados

Site público que mostra, com dados oficiais, a relação entre a cobertura
vacinal e os casos de doenças preveníveis por vacina em todo o Brasil, por
estado e por município.

> Em construção.

## Tecnologias

- [Next.js 16](https://nextjs.org) com TypeScript: o site.
- [Tailwind CSS 4](https://tailwindcss.com): estilos.
- [Supabase](https://supabase.com) (PostgreSQL): guarda os dados já resumidos.
- GitHub Actions: rotinas que buscam os dados nas fontes oficiais.
- [Vercel](https://vercel.com): hospedagem.

## Como rodar no seu computador

Requisitos: Node.js 22 ou mais recente.

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Copie `.env.example` para `.env.local` e preencha os valores
   (veja os comentários dentro do arquivo).

3. Rode o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

4. Abra [http://localhost:3000](http://localhost:3000).

## Comandos

| Comando         | O que faz                                   |
| --------------- | ------------------------------------------- |
| `npm run dev`   | Servidor de desenvolvimento                 |
| `npm run build` | Gera a versão de produção                   |
| `npm run start` | Roda a versão de produção gerada pelo build |
| `npm run lint`  | Verifica o código com o ESLint              |

## Rotinas de dados (`pipeline/`)

Python 3.14, sem dependências além do `psycopg`. Rodam toda segunda-feira no
GitHub Actions (`.github/workflows/coleta.yml`) e também podem rodar à mão:

```bash
cd pipeline
python -m venv .venv
.venv\Scripts\activate            # Windows (no Linux/macOS: source .venv/bin/activate)
pip install --require-hashes -r requirements.txt
python -m unittest discover -s tests
python -m coleta tudo             # ou: territorios | cobertura | sarampo
```

As rotinas gravam no banco com o usuário `coleta`, que só escreve nas
tabelas de dados. A senha dele é gerada por `python definir_senha_coleta.py`,
que a grava no `.env.local` e nos segredos do GitHub sem exibi-la. O esquema
do banco fica em `supabase/migrations/`.

## Fontes de dados

Todos os números vêm de fontes públicas oficiais. A lista completa, com a
metodologia e as limitações, ficará na página "Sobre os dados" do site.

- Ministério da Saúde: DATASUS (PNI, SINAN), OpenDataSUS e API de Dados Abertos.
- Fiocruz: InfoDengue.
- IBGE: população e mapas.

## Segurança

- Segredos ficam só em variáveis de ambiente (`.env.local`, fora do Git).
- O site lê o banco apenas pelo servidor. O navegador nunca acessa o banco.
- Cabeçalhos de segurança (CSP, `X-Frame-Options` etc.) em `next.config.ts`.
- `npm audit` acusa uma vulnerabilidade alta no pacote `braces`, usado só pelo
  ESLint durante o desenvolvimento (não vai para o site publicado). Ainda não
  há versão corrigida. Reavaliar quando houver.

## Aviso

O conteúdo tem caráter informativo e não substitui orientação de um
profissional de saúde.
