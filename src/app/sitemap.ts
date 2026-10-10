import type { MetadataRoute } from "next";

import { estados, municipios } from "@/lib/dados";
import { URL_SITE } from "@/lib/site";

// Todas as páginas do site, incluindo o painel de cada estado e município.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [ufs, cidades] = await Promise.all([estados(), municipios()]);
  return [
    { url: URL_SITE, priority: 1 },
    { url: `${URL_SITE}/doencas/sarampo`, priority: 0.8 },
    { url: `${URL_SITE}/mitos-e-verdades`, priority: 0.8 },
    { url: `${URL_SITE}/calendario`, priority: 0.8 },
    { url: `${URL_SITE}/onde-se-vacinar`, priority: 0.8 },
    { url: `${URL_SITE}/sobre-os-dados`, priority: 0.5 },
    ...ufs.map((u) => ({ url: `${URL_SITE}/estados/${u.slug}`, priority: 0.7 })),
    ...cidades.map((m) => ({ url: `${URL_SITE}/municipios/${m.slug}`, priority: 0.6 })),
  ];
}
