'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface MerchantProfile {
  id: string;
  business_name: string;
  contact_email: string;
  website_url?: string;
  support_phone?: string;
  estimated_monthly_orders?: string;
}

export default function ProfileForm({ initialData }: { initialData: MerchantProfile }) {
  const supabase = createClient();
  const router = useRouter();
  
  const [businessName, setBusinessName] = useState(initialData.business_name || '');
  const [websiteUrl, setWebsiteUrl] = useState(initialData.website_url || '');
  const [supportPhone, setSupportPhone] = useState(initialData.support_phone || '');
  const [orders, setOrders] = useState(initialData.estimated_monthly_orders || '0-100');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const { error } = await supabase
      .from('merchant_profiles')
      .update({
        business_name: businessName,
        website_url: websiteUrl,
        support_phone: supportPhone,
        estimated_monthly_orders: orders,
      })
      .eq('id', initialData.id);

    setLoading(false);

    if (error) {
      setMessage({ type: 'error', text: `Configuration failed: ${error.message}` });
    } else {
      setMessage({ type: 'success', text: 'Corporate metadata sync completed successfully!' });
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleProfileSubmit} className="space-y-6 max-w-[680px]">
      
      {/* Toast Alert Feedback Overlay */}
      {message && (
        <div className={`p-4 rounded-xl border text-sm font-semibold shadow-sm transition-all ${
          message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Grid Inputs Display */}
      <div className="grid grid-cols-1 gap-6 bg-white p-6 border border-slate-200 rounded-2xl shadow-sm">
        
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 font-bold mb-2">
            Registered Enterprise Name
          </label>
          <input
            type="text"
            required
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-indigo-600 transition-colors"
            placeholder="e.g. GiftGrid Inc."
          />
        </div>

        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 font-bold mb-2">
            E-Commerce Store Website URL
          </label>
          <input
            type="url"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-indigo-600 transition-colors"
            placeholder="https://yourstore.com"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 font-bold mb-2">
              Primary Support Hotline Phone
            </label>
            <input
              type="tel"
              value={supportPhone}
              onChange={(e) => setSupportPhone(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-indigo-600 transition-colors"
              placeholder="+1 (555) 000-0000"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 font-bold mb-2">
              Estimated Monthly Orders Volume
            </label>
            <select
              value={orders}
              onChange={(e) => setOrders(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-indigo-600 transition-colors"
            >
              <option value="0-100">0 - 100 orders / mo</option>
              <option value="101-500">101 - 500 orders / mo</option>
              <option value="501-2000">501 - 2,000 orders / mo</option>
              <option value="2001+">2,000+ orders / mo</option>
            </select>
          </div>
        </div>

      </div>

      {/* High Contrast Light Theme Submission Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full md:w-auto bg-slate-900 text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-black transition-colors shadow-md disabled:opacity-50"
      >
        {loading ? 'Synchronizing Data...' : 'Save Profile Settings'}
      </button>

    </form>
  );
}
