// Ícones desenhados para o site: traço de 2 px, cantos arredondados,
// grade de 20 px. Decorativos por padrão (o texto ao lado dá o sentido).

export type NomeIcone =
  | "ok"
  | "alerta"
  | "critico"
  | "busca"
  | "seta"
  | "chevron"
  | "desce"
  | "sobe"
  | "fonte"
  | "fechar"
  | "pin"
  | "fone"
  | "menu"
  | "virar"
  | "local"
  | "calendario"
  | "relogio"
  | "vento"
  | "escudo"
  | "compartilhar"
  | "tocar"
  | "pausar";

const DESENHOS: Record<NomeIcone, React.ReactNode> = {
  ok: (
    <>
      <circle cx="10" cy="10" r="8" />
      <path d="m6.4 10.3 2.4 2.4 4.8-5" />
    </>
  ),
  alerta: (
    <>
      <circle cx="10" cy="10" r="8" />
      <path d="M10 5.8v5" />
      <circle cx="10" cy="14" r="0.6" fill="currentColor" />
    </>
  ),
  critico: (
    <>
      <path d="M10 2.6 18.2 17H1.8z" />
      <path d="M10 7.8v4.2" />
      <circle cx="10" cy="14.4" r="0.6" fill="currentColor" />
    </>
  ),
  busca: (
    <>
      <circle cx="8.6" cy="8.6" r="5.4" />
      <path d="m12.8 12.8 4.4 4.4" />
    </>
  ),
  seta: <path d="M3.5 10h12.5M11 5l5 5-5 5" />,
  chevron: <path d="m5.5 8 4.5 4.5L14.5 8" />,
  desce: <path d="M10 3.5V16M4.6 10.6 10 16l5.4-5.4" />,
  sobe: <path d="M10 16.5V4M4.6 9.4 10 4l5.4 5.4" />,
  fonte: (
    <>
      <path d="M8.25 11.75 11.75 8.25" />
      <path d="M9.5 6.25 11 4.75a3 3 0 0 1 4.25 4.25l-1.5 1.5M10.5 13.75 9 15.25A3 3 0 0 1 4.75 11l1.5-1.5" />
    </>
  ),
  fechar: <path d="m5.5 5.5 9 9M14.5 5.5l-9 9" />,
  pin: (
    <>
      <path d="M10 18s6-5.5 6-10a6 6 0 0 0-12 0c0 4.5 6 10 6 10z" />
      <circle cx="10" cy="8" r="2.2" />
    </>
  ),
  fone: <path d="M5.6 2.6h2.5l1.3 3.6-1.8 1.3a10.5 10.5 0 0 0 4.9 4.9l1.3-1.8 3.6 1.3v2.5a2 2 0 0 1-2.2 2A15.2 15.2 0 0 1 3.6 4.8a2 2 0 0 1 2-2.2z" />,
  menu: <path d="M3.5 6h13M3.5 10h13M3.5 14h13" />,
  virar: (
    <>
      <path d="M16 7.4A6.6 6.6 0 0 0 4.3 8.2M4 12.6a6.6 6.6 0 0 0 11.7.8" />
      <path d="M16.4 3.4v4.2h-4.2M3.6 16.6v-4.2h4.2" />
    </>
  ),
  local: (
    <>
      <circle cx="10" cy="10" r="5.5" />
      <circle cx="10" cy="10" r="1.6" fill="currentColor" />
      <path d="M10 1.8v2.7M10 15.5v2.7M1.8 10h2.7M15.5 10h2.7" />
    </>
  ),
  calendario: (
    <>
      <rect x="3" y="4.2" width="14" height="13" rx="2.2" />
      <path d="M3 8.4h14M7 2.6v3.2M13 2.6v3.2" />
    </>
  ),
  relogio: (
    <>
      <circle cx="10" cy="10" r="8" />
      <path d="M10 5.6V10l3 2" />
    </>
  ),
  vento: <path d="M2.5 7.5h9.5a2.6 2.6 0 1 0-2.6-2.6M2.5 11h12.3a2.6 2.6 0 1 1-2.6 2.6M2.5 14.5h5.5" />,
  escudo: (
    <>
      <path d="M10 2 3.6 4.5v5c0 4 2.7 7 6.4 8.5 3.7-1.5 6.4-4.5 6.4-8.5v-5z" />
      <path d="m7.2 10 2 2 3.8-4" />
    </>
  ),
  compartilhar: <path d="M10 2.8v10M6.2 6.6 10 2.8l3.8 3.8M4.2 10.6v4.9a1.7 1.7 0 0 0 1.7 1.7h8.2a1.7 1.7 0 0 0 1.7-1.7v-4.9" />,
  tocar: <path d="M6.5 4.2v11.6l9.2-5.8z" fill="currentColor" />,
  pausar: <path d="M7 4.5v11M13 4.5v11" />,
};

export function Icone({ nome, className = "size-5", rotulo }: { nome: NomeIcone; className?: string; rotulo?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
      aria-hidden={rotulo ? undefined : true}
      role={rotulo ? "img" : undefined}
      aria-label={rotulo}
      focusable="false"
    >
      {DESENHOS[nome]}
    </svg>
  );
}
