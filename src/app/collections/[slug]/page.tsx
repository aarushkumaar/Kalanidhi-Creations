import Link from 'next/link';
import SectionLabel from '@/components/ui/SectionLabel';
import { getCategoryBySlug, getPiecesByCategory } from '@/utils/firebase/db';
import { notFound } from 'next/navigation';

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const category = await getCategoryBySlug(params.slug) as any;
  
  if (!category) {
    notFound();
  }

  const pieces = await getPiecesByCategory(category.id) as any[];

  return (
    <div className="min-h-screen py-32 px-6 md:px-12 max-w-7xl mx-auto">
      <SectionLabel text="Collection" />
      <h1 className="text-5xl md:text-7xl font-serif text-gold mb-12 mt-4">{category.name}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
        {pieces.map((piece) => (
          <Link href={`/pieces/${piece.id}`} key={piece.id} className="group flex flex-col items-start cursor-pointer">
            <div className="w-full aspect-[3/4] bg-muted relative mb-6 overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 opacity-60 pointer-events-none" />
               {piece.coverImage ? (
                  <img src={piece.coverImage} alt={piece.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
               ) : (
                  <div className="w-full h-full bg-muted-foreground/10 animate-pulse transition-transform duration-700 group-hover:scale-105" />
               )}
            </div>
            <p className="text-gold text-xs uppercase tracking-widest">{category.name}</p>
            <h2 className="text-xl font-serif text-foreground group-hover:text-gold transition-colors mt-2">{piece.name}</h2>
          </Link>
        ))}
        {pieces.length === 0 && (
          <p className="text-muted-foreground col-span-3 py-12">No pieces found in this collection.</p>
        )}
      </div>
    </div>
  );
}
