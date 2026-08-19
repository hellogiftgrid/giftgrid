import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';

export const metadata = {
  title: 'Merchant Dashboard — GiftGrid',
};

export default async function MerchantDashboardPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/auth/sign-in');

  const [profileRes, merchantRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('full_name, email, role, phone, country, is_active')
      .eq('id', user.id)
      .single(),

    // IMPORTANT: live schema uses user_id, not profile_id
    supabase
      .from('merchant_profiles')
      .select(`
        id,
        user_id,
        business_name,
        business_email,
        phone,
        country,
        store_url,
        business_category,
        product_category,
        business_description,
        application_status,
        application_submitted_at,
        reviewed_at
      `)
      .eq('user_id', user.id)
      .single(),
  ]);

  const profile = profileRes.data;
  const merchant = merchantRes.data;

  async function activateWorkspace(formData: FormData) {
    'use server';

    const serverSupabase = createClient();
    const businessName =
      String(formData.get('businessName') || '').trim();

    const {
      data: { user: sessionUser },
    } = await serverSupabase.auth.getUser();

    if (!sessionUser) return;

    await serverSupabase
      .from('merchant_profiles')
      .upsert(
        {
          user_id: sessionUser.id,
          business_name: businessName || 'My Business',
          business_email: sessionUser.email,
        },
        {
          onConflict: 'user_id',
        }
      );

    revalidatePath('/dashboard');
  }

  // Temporary onboarding state if the merchant row has not been created.
  if (!merchant) {
    return (
      <div className="min-h-full bg-slate-50 -m-10 p-10">
        <div className="max-w-4xl mx-auto">

          <div className="mb-8">
            <span className="text-xs font-mono uppercase tracking-[0.15em] text-indigo-600 font-bold">
              Welcome to GiftGrid
            </span>

            <h1 className="text-3xl font-bold text-slate-900 mt-2">
              Let&apos;s get your merchant workspace ready.
            </h1>

            <p className="text-sm text-slate-500 mt-2 max-w-2xl">
              Your account is verified. The next step is to create your business
              workspace so GiftGrid can connect your store, audit your site,
              and prepare opportunity matching.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-mono uppercase tracking-wider text-slate-400">
                    Step 1 of 4
                  </p>
                  <h2 className="text-xl font-bold text-slate-900 mt-1">
                    Create your business workspace
                  </h2>
                </div>

                <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  1
                </div>
              </div>

              <form action={activateWorkspace} className="mt-7 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Business name
                  </label>

                  <input
                    type="text"
                    name="businessName"
                    required
                    placeholder="e.g. Wizcartez"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                  />

                  <p className="mt-2 text-xs text-slate-400">
                    Use the legal or trading name your customers know.
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                  <p className="text-xs font-medium text-slate-500">
                    Signed in as
                  </p>
                  <p className="text-sm font-semibold text-slate-900 mt-1">
                    {user.email}
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-black hover:-translate-y-0.5"
                >
                  Create My Workspace →
                </button>
              </form>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <p className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Your journey
              </p>

              <div className="mt-5 space-y-5">
                {[
                  ['1', 'Business profile', 'Create your workspace'],
                  ['2', 'Store connection', 'Connect your e-commerce store'],
                  ['3', 'Store audit', 'Get your GiftGrid assessment'],
                  ['4', 'Opportunity matching', 'See relevant opportunities'],
                ].map(([number, title, text], index) => (
                  <div key={number} className="flex gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {number}
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {title}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          <div className="mt-6">
            <Link
              href="/auth/sign-out"
              className="text-sm font-semibold text-slate-500 hover:text-red-600"
            >
              Sign out
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Fetch stores first because audits are connected to stores,
  // not directly to merchant_profiles.
  const { data: stores } = await supabase
    .from('stores')
    .select('id, store_url, platform, created_at')
    .eq('merchant_id', merchant.id)
    .order('created_at', { ascending: false });

  const storeIds = (stores || []).map((store) => store.id);

  const [auditsRes, submissionsRes, documentsRes] = await Promise.all([
    storeIds.length
      ? supabase
          .from('audits')
          .select('id, status, overall_score, created_at')
          .in('store_id', storeIds)
          .order('created_at', { ascending: false })
      : Promise.resolve({ data: [] }),

    supabase
      .from('opportunity_submissions')
      .select('id, status', { count: 'exact' })
      .eq('merchant_id', merchant.id),

    supabase
      .from('documents')
      .select('id', { count: 'exact' })
      .eq('merchant_id', merchant.id)
      .eq('visible_to_merchant', true),
  ]);

  const audits = auditsRes.data || [];
  const latestAudit = audits[0] || null;
  const submissionCount = submissionsRes.count || 0;
  const documentCount = documentsRes.count || 0;

  const profileChecks = [
    Boolean(merchant.business_name),
    Boolean(merchant.business_email || profile?.email),
    Boolean(merchant.phone || profile?.phone),
    Boolean(merchant.country || profile?.country),
    Boolean(merchant.store_url),
    Boolean(merchant.business_category),
    Boolean(merchant.product_category),
    Boolean(merchant.business_description),
  ];

  const completed = profileChecks.filter(Boolean).length;
  const completion = Math.round((completed / profileChecks.length) * 100);

  return (
    <div className="min-h-full bg-slate-50 -m-10 p-10">
      <div className="max-w-6xl mx-auto space-y-7">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
          <div>
            <span className="text-xs font-mono uppercase tracking-[0.15em] text-indigo-600 font-bold">
              Merchant Workspace
            </span>

            <h1 className="text-3xl font-bold text-slate-900 mt-2">
              Welcome back, {profile?.full_name || 'Merchant'}
            </h1>

            <p className="text-sm text-slate-500 mt-2">
              {merchant.business_name}
            </p>
          </div>

          <Link
            href="/dashboard/profile"
            className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-black transition"
          >
            Edit business profile
          </Link>
        </div>

        {/* Progress */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Profile readiness
              </p>
              <h2 className="text-lg font-bold text-slate-900 mt-1">
                {completion}% complete
              </h2>
            </div>

            <span className="text-xs font-semibold text-slate-500">
              {completed} of {profileChecks.length} sections
            </span>
          </div>

          <div className="mt-4 h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-indigo-600 transition-all"
              style={{ width: `${completion}%` }}
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {[
              ['Business', Boolean(merchant.business_name)],
              ['Contact', Boolean(merchant.business_email || profile?.email)],
              ['Location', Boolean(merchant.country || profile?.country)],
              ['Store', Boolean(merchant.store_url)],
              ['Categories', Boolean(merchant.business_category && merchant.product_category)],
            ].map(([label, done]) => (
              <span
                key={String(label)}
                className={`rounded-full px-3 py-1 text-xs font-semibold border ${
                  done
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-slate-50 text-slate-500 border-slate-200'
                }`}
              >
                {done ? '✓ ' : '○ '}
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">

          <Link
            href="/dashboard/profile"
            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:-translate-y-1 hover:border-indigo-200 transition-all"
          >
            <p className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Profile
            </p>
            <p className="text-3xl font-bold text-slate-900 mt-3">
              {completion}%
            </p>
            <p className="text-xs text-indigo-600 font-bold mt-3">
              Complete details →
            </p>
          </Link>

          <Link
            href="/dashboard/audit"
            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:-translate-y-1 hover:border-indigo-200 transition-all"
          >
            <p className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Latest audit
            </p>
            <p className="text-3xl font-bold text-slate-900 mt-3">
              {latestAudit?.overall_score != null
                ? `${latestAudit.overall_score}/100`
                : 'Pending'}
            </p>
            <p className="text-xs text-indigo-600 font-bold mt-3">
              Open audit →
            </p>
          </Link>

          <Link
            href="/dashboard/opportunities"
            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:-translate-y-1 hover:border-indigo-200 transition-all"
          >
            <p className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Opportunity pipeline
            </p>
            <p className="text-3xl font-bold text-slate-900 mt-3">
              {submissionCount}
            </p>
            <p className="text-xs text-indigo-600 font-bold mt-3">
              View opportunities →
            </p>
          </Link>

          <Link
            href="/dashboard/documents"
            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:-translate-y-1 hover:border-indigo-200 transition-all"
          >
            <p className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Documents
            </p>
            <p className="text-3xl font-bold text-slate-900 mt-3">
              {documentCount}
            </p>
            <p className="text-xs text-indigo-600 font-bold mt-3">
              View documents →
            </p>
          </Link>

        </div>

        {/* Store + application status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  Store connection
                </p>
                <h2 className="text-lg font-bold text-slate-900 mt-1">
                  {stores?.length ? 'Store connected' : 'Store not connected'}
                </h2>
              </div>

              <div className={`w-3 h-3 rounded-full ${
                stores?.length ? 'bg-emerald-500' : 'bg-amber-400'
              }`} />
            </div>

            {stores?.length ? (
              <div className="mt-5 space-y-3">
                {stores.slice(0, 2).map((store) => (
                  <div
                    key={store.id}
                    className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                  >
                    <p className="text-sm font-semibold text-slate-900">
                      {store.store_url}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {store.platform || 'Platform not specified'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-xl border border-dashed border-slate-200 p-5">
                <p className="text-sm text-slate-600">
                  Connect your store to unlock audit and opportunity workflows.
                </p>

                <Link
                  href="/dashboard/profile"
                  className="inline-flex mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700"
                >
                  Add store details
                </Link>
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <p className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Application status
            </p>

            <div className="flex items-center justify-between mt-2">
              <h2 className="text-lg font-bold text-slate-900 capitalize">
                {(merchant.application_status || 'draft').replaceAll('_', ' ')}
              </h2>

              <span className="rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-1 text-xs font-semibold">
                {merchant.application_status || 'draft'}
              </span>
            </div>

            <div className="mt-5 grid grid-cols-4 gap-2">
              {['draft', 'submitted', 'under_review', 'approved'].map((step) => {
                const order = ['draft', 'submitted', 'under_review', 'approved'];
                const currentIndex = order.indexOf(
                  merchant.application_status || 'draft'
                );
                const stepIndex = order.indexOf(step);

                return (
                  <div key={step}>
                    <div
                      className={`h-2 rounded-full ${
                        stepIndex <= currentIndex
                          ? 'bg-indigo-600'
                          : 'bg-slate-100'
                      }`}
                    />
                    <p className="text-[10px] text-slate-400 mt-2 capitalize">
                      {step.replaceAll('_', ' ')}
                    </p>
                  </div>
                );
              })}
            </div>

            <p className="text-xs text-slate-500 mt-5">
              {merchant.application_status === 'approved'
                ? 'Your merchant application has been approved.'
                : merchant.application_status === 'submitted'
                ? 'Your application has been submitted for review.'
                : 'Complete your profile and submit your application when ready.'}
            </p>
          </div>

        </div>

        {/* Quick actions */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Quick actions
              </p>
              <h2 className="text-lg font-bold text-slate-900 mt-1">
                Keep your GiftGrid workspace moving
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">

            <Link
              href="/dashboard/profile"
              className="rounded-xl border border-slate-200 p-5 hover:border-indigo-300 hover:bg-indigo-50/40 transition"
            >
              <p className="text-sm font-bold text-slate-900">
                Complete profile
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Add business, store and category details.
              </p>
            </Link>

            <Link
              href="/dashboard/audit"
              className="rounded-xl border border-slate-200 p-5 hover:border-indigo-300 hover:bg-indigo-50/40 transition"
            >
              <p className="text-sm font-bold text-slate-900">
                Review audit
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Check your latest store performance results.
              </p>
            </Link>

            <Link
              href="/dashboard/opportunities"
              className="rounded-xl border border-slate-200 p-5 hover:border-indigo-300 hover:bg-indigo-50/40 transition"
            >
              <p className="text-sm font-bold text-slate-900">
                Explore opportunities
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Track suitable corporate and buyer pathways.
              </p>
            </Link>

          </div>
        </div>

      </div>
    </div>
  );
}
