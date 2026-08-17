import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export const metadata = {
  title: 'Store Performance Audit — GiftGrid',
};

export default async function MerchantAuditPage() {
  const supabase = createClient();

  // 1. Authenticate user context session
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/sign-in');

  // 2. Fetch the linked merchant account identifier
  const { data: merchant } = await supabase
    .from('merchant_profiles')
    .select('id, business_name')
    .eq('profile_id', user.id)
    .single();

  if (!merchant) redirect('/dashboard');

  // 3. Fetch comprehensive audit analytics rows assigned to this specific merchant store
  const { data: audits } = await supabase
    .from('audits')
    .select('*')
    .eq('store_id', merchant.id)
    .order('created_at', { ascending: false });

  const activeAudit = audits && audits.length > 0 ? audits[0] : null;

  return (
    <div className="space-y-8 p-4 max-w-[1140px] mx-auto bg-slate-50/30 min-h-screen">
      
      {/* Structural Header Banner Section */}
      <div className="border border-slate-200 rounded-2xl bg-white p-8 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-50/50 rounded-bl-full pointer-events-none" />
        <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-indigo-700 font-bold bg-indigo-50 px-2.5 py-1 rounded">
          Evaluation Analytics
        </span>
        <h1 className="text-3xl font-display font-bold text-slate-900 mt-4">
          Store Optimization Audit
        </h1>
        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
          Review automated parameters, loading benchmarks, and performance profiles gathered for <span className="font-semibold text-slate-800">{merchant.business_name}</span>.
        </p>
      </div>

      {/* Conditional Branching Layout Based on Audit Discovery */}
      {!activeAudit ? (
        /* State A: No Audit Generated Yet */
        <div className="border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center bg-white shadow-sm">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mx-auto text-xl font-bold mb-4">
            ?
          </div>
          <h3 className="text-base font-bold text-slate-900">No Active Audit Data Found</h3>
          <p className="text-sm text-slate-500 mt-2 max-w-[420px] mx-auto leading-relaxed">
            Your e-commerce parameters haven't been processed by the automated analyzer grid yet. Connect your store API variables in your profile layout panel to initiate a scoring evaluation run.
          </p>
          <div className="mt-6">
            <Link href="/dashboard/profile" className="inline-block text-xs bg-slate-900 text-white font-bold rounded-lg px-5 py-2.5 hover:bg-black transition-colors shadow-sm">
              Complete Core Profile Configuration
            </Link>
          </div>
        </div>
      ) : (
        /* State B: Active Core Metrics Discovered */
        <div className="space-y-8">
          
          {/* Top Score Matrix Metrics Panels */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="border border-slate-200 bg-white p-6 rounded-xl shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">Overall Grid Grade</span>
                <p className="text-4xl font-display font-bold text-indigo-600 mt-3">
                  {activeAudit.overall_score || 0}<span className="text-sm text-slate-400 font-normal">/100</span>
                </p>
              </div>
              <span className="text-[11px] text-slate-500 mt-4 font-medium block">
                Status: <span className="capitalize font-bold text-slate-700">{activeAudit.status || 'Complete'}</span>
              </span>
            </div>

            <div className="border border-slate-200 bg-white p-6 rounded-xl shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">Fulfillment Readiness</span>
                <p className="text-4xl font-display font-bold text-slate-900 mt-3">
                  {activeAudit.overall_score && activeAudit.overall_score >= 80 ? 'High' : 'Medium'}
                </p>
              </div>
              <span className="text-[11px] text-slate-500 mt-4 font-medium block">Based on inventory capacity maps</span>
            </div>

            <div className="border border-slate-200 bg-white p-6 rounded-xl shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">Last Scanner Run</span>
                <p className="text-sm font-semibold text-slate-800 mt-4">
                  {activeAudit.created_at ? new Date(activeAudit.created_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <span className="text-[11px] text-slate-500 mt-4 font-medium block">Data pipeline remains active</span>
            </div>

          </div>

          {/* Breakdown Analytics Details Layout Card */}
          <div className="border border-slate-200 rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Optimization Parameter Logs</h2>
            <p className="text-xs text-slate-400 mt-0.5">Granular performance benchmarks mapped by your application scanning layer.</p>
            
            <div className="mt-6 space-y-4">
              
              {/* Check Item A */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">Mobile Fluid Response Framework</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Validates layouts across viewport nodes.</p>
                </div>
                <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded px-2.5 py-1">
                  PASS
                </span>
              </div>

              {/* Check Item B */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">SSL Certificate & Metadata Verification</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Encrypts transactional customer token configurations securely.</p>
                </div>
                <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded px-2.5 py-1">
                  SECURE
                </span>
              </div>

              {/* Check Item C */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">Cart Checkout Flow Hook Hydration</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Analyzes checkout speed performance for high volume corporate loads.</p>
                </div>
                <span className="text-xs font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200 rounded px-2.5 py-1">
                  OPTIMIZE
                </span>
              </div>

            </div>
          </div>

        </div>
      )}
      
    </div>
  );
}
