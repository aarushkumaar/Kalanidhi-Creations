'use client';

import { useState, useEffect } from 'react';
import ImageUpload from '@/components/admin/ImageUpload';
import { useRouter } from 'next/navigation';
import { createPiece, getCategories } from '@/utils/firebase/db';
import { toast } from '@/components/ui/Toast';

export default function AddPiece() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('0');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) {
      toast('Please select a category', 'error');
      return;
    }
    
    setLoading(true);
    try {
      const selectedCategory = categories.find(c => c.id === category);
      
      await createPiece({
        name: title,
        description,
        price: parseFloat(price),
        categoryId: category,
        categorySlug: selectedCategory?.slug || '',
        coverImage: image,
        images: [image],
        isFeatured: false,
        isAvailable: true,
      });

      toast('Piece added successfully', 'success');
      router.push('/admin/pieces');
      router.refresh();
    } catch (error: any) {
      toast('Error saving piece: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-serif text-foreground mb-8">Add New Piece</h1>
      
      <form onSubmit={handleSave} className="flex flex-col gap-6 bg-muted/30 p-8 border border-border">
        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase tracking-widest text-muted-foreground">Title</label>
          <input 
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            required 
            className="bg-transparent border-b border-border py-2 focus:outline-none focus:border-gold transition-colors text-sm" 
            disabled={loading}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Category</label>
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)} 
              className="bg-transparent border-b border-border py-2 focus:outline-none focus:border-gold transition-colors text-sm"
              disabled={loading}
              required
            >
              <option value="" disabled className="bg-background">Select Collection</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id} className="bg-background">{c.name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Price (₹)</label>
            <input 
              type="number" 
              value={price} 
              onChange={(e) => setPrice(e.target.value)} 
              className="bg-transparent border-b border-border py-2 focus:outline-none focus:border-gold transition-colors text-sm" 
              disabled={loading}
            />
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase tracking-widest text-muted-foreground">Description</label>
          <textarea 
            rows={4} 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            required 
            className="bg-transparent border-b border-border py-2 focus:outline-none focus:border-gold transition-colors resize-none text-sm" 
            disabled={loading}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Primary Image</label>
          <ImageUpload bucket="pieces" onUpload={setImage} currentImage={image} />
        </div>

        <div className="flex gap-4 mt-8 pt-6 border-t border-border">
          <button 
            type="submit" 
            disabled={loading || !image}
            className="bg-gold text-background py-3 px-8 uppercase tracking-widest text-xs font-medium hover:bg-gold-light transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Piece'}
          </button>
          <button 
            type="button" 
            onClick={() => router.back()} 
            className="text-muted-foreground uppercase tracking-widest text-xs hover:text-foreground transition-colors px-4"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
