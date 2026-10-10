import { estados } from "@/lib/dados";
import { anosDoPainel, regioesDaUf } from "@/lib/paineis";

// Mapa das cidades de um estado (caminhos SVG prontos) com a cobertura e os
// casos de cada cidade, ano a ano. Gerado no build, um arquivo por estado; a
// página do estado o baixa depois de abrir, porque pesa centenas de KB.

export async function generateStaticParams() {
  return (await estados()).map((u) => ({ uf: u.slug }));
}

export async function GET(_: Request, { params }: RouteContext<"/mapas/[uf]">) {
  const { uf: slug } = await params;
  const uf = (await estados()).find((u) => u.slug === slug);
  if (!uf) return Response.json({ erro: "Estado não encontrado" }, { status: 404 });
  const corpo = await regioesDaUf(uf, await anosDoPainel());
  return Response.json(corpo, { headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800" } });
}
