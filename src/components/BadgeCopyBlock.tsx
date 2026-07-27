"use client";

import { useState } from "react";

export function BadgeCopyBlock({ label, code, copiedLabel, copyLabel }: { label: string; code: string; copiedLabel: string; copyLabel: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      // clipboard API unavailable (http / old browser): fall back to selection
      const el = document.createElement("textarea");
      el.value = code;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between gap-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/50">{label}</p>
        <button
          type="button"
          onClick={copy}
          className={`inline-flex min-h-9 items-center justify-center rounded-sm px-4 text-[11px] font-black uppercase tracking-[0.1em] transition ${copied ? "bg-white text-[#0A0A0A]" : "bg-[#00C37A] text-[#0A0A0A] hover:bg-white"}`}
        >
          {copied ? copiedLabel : copyLabel}
        </button>
      </div>
      <pre className="mt-2 overflow-x-auto rounded-sm border border-white/[0.10] bg-[#040D1A] p-4 text-[11px] leading-5 text-white/70">{code}</pre>
    </div>
  );
}
