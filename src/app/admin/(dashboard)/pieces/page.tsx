import Link from 'next/link';
import { getAllPieces } from '@/utils/firebase/db';

export default async function AdminPieces() {
  const pieces = await getAllPieces() as any[];

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-serif text-foreground">Pieces</h1>
        <Link href="/admin/pieces/new" className="bg-gold text-background py-2 px-6 uppercase tracking-widest text-xs font-medium hover:bg-gold-light transition-colors">
          Add New Piece
        </Link>
      </div>

      <div className="bg-background border border-border overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted text-muted-foreground uppercase tracking-widest text-xs">
            <tr>
              <th className="p-4 font-normal">Piece</th>
              <th className="p-4 font-normal">Category</th>
              <th className="p-4 font-normal">Status</th>
              <th className="p-4 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pieces.map((piece) => (
              <tr key={piece.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                <td className="p-4 flex gap-4 items-center">
                  <div className="w-12 h-16 bg-muted relative overflow-hidden">
                    {piece.coverImage && <img src={piece.coverImage} alt={piece.name} className="w-full h-full object-cover" />}
                  </div>
                  <span className="font-serif text-base">{piece.name}</span>
                </td>
                <td className="p-4 text-muted-foreground">{piece.categorySlug?.replace('-', ' ')}</td>
                <td className="p-4">
                  <div className="flex gap-2">
                    {piece.isFeatured && <span className="text-gold border border-gold/30 px-2 py-1 text-[10px] uppercase tracking-widest">Featured</span>}
                    {!piece.isAvailable && <span className="text-red-500 border border-red-500/30 px-2 py-1 text-[10px] uppercase tracking-widest">Out of Stock</span>}
                  </div>
                </td>
                <td className="p-4 text-right">
                  <Link href={`/admin/pieces/${piece.id}`} className="text-muted-foreground hover:text-gold transition-colors text-xs uppercase tracking-widest">Edit</Link>
                </td>
              </tr>
            ))}
            {pieces.length === 0 && (
              <tr>
                <td colSpan={4} className="p-12 text-center text-muted-foreground">No pieces found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
