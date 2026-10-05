import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import type { Session } from '@supabase/supabase-js';
import { configured, supabase } from './client';

const SessionContext = createContext<{ session: Session | null; ready: boolean }>({ session: null, ready: false });
export function SessionProvider({ children }: React.PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(!configured);
  useEffect(() => {
    if (!configured) return;
    let active = true;
    supabase.auth.getSession().then(({ data }) => { if (active) { setSession(data.session); setReady(true); } }).catch(() => { if (active) setReady(true); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, next) => { if (active) setSession(next); });
    supabase.auth.startAutoRefresh();
    const listener = AppState.addEventListener('change', state => state === 'active' ? supabase.auth.startAutoRefresh() : supabase.auth.stopAutoRefresh());
    return () => { active = false; subscription.unsubscribe(); listener.remove(); supabase.auth.stopAutoRefresh(); };
  }, []);
  return <SessionContext.Provider value={{ session, ready }}>{children}</SessionContext.Provider>;
}
export const useSession = () => useContext(SessionContext);
