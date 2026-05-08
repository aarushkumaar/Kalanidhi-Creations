'use client';

import { useState, useEffect } from 'react';
import { adminGetTestimonials, adminCreateTestimonial, adminUpdateTestimonial, adminDeleteTestimonial } from '@/utils/admin-api';
import { toast } from '@/components/ui/Toast';
import { Trash2, Plus, X, ToggleLeft, ToggleRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Testimonial {
  id: string;
  name?: string;
  authorName?: string;
  location?: string;
  authorDetail?: string;
  message?: string;
  quote?: string;
  active?: boolean;
  isFeatured?: boolean;
}

function getName(t: Testimonial)     { return t.name     ?? t.authorName   ?? ''; }
function getLocation(t: Testimonial) { return t.location ?? t.authorDetail ?? ''; }
function getMessage(t: Testimonial)  { return t.message  ?? t.quote        ?? ''; }
function isActive(t: Testimonial)    { return t.active === true || t.isFeatured === true; }

const emptyForm = { name: '', location: '', message: '' };

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [panelOpen,    setPanelOpen]    = useState(false);
  const [form,         setForm]         = useState({ ...emptyForm });
  const [saving,       setSaving]       = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await adminGetTestimonials();
      setTestimonials(data.testimonials ?? []);
    } catch (err: any) { toast(err.message, 'error'); }
    finally { setLoading(false); }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await adminCreateTestimonial({ ...form, active: true, createdAt: new Date().toISOString() });
      toast('Testimonial added', 'success');
      setForm({ ...emptyForm });
      setPanelOpen(false);
      load();
    } catch (err: any) { toast(err.message, 'error'); }
    finally { setSaving(false); }
  }

  async function toggleActive(t: Testimonial) {
    const nowActive = isActive(t);
    try {
      // Update both fields for backward compat
      await adminUpdateTestimonial(t.id, { active: !nowActive, isFeatured: !nowActive });
      toast(!nowActive ? 'Active — visible on homepage' : 'Hidden from homepage', 'success');
      load();
    } catch (err: any) { toast(err.message, 'error'); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this testimonial?')) return;
    try {
      await adminDeleteTestimonial(id);
      toast('Deleted', 'success');
      load();
    } catch (err: any) { toast(err.message, 'error'); }
  }

  const activeCount   = testimonials.filter(isActive).length;
  const inactiveCount = testimonials.length - activeCount;

  return (
    <div className="w-full max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif">Testimonials</h1>
          <p className="text-xs text-muted-foreground uppercase tracking-[0.15em] mt-1">
            {activeCount} active · {inactiveCount} hidden · shown in homepage marquee
          </p>
        </div>
        <button
          onClick={() => setPanelOpen(v => !v)}
          className="flex items-center gap-2 bg-gold text-background py-2.5 px-6 uppercase tracking-widest text-xs font-medium hover:bg-gold-light transition-colors"
        >
          {panelOpen ? <><X size={14} /> Cancel</> : <><Plus size={14} /> Add Testimonial</>}
        </button>
      </div>

      {/* Add form slide-in */}
      <AnimatePresence>
        {panelOpen && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleAdd}
            className="mb-8 p-6 bg-muted/30 border border-gold/20 flex flex-col gap-4 overflow-hidden"
          >
            <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2">New Testimonial</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Customer Name *</label>
                <input
                  type="text" required value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Priya Sharma"
                  className="bg-transparent border-b border-border py-2 text-sm focus:outline-none focus:border-gold transition-colors"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Location</label>
                <input
                  type="text" value={form.location}
                  onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                  placeholder="e.g. Mumbai, India"
                  className="bg-transparent border-b border-border py-2 text-sm focus:outline-none focus:border-gold transition-colors"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Message *</label>
              <textarea
                rows={3} required value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                placeholder="What did they say about Kalanidhi?"
                className="bg-transparent border-b border-border py-2 text-sm focus:outline-none focus:border-gold transition-colors resize-none"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setPanelOpen(false)} className="px-6 border border-border text-muted-foreground hover:text-foreground text-xs uppercase tracking-widest transition-colors py-2">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="bg-gold text-background py-2 px-6 uppercase tracking-widest text-xs font-medium disabled:opacity-50">
                {saving ? 'Saving…' : 'Save Testimonial'}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Testimonial cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-36 skeleton" />
          ))}
        </div>
      ) : testimonials.length === 0 ? (
        <div className="border border-dashed border-border py-24 text-center text-muted-foreground">
          <p className="text-sm uppercase tracking-widest">No testimonials yet.</p>
          <p className="text-xs mt-2 text-muted-foreground/60">Add your first testimonial above.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {testimonials.map(t => {
            const active = isActive(t);
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-start gap-4 p-5 border transition-colors duration-300 ${
                  active ? 'border-gold/30 bg-gold/5' : 'border-border bg-background'
                }`}
              >
                {/* Active toggle */}
                <button
                  onClick={() => toggleActive(t)}
                  title={active ? 'Hide from homepage' : 'Show on homepage'}
                  className="mt-0.5 flex-shrink-0"
                >
                  {active
                    ? <ToggleRight size={22} className="text-gold" />
                    : <ToggleLeft  size={22} className="text-muted-foreground" />
                  }
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-serif font-semibold text-base truncate">{getName(t) || '—'}</p>
                    {getLocation(t) && (
                      <span className="text-[10px] text-muted-foreground uppercase tracking-widest flex-shrink-0">
                        · {getLocation(t)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground italic leading-relaxed line-clamp-2">
                    &ldquo;{getMessage(t)}&rdquo;
                  </p>
                  <p className={`text-[10px] uppercase tracking-widest mt-2 ${active ? 'text-gold' : 'text-muted-foreground/50'}`}>
                    {active ? '✓ Visible in homepage marquee' : 'Hidden'}
                  </p>
                </div>

                {/* Delete */}
                <button
                  onClick={() => handleDelete(t.id)}
                  className="flex-shrink-0 text-muted-foreground hover:text-red-500 transition-colors p-1 mt-0.5"
                >
                  <Trash2 size={15} />
                </button>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
