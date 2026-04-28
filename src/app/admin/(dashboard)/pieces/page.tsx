'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { adminGetPieces, adminDeletePiece } from '@/utils/admin-api';
import { toast } from '@/components/ui/Toast';
import { Pencil, Trash2 } from 'lucide-react';

export default function AdminPieces() {
  const [pieces, setPieces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await adminGetPieces();
      setPieces(data.pieces || []);
    } catch (err: any) {
      toast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await adminDeletePiece(id);
      toast('Piece deleted', 'success');
      load();
    } catch (err: any) {
      toast(err.message, 'error');
    }
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-serif text-foreground">Pieces</h1>
        <Link
          href="/admin/pieces/new"
          className="bg-gold text-background py-2 px-6 uppercase tracking-widest text-xs font-medium hover:bg-gold-light transition-colors"
        >
          Add New Piece
        </Link>
      </div>

      <div className="bg-background border border-border overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted text-muted-foreground uppercase tracking-widest text-xs">
            <tr>
              <th className="p-4 font-normal">Piece</th>
              <th className="p-4 font-normal">Collection</th>
              <th className="p-4 font-normal">Price</th>
              <th className="p-4 font-normal">Status</th>
              <th className="p-4 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pieces.map((piece) => (
              <tr key={piece.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                <td className="p-4 flex gap-4 items-center">
                  <div className="w-10 h-14 bg-muted relative overflow-hidden flex-shrink-0">
                    {piece.coverImage && (
                      <Image src={piece.coverImage} alt={piece.name} fill className="object-cover" sizes="40px" />
                    )}
                  </div>
                  <span className="font-serif text-base">{piece.name}</span>
                </td>
                <td className="p-4 text-muted-foreground text-xs uppercase tracking-widest">
                  {piece.categorySlug?.replace(/-/g, ' ')}
                </td>
                <td className="p-4 text-gold">
                  ₹{Number(piece.price || 0).toLocaleString('en-IN')}
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    {piece.isFeatured && (
                      <span className="text-gold border border-gold/30 px-2 py-0.5 text-[10px] uppercase tracking-widest">Featured</span>
                    )}
                    {piece.isAvailable === false && (
                      <span className="text-muted-foreground border border-border px-2 py-0.5 text-[10px] uppercase tracking-widest">Sold Out</span>
                    )}
                  </div>
                </td>
                <td className="p-4 text-right">
                  <div className="flex gap-3 justify-end">
                    <Link
                      href={`/admin/pieces/${piece.id}`}
                      className="text-muted-foreground hover:text-gold transition-colors"
                      title="Edit"
                    >
                      <Pencil size={14} />
                    </Link>
                    <button
                      onClick={() => handleDelete(piece.id, piece.name)}
                      className="text-muted-foreground hover:text-red-500 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {pieces.length === 0 && !loading && (
              <tr>
                <td colSpan={5} className="p-12 text-center text-muted-foreground uppercase tracking-widest text-xs">
                  No pieces found.
                </td>
              </tr>
            )}
            {loading && (
              <tr>
                <td colSpan={5} className="p-12 text-center">
                  <div className="w-6 h-6 border-2 border-gold/20 border-t-gold rounded-full animate-spin mx-auto" />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
