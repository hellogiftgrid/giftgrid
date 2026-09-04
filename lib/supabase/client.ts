import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  // Fall back to harmless placeholders when the public env vars are not
  // inlined at build time (e.g. a preview build without them configured).
  // This keeps `next build` prerendering from throwing; at runtime the real
  // inlined values are used whenever they are present.
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    "https://placeholder.supabase.co";
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder-anon-key";

  return createBrowserClient(url, anonKey);
}
