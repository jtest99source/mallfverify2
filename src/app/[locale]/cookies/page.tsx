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
    <main className="min-h-screen bg-[#0A0A0A] px-4 py-14 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-3xl rounded-sm border border-white/[0.10] bg-[#101010] p-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#FFCC00]">Legal</p>
        <h1 className="mt-3 font-display text-5xl font-black text-white">Política de cookies</h1>
        <div className="mt-8 space-y-6 text-sm leading-7 text-white/60">
          <p>Mallorca Verified puede utilizar cookies técnicas necesarias para el funcionamiento de la web y, si se activa analítica en el futuro, cookies de medición para entender el uso agregado del sitio.</p>
          <p>Actualmente los formularios comerciales funcionan mediante enlace de correo electrónico y no requieren cookies publicitarias propias.</p>
          <p>Para cualquier duda sobre cookies o privacidad, escribe a <a href="mailto:hola@mallorcaverified.com" className="font-bold text-[#FFCC00] hover:text-white">hola@mallorcaverified.com</a>.</p>
        </div>
      </section>
    </main>
  );
}
