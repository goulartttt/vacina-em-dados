import { imagemDoLugar, TAMANHO } from "@/lib/imagem-compartilhar";
import { serieCobertura, territorioPorSlug } from "@/lib/dados";

export const size = TAMANHO;
export const contentType = "image/png";
export const alt = "Cobertura da vacina tríplice viral no estado comparada com a meta de 95%";

export default async function Imagem({ params }: { params: Promise<{ uf: string }> }) {
  const t = await territorioPorSlug((await params).uf);
  return imagemDoLugar({
    titulo: t?.nome ?? "Estado",
    subtitulo: "Vacinação contra o sarampo",
    serie: t ? await serieCobertura(t.id) : [],
  });
}
