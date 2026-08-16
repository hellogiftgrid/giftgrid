import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfileForm from '@/components/merchant/ProfileForm'

export const metadata = { title: 'Profile — GiftGrid' }

export default async function ProfilePage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/sign-in')

  const [{ data: profile }, { data: merchant }] = await Promise.all([
    supabase.from('profiles').select('full_name, email, phone').eq('id', user.id).single(),
    supabase
      .from('merchant_profiles')
      .select('id, business_name, store_url, country, business_category, product_category, business_description')
      .eq('user_id', user.id)
      .single(),
  ])

  if (!merchant) redirect('/dashboard')

  return (
    <>
      <div className="page-header">
        <p className="eyebrow">Profile</p>
        <h1 className="page-title">Your Business Profile</h1>
        <p className="page-sub">
          This information is used in your merchant application and may be referenced during the store review process.
        </p>
      </div>

      <ProfileForm
        profile={profile ?? { full_name: null, email: user.email ?? '', phone: null }}
        merchant={merchant}
        userId={user.id}
      />

      <style jsx>{`
        .page-header { margin-bottom: 32px; }
        .eyebrow {
          font-family: var(--mono);
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 8px;
        }
        .page-title {
          font-family: var(--display);
          font-weight: 560;
          font-size: 26px;
          margin-bottom: 8px;
        }
        .page-sub { font-size: 14px; color: var(--text-secondary); line-height: 1.6; max-width: 560px; }
      `}</style>
    </>
  )
}
