import type { FAQ as FAQType } from "@/types/business";
import type { Locale } from "@/lib/i18n";

const faqHeadings: Record<Locale, string> = {
  es: "Preguntas frecuentes",
  en: "Frequently asked questions",
  de: "Häufige Fragen"
};

function renderAnswer(text: string) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((part, i) => (i % 2 === 1 ? <strong key={i}>{part}</strong> : part));
}

export function FAQ({ faqs, locale = "es", tone = "dark" }: { faqs: FAQType[]; locale?: Locale; tone?: "dark" | "light" }) {
  if (!faqs.length) return null;
  const dark = tone === "dark";
  return (
    <section className="mt-14">
      <h2 className={`border-b pb-3 font-display text-3xl font-bold ${dark ? "border-white/[0.10] text-white" : "border-[#E5E7EB] text-ink"}`}>{faqHeadings[locale]}</h2>
      <div className={`mt-6 border ${dark ? "border-white/[0.10] bg-[#0C1A2E]" : "border-[#E5E7EB] bg-white"}`}>
        {faqs.map((faq) => (
          <details key={faq.question} className={`group border-b last:border-b-0 ${dark ? "border-white/[0.08]" : "border-[#E5E7EB]"}`}>
            <summary className={`flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-bold ${dark ? "text-white" : "text-ink"}`}>
              {faq.question}
              <span className="text-lg text-[#00C37A]">+</span>
            </summary>
            <p className={`px-5 pb-5 text-sm leading-7 ${dark ? "text-white/66" : "text-olive"}`}>{renderAnswer(faq.answer)}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
