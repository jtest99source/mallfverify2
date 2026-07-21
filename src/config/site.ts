export const siteConfig = {
  name: "Mallorca Verified",
  // Canonical host is www — the apex (non-www) 308-redirects to www on Vercel,
  // so every sitemap/canonical/hreflang URL must use www to avoid redirect chains.
  domain: "www.mallorcaverified.com",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.mallorcaverified.com",
  description: "El directorio de referencia para residentes internacionales, compradores y expats en Mallorca. Rankings basados en datos reales de Google, sin publicidad ni posiciones de pago.",
  organizationDescription: "Reference directory for English and German-speaking residents, buyers and expats in Mallorca. Rankings built on real Google data, verified editorially.",
  contactEmail: "hola@mallorcaverified.com",
  locale: {
    es: "https://www.mallorcaverified.com/es",
    en: "https://www.mallorcaverified.com/en",
    de: "https://www.mallorcaverified.com/de"
  }
} as const;
