import Link from "next/link";
import { siteConfig } from "@/config/site";
import type { Locale } from "@/lib/i18n";

export function Hero({ locale }: { locale: Locale }) {
  return (
    <section className="relative overflow-hidden bg-ink text-white">
      <div className="absolute inset-0 bg-[url('/images/hero.svg')] bg-cover bg-center opacity-45" />
      <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-24 sm:px-6 lg:px-8 lg:pb-28 lg:pt-32">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/70">{siteConfig.name}</p>
        <h1 className="mt-5 max-w-4xl font-sans text-5xl font-semibold leading-tight tracking-normal sm:text-6xl lg:text-7xl">
          Mallorca verificada con datos reales
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-white/82">
          Restaurantes, hoteles, beach clubs, barcos y calas seleccionados con mirada editorial para decidir rápido y viajar mejor.
        </p>
        <div className="mt-8 flex max-w-2xl flex-col gap-3 rounded-md bg-white p-2 shadow-soft sm:flex-row">
          <input className="min-h-12 flex-1 rounded border-0 px-4 text-ink placeholder:text-ink/55 focus:ring-2 focus:ring-[#0A0A0A]" placeholder="Busca Palma, Deià, barcos, beach clubs..." />
          <Link href={`/${locale}/top/restaurants`} className="inline-flex min-h-12 items-center justify-center rounded bg-[#07101F] px-5 text-sm font-semibold text-[#FFFFFF]">
            Explorar rankings
          </Link>
        </div>
      </div>
    </section>
  );
}
