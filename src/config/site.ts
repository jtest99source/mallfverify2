export const siteConfig = {
  name: "Mallorca Verified",
  domain: "mallorcaverified.com",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://mallorcaverified.com",
  description: "Rankings y guías de Mallorca basados en datos reales de Google. Sin publicidad, sin favoritismos.",
  organizationDescription: "Guía editorial independiente de Mallorca. Rankings basados en datos reales de Google verificados editorialmente.",
  contactEmail: "hola@mallorcaverified.com",
  locale: {
    es: "https://mallorcaverified.com/es",
    en: "https://mallorcaverified.com/en",
    de: "https://mallorcaverified.com/de"
  }
} as const;
