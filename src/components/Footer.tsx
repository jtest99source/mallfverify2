import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { siteConfig } from "@/config/site";
import { methodologyPath } from "@/lib/methodology";

const footerCategories = [
  { slug: "restaurants", label: "Restaurantes" },
  { slug: "hotels", label: "Hoteles" },
  { slug: "beach-clubs", label: "Beach clubs" },
  { slug: "boats", label: "Barcos" },
  { slug: "activities", label: "Actividades" },
  { slug: "beaches", label: "Playas y calas" },
  { slug: "bars", label: "Bares" },
  { slug: "spas", label: "Spas y wellness" }
] as const;

export function Footer({ locale }: { locale: Locale }) {
  return (
    <footer className="border-t border-[#F1D3A2] bg-[#10253D] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr] lg:px-8">
        <div>
          <p className="font-display text-2xl font-bold tracking-tight text-[#FFD166]">{siteConfig.name}</p>
          <p className="mt-4 max-w-md text-sm leading-7 text-white/70">
            Rankings independientes de Mallorca basados en el consenso de miles de reseñas verificadas. La posición no se compra. Si hay contenido patrocinado en alguna parte del site, siempre está etiquetado.
          </p>
          <p className="mt-5 text-sm text-white/60">
            Contacto: <a href={`mailto:${siteConfig.contactEmail}`} className="text-[#FFD166] hover:text-white">{siteConfig.contactEmail}</a>
          </p>
          <p className="mt-6 text-xs text-white/35">© {new Date().getFullYear()} Mallorca Verified</p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <p className="mb-4 text-[10px] font-black uppercase tracking-[0.14em] text-[#FFD166]">Categorías</p>
            <div className="grid gap-2.5 text-[12px] font-medium text-white/65">
              {footerCategories.map(({ slug, label }) => (
                <Link key={slug} href={`/${locale}/rankings?category=${slug}`} className="hover:text-white">{label}</Link>
              ))}
              <Link href={`/${locale}/rankings`} className="mt-1 font-bold text-[#FFD166]/80 hover:text-[#FFD166]">Ver todas las categorías →</Link>
            </div>
          </div>
          <div>
            <p className="mb-4 text-[10px] font-black uppercase tracking-[0.14em] text-[#FFD166]">Sitio</p>
            <div className="grid gap-2.5 text-[12px] font-medium text-white/65">
              <Link href={`/${locale}/rankings`} className="hover:text-white">Rankings</Link>
              <Link href={`/${locale}/guides`} className="hover:text-white">Guías</Link>
              <Link href={methodologyPath(locale)} className="hover:text-white">Metodología</Link>
              <Link href={`/${locale}/business`} className="hover:text-white">Para negocios</Link>
              <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" className="hover:text-white">Instagram</a>
              <a href="https://www.linkedin.com/" target="_blank" rel="noreferrer" className="hover:text-white">LinkedIn</a>
              <Link href={`/${locale}/privacy`} className="hover:text-white">Privacidad</Link>
              <Link href={`/${locale}/cookies`} className="hover:text-white">Cookies</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
