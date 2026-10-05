"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
export function useSession() {
  const [signedIn, setSignedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const supabase = createClient(); let active = true;
    void supabase.auth.getUser().then(({ data }) => { if (active) { setSignedIn(Boolean(data.user)); setLoading(false); } }).catch(() => { if (active) setLoading(false); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => { if (active) { setSignedIn(Boolean(session?.user)); setLoading(false); } });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);
  return { signedIn, loading };
}
