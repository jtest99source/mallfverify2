import { generateSeoMetadata } from "@/lib/seo";
import { isLocale } from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const safeLocale = isLocale(locale) ? locale : "es";
  return generateSeoMetadata({
    title: "Política de cookies | Mallorca Verified",
    description: "Información básica sobre cookies en Mallorca Verified.",
    path: `/${safeLocale}/cookies`,
    locale: safeLocale
  });
}

export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-[#07101F]">
      <section className="bg-[#0C1A2E] px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center sm:text-left">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#00C37A]">Legal</p>
          <h1 className="mt-3 font-display text-4xl font-black leading-[1.03] text-white sm:text-5xl">Política de cookies</h1>
          <p className="mt-4 max-w-xl text-base leading-8 text-white/70">Información sobre el uso de cookies en Mallorca Verified.</p>
        </div>
      </section>

      <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-6 rounded-lg border border-white/[0.08] bg-[#0C1A2E] p-6 text-sm leading-8 text-white/70 sm:p-8">
          <p>Mallorca Verified puede utilizar cookies técnicas necesarias para el funcionamiento de la web y, si se activa analítica en el futuro, cookies de medición para entender el uso agregado del sitio.</p>
          <p>Actualmente los formularios comerciales funcionan mediante enlace de correo electrónico y no requieren cookies publicitarias propias.</p>
          <p>Para cualquier duda sobre cookies o privacidad, escribe a <a href="mailto:hola@mallorcaverified.com" className="font-bold text-[#00C37A] hover:text-white">hola@mallorcaverified.com</a>.</p>
        </div>
      </article>
    </main>
  );
}
