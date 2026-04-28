'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { adminGetCategories, adminCreatePiece } from '@/utils/admin-api';
import { storage } from '@/utils/firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { toast } from '@/components/ui/Toast';
import { ToggleLeft, ToggleRight } from 'lucide-react';

export default function AddPiece() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('0');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [image, setImage] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    adminGetCategories().then(d => setCategories(d.categories || []));
  }, []);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    setUploading(true);
    try {
      const path = `pieces/${Date.now()}.${file.name.split('.').pop()}`;
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file, { contentType: file.type });
      const url = await getDownloadURL(storageRef);
      setImage(url);
      toast('Image uploaded', 'success');
    } catch (err: any) {
      toast('Upload failed: ' + err.message, 'error');
    } finally {
      setUploading(false);
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) { toast('Select a collection', 'error'); return; }
    setLoading(true);
    try {
      const cat = categories.find(c => c.id === categoryId);
      await adminCreatePiece({
        name: title, description,
        price: parseFloat(price),
        categoryId, categorySlug: cat?.slug || '',
        coverImage: image, images: image ? [image] : [],
        isAvailable, isFeatured,
      });
      toast('Piece saved', 'success');
      router.push('/admin/pieces');
    } catch (err: any) {
      toast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-serif text-foreground mb-8">Add New Piece</h1>
      <form onSubmit={handleSave} className="flex flex-col gap-6 bg-muted/30 p-8 border border-border">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Title *</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} required disabled={loading}
            className="bg-transparent border-b border-border py-2 focus:outline-none focus:border-gold transition-colors text-sm" />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Collection *</label>
            <select value={categoryId} onChange={e => setCategoryId(e.target.value)} required disabled={loading}
              className="bg-transparent border-b border-border py-2 focus:outline-none focus:border-gold transition-colors text-sm">
              <option value="">Select…</option>
              {categories.map(c => <option key={c.id} value={c.id} className="bg-background">{c.name}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Price (₹)</label>
            <input type="number" value={price} onChange={e => setPrice(e.target.value)} disabled={loading}
              className="bg-transparent border-b border-border py-2 focus:outline-none focus:border-gold transition-colors text-sm" />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Description</label>
          <textarea rows={4} value={description} onChange={e => setDescription(e.target.value)} disabled={loading}
            className="bg-transparent border-b border-border py-2 focus:outline-none focus:border-gold transition-colors resize-none text-sm" />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Primary Image</label>
          {image ? (
            <div className="relative w-32 h-40">
              <Image src={image} alt="Preview" fill className="object-cover" sizes="128px" />
              <button type="button" onClick={() => setImage('')}
                className="absolute -top-2 -right-2 p-1 bg-background border border-border text-xs rounded-full hover:text-red-500 transition-colors">
                ×
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full max-w-xs h-32 border-2 border-dashed border-border hover:border-gold/50 cursor-pointer transition-colors">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">{uploading ? 'Uploading…' : 'Click to upload'}</span>
              <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
            </label>
          )}
        </div>

        <div className="flex gap-6">
          <button type="button" onClick={() => setIsAvailable(v => !v)} className="flex items-center gap-2 text-xs uppercase tracking-widest">
            {isAvailable ? <ToggleRight size={20} className="text-gold" /> : <ToggleLeft size={20} className="text-muted-foreground" />}
            In Stock
          </button>
          <button type="button" onClick={() => setIsFeatured(v => !v)} className="flex items-center gap-2 text-xs uppercase tracking-widest">
            {isFeatured ? <ToggleRight size={20} className="text-gold" /> : <ToggleLeft size={20} className="text-muted-foreground" />}
            Featured
          </button>
        </div>

        <div className="flex gap-4 pt-6 border-t border-border">
          <button type="submit" disabled={loading || uploading}
            className="bg-gold text-background py-3 px-8 uppercase tracking-widest text-xs font-medium hover:bg-gold-light transition-colors disabled:opacity-50">
            {loading ? 'Saving…' : 'Save Piece'}
          </button>
          <button type="button" onClick={() => router.back()}
            className="text-muted-foreground uppercase tracking-widest text-xs hover:text-foreground transition-colors px-4">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
