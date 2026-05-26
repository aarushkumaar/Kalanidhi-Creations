'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, Trash2, Plus, X, ToggleLeft, ToggleRight, Star, Upload, GripVertical } from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import Cropper from 'react-easy-crop';
import {
  adminGetPieces, adminCreatePiece, adminUpdatePiece, adminDeletePiece,
  adminGetCategories, adminCreateCategory, adminDeleteCategory, adminUpdateCategory,
} from '@/utils/admin-api';

/* ═══════════════════════════════════════════════════════════════════════════
   IMAGE UTILITIES
═══════════════════════════════════════════════════════════════════════════ */

async function compressImage(file: File, maxDim = 1200, quality = 0.82): Promise<Blob> {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ratio = Math.min(maxDim / img.width, maxDim / img.height, 1);
      canvas.width = Math.round(img.width * ratio);
      canvas.height = Math.round(img.height * ratio);
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(blob => resolve(blob!), 'image/jpeg', quality);
    };
    img.src = URL.createObjectURL(file);
  });
}

async function getCroppedImg(imageSrc: string, crop: { x: number; y: number; width: number; height: number }): Promise<Blob> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = imageSrc;
  });
  const canvas = document.createElement('canvas');
  canvas.width = crop.width;
  canvas.height = crop.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);
  return new Promise(resolve => canvas.toBlob(blob => resolve(blob!), 'image/jpeg', 0.92));
}

async function uploadToCloudinary(blob: Blob, folder: string): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;
  const fd = new FormData();
  fd.append('file', blob, `image_${Date.now()}.jpg`);
  fd.append('upload_preset', uploadPreset);
  fd.append('folder', folder);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: fd });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || 'Upload failed');
  return data.secure_url as string;
}

/* ═══════════════════════════════════════════════════════════════════════════
   CROP MODAL
═══════════════════════════════════════════════════════════════════════════ */

type CropAspect = 'portrait' | 'square' | 'free';

interface CropModalProps {
  files: File[];
  currentIndex: number;
  onComplete: (blob: Blob, index: number) => void;
  onSkip: (index: number) => void;
  onCancel: () => void;
}

function CropModal({ files, currentIndex, onComplete, onSkip, onCancel }: CropModalProps) {
  const file = files[currentIndex];
  const [imageSrc, setImageSrc] = useState('');
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState<CropAspect>('portrait');
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImageSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const aspectRatios: Record<CropAspect, number | undefined> = {
    portrait: 3 / 4,
    square: 1,
    free: undefined,
  };

  const handleCropAndUpload = async () => {
    if (!croppedAreaPixels || !imageSrc) return;
    setProcessing(true);
    try {
      const cropped = await getCroppedImg(imageSrc, croppedAreaPixels);
      const compressed = await compressImage(new File([cropped], 'crop.jpg', { type: 'image/jpeg' }));
      onComplete(compressed, currentIndex);
    } catch (e: any) {
      toast('Crop failed: ' + e.message, 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleSkip = async () => {
    const compressed = await compressImage(file);
    onSkip(currentIndex);
    // pass compressed blob back via onComplete
    onComplete(compressed, currentIndex);
  };

  if (!imageSrc) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, zIndex: 700, background: 'rgba(0,0,0,0.92)', display: 'flex', flexDirection: 'column' }}
    >
      {/* Header */}
      <div style={{ padding: '20px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond',serif", color: 'white', fontSize: '1.4rem', fontWeight: 300 }}>
          Crop Image {files.length > 1 ? `(${currentIndex + 1} of ${files.length})` : ''}
        </h2>
        <button onClick={onCancel} style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer' }}>
          <X size={24} />
        </button>
      </div>

      {/* Aspect ratio selector */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 16, paddingBottom: 16 }}>
        {(['portrait', 'square', 'free'] as CropAspect[]).map(a => (
          <button key={a} onClick={() => setAspect(a)} style={{
            padding: '6px 16px', fontSize: '0.72rem', letterSpacing: '0.15em',
            textTransform: 'uppercase', fontFamily: "'DM Sans',sans-serif",
            border: `1px solid ${aspect === a ? '#C9A84C' : 'rgba(255,255,255,0.3)'}`,
            background: aspect === a ? '#C9A84C' : 'transparent',
            color: aspect === a ? '#fff' : 'rgba(255,255,255,0.7)', cursor: 'pointer',
          }}>
            {a === 'portrait' ? 'Portrait 3:4' : a === 'square' ? 'Square 1:1' : 'Free form'}
          </button>
        ))}
      </div>

      {/* Crop area */}
      <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={aspectRatios[aspect]}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)}
        />
      </div>

      {/* Zoom slider */}
      <div style={{ padding: '12px 40px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', letterSpacing: '0.1em' }}>Zoom</span>
        <input type="range" min={1} max={3} step={0.01} value={zoom}
          onChange={e => setZoom(Number(e.target.value))}
          style={{ flex: 1, accentColor: '#C9A84C' }}
        />
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 28px 28px', gap: 16 }}>
        <button onClick={handleSkip} disabled={processing} style={{
          padding: '12px 28px', border: '1px solid rgba(255,255,255,0.4)',
          color: 'white', background: 'transparent', cursor: 'pointer',
          fontSize: '0.8rem', letterSpacing: '0.15em', textTransform: 'uppercase',
          fontFamily: "'DM Sans',sans-serif",
          opacity: processing ? 0.5 : 1,
        }}>
          Skip Crop
        </button>
        <button onClick={handleCropAndUpload} disabled={processing} style={{
          padding: '12px 32px', background: '#C9A84C', border: 'none',
          color: 'white', cursor: 'pointer',
          fontSize: '0.8rem', letterSpacing: '0.15em', textTransform: 'uppercase',
          fontFamily: "'DM Sans',sans-serif",
          opacity: processing ? 0.7 : 1,
        }}>
          {processing ? 'Processing…' : 'Crop & Upload'}
        </button>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MULTI-IMAGE GALLERY (for piece edit)
═══════════════════════════════════════════════════════════════════════════ */

interface ImageGalleryProps {
  images: string[];
  uploading: boolean;
  uploadProgress: Record<number, number>;
  onRemove: (idx: number) => void;
  onReorder: (from: number, to: number) => void;
  onAddFiles: (files: FileList) => void;
}

function ImageGallery({ images, uploading, uploadProgress, onRemove, onReorder, onAddFiles }: ImageGalleryProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);
  const [dragSrc, setDragSrc] = useState<number | null>(null);

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 12 }}>
        {images.map((img, i) => (
          <div key={img + i}
            draggable
            onDragStart={() => setDragSrc(i)}
            onDragOver={e => { e.preventDefault(); setDragOver(i); }}
            onDrop={e => { e.preventDefault(); if (dragSrc !== null && dragSrc !== i) onReorder(dragSrc, i); setDragSrc(null); setDragOver(null); }}
            onDragEnd={() => { setDragSrc(null); setDragOver(null); }}
            style={{
              position: 'relative', aspectRatio: '1', background: '#F2D9D0',
              border: dragOver === i ? '2px solid #C9A84C' : '2px solid transparent',
              cursor: 'grab', transition: 'border-color 0.2s',
            }}
            className="group"
          >
            <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            {/* Cover badge */}
            {i === 0 && (
              <span style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                background: 'rgba(201,168,76,0.9)', color: 'white',
                fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase',
                textAlign: 'center', padding: '3px 0',
              }}>Cover</span>
            )}
            {/* Remove button */}
            <button
              type="button"
              onClick={() => onRemove(i)}
              style={{
                position: 'absolute', top: 4, right: 4,
                background: 'rgba(0,0,0,0.6)', color: 'white',
                border: 'none', borderRadius: '50%', width: 22, height: 22,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', opacity: 0, transition: 'opacity 0.2s',
              }}
              className="group-hover:opacity-100"
            >
              <X size={12} />
            </button>
            {/* Drag handle */}
            <div style={{
              position: 'absolute', top: 4, left: 4, color: 'white',
              opacity: 0, transition: 'opacity 0.2s',
            }} className="group-hover:opacity-70">
              <GripVertical size={14} />
            </div>
            {/* Upload progress bar */}
            {uploadProgress[i] !== undefined && uploadProgress[i] < 100 && (
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
                background: 'rgba(0,0,0,0.2)',
              }}>
                <div style={{ height: '100%', width: `${uploadProgress[i]}%`, background: '#C9A84C', transition: 'width 0.3s' }} />
              </div>
            )}
          </div>
        ))}

        {/* Add more button */}
        {images.length < 10 && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            style={{
              aspectRatio: '1', border: '2px dashed rgba(200,165,90,0.4)',
              background: 'transparent', cursor: 'pointer', display: 'flex',
              flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 4, color: '#C9A84C', transition: 'border-color 0.2s',
              opacity: uploading ? 0.5 : 1,
            }}
          >
            <Plus size={20} />
            <span style={{ fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              {uploading ? 'Uploading…' : 'Add'}
            </span>
          </button>
        )}
      </div>

      <p style={{ fontSize: '0.7rem', color: '#9b8e86', fontStyle: 'italic', fontFamily: "'DM Sans',sans-serif" }}>
        First image is the cover. Drag to reorder. Max 10 images, 5MB each.
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={e => { if (e.target.files) { onAddFiles(e.target.files); e.target.value = ''; } }}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN ADMIN DASHBOARD
═══════════════════════════════════════════════════════════════════════════ */

const emptyForm = {
  name: '', description: '', price: '', categoryId: '', categorySlug: '',
  coverImage: '', images: [] as string[], isAvailable: true, isFeatured: false,
};

export default function AdminDashboard() {
  const [pieces, setPieces] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);

  // Multi-image upload state
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<number, number>>({});
  const [cropFiles, setCropFiles] = useState<File[]>([]);
  const [cropIndex, setCropIndex] = useState(0);
  const [cropBlobQueue, setCropBlobQueue] = useState<Blob[]>([]);

  // Category panel state
  const [catPanelOpen, setCatPanelOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [catSaving, setCatSaving] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [catCoverUploading, setCatCoverUploading] = useState(false);
  const [catForm, setCatForm] = useState({ name: '', coverImage: '' });

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
    const imgs: string[] = [];
    if (piece.coverImage) imgs.push(piece.coverImage);
    (piece.images || []).forEach((img: string) => { if (img && !imgs.includes(img)) imgs.push(img); });
    setForm({
      name: piece.name || '',
      description: piece.description || '',
      price: String(piece.price || ''),
      categoryId: piece.categoryId || '',
      categorySlug: piece.categorySlug || '',
      coverImage: piece.coverImage || '',
      images: imgs,
      isAvailable: piece.isAvailable !== false,
      isFeatured: piece.isFeatured === true,
    });
    setPanelOpen(true);
  }

  /* ── Multi-image upload pipeline ── */
  function handleAddFiles(fileList: FileList) {
    const files = Array.from(fileList).slice(0, 10 - form.images.length);
    const oversized = files.filter(f => f.size > 5 * 1024 * 1024);
    if (oversized.length) {
      toast(`${oversized.length} file(s) exceed 5MB limit`, 'error');
    }
    const valid = files.filter(f => f.size <= 5 * 1024 * 1024);
    if (!valid.length) return;
    setCropFiles(valid);
    setCropIndex(0);
    setCropBlobQueue([]);
  }

  function handleCropComplete(blob: Blob, idx: number) {
    const newQueue = [...cropBlobQueue, blob];
    setCropBlobQueue(newQueue);
    if (idx + 1 < cropFiles.length) {
      setCropIndex(idx + 1);
    } else {
      // All files processed — upload them
      setCropFiles([]);
      uploadBlobs(newQueue);
    }
  }

  function handleCropCancel() {
    setCropFiles([]);
    setCropBlobQueue([]);
    setCropIndex(0);
  }

  async function uploadBlobs(blobs: Blob[]) {
    setUploading(true);
    const folder = editingId ? `kalanidhi/pieces/${editingId}` : 'kalanidhi/pieces';
    const urls: string[] = [];
    // Upload max 3 at a time
    for (let i = 0; i < blobs.length; i += 3) {
      const batch = blobs.slice(i, i + 3);
      const results = await Promise.all(
        batch.map(async (blob, j) => {
          const globalIdx = i + j;
          setUploadProgress(p => ({ ...p, [form.images.length + globalIdx]: 30 }));
          const url = await uploadToCloudinary(blob, folder);
          setUploadProgress(p => ({ ...p, [form.images.length + globalIdx]: 100 }));
          return url;
        })
      );
      urls.push(...results);
    }
    const newImages = [...form.images, ...urls];
    setForm(f => ({ ...f, images: newImages, coverImage: newImages[0] || f.coverImage }));
    setUploadProgress({});
    setUploading(false);
    toast(`${urls.length} image${urls.length > 1 ? 's' : ''} uploaded`, 'success');
  }

  function handleRemoveImage(idx: number) {
    const updated = form.images.filter((_, i) => i !== idx);
    setForm(f => ({ ...f, images: updated, coverImage: updated[0] || '' }));
  }

  function handleReorderImage(from: number, to: number) {
    const updated = [...form.images];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    setForm(f => ({ ...f, images: updated, coverImage: updated[0] || '' }));
  }

  /* ── Save piece ── */
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const cat = categories.find(c => c.id === form.categoryId);
      const payload = {
        name: form.name, description: form.description,
        price: parseFloat(form.price) || 0,
        categoryId: form.categoryId, categorySlug: cat?.slug || '',
        coverImage: form.images[0] || form.coverImage,
        images: form.images.length > 0 ? form.images : (form.coverImage ? [form.coverImage] : []),
        isAvailable: form.isAvailable, isFeatured: form.isFeatured,
      };
      if (editingId) { await adminUpdatePiece(editingId, payload); toast('Piece updated', 'success'); }
      else { await adminCreatePiece(payload); toast('Piece added', 'success'); }
      setPanelOpen(false);
      load();
    } catch (err: any) { toast(err.message, 'error'); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try { await adminDeletePiece(id); toast('Piece deleted', 'success'); load(); }
    catch (err: any) { toast(err.message, 'error'); }
  }

  /* ── Category cover image upload ── */
  async function handleCatCoverUpload(e: React.ChangeEvent<HTMLInputElement>, catId?: string) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast('File too large. Max 5MB.', 'error'); return; }
    setCatCoverUploading(true);
    try {
      const compressed = await compressImage(file);
      const url = await uploadToCloudinary(compressed, 'kalanidhi/categories');
      if (catId) {
        await adminUpdateCategory(catId, { coverImage: url });
        toast('Cover image updated', 'success');
        load();
      } else {
        setCatForm(f => ({ ...f, coverImage: url }));
        toast('Cover image uploaded', 'success');
      }
    } catch (err: any) { toast('Upload failed: ' + err.message, 'error'); }
    finally { setCatCoverUploading(false); }
  }

  /* ── Add category ── */
  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!catForm.name.trim()) return;
    setCatSaving(true);
    try {
      await adminCreateCategory({ name: catForm.name.trim(), description: '', coverImage: catForm.coverImage });
      toast('Collection created', 'success');
      setCatForm({ name: '', coverImage: '' });
      setCatPanelOpen(false);
      load();
    } catch (err: any) { toast(err.message, 'error'); }
    finally { setCatSaving(false); }
  }

  async function handleDeleteCategory(id: string, name: string) {
    if (!confirm(`Delete collection "${name}"?`)) return;
    try { await adminDeleteCategory(id); toast('Collection deleted', 'success'); load(); }
    catch (err: any) { toast(err.message, 'error'); }
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
          <button onClick={openAdd}
            className="flex items-center gap-2 bg-gold text-background py-2.5 px-6 uppercase tracking-widest text-xs font-medium hover:bg-gold-light transition-colors">
            <Plus size={14} /> Add Piece
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="aspect-[3/4] skeleton" />)}
          </div>
        ) : pieces.length === 0 ? (
          <div className="border border-dashed border-border py-24 text-center text-muted-foreground">
            <p className="text-sm uppercase tracking-widest">No pieces yet. Add your first piece.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pieces.map(piece => (
              <motion.div key={piece.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="group relative bg-background border border-border hover:border-gold/40 transition-colors duration-300">
                <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                  {(piece.coverImage || piece.images?.[0]) ? (
                    <img src={piece.coverImage || piece.images?.[0]} alt={piece.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground text-xs uppercase tracking-widest">No image</div>
                  )}
                  {/* Image count badge */}
                  {piece.images?.length > 1 && (
                    <span className="absolute top-3 right-3 bg-background/80 text-foreground text-[10px] px-2 py-0.5 backdrop-blur-sm">
                      {piece.images.length} photos
                    </span>
                  )}
                  <div className="absolute top-3 left-3 flex flex-col gap-1">
                    {piece.isFeatured && <span className="bg-gold text-background text-[10px] uppercase tracking-widest px-2 py-0.5">Featured</span>}
                    {piece.isAvailable === false && <span className="bg-foreground text-background text-[10px] uppercase tracking-widest px-2 py-0.5">Sold Out</span>}
                  </div>
                  <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/30 transition-all duration-300 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                    <button onClick={() => openEdit(piece)} className="p-2 bg-background text-foreground hover:text-gold transition-colors shadow-sm"><Pencil size={16} /></button>
                    <button onClick={() => handleDelete(piece.id, piece.name)} className="p-2 bg-background text-foreground hover:text-red-500 transition-colors shadow-sm"><Trash2 size={16} /></button>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">{piece.categorySlug?.replace(/-/g, ' ')}</p>
                  <h3 className="font-serif text-lg leading-tight">{piece.name}</h3>
                  <p className="text-gold text-sm mt-1">₹{Number(piece.price || 0).toLocaleString('en-IN')}</p>
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
            <p className="text-xs text-muted-foreground uppercase tracking-[0.15em] mt-1">Manage categories and cover images</p>
          </div>
          <button onClick={() => setCatPanelOpen(v => !v)}
            className="flex items-center gap-2 border border-gold text-gold py-2.5 px-6 uppercase tracking-widest text-xs font-medium hover:bg-gold hover:text-background transition-colors">
            <Plus size={14} /> New Collection
          </button>
        </div>

        {/* New category form */}
        <AnimatePresence>
          {catPanelOpen && (
            <motion.form initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              onSubmit={handleAddCategory}
              className="mb-6 p-6 bg-muted/30 border border-gold/20 overflow-hidden">
              <div className="flex gap-4 items-start flex-wrap">
                <div className="flex flex-col gap-2 flex-1 min-w-48">
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Collection Name *</label>
                  <input type="text" value={catForm.name} onChange={e => setCatForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Bridal Heirlooms" required
                    className="bg-transparent border-b border-border py-2 text-sm focus:outline-none focus:border-gold transition-colors" />
                </div>
                {/* Cover image upload */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Cover Image</label>
                  {catForm.coverImage ? (
                    <div className="relative w-20 h-24">
                      <img src={catForm.coverImage} alt="" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setCatForm(f => ({ ...f, coverImage: '' }))}
                        className="absolute -top-2 -right-2 p-1 bg-background border border-border rounded-full hover:text-red-500">
                        <X size={10} />
                      </button>
                    </div>
                  ) : (
                    <label className="w-20 h-24 border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-gold/50 transition-colors">
                      {catCoverUploading ? (
                        <span className="text-[8px] text-center text-muted-foreground">Uploading…</span>
                      ) : (
                        <Upload size={16} className="text-muted-foreground" />
                      )}
                      <input type="file" accept="image/*" className="hidden" disabled={catCoverUploading}
                        onChange={e => handleCatCoverUpload(e)} />
                    </label>
                  )}
                </div>
                <button type="submit" disabled={catSaving}
                  className="bg-gold text-background py-2 px-6 uppercase tracking-widest text-xs font-medium h-10 disabled:opacity-50 self-end">
                  {catSaving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(cat => (
            <div key={cat.id} className="border border-border hover:border-gold/40 transition-colors overflow-hidden">
              {/* Cover image */}
              <div className="relative h-32 bg-muted group/cover">
                {cat.coverImage ? (
                  <img src={cat.coverImage} alt={cat.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs uppercase tracking-widest">No cover</div>
                )}
                {/* Upload cover overlay */}
                <label className="absolute inset-0 bg-black/0 group-hover/cover:bg-black/40 transition-colors flex items-center justify-center cursor-pointer opacity-0 group-hover/cover:opacity-100">
                  <span className="bg-background/80 text-foreground text-[10px] uppercase tracking-widest px-3 py-1.5 backdrop-blur-sm flex items-center gap-1">
                    <Upload size={10} /> {catCoverUploading ? 'Uploading…' : 'Change Image'}
                  </span>
                  <input type="file" accept="image/*" className="hidden" disabled={catCoverUploading}
                    onChange={e => handleCatCoverUpload(e, cat.id)} />
                </label>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-serif text-base">{cat.name}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">{cat.slug}</p>
                </div>
                <button onClick={() => handleDeleteCategory(cat.id, cat.name)} className="text-muted-foreground hover:text-red-500 transition-colors p-1">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          {categories.length === 0 && !loading && (
            <p className="col-span-3 text-center py-12 text-muted-foreground text-sm uppercase tracking-widest">No collections yet.</p>
          )}
        </div>
      </section>

      {/* ── PIECE SLIDE-IN PANEL ── */}
      <AnimatePresence>
        {panelOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setPanelOpen(false)}
              className="fixed inset-0 bg-foreground/40 z-[999] backdrop-blur-sm" />
            <motion.aside initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 250 }}
              className="fixed right-0 top-0 h-full w-full max-w-lg bg-background border-l border-border z-[1000] overflow-y-auto">
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-serif">{editingId ? 'Edit Piece' : 'Add New Piece'}</h2>
                  <button onClick={() => setPanelOpen(false)} className="p-2 hover:text-gold transition-colors"><X size={20} /></button>
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
                      <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Price (₹)</label>
                      <input type="number" min="0" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
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
                    <textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      className="bg-transparent border-b border-border py-2 text-sm focus:outline-none focus:border-gold transition-colors resize-none" />
                  </div>

                  {/* Multi-image gallery */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      Images ({form.images.length}/10)
                    </label>
                    <ImageGallery
                      images={form.images}
                      uploading={uploading}
                      uploadProgress={uploadProgress}
                      onRemove={handleRemoveImage}
                      onReorder={handleReorderImage}
                      onAddFiles={handleAddFiles}
                    />
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

      {/* ── CROP MODAL ── */}
      <AnimatePresence>
        {cropFiles.length > 0 && (
          <CropModal
            files={cropFiles}
            currentIndex={cropIndex}
            onComplete={handleCropComplete}
            onSkip={(idx) => {
              // skip means use original file compressed — handled in handleCropComplete
            }}
            onCancel={handleCropCancel}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
