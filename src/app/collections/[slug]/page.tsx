import SectionLabel from '@/components/ui/SectionLabel';
import ProductCard from '@/components/ui/ProductCard';
import { getCategoryBySlug, getPiecesByCategory } from '@/utils/firebase/db';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const category = await getCategoryBySlug(params.slug) as any;

  if (!category) {
    notFound();
  }

  const pieces = await getPiecesByCategory(category.id) as any[];

  return (
    <div className="min-h-screen py-32 px-6 md:px-12 max-w-7xl mx-auto">
      <div className="mb-20">
        <SectionLabel text="Collection" />
        <h1 className="text-5xl md:text-7xl font-serif text-gold mb-4 mt-4 leading-tight">{category.name}</h1>
        {category.description && (
          <p className="text-muted-foreground max-w-xl leading-relaxed mt-4">{category.description}</p>
        )}
      </div>

      {pieces.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 w-full">
          {pieces.map((piece, i) => (
            <ProductCard
              key={piece.id}
              id={piece.id}
              name={piece.name}
              price={piece.price}
              imageUrl={piece.coverImage}
              category={category.name}
              inStock={piece.isAvailable !== false}
              index={i}
            />
          ))}
        </div>
      ) : (
        <div className="py-24 text-center border border-dashed border-border">
          <p className="text-muted-foreground uppercase tracking-widest text-xs">
            No pieces in this collection yet.
          </p>
        </div>
      )}
    </div>
  );
}
