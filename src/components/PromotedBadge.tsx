export function PromotedBadge({ label = "Promocionado" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded border border-[#E5E7EB] bg-[#F9FAFB] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#0A0A0A]">
      <span>MV</span>
      {label}
    </span>
  );
}
