import Link from "next/link";

export function Breadcrumbs({ items }: { items: { label: string; href: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-[10px] font-black uppercase tracking-[0.12em] text-[#0A0A0A]">
      {items.map((item, index) => (
        <span key={item.href}>
          {index > 0 && <span className="mx-2 text-[#9CA3AF]">/</span>}
          <Link href={item.href} className={index === items.length - 1 ? "text-[#0A0A0A]" : "hover:text-[#0A0A0A]"}>{item.label}</Link>
        </span>
      ))}
    </nav>
  );
}
