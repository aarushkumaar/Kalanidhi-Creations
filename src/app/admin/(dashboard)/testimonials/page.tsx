'use client';

import { useState, useEffect } from 'react';
import { getTestimonials, createTestimonial, updateTestimonial, deleteTestimonial } from '@/utils/firebase/db';
import { toast } from '@/components/ui/Toast';

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ authorName: '', authorDetail: '', quote: '' });

  useEffect(() => {
    fetchTestimonials();
  }, []);

  async function fetchTestimonials() {
    try {
      const data = await getTestimonials();
      setTestimonials(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createTestimonial({ ...formData, isFeatured: false });
      toast('Testimonial added', 'success');
      setFormData({ authorName: '', authorDetail: '', quote: '' });
      setIsAdding(false);
      fetchTestimonials();
    } catch (error) {
      toast('Error adding testimonial', 'error');
    }
  }

  async function toggleFeatured(id: string, current: boolean) {
    try {
      await updateTestimonial(id, { isFeatured: !current });
      toast(`Testimonial ${!current ? 'published to home' : 'unpublished'}`, 'success');
      fetchTestimonials();
    } catch (error) {
      toast('Error updating testimonial', 'error');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;
    try {
      await deleteTestimonial(id);
      toast('Testimonial deleted', 'success');
      fetchTestimonials();
    } catch (error) {
      toast('Error deleting testimonial', 'error');
    }
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-serif text-foreground">Testimonials</h1>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-gold text-background py-2 px-6 uppercase tracking-widest text-xs font-medium hover:bg-gold-light transition-colors"
        >
          {isAdding ? 'Cancel' : 'Add Testimonial'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="mb-8 p-6 bg-muted/30 border border-gold/20 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Author Name</label>
              <input 
                type="text" 
                value={formData.authorName} 
                onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                required 
                className="bg-transparent border-b border-border py-2 text-sm focus:outline-none focus:border-gold"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Author Detail (e.g. New Delhi)</label>
              <input 
                type="text" 
                value={formData.authorDetail} 
                onChange={(e) => setFormData({ ...formData, authorDetail: e.target.value })}
                className="bg-transparent border-b border-border py-2 text-sm focus:outline-none focus:border-gold"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Quote</label>
            <textarea 
              value={formData.quote} 
              onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
              required 
              rows={3}
              className="bg-transparent border-b border-border py-2 text-sm focus:outline-none focus:border-gold resize-none"
            />
          </div>
          <button type="submit" className="bg-gold text-background py-2 px-6 uppercase tracking-widest text-xs font-medium self-end">Save Testimonial</button>
        </form>
      )}

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
            {testimonials.map((t) => (
              <tr key={t.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                <td className="p-4 font-medium flex flex-col">
                  <span>{t.authorName}</span>
                  <span className="text-muted-foreground text-xs font-light">{t.authorDetail}</span>
                </td>
                <td className="p-4 text-muted-foreground italic line-clamp-2 leading-relaxed">
                  "{t.quote}"
                </td>
                <td className="p-4 text-right flex gap-3 justify-end items-center h-full">
                  {t.isFeatured && (
                    <span className="text-gold border border-gold/30 px-2 py-1 text-[10px] uppercase tracking-widest mr-2">Featured</span>
                  )}
                  <button onClick={() => toggleFeatured(t.id, t.isFeatured)} className="text-muted-foreground hover:text-gold transition-colors text-xs uppercase tracking-widest">
                    {t.isFeatured ? 'Unfeature' : 'Feature'}
                  </button>
                  <button onClick={() => handleDelete(t.id)} className="text-red-500/80 hover:text-red-500 transition-colors text-xs uppercase tracking-widest">Delete</button>
                </td>
              </tr>
            ))}
            {testimonials.length === 0 && !loading && (
              <tr>
                <td colSpan={3} className="p-12 text-center text-muted-foreground">No testimonials found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
