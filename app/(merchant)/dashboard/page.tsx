import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';

export const metadata = {
  title: 'Merchant Dashboard — GiftGrid',
};

export default async function MerchantDashboardPage() {
  const supabase = createClient();
  
  // 1. Get the authenticated user session context
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/sign-in');

  // 2. Fetch the profile and merchant records simultaneously
  const [profileRes, merchantRes] = await Promise.all([
    supabase.from('profiles').select('full_name, role').eq('id', user.id).single(),
    supabase.from('merchant_profiles').select('id, business_name').eq('profile_id', user.id).single()
  ]);

  const profile = profileRes.data;
  const merchant = merchantRes.data;

  // Inline Server Action to create the workspace profile right on this page!
  async function activateWorkspace(formData: FormData) {
    'use server';
    const serverSupabase = createClient();
    const businessName = formData.get('businessName') as string;
    
    // Fetch user object to guarantee contextual tracking visibility
    const { data: { user: sessionUser } } = await serverSupabase.auth.getUser();
    if (!sessionUser) return;

    await serverSupabase.from('merchant_profiles').insert({
      profile_id: sessionUser.id,
      business_name: businessName || 'My Business Entity',
      contact_email: sessionUser.email
    });
    
    // Instantly refreshes the view layers to reveal the dashboard metrics below
    revalidatePath('/dashboard');
  }

  // Interactive Fallback view if no unique business entry row is present yet
  if (!merchant) {
    return (
      <div className="max-w-[600px] mx-auto mt-16 p-8 border border-amber-200 bg-amber-50/60 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm">!</div>
          <h2 className="text-amber-900 font-bold text-lg">Account Initialization Required</h2>
        </div>
        <p className="text-amber-700 text-sm mt-3 leading-relaxed">
          Your authorization credentials are valid, but a unique merchant workspace hasn't been instantiated for your user ID yet. Enter your business name below to activate your account layout.
        </p>

        <form action={activateWorkspace} className="mt-6 space-y-4 bg-white p-6 rounded-xl border border-amber-200 shadow-sm">
          <div>
            <label className="block text-xs font-mono font-bold text-slate-500 uppercase mb-2">
              Your Company Name
            </label>
            <input 
              type="text" 
              name="businessName" 
              required 
              placeholder="e.g. Acme Gifting Labs"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-600 transition-colors"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button 
              type="submit" 
              className="text-xs bg-slate-900 hover:bg-black text-white font-bold rounded-lg px-5 py-2.5 shadow-sm transition-colors"
            >
              Activate Workspace
            </button>
            <Link 
              href="/auth/sign-out" 
              className="text-xs border border-slate-200 text-slate-700 bg-white font-semibold rounded-lg px-4 py-2.5 hover:bg-slate-50 transition-colors"
            >
              Sign Out
            </Link>
          </div>
        </form>
      </div>
    );
  }

  // 3. Collect active context metrics once the profile is confirmed
  const [auditsRes, submissionsRes] = await Promise.all([
    supabase.from('audits').select('id, status, overall_score').eq('store_id', merchant.id),
    supabase.from('opportunity_submissions').select('*', { count: 'exact', head: true }).eq('merchant_id', merchant.id).eq('status', 'submitted')
  ]);

  const audits = auditsRes.data;
  const pendingSubmissions = submissionsRes.count;

  return (
    <div className="space-y-8 p-4 max-w-[1140px] mx-auto">
      
      {/* Welcome Header Banner */}
      <div className="border border-slate-200 rounded-2xl bg-white p-8 shadow-sm">
        <span className="text-xs font-mono uppercase tracking-[0.1em] text-indigo-600 font-bold">
          Workspace Hub
        </span>
        <h1 className="text-3xl font-bold text-slate-900 mt-1">
          Welcome back, {profile?.full_name || 'Merchant'}
        </h1>
        <p className="text-sm text-slate-500 mt-2">
          Connected Company: <span className="font-semibold text-slate-800">{merchant.business_name}</span>
        </p>
      </div>

      {/* Metric Cards Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Audit Metric Card */}
        <div className="border border-slate-200 bg-white p-6 rounded-xl shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between min-h-[160px]">
          <div>
            <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider">Latest Store Audit</h3>
            <p className="text-3xl font-bold text-slate-900 mt-3">
              {audits && audits.length > 0 && audits[0].overall_score !== null ? `${audits[0].overall_score}/100` : 'Pending'}
            </p>
          </div>
          <Link href="/dashboard/audit" className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 mt-4">
            View comprehensive metrics <span>→</span>
          </Link>
        </div>

        {/* Pipeline Metric Card */}
        <div className="border border-slate-200 bg-white p-6 rounded-xl shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between min-h-[160px]">
          <div>
            <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider">Active Submissions</h3>
            <p className="text-3xl font-bold text-slate-900 mt-3">
              {pendingSubmissions || 0}
            </p>
          </div>
          <Link href="/dashboard/opportunities" className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 mt-4">
            Track matching pipeline <span>→</span>
          </Link>
        </div>

        {/* Inbox Communications Card */}
        <div className="border border-slate-200 bg-white p-6 rounded-xl shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between min-h-[160px]">
          <div>
            <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider">Support Comms Inbox</h3>
            <p className="text-3xl font-bold text-slate-900 mt-3">Connected</p>
          </div>
          <Link href="/dashboard/comms" className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 mt-4">
            Open help desk channel <span>→</span>
          </Link>
        </div>
      </div>

      {/* Onboarding Tasks Timeline Section */}
      <div className="border border-slate-200 rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Your Onboarding Workflow Checklist</h2>
        <p className="text-xs text-slate-400 mt-0.5">Complete your configuration pipeline items to qualify for corporate matching pools.</p>
        
        <div className="mt-6 space-y-4">
          <div className="flex items-start gap-4 p-5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold text-xs mt-0.5 shadow-sm">
              ✓
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-slate-900">Step 1: Complete Corporate Profile Metadata</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Ensure your verified distributions capacities, e-commerce store platform targets, and primary phone settings match up perfectly.
              </p>
              <Link href="/dashboard/profile" className="inline-block mt-3 text-xs bg-slate-900 text-white font-bold rounded-lg px-4 py-2 hover:bg-black transition-colors shadow-sm">
                Update Business Details
              </Link>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}
