// Endereço público do site. Na Vercel vem da variável de sistema com o
// domínio de produção do projeto; no computador, o servidor local.
const dominio = process.env.VERCEL_PROJECT_PRODUCTION_URL;
export const URL_SITE = dominio ? `https://${dominio}` : "http://localhost:3000";
