'use client'

import { useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'

interface Props {
  profile: { full_name: string | null; email: string; phone: string | null }
  merchant: {
    id: string
    business_name: string | null
    store_url: string | null
    country: string | null
    business_category: string | null
    product_category: string | null
    business_description: string | null
  }
  userId: string
}

export default function ProfileForm({ profile, merchant, userId }: Props) {
  const supabase = createBrowserClient()

  const [form, setForm] = useState({
    full_name: profile.full_name ?? '',
    phone: profile.phone ?? '',
    business_name: merchant.business_name ?? '',
    store_url: merchant.store_url ?? '',
    country: merchant.country ?? '',
    business_category: merchant.business_category ?? '',
    product_category: merchant.product_category ?? '',
    business_description: merchant.business_description ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSaved(false)

    const [profileUpdate, merchantUpdate] = await Promise.all([
      supabase
        .from('profiles')
        .update({ full_name: form.full_name, phone: form.phone })
        .eq('id', userId),
      supabase
        .from('merchant_profiles')
        .update({
          business_name: form.business_name,
          store_url: form.store_url,
          country: form.country,
          business_category: form.business_category,
          product_category: form.product_category,
          business_description: form.business_description,
        })
        .eq('id', merchant.id),
    ])

    setSaving(false)
    if (profileUpdate.error || merchantUpdate.error) {
      setError(profileUpdate.error?.message ?? merchantUpdate.error?.message ?? 'Save failed.')
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  return (
    <>
      <div className="form-wrap">
        <section className="form-section">
          <h2 className="section-title">Personal Details</h2>
          <div className="field-grid">
            <div className="field">
              <label>Full Name</label>
              <input value={form.full_name} onChange={set('full_name')} placeholder="Your full name" />
            </div>
            <div className="field">
              <label>Email</label>
              <input value={profile.email} disabled className="disabled" />
              <p className="field-hint">Email cannot be changed here. Contact support if needed.</p>
            </div>
            <div className="field">
              <label>Phone</label>
              <input value={form.phone} onChange={set('phone')} placeholder="+44 7000 000000" />
            </div>
          </div>
        </section>

        <section className="form-section">
          <h2 className="section-title">Business Information</h2>
          <div className="field-grid">
            <div className="field">
              <label>Business Name</label>
              <input value={form.business_name} onChange={set('business_name')} placeholder="Your business name" />
            </div>
            <div className="field">
              <label>Store URL</label>
              <input value={form.store_url} onChange={set('store_url')} placeholder="https://yourstore.com" type="url" />
            </div>
            <div className="field">
              <label>Country</label>
              <input value={form.country} onChange={set('country')} placeholder="e.g. United Kingdom" />
            </div>
            <div className="field">
              <label>Business Category</label>
              <input value={form.business_category} onChange={set('business_category')} placeholder="e.g. Lifestyle, Food & Drink" />
            </div>
            <div className="field">
              <label>Product Category</label>
              <input value={form.product_category} onChange={set('product_category')} placeholder="e.g. Gifts, Homewares" />
            </div>
          </div>
          <div className="field full-width">
            <label>Business Description</label>
            <textarea
              value={form.business_description}
              onChange={set('business_description')}
              placeholder="Briefly describe your business and what makes your products suitable for corporate gifting or bulk opportunities."
              rows={5}
            />
          </div>
        </section>

        <div className="form-footer">
          {error && <p className="error-msg">{error}</p>}
          {saved && <p className="success-msg">Changes saved.</p>}
          <button onClick={handleSave} disabled={saving} className="save-btn">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>

      <style jsx>{`
        .form-wrap { max-width: 680px; }
        .form-section {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 24px 26px;
          margin-bottom: 16px;
        }
        .section-title {
          font-size: 15px;
          font-weight: 600;
          margin-bottom: 20px;
          padding-bottom: 14px;
          border-bottom: 1px solid var(--border);
        }
        .field-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        @media (max-width: 580px) {
          .field-grid { grid-template-columns: 1fr; }
        }
        .field { display: flex; flex-direction: column; gap: 6px; }
        .full-width { margin-top: 16px; }
        label {
          font-family: var(--mono);
          font-size: 10.5px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-secondary);
        }
        input, textarea, select {
          background: var(--bg-primary);
          border: 1px solid var(--border);
          border-radius: 5px;
          padding: 10px 13px;
          color: var(--text-primary);
          font-family: var(--body);
          font-size: 14px;
          transition: border-color 0.15s;
          width: 100%;
        }
        input:focus, textarea:focus { outline: none; border-color: var(--accent-dim); }
        input.disabled { opacity: 0.5; cursor: not-allowed; }
        .field-hint { font-size: 12px; color: var(--text-secondary); }
        textarea { resize: vertical; }
        .form-footer {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 16px;
        }
        .error-msg { color: #F87171; font-size: 13.5px; }
        .success-msg { color: var(--success); font-size: 13.5px; }
        .save-btn {
          padding: 11px 24px;
          background: var(--accent);
          color: #0B0F19;
          border: none;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.15s;
        }
        .save-btn:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>
    </>
  )
}
