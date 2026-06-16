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
    <main className="bg-[linear-gradient(180deg,#FFF8EC_0%,#FFFDF7_100%)] px-4 py-14 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-3xl rounded-md border border-[#E7DED0] bg-[#FFFDF7] p-8 shadow-[0_18px_45px_rgba(27,46,75,0.05)]">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0E8F72]">Legal</p>
        <h1 className="mt-3 font-sans text-5xl font-black text-[#10253D]">Política de cookies</h1>
        <div className="mt-8 space-y-6 text-sm leading-7 text-[#4B5B4D]">
          <p>Mallorca Verified puede utilizar cookies técnicas necesarias para el funcionamiento de la web y, si se activa analítica en el futuro, cookies de medición para entender el uso agregado del sitio.</p>
          <p>Actualmente los formularios comerciales funcionan mediante enlace de correo electrónico y no requieren cookies publicitarias propias.</p>
          <p>Para cualquier duda sobre cookies o privacidad, escribe a <a href="mailto:hola@mallorcaverified.com" className="font-bold text-[#B86B1D]">hola@mallorcaverified.com</a>.</p>
        </div>
      </section>
    </main>
  );
}
