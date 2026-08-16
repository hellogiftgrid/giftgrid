import { createClient } from "@supabase/supabase-js";

// Service-role client — NEVER import this into a client component.
// Used only inside route handlers / server actions for trusted writes
// (e.g. public contact/lead capture) that intentionally bypass RLS.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
