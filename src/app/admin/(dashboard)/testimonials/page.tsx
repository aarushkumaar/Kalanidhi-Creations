'use client';

import { useState, useEffect } from 'react';
import { adminGetTestimonials, adminCreateTestimonial, adminUpdateTestimonial, adminDeleteTestimonial } from '@/utils/admin-api';
import { toast } from '@/components/ui/Toast';
import { Star, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ authorName: '', authorDetail: '', quote: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchTestimonials(); }, []);

  async function fetchTestimonials() {
    setLoading(true);
    try {
      const data = await adminGetTestimonials();
      setTestimonials(data.testimonials || []);
    } catch (err: any) { toast(err.message, 'error'); }
    finally { setLoading(false); }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await adminCreateTestimonial({ ...formData, isFeatured: false, sortOrder: testimonials.length });
      toast('Testimonial added', 'success');
      setFormData({ authorName: '', authorDetail: '', quote: '' });
      setIsAdding(false);
      fetchTestimonials();
    } catch (err: any) { toast(err.message, 'error'); }
    finally { setSaving(false); }
  }

  async function toggleFeatured(id: string, current: boolean) {
    try {
      await adminUpdateTestimonial(id, { isFeatured: !current });
      toast(!current ? 'Published to home' : 'Unpublished', 'success');
      fetchTestimonials();
    } catch (err: any) { toast(err.message, 'error'); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this testimonial?')) return;
    try {
      await adminDeleteTestimonial(id);
      toast('Deleted', 'success');
      fetchTestimonials();
    } catch (err: any) { toast(err.message, 'error'); }
  }

  return (
    <div className="w-full max-w-5xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-serif text-foreground">Testimonials</h1>
        <button onClick={() => setIsAdding(v => !v)}
          className="bg-gold text-background py-2 px-6 uppercase tracking-widest text-xs font-medium hover:bg-gold-light transition-colors">
          {isAdding ? 'Cancel' : 'Add Testimonial'}
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleAdd}
            className="mb-8 p-6 bg-muted/30 border border-gold/20 flex flex-col gap-4 overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Author Name</label>
                <input type="text" value={formData.authorName} required
                  onChange={e => setFormData(f => ({ ...f, authorName: e.target.value }))}
                  className="bg-transparent border-b border-border py-2 text-sm focus:outline-none focus:border-gold" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Detail (e.g. New Delhi)</label>
                <input type="text" value={formData.authorDetail}
                  onChange={e => setFormData(f => ({ ...f, authorDetail: e.target.value }))}
                  className="bg-transparent border-b border-border py-2 text-sm focus:outline-none focus:border-gold" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Quote</label>
              <textarea rows={3} required value={formData.quote}
                onChange={e => setFormData(f => ({ ...f, quote: e.target.value }))}
                className="bg-transparent border-b border-border py-2 text-sm focus:outline-none focus:border-gold resize-none" />
            </div>
            <button type="submit" disabled={saving} className="bg-gold text-background py-2 px-6 uppercase tracking-widest text-xs font-medium self-end disabled:opacity-50">
              {saving ? 'Saving…' : 'Save Testimonial'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="bg-background border border-border overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted text-muted-foreground uppercase tracking-widest text-xs">
            <tr>
              <th className="p-4 font-normal w-1/4">Author</th>
              <th className="p-4 font-normal w-1/2">Snippet</th>
              <th className="p-4 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {testimonials.map(t => (
              <tr key={t.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                <td className="p-4">
                  <p className="font-medium">{t.authorName}</p>
                  <p className="text-muted-foreground text-xs">{t.authorDetail}</p>
                </td>
                <td className="p-4 text-muted-foreground italic text-sm leading-relaxed line-clamp-2">
                  &ldquo;{t.quote}&rdquo;
                </td>
                <td className="p-4 text-right">
                  <div className="flex gap-3 justify-end items-center">
                    {t.isFeatured && <span className="text-gold border border-gold/30 px-2 py-0.5 text-[10px] uppercase tracking-widest">Featured</span>}
                    <button onClick={() => toggleFeatured(t.id, t.isFeatured)}
                      className="text-muted-foreground hover:text-gold transition-colors" title={t.isFeatured ? 'Unfeature' : 'Feature'}>
                      <Star size={14} className={t.isFeatured ? 'fill-gold text-gold' : ''} />
                    </button>
                    <button onClick={() => handleDelete(t.id)} className="text-muted-foreground hover:text-red-500 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {testimonials.length === 0 && !loading && (
              <tr><td colSpan={3} className="p-12 text-center text-muted-foreground uppercase tracking-widest text-xs">No testimonials found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
