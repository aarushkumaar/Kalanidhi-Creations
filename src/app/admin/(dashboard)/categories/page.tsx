'use client';

import { useState, useEffect } from 'react';
import { adminGetCategories, adminCreateCategory, adminDeleteCategory } from '@/utils/admin-api';
import { toast } from '@/components/ui/Toast';
import { Trash2, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchCategories(); }, []);

  async function fetchCategories() {
    setLoading(true);
    try {
      const data = await adminGetCategories();
      setCategories(data.categories || []);
    } catch (err: any) { toast(err.message, 'error'); }
    finally { setLoading(false); }
  }

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setSaving(true);
    try {
      await adminCreateCategory({ name: newCatName.trim(), description: '', coverImage: '' });
      toast('Collection added', 'success');
      setNewCatName('');
      setIsAdding(false);
      fetchCategories();
    } catch (err: any) { toast(err.message, 'error'); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await adminDeleteCategory(id);
      toast('Deleted', 'success');
      fetchCategories();
    } catch (err: any) { toast(err.message, 'error'); }
  }

  return (
    <div className="w-full max-w-3xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-serif text-foreground">Collections</h1>
        <button onClick={() => setIsAdding(v => !v)}
          className="flex items-center gap-2 bg-gold text-background py-2 px-6 uppercase tracking-widest text-xs font-medium hover:bg-gold-light transition-colors">
          <Plus size={14} />
          {isAdding ? 'Cancel' : 'Add Collection'}
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleAddCategory}
            className="mb-8 p-6 bg-muted/30 border border-gold/20 flex gap-4 items-end overflow-hidden"
          >
            <div className="flex flex-col gap-2 flex-1">
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Collection Name</label>
              <input type="text" value={newCatName} onChange={e => setNewCatName(e.target.value)}
                placeholder="e.g. Bridal Heirlooms" required
                className="bg-transparent border-b border-border py-2 focus:outline-none focus:border-gold transition-colors text-sm" />
            </div>
            <button type="submit" disabled={saving}
              className="bg-gold text-background py-2 px-6 uppercase tracking-widest text-xs font-medium h-10 disabled:opacity-50">
              {saving ? 'Saving…' : 'Save'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="bg-background border border-border overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted text-muted-foreground uppercase tracking-widest text-xs">
            <tr>
              <th className="p-4 font-normal">Name</th>
              <th className="p-4 font-normal">Slug</th>
              <th className="p-4 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(cat => (
              <tr key={cat.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                <td className="p-4 font-serif text-base">{cat.name}</td>
                <td className="p-4 text-muted-foreground text-xs">{cat.slug}</td>
                <td className="p-4 text-right">
                  <button onClick={() => handleDelete(cat.id, cat.name)}
                    className="text-muted-foreground hover:text-red-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && !loading && (
              <tr><td colSpan={3} className="p-12 text-center text-muted-foreground uppercase tracking-widest text-xs">No collections found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
