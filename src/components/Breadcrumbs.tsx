import Link from "next/link";

export function Breadcrumbs({ items }: { items: { label: string; href: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-[10px] font-bold uppercase tracking-[0.12em] text-sage">
      {items.map((item, index) => (
        <span key={item.href}>
          {index > 0 && <span className="mx-2 text-borderline">/</span>}
          <Link href={item.href} className={index === items.length - 1 ? "text-coral" : "hover:text-coral"}>{item.label}</Link>
        </span>
      ))}
    </nav>
  );
}
