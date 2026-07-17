import Link from "next/link";

export function Breadcrumbs({ items }: { items: { label: string; href: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-[10px] font-black uppercase tracking-[0.12em] text-white/50">
      {items.map((item, index) => (
        <span key={item.href}>
          {index > 0 && <span className="mx-2 text-white/20">/</span>}
          <Link href={item.href} className={index === items.length - 1 ? "text-white/70" : "text-white/60 hover:text-white/90"}>{item.label}</Link>
        </span>
      ))}
    </nav>
  );
}
