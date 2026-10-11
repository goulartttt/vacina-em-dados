// Estado de carregamento das páginas de lugar: os blocos do painel já
// aparecem no lugar, sem a página saltar quando o conteúdo chega.
export function Carregando() {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">Carregando o painel…</span>
      <div className="h-6 w-48 rounded bg-grade" />
      <div className="mt-5 h-14 w-3/4 max-w-2xl rounded-lg bg-grade" />
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-36 rounded-xl bg-grade motion-safe:animate-pulse" />
        ))}
      </div>
      <div className="mt-4 h-96 rounded-xl bg-grade motion-safe:animate-pulse" />
    </div>
  );
}
