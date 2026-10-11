// Lê a cobertura vacinal do painel oficial do Ministério da Saúde (Qlik).
//
// O servidor do painel só aceita conexões vindas de um navegador. Por isso
// este script abre a página pública num Chrome sem janela, como uma pessoa
// faria, e pede os números ao próprio Qlik da página. Só leitura.
//
// - Sem pacotes: o Chrome é controlado por um canal interno
//   (--remote-debugging-pipe), sem abrir porta de rede.
// - Uso: node painel.mjs <url> <referência> [<referência> ...]
//   (ex.: TRIPLICE_D1). Escreve um JSON na saída padrão.
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const [url, ...referencias] = process.argv.slice(2);
if (!url?.startsWith("https://infoms.saude.gov.br/") || !referencias.length || !referencias.every((r) => /^[A-Z0-9_]+$/.test(r))) {
  console.error("uso: node painel.mjs <url do painel em infoms.saude.gov.br> <REFERENCIA> [...]");
  process.exit(2);
}

const CHROMES = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
];
const caminho = CHROMES.find((c) => c && existsSync(c));
if (!caminho) {
  console.error("Chrome não encontrado (defina CHROME_PATH)");
  process.exit(2);
}

const perfil = mkdtempSync(join(tmpdir(), "painel-"));
const chrome = spawn(caminho, ["--headless=new", "--remote-debugging-pipe", `--user-data-dir=${perfil}`, "--no-first-run", "--disable-extensions"], {
  stdio: ["ignore", "ignore", "ignore", "pipe", "pipe"], // fd 3: comandos, fd 4: respostas
});
const [, , , entrada, saida] = chrome.stdio;

let proximoId = 0;
const pendentes = new Map();
let resto = "";
saida.on("data", (pedaco) => {
  // Mensagens separadas pelo caractere nulo.
  const partes = (resto + pedaco.toString("utf8")).split("\0");
  resto = partes.pop();
  for (const p of partes) {
    const m = JSON.parse(p);
    const espera = pendentes.get(m.id);
    if (!espera) continue;
    pendentes.delete(m.id);
    if (m.error) espera.falhou(new Error(`${m.error.message}`));
    else espera.ok(m.result);
  }
});
function cdp(method, params = {}, sessionId) {
  const id = ++proximoId;
  return new Promise((ok, falhou) => {
    pendentes.set(id, { ok, falhou });
    entrada.write(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }) + "\0");
  });
}
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

function encerrar(codigo) {
  chrome.kill();
  try {
    rmSync(perfil, { recursive: true, force: true });
  } catch {}
  process.exit(codigo);
}
setTimeout(() => {
  console.error("tempo esgotado");
  encerrar(1);
}, 10 * 60_000).unref();

// Roda dentro da página: monta tabelas no Qlik e lê página por página.
function extrair(referencias) {
  return (async () => {
    const doc = window.app.model.engineApp;
    const lista = referencias.map((r) => `'${r}'`).join(",");
    const filtro = `{1<[Referência Imunobiológico]={${lista}}>}`;
    async function cubo(dimensoes) {
      const objeto = await doc.createSessionObject({
        qInfo: { qType: "consulta" },
        qHyperCubeDef: {
          qDimensions: dimensoes.map((d) => ({ qDef: { qFieldDefs: [d] }, qNullSuppression: true })),
          qMeasures: [{ qDef: { qDef: `Sum(${filtro} Total_Vacina)` } }, { qDef: { qDef: `Sum(${filtro} [Qtd. População])` } }],
          qSuppressZero: false,
          qInitialDataFetch: [],
        },
      });
      const largura = dimensoes.length + 2;
      const layout = await objeto.getLayout();
      const total = layout.qHyperCube.qSize.qcy;
      const passo = Math.floor(10000 / largura); // limite de células por página do Qlik
      const linhas = [];
      for (let topo = 0; topo < total; topo += passo) {
        const [pagina] = await objeto.getHyperCubeData("/qHyperCubeDef", [
          { qTop: topo, qLeft: 0, qWidth: largura, qHeight: Math.min(passo, total - topo) },
        ]);
        for (const r of pagina.qMatrix) linhas.push(r.map((c, i) => (i < dimensoes.length ? c.qText : c.qNum)));
      }
      await doc.destroySessionObject(layout.qInfo.qId);
      return linhas;
    }
    const app = await doc.getAppLayout();
    return {
      recarregado: (app.qLayout ?? app).qLastReloadTime ?? null,
      brasil: await cubo(["Ano", "Referência Imunobiológico"]),
      uf: await cubo(["Ano", "Cód. UF", "Referência Imunobiológico"]),
      municipio: await cubo(["Ano", "Cód. Município", "Referência Imunobiológico"]),
    };
  })();
}

try {
  const { targetId } = await cdp("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await cdp("Target.attachToTarget", { targetId, flatten: true });
  await cdp("Page.navigate", { url }, sessionId);
  let pronto = false;
  for (let i = 0; i < 120 && !pronto; i++) {
    await esperar(1000);
    const r = await cdp(
      "Runtime.evaluate",
      { expression: "!!(window.app && window.app.model && window.app.model.engineApp)", returnByValue: true },
      sessionId,
    );
    pronto = r.result?.value === true;
  }
  if (!pronto) throw new Error("o painel não carregou o Qlik a tempo");
  const r = await cdp(
    "Runtime.evaluate",
    { expression: `(${extrair.toString()})(${JSON.stringify(referencias)})`, awaitPromise: true, returnByValue: true },
    sessionId,
  );
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? "erro na página");
  process.stdout.write(JSON.stringify(r.result.value), () => encerrar(0));
} catch (erro) {
  console.error(erro.message);
  encerrar(1);
}
