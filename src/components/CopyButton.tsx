"use client";

import { useState } from "react";

export function CopyButton({ text, label, copiedLabel }: { text: string; label: string; copiedLabel: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
        } catch {
          // Clipboard unavailable (old browser/http) — the code is selectable below.
        }
      }}
      className="inline-flex min-h-11 items-center justify-center rounded-sm bg-[#00C37A] px-5 text-[11px] font-bold uppercase tracking-[0.1em] text-[#0A0A0A] transition hover:bg-white"
    >
      {copied ? copiedLabel : label}
    </button>
  );
}
