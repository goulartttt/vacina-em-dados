"use client";

// Período com dois controles deslizantes nativos (teclado e leitor de tela
// funcionam sem esforço extra). Os botões ao lado são atalhos.

const POLEGAR = "1.5rem";
const posicao = (p: number) => `calc(${POLEGAR} / 2 + ${p} * (100% - ${POLEGAR}))`;

export function BarraAnos({
  limites,
  valor,
  aoMudar,
  extra,
}: {
  limites: [number, number];
  valor: [number, number];
  aoMudar: (v: [number, number]) => void;
  /** Botão a mais ao lado dos atalhos (ex.: "Ver os anos passando"). */
  extra?: React.ReactNode;
}) {
  const [min, max] = limites;
  const [inicio, fim] = valor;
  const p = (a: number) => (max === min ? 0 : (a - min) / (max - min));
  const ultimos5: [number, number] = [Math.max(min, max - 4), max];

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
      <div className="flex items-baseline justify-between gap-3 sm:block">
        <span className="rotulo block">Período</span>
        <span className="font-bold whitespace-nowrap">
          {inicio} <span className="text-tinta-3">→</span> {fim}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="faixa-anos">
          <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-linha" aria-hidden="true" />
          <div
            className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-azul"
            style={{ left: posicao(p(inicio)), right: `calc(100% - ${posicao(p(fim))})` }}
            aria-hidden="true"
          />
          <input
            type="range"
            min={min}
            max={max}
            step={1}
            value={inicio}
            aria-label="Ano inicial"
            aria-valuetext={`De ${inicio}`}
            onChange={(e) => {
              const v = Number(e.target.value);
              aoMudar([Math.min(v, fim), fim]);
            }}
          />
          <input
            type="range"
            min={min}
            max={max}
            step={1}
            value={fim}
            aria-label="Ano final"
            aria-valuetext={`Até ${fim}`}
            onChange={(e) => {
              const v = Number(e.target.value);
              aoMudar([inicio, Math.max(v, inicio)]);
            }}
          />
        </div>
        <div className="flex justify-between text-[0.8125rem] font-semibold text-tinta-3" aria-hidden="true">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {extra}
        {[
          { rotulo: "Últimos 5 anos", v: ultimos5 },
          { rotulo: "Tudo", v: limites },
        ].map((b) => {
          const ativo = b.v[0] === inicio && b.v[1] === fim;
          return (
            <button
              key={b.rotulo}
              type="button"
              aria-pressed={ativo}
              onClick={() => aoMudar(b.v)}
              className={`min-h-9 rounded-md border px-3 text-sm font-semibold whitespace-nowrap transition-colors ${
                ativo ? "border-azul bg-azul-claro text-azul" : "border-linha bg-folha text-tinta-2 hover:border-azul hover:text-azul"
              }`}
            >
              {b.rotulo}
            </button>
          );
        })}
      </div>
    </div>
  );
}
