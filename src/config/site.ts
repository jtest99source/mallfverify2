export const siteConfig = {
  name: "Mallorca Verified",
  domain: "mallorcaverified.com",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://mallorcaverified.com",
  description: "El directorio de referencia para residentes internacionales, compradores y expats en Mallorca. Rankings basados en datos reales de Google, sin publicidad ni posiciones de pago.",
  organizationDescription: "Reference directory for English and German-speaking residents, buyers and expats in Mallorca. Rankings built on real Google data, verified editorially.",
  contactEmail: "hola@mallorcaverified.com",
  locale: {
    es: "https://mallorcaverified.com/es",
    en: "https://mallorcaverified.com/en",
    de: "https://mallorcaverified.com/de"
  }
} as const;
