import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import MerchantSidebar from '@/components/merchant/MerchantSidebar'
import MerchantTopbar from '@/components/merchant/MerchantTopbar'

export default async function MerchantLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/sign-in')

  // Fetch profile to verify role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name, email')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'merchant') {
    // If team/admin lands here, send to admin portal
    if (profile?.role === 'admin' || profile?.role === 'team') {
      redirect('/admin')
    }
    redirect('/auth/sign-in')
  }

  return (
    <div className="merchant-shell">
      <MerchantSidebar />
      <div className="merchant-body">
        <MerchantTopbar profile={profile} />
        <main className="merchant-main">{children}</main>
      </div>

      <style jsx global>{`
        .merchant-shell {
          display: flex;
          min-height: 100vh;
          background: var(--bg-primary);
        }
        .merchant-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }
        .merchant-main {
          flex: 1;
          padding: 32px 36px;
          max-width: 1200px;
          width: 100%;
        }
        @media (max-width: 860px) {
          .merchant-main {
            padding: 20px 18px;
          }
        }
      `}</style>
    </div>
  )
}
