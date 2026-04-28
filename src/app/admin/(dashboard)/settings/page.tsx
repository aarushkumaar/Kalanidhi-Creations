'use client';

import { useState, useEffect } from 'react';
import { adminGetSettings, adminUpdateSettings } from '@/utils/admin-api';
import { toast } from '@/components/ui/Toast';

export default function AdminSettings() {
  const [settings, setSettings] = useState({ publicEmail: '', boutiquePhone: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminGetSettings().then(data => {
      if (data?.settings) setSettings({
        publicEmail: data.settings.publicEmail || '',
        boutiquePhone: data.settings.boutiquePhone || '',
      });
    }).finally(() => setLoading(false));
  }, []);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await adminUpdateSettings(settings);
      toast('Settings updated', 'success');
    } catch (err: any) {
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-serif text-foreground mb-8">Settings</h1>

      <div className="bg-muted/30 border border-border p-8 flex flex-col gap-8">
        <form onSubmit={handleUpdate}>
          <h3 className="text-lg font-serif mb-1 text-gold">Boutique Information</h3>
          <p className="text-sm text-muted-foreground mb-6">Public contact details displayed on the website.</p>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Public Email</label>
              <input type="email" value={settings.publicEmail}
                onChange={e => setSettings(s => ({ ...s, publicEmail: e.target.value }))}
                disabled={loading}
                className="bg-transparent border-b border-border py-2 focus:outline-none focus:border-gold w-full text-sm transition-colors disabled:opacity-50" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Boutique Phone</label>
              <input type="text" value={settings.boutiquePhone}
                onChange={e => setSettings(s => ({ ...s, boutiquePhone: e.target.value }))}
                disabled={loading}
                className="bg-transparent border-b border-border py-2 focus:outline-none focus:border-gold w-full text-sm transition-colors disabled:opacity-50" />
            </div>
          </div>

          <button type="submit" disabled={saving || loading}
            className="mt-8 border border-gold text-gold py-3 px-6 uppercase tracking-widest text-xs font-medium hover:bg-gold hover:text-background transition-colors disabled:opacity-50">
            {saving ? 'Saving…' : 'Update Info'}
          </button>
        </form>

        <div className="h-px bg-border w-full" />

        <div>
          <h3 className="text-lg font-serif mb-1 text-gold">Admin Access</h3>
          <p className="text-sm text-muted-foreground">
            This portal uses a session-based password gate. Set <code className="text-xs bg-muted px-1.5 py-0.5 rounded">NEXT_PUBLIC_ADMIN_PASSWORD</code> in your environment to change the access password.
          </p>
        </div>
      </div>
    </div>
  );
}
