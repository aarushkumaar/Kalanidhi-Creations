'use client';

import { useState, useEffect } from 'react';
import { getSettings, updateSettings } from '@/utils/firebase/db';
import { toast } from '@/components/ui/Toast';

export default function AdminSettings() {
  const [settings, setSettings] = useState({ publicEmail: '', boutiquePhone: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSettings() {
      const data = await getSettings();
      if (data) {
        setSettings({
          publicEmail: data.publicEmail || '',
          boutiquePhone: data.boutiquePhone || ''
        });
      }
      setLoading(false);
    }
    fetchSettings();
  }, []);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    try {
      await updateSettings(settings);
      toast('Settings updated successfully', 'success');
    } catch (error) {
      toast('Error updating settings', 'error');
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-serif text-foreground mb-8">Settings</h1>
      
      <div className="bg-muted/30 border border-border p-8 flex flex-col gap-8">
        <form onSubmit={handleUpdate}>
          <h3 className="text-lg font-serif mb-2 text-gold">Boutique Information</h3>
          <p className="text-sm text-muted-foreground mb-6 text-balance">Manage the public contact details displayed on the website.</p>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase tracking-widest text-muted-foreground">Public Email</label>
              <input 
                type="email" 
                value={settings.publicEmail} 
                onChange={(e) => setSettings({ ...settings, publicEmail: e.target.value })}
                className="bg-transparent border-b border-border py-2 focus:outline-none focus:border-gold w-full max-w-sm text-sm transition-colors" 
              />
            </div>
            <div className="flex flex-col gap-1">
               <label className="text-xs uppercase tracking-widest text-muted-foreground">Boutique Phone</label>
              <input 
                type="text" 
                value={settings.boutiquePhone} 
                onChange={(e) => setSettings({ ...settings, boutiquePhone: e.target.value })}
                className="bg-transparent border-b border-border py-2 focus:outline-none focus:border-gold w-full max-w-sm text-sm transition-colors" 
              />
            </div>
          </div>
          <button type="submit" className="mt-8 border border-gold text-gold py-3 px-6 uppercase tracking-widest text-xs font-medium hover:bg-gold hover:text-background transition-colors">Update Info</button>
        </form>
        
        <div className="h-px bg-border w-full" />
        
        <div>
          <h3 className="text-lg font-serif mb-2 text-gold">Authentication</h3>
          <p className="text-sm text-muted-foreground mb-6">This app uses Firebase Magic Links for passwordless entry. No password management is required.</p>
        </div>
      </div>
    </div>
  );
}
