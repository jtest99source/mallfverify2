import { BusinessLeadForm } from "@/components/BusinessLeadForm";

export function CTABox() {
  return (
    <section className="overflow-hidden rounded-lg bg-[linear-gradient(135deg,#17324E_0%,#0E5F66_58%,#0E8F72_100%)] px-6 py-10 text-white shadow-[0_18px_45px_rgba(27,46,75,0.16)] sm:px-8">
      <div className="grid gap-6 lg:grid-cols-[1fr_420px] lg:items-center">
        <div>
          <p className="text-3xl font-black leading-tight">¿Tienes un negocio en Mallorca?</p>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-white/78">
            Solicita una propuesta para enriquecer tu ficha con información fiable, mejores fotos, servicios, carta, enlaces oficiales y contexto útil para quien está comparando. Las colaboraciones editoriales no modifican ratings, reseñas ni posiciones objetivas.
          </p>
        </div>
        <BusinessLeadForm />
      </div>
    </section>
  );
}
