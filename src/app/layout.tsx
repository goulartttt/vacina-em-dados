import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Figtree } from "next/font/google";
import Link from "next/link";

import { Busca } from "@/components/Busca";
import { Fonte } from "@/components/Fonte";
import { Icone } from "@/components/Icone";
import { AVISO_MEDICO, FONTES } from "@/conteudo/fontes";
import { URL_SITE } from "@/lib/site";

import "./globals.css";

// Fontes baixadas no build e servidas pelo próprio site (sem Google no
// navegador do leitor). Bricolage Grotesque: títulos e números grandes.
// Figtree: textos e filtros.
const titulo = Bricolage_Grotesque({ subsets: ["latin", "latin-ext"], variable: "--fonte-titulo", display: "swap" });
const texto = Figtree({ subsets: ["latin", "latin-ext"], variable: "--fonte-texto", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(URL_SITE),
  title: { default: "Vacina em Dados", template: "%s · Vacina em Dados" },
  description:
    "Quando a vacinação cai, a doença volta. Cobertura vacinal e casos de doenças preveníveis por vacina em todo o Brasil, com dados oficiais do Ministério da Saúde.",
  applicationName: "Vacina em Dados",
  openGraph: { type: "website", locale: "pt_BR", siteName: "Vacina em Dados" },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  colorScheme: "light",
};

const MENU = [
  { href: "/", rotulo: "Painel" },
  { href: "/doencas/sarampo", rotulo: "Sarampo" },
  { href: "/mitos-e-verdades", rotulo: "Mitos e verdades" },
  { href: "/calendario", rotulo: "Calendário" },
  { href: "/onde-se-vacinar", rotulo: "Onde se vacinar" },
  { href: "/sobre-os-dados", rotulo: "Sobre os dados" },
];

function Marca() {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2.5 text-tinta no-underline" aria-label="Vacina em Dados, página inicial">
      <span className="grid size-9 place-items-center rounded-[0.7rem] bg-azul text-white" aria-hidden="true">
        <Icone nome="escudo" className="size-5" />
      </span>
      <span className="titulo text-[1.25rem]">Vacina em Dados</span>
    </Link>
  );
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${titulo.variable} ${texto.variable} antialiased`}>
      <body className="flex min-h-dvh flex-col">
        <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-folha focus:px-3 focus:py-2">
          Pular para o conteúdo
        </a>
        {/* Fixo no topo só na tela grande; no celular ele sobe junto e libera espaço. */}
        <header className="z-40 border-b border-linha bg-folha lg:sticky lg:top-0">
          <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3 sm:px-6 lg:px-8">
            <Marca />
            <nav aria-label="Principal" className="hidden items-center gap-5 text-[0.9375rem] font-semibold text-tinta-2 xl:flex">
              {MENU.map((m) => (
                <Link key={m.href} href={m.href} className="no-underline hover:text-azul">
                  {m.rotulo}
                </Link>
              ))}
            </nav>
            <div className="ml-auto hidden w-full max-w-[18rem] sm:block">
              <Busca />
            </div>
          </div>
          <div className="px-4 pb-3 sm:hidden">
            <Busca />
          </div>
          {/* Fora da tela grande, o menu vira uma linha que desliza para o lado. */}
          <nav aria-label="Principal (celular)" className="border-t border-grade xl:hidden">
            <ul className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-2 sm:px-6">
              {MENU.map((m) => (
                <li key={m.href} className="shrink-0">
                  <Link href={m.href} className="block rounded-full bg-fundo px-3 py-1.5 text-sm font-semibold text-tinta-2 no-underline hover:bg-azul-claro hover:text-azul">
                    {m.rotulo}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </header>

        <main id="conteudo" className="flex-1">
          {children}
        </main>

        <footer className="mt-20 border-t border-linha bg-folha">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 text-[0.9375rem] text-tinta-2 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
            <div className="max-w-md">
              <Marca />
              <p className="mt-3">Cobertura vacinal e casos de doenças preveníveis por vacina, com dados oficiais do Ministério da Saúde e do IBGE.</p>
              <p className="mt-3 text-tinta-3">{AVISO_MEDICO}</p>
            </div>
            <nav aria-label="Rodapé" className="flex flex-col gap-2">
              <span className="font-bold text-tinta">Explore</span>
              {MENU.map((m) => (
                <Link key={m.href} href={m.href} className="no-underline hover:text-azul">
                  {m.rotulo}
                </Link>
              ))}
            </nav>
            <div className="flex flex-col gap-2">
              <span className="font-bold text-tinta">Vacinar</span>
              <p>
                As vacinas do Calendário Nacional de Vacinação são de graça no SUS. Procure a unidade básica de saúde mais perto e leve a caderneta.
                <Fonte fonte={FONTES.msCalendario} />
              </p>
            </div>
          </div>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
