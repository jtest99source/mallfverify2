import { generateSeoMetadata } from "@/lib/seo";
import { isLocale } from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const safeLocale = isLocale(locale) ? locale : "es";
  return generateSeoMetadata({
    title: "Política de privacidad | Mallorca Verified",
    description: "Información básica sobre privacidad y contacto en Mallorca Verified.",
    path: `/${safeLocale}/privacy`,
    locale: safeLocale
  });
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] px-4 py-14 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-3xl rounded-sm border border-white/[0.10] bg-[#101010] p-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#FFCC00]">Legal</p>
        <h1 className="mt-3 font-display text-5xl font-black text-white">Política de privacidad</h1>
        <div className="mt-8 space-y-6 text-sm leading-7 text-white/60">
          <p>Mallorca Verified utiliza los datos enviados por formularios o correo electrónico únicamente para responder a solicitudes comerciales, editoriales o de corrección de fichas.</p>
          <p>No vendemos datos personales a terceros. Si contactas con nosotros, podremos conservar tu email y el contexto de la solicitud para dar seguimiento a la conversación.</p>
          <p>Para solicitar acceso, rectificación o eliminación de tus datos, escribe a <a href="mailto:hola@mallorcaverified.com" className="font-bold text-[#FFCC00] hover:text-white">hola@mallorcaverified.com</a>.</p>
        </div>
      </section>
    </main>
  );
}
