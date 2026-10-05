import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies, headers } from "next/headers";
import { createClient as createJwtClient } from "@supabase/supabase-js";

export async function createClient() {
  const cookieStore = await cookies();
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!publishableKey) {
    throw new Error("Supabase publishable key is not configured.");
  }

  const authorization = (await headers()).get("authorization");
  if (authorization?.startsWith("Bearer ")) {
    const token=authorization.slice(7);
    const native=createJwtClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,publishableKey,{
      global:{headers:{Authorization:authorization}},auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}
    });
    const verify=native.auth.getUser.bind(native.auth);
    native.auth.getUser=()=>verify(token);
    return native;
  }
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    publishableKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Called from a Server Component — safe to ignore if
            // you have middleware refreshing sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            // Same as above.
          }
        },
      },
    }
  );
}
