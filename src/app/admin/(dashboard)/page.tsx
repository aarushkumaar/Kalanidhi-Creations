'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, Trash2, Plus, X, ToggleLeft, ToggleRight, Star } from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import {
  adminGetPieces, adminCreatePiece, adminUpdatePiece, adminDeletePiece,
  adminGetCategories, adminCreateCategory, adminDeleteCategory,
} from '@/utils/admin-api';


const emptyForm = {
  name: '', description: '', price: '', categoryId: '', categorySlug: '',
  coverImage: '', isAvailable: true, isFeatured: false,
};

export default function AdminDashboard() {
  const [pieces, setPieces] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Collection manager
  const [catPanelOpen, setCatPanelOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [catSaving, setCatSaving] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([adminGetPieces(), adminGetCategories()]);
      setPieces(pRes.pieces || []);
      setCategories(cRes.categories || []);
    } catch (err: any) { toast(err.message, 'error'); }
    finally { setLoading(false); }
  }

  function openAdd() {
    setEditingId(null);
    setForm({ ...emptyForm });
    setPanelOpen(true);
  }

  function openEdit(piece: any) {
    setEditingId(piece.id);
    setForm({
      name: piece.name || '',
      description: piece.description || '',
      price: String(piece.price || ''),
      categoryId: piece.categoryId || '',
      categorySlug: piece.categorySlug || '',
      coverImage: piece.coverImage || '',
      isAvailable: piece.isAvailable !== false,
      isFeatured: piece.isFeatured === true,
    });
    setPanelOpen(true);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    setUploading(true);
    try {
      const cloudName    = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;
      const formData     = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      formData.append('folder', 'kalanidhi');
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: 'POST', body: formData }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || 'Upload failed');
      setForm(f => ({ ...f, coverImage: data.secure_url }));
      toast('Image uploaded', 'success');
    } catch (err: any) { toast('Upload failed: ' + err.message, 'error'); }
    finally { setUploading(false); }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const cat = categories.find(c => c.id === form.categoryId);
      const payload = {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price) || 0,
        categoryId: form.categoryId,
        categorySlug: cat?.slug || '',
        coverImage: form.coverImage,
        images: form.coverImage ? [form.coverImage] : [],
        isAvailable: form.isAvailable,
        isFeatured: form.isFeatured,
      };
      if (editingId) {
        await adminUpdatePiece(editingId, payload);
        toast('Piece updated', 'success');
      } else {
        await adminCreatePiece(payload);
        toast('Piece added', 'success');
      }
      setPanelOpen(false);
      load();
    } catch (err: any) { toast(err.message, 'error'); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await adminDeletePiece(id);
      toast('Piece deleted', 'success');
      load();
    } catch (err: any) { toast(err.message, 'error'); }
  }

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setCatSaving(true);
    try {
      await adminCreateCategory({ name: newCatName.trim(), description: '', coverImage: '' });
      toast('Collection created', 'success');
      setNewCatName('');
      setCatPanelOpen(false);
      load();
    } catch (err: any) { toast(err.message, 'error'); }
    finally { setCatSaving(false); }
  }

  async function handleDeleteCategory(id: string, name: string) {
    if (!confirm(`Delete collection "${name}"?`)) return;
    try {
      await adminDeleteCategory(id);
      toast('Collection deleted', 'success');
      load();
    } catch (err: any) { toast(err.message, 'error'); }
  }

  const stats = [
    { label: 'Total Pieces', value: pieces.length },
    { label: 'Available', value: pieces.filter(p => p.isAvailable !== false).length },
    { label: 'Collections', value: categories.length },
  ];

  return (
    <div className="max-w-6xl mx-auto w-full">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {stats.map(s => (
          <div key={s.label} className="bg-muted/40 border border-border p-5">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">{s.label}</p>
            <p className="text-4xl font-serif text-gold">{loading ? '—' : s.value}</p>
          </div>
        ))}
      </div>

      {/* ── PRODUCT MANAGER ── */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-serif">Product Manager</h2>
            <p className="text-xs text-muted-foreground uppercase tracking-[0.15em] mt-1">All pieces in your boutique</p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-gold text-background py-2.5 px-6 uppercase tracking-widest text-xs font-medium hover:bg-gold-light transition-colors"
          >
            <Plus size={14} />
            Add Piece
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="aspect-[3/4] skeleton rounded-none" />
            ))}
          </div>
        ) : pieces.length === 0 ? (
          <div className="border border-dashed border-border py-24 text-center text-muted-foreground">
            <p className="text-sm uppercase tracking-widest">No pieces yet. Add your first piece.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pieces.map(piece => (
              <motion.div
                key={piece.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="group relative bg-background border border-border hover:border-gold/40 transition-colors duration-300"
              >
                {/* Image */}
                <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                  {piece.coverImage ? (
                    <Image src={piece.coverImage} alt={piece.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width:640px) 100vw, 33vw" />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground text-xs uppercase tracking-widest">No image</div>
                  )}
                  {/* Status badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1">
                    {piece.isFeatured && <span className="bg-gold text-background text-[10px] uppercase tracking-widest px-2 py-0.5">Featured</span>}
                    {piece.isAvailable === false && <span className="bg-foreground text-background text-[10px] uppercase tracking-widest px-2 py-0.5">Sold Out</span>}
                  </div>
                  {/* Actions overlay */}
                  <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/30 transition-all duration-300 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                    <button onClick={() => openEdit(piece)} className="p-2 bg-background text-foreground hover:text-gold transition-colors shadow-sm">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => handleDelete(piece.id, piece.name)} className="p-2 bg-background text-foreground hover:text-red-500 transition-colors shadow-sm">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                {/* Info */}
                <div className="p-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">{piece.categorySlug?.replace(/-/g, ' ')}</p>
                  <h3 className="font-serif text-lg leading-tight">{piece.name}</h3>
                  <p className="text-gold text-sm mt-1">
                    ₹{Number(piece.price || 0).toLocaleString('en-IN')}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* ── COLLECTION MANAGER ── */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-serif">Collection Manager</h2>
            <p className="text-xs text-muted-foreground uppercase tracking-[0.15em] mt-1">Tag pieces to collections</p>
          </div>
          <button
            onClick={() => setCatPanelOpen(v => !v)}
            className="flex items-center gap-2 border border-gold text-gold py-2.5 px-6 uppercase tracking-widest text-xs font-medium hover:bg-gold hover:text-background transition-colors"
          >
            <Plus size={14} />
            New Collection
          </button>
        </div>

        <AnimatePresence>
          {catPanelOpen && (
            <motion.form
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              onSubmit={handleAddCategory}
              className="mb-6 p-6 bg-muted/30 border border-gold/20 flex gap-4 items-end overflow-hidden"
            >
              <div className="flex flex-col gap-2 flex-1">
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Collection Name</label>
                <input
                  type="text"
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  placeholder="e.g. Bridal Heirlooms"
                  required
                  className="bg-transparent border-b border-border py-2 text-sm focus:outline-none focus:border-gold transition-colors"
                />
              </div>
              <button type="submit" disabled={catSaving} className="bg-gold text-background py-2 px-6 uppercase tracking-widest text-xs font-medium h-10 disabled:opacity-50">
                {catSaving ? 'Saving…' : 'Save'}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(cat => (
            <div key={cat.id} className="border border-border p-5 flex items-center justify-between hover:border-gold/40 transition-colors">
              <div>
                <p className="font-serif text-base">{cat.name}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">{cat.slug}</p>
              </div>
              <button onClick={() => handleDeleteCategory(cat.id, cat.name)} className="text-muted-foreground hover:text-red-500 transition-colors p-1">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {categories.length === 0 && !loading && (
            <p className="col-span-3 text-center py-12 text-muted-foreground text-sm uppercase tracking-widest">No collections yet.</p>
          )}
        </div>
      </section>

      {/* ── SLIDE-IN PANEL ── */}
      <AnimatePresence>
        {panelOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPanelOpen(false)}
              className="fixed inset-0 bg-foreground/40 z-[999] backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 250 }}
              className="fixed right-0 top-0 h-full w-full max-w-lg bg-background border-l border-border z-[1000] overflow-y-auto"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-serif">{editingId ? 'Edit Piece' : 'Add New Piece'}</h2>
                  <button onClick={() => setPanelOpen(false)} className="p-2 hover:text-gold transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSave} className="flex flex-col gap-6">
                  {/* Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Name *</label>
                    <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="bg-transparent border-b border-border py-2 text-sm focus:outline-none focus:border-gold transition-colors" />
                  </div>

                  {/* Price + Category */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Price (₹) *</label>
                      <input type="number" required min="0" value={form.price}
                        onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                        className="bg-transparent border-b border-border py-2 text-sm focus:outline-none focus:border-gold transition-colors" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Collection</label>
                      <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
                        className="bg-transparent border-b border-border py-2 text-sm focus:outline-none focus:border-gold transition-colors">
                        <option value="">Select…</option>
                        {categories.map(c => <option key={c.id} value={c.id} className="bg-background">{c.name}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Description</label>
                    <textarea rows={3} value={form.description}
                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      className="bg-transparent border-b border-border py-2 text-sm focus:outline-none focus:border-gold transition-colors resize-none" />
                  </div>

                  {/* Image */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Image</label>
                    {form.coverImage ? (
                      <div className="relative w-32 h-40">
                        <Image src={form.coverImage} alt="Preview" fill className="object-cover" sizes="128px" />
                        <button type="button" onClick={() => setForm(f => ({ ...f, coverImage: '' }))}
                          className="absolute -top-2 -right-2 p-1 bg-background border border-border rounded-full hover:text-red-500 transition-colors">
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-border hover:border-gold/50 cursor-pointer transition-colors">
                        <span className="text-xs uppercase tracking-widest text-muted-foreground">{uploading ? 'Uploading…' : 'Click to upload'}</span>
                        <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={handleImageUpload} />
                      </label>
                    )}
                  </div>

                  {/* Toggles */}
                  <div className="flex gap-6">
                    <button type="button" onClick={() => setForm(f => ({ ...f, isAvailable: !f.isAvailable }))}
                      className="flex items-center gap-2 text-xs uppercase tracking-widest">
                      {form.isAvailable ? <ToggleRight size={20} className="text-gold" /> : <ToggleLeft size={20} className="text-muted-foreground" />}
                      In Stock
                    </button>
                    <button type="button" onClick={() => setForm(f => ({ ...f, isFeatured: !f.isFeatured }))}
                      className="flex items-center gap-2 text-xs uppercase tracking-widest">
                      <Star size={16} className={form.isFeatured ? 'text-gold fill-gold' : 'text-muted-foreground'} />
                      Featured
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-4 pt-4 border-t border-border mt-2">
                    <button type="submit" disabled={saving || uploading}
                      className="flex-1 bg-gold text-background py-3 uppercase tracking-widest text-xs font-medium hover:bg-gold-light transition-colors disabled:opacity-50">
                      {saving ? 'Saving…' : editingId ? 'Update Piece' : 'Save Piece'}
                    </button>
                    <button type="button" onClick={() => setPanelOpen(false)}
                      className="px-6 border border-border text-muted-foreground hover:text-foreground text-xs uppercase tracking-widest transition-colors">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
