'use client';

import { useState, useEffect } from 'react';
import { getCategories, createCategory } from '@/utils/firebase/db';
import { toast } from '@/components/ui/Toast';

export default function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newCatName) return;
    
    try {
      const slug = newCatName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      await createCategory({
        name: newCatName,
        slug,
        description: '',
        coverImage: ''
      });
      toast('Category added', 'success');
      setNewCatName('');
      setIsAdding(false);
      fetchCategories();
    } catch (error) {
      toast('Error adding category', 'error');
    }
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-serif text-foreground">Categories</h1>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-gold text-background py-2 px-6 uppercase tracking-widest text-xs font-medium hover:bg-gold-light transition-colors"
        >
          {isAdding ? 'Cancel' : 'Add Category'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddCategory} className="mb-8 p-6 bg-muted/30 border border-gold/20 flex gap-4 items-end">
          <div className="flex flex-col gap-2 flex-1">
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Category Name</label>
            <input 
              type="text" 
              value={newCatName} 
              onChange={(e) => setNewCatName(e.target.value)}
              className="bg-transparent border-b border-border py-2 focus:outline-none focus:border-gold transition-colors text-sm"
              placeholder="e.g. Bridal Collection"
              required
            />
          </div>
          <button type="submit" className="bg-gold text-background py-2 px-6 uppercase tracking-widest text-xs font-medium h-10">Save</button>
        </form>
      )}

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
            {categories.map((cat) => (
              <tr key={cat.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                <td className="p-4 font-serif text-base">{cat.name}</td>
                <td className="p-4 text-muted-foreground">{cat.slug}</td>
                <td className="p-4 text-right">
                  <button className="text-muted-foreground hover:text-gold transition-colors text-xs uppercase tracking-widest">Edit</button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && !loading && (
              <tr>
                <td colSpan={3} className="p-12 text-center text-muted-foreground">No categories found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
