export function PromotedBadge({ label = "Promocionado" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-amber-700">
      <span>★</span>
      {label}
    </span>
  );
}
