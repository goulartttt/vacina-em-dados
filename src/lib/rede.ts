import "server-only";

const TENTATIVAS = 3;
const espera = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Falhas passageiras (rede caiu, DNS não respondeu, servidor ocupado com 5xx)
// ganham novas tentativas com espera crescente, em vez de derrubar a página
// ou o build. Erro 4xx é problema do pedido: volta na hora, sem insistir.
export async function buscar(endereco: string, headers: Record<string, string> = {}): Promise<Response> {
  for (let tentativa = 1; ; tentativa++) {
    try {
      const resposta = await fetch(endereco, { headers, signal: AbortSignal.timeout(20_000) });
      if (resposta.status < 500 || tentativa === TENTATIVAS) return resposta;
    } catch (erro) {
      if (tentativa === TENTATIVAS) throw erro;
    }
    await espera(500 * 2 ** (tentativa - 1));
  }
}
