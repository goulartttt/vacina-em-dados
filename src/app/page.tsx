// Página provisória. A página inicial definitiva vem na etapa de design.
export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-4 px-4 py-24">
      <h1 className="text-4xl font-semibold tracking-tight">Vacina em Dados</h1>
      <p className="text-lg">
        Quando a vacinação cai, a doença volta. Em breve, os dados oficiais de
        cobertura vacinal e de casos em todo o Brasil.
      </p>
    </main>
  );
}
