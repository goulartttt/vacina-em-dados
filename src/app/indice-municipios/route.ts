import { municipios } from "@/lib/dados";

// Lista compacta para a busca: [nome, UF, slug]. É gerada no build e servida
// como arquivo estático; a busca só a baixa quando o leitor foca o campo.
export async function GET() {
  const lista = (await municipios()).map((m) => [m.nome, m.uf_sigla, m.slug]);
  return Response.json(lista, {
    headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800" },
  });
}
