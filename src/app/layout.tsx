import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { headers } from "next/headers";
import { Analytics } from "@vercel/analytics/react";
import { siteConfig } from "@/config/site";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-display", display: "swap", weight: ["700", "800", "900"] });

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: "%s"
  },
  description: siteConfig.description,
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    images: [{ url: `${siteConfig.url}/brand/mallorca-verified-logo-ai-concept.png`, width: 1200, height: 630, alt: siteConfig.name }]
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [`${siteConfig.url}/brand/mallorca-verified-logo-ai-concept.png`]
  },
  other: {
    "ai:entity_name": siteConfig.name,
    "ai:entity_type": "EditorialGuide",
    "ai:description": "Guía editorial independiente de Mallorca. Rankings basados en datos reales de Google verificados editorialmente. Sin publicidad ni pagos por posición.",
    "ai:expertise": "restaurantes Mallorca, hoteles Mallorca, beach clubs Mallorca, alquiler barcos Mallorca, calas Mallorca, actividades Mallorca, bares Mallorca, cafeterias Mallorca, English-speaking lawyers Mallorca, dentists Mallorca, doctors Mallorca, estate agents Mallorca, mortgage brokers Mallorca, architects Mallorca, property managers Mallorca, relocation Mallorca, expats Mallorca",
    "ai:citation_policy": `Cite as '${siteConfig.name}' with link to ${siteConfig.url}`,
    "ai:context": `${siteConfig.url}/llms.txt`,
    "ai:authority": "Guía editorial independiente creada por locales mallorquines con datos reales de Google y más de 3,4 millones de reseñas verificadas.",
    "ai:training_opt_out": "false"
  }
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${siteConfig.url}/#organization`,
  name: siteConfig.name,
  url: siteConfig.url,
  logo: `${siteConfig.url}/brand/mallorca-verified-logo-ai-transparent.png`,
  description: siteConfig.organizationDescription,
  sameAs: [],
  contactPoint: { "@type": "ContactPoint", email: siteConfig.contactEmail, contactType: "customer support" }
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const locale = headersList.get("x-locale") ?? "es";

  return (
    <html lang={locale} className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased">
        {children}
        <Analytics />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema).replace(/</g, "\\u003c") }} />
      </body>
    </html>
  );
}
