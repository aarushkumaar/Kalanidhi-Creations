'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { adminGetCategories, adminCreatePiece } from '@/utils/admin-api';
import { toast } from '@/components/ui/Toast';
import { ToggleLeft, ToggleRight } from 'lucide-react';
import ImageUpload from '@/components/admin/ImageUpload';

export default function AddPiece() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('0');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [coverImage, setCoverImage] = useState('');
  const [allImages, setAllImages] = useState<string[]>([]);
  const [isAvailable, setIsAvailable] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    adminGetCategories().then(d => setCategories(d.categories || []));
  }, []);

  // Called when ImageUpload finishes uploading (multi-file mode)
  function handleImagesUploaded(urls: string[]) {
    setAllImages(prev => {
      const merged = [...prev, ...urls.filter(u => !prev.includes(u))];
      if (!coverImage && merged.length > 0) setCoverImage(merged[0]);
      return merged;
    });
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) { toast('Select a collection', 'error'); return; }
    if (!coverImage) { toast('Upload at least one image', 'error'); return; }
    setLoading(true);
    try {
      const cat = categories.find(c => c.id === categoryId);
      await adminCreatePiece({
        name: title,
        description,
        price: parseFloat(price),
        categoryId,
        categorySlug: cat?.slug || '',
        coverImage,
        images: allImages.length ? allImages : [coverImage],
        isAvailable,
        isFeatured,
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

        {/* ── Images — Cloudinary multi-upload ── */}
        <div className="flex flex-col gap-3">
          <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Images (up to 20) *
          </label>

          {/* Cover image selector */}
          {allImages.length > 1 && (
            <div>
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-2">
                Cover image (click to set)
              </p>
              <div className="flex flex-wrap gap-3">
                {allImages.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCoverImage(url)}
                    className={`relative w-20 aspect-[3/4] overflow-hidden border-2 transition-colors ${
                      url === coverImage ? 'border-gold' : 'border-transparent hover:border-gold/40'
                    }`}
                  >
                    <Image src={url} alt={`Image ${i + 1}`} fill className="object-cover" sizes="80px" />
                    {url === coverImage && (
                      <span className="absolute bottom-0 inset-x-0 bg-gold text-background text-[8px] uppercase tracking-wider text-center py-0.5">
                        Cover
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Single cover preview when only 1 image */}
          {allImages.length === 1 && (
            <div className="relative w-24 aspect-[3/4] overflow-hidden border border-gold/30">
              <Image src={allImages[0]} alt="Cover" fill className="object-cover" sizes="96px" />
              <button
                type="button"
                onClick={() => { setAllImages([]); setCoverImage(''); }}
                className="absolute -top-2 -right-2 w-5 h-5 bg-background border border-border rounded-full flex items-center justify-center text-xs hover:text-red-500 transition-colors"
              >
                ×
              </button>
            </div>
          )}

          <ImageUpload
            onUploadMultiple={handleImagesUploaded}
            onUpload={(url) => { if (!coverImage) setCoverImage(url); }}
            maxFiles={20}
            label="Click or drag images to upload"
          />
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
          <button type="submit" disabled={loading}
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
