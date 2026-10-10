import { serieCobertura, territorioPorSlug } from "@/lib/dados";
import { imagemDoLugar, TAMANHO } from "@/lib/imagem-compartilhar";

export const size = TAMANHO;
export const contentType = "image/png";
export const alt = "Cobertura da vacina tríplice viral no município comparada com a meta de 95%";

export default async function Imagem({ params }: { params: Promise<{ slug: string }> }) {
  const t = await territorioPorSlug((await params).slug);
  return imagemDoLugar({
    titulo: t ? `${t.nome} (${t.uf_sigla})` : "Município",
    subtitulo: "Vacinação contra o sarampo",
    serie: t ? await serieCobertura(t.id) : [],
  });
}
