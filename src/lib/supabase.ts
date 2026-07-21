import { createClient } from "@supabase/supabase-js";

export function hasSupabaseConfig() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY));
}

// Supabase's pooler intermittently fails reads (5xx / "25P02 current transaction
// is aborted"). A failed read during an ISR regeneration turns the whole page
// into a 500 for crawlers, so retry idempotent requests a couple of times.
const RETRYABLE_STATUS = new Set([500, 502, 503, 504]);

async function fetchWithRetry(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const method = (init?.method ?? "GET").toUpperCase();
  const idempotent = method === "GET" || method === "HEAD";
  const attempts = idempotent ? 3 : 1;

  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const response = await fetch(input, init);
      if (attempt === attempts) return response;
      let retryable = RETRYABLE_STATUS.has(response.status);
      if (!retryable && response.status >= 400) {
        // PostgREST surfaces transient pooler failures as 400s with code 25P02.
        const body = await response.clone().text().catch(() => "");
        retryable = body.includes("25P02");
      }
      if (!retryable) return response;
      lastError = new Error(`Supabase HTTP ${response.status}`);
    } catch (error) {
      if (attempt === attempts) throw error;
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 250 * attempt));
  }
  throw lastError;
}

export function createSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    },
    global: {
      fetch: fetchWithRetry
    }
  });
}
