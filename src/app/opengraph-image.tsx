import { imagemDoLugar, TAMANHO } from "@/lib/imagem-compartilhar";
import { BRASIL, serieCobertura } from "@/lib/dados";

export const size = TAMANHO;
export const contentType = "image/png";
export const alt = "Cobertura da vacina tríplice viral no Brasil comparada com a meta de 95%";

export default async function Imagem() {
  return imagemDoLugar({
    titulo: "Quando a vacinação cai, a doença volta.",
    subtitulo: "Cobertura vacinal e casos de sarampo no Brasil",
    serie: await serieCobertura(BRASIL),
  });
}
