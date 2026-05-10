'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import SectionLabel from '@/components/ui/SectionLabel';
import ProductCard from '@/components/ui/ProductCard';
import { getCategoryBySlug, getPiecesByCategory } from '@/utils/firebase/db';

function withTimeout<T>(p: Promise<T>, ms = 3000, fallback: T): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>(resolve => setTimeout(() => resolve(fallback), ms)),
  ]);
}

// Skeleton loader
function Skeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 w-full">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-4">
          <div className="w-full aspect-[3/4] skeleton" />
          <div className="h-5 w-2/3 skeleton" />
          <div className="h-4 w-1/3 skeleton" />
        </div>
      ))}
    </div>
  );
}

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<any>(null);
  const [pieces, setPieces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;

    async function load() {
      try {
        const cat = await withTimeout(getCategoryBySlug(slug), 3000, null);
        if (!cat) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        setCategory(cat);

        const items = await withTimeout(
          getPiecesByCategory((cat as any).id, slug).catch(() => []),
          3000,
          []
        );
        setPieces(items as any[]);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen py-32 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="mb-20">
          <div className="h-3 w-24 skeleton mb-6" />
          <div className="h-16 w-1/2 skeleton mb-4" />
          <div className="h-4 w-80 skeleton" />
        </div>
        <Skeleton />
      </div>
    );
  }

  if (notFound || !category) {
    return (
      <div className="min-h-screen py-32 px-6 md:px-12 max-w-7xl mx-auto flex flex-col items-center justify-center">
        <h1 className="text-4xl font-serif text-gold mb-4">Collection Not Found</h1>
        <p className="text-muted-foreground">This collection doesn&apos;t exist or could not be loaded.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-32 px-6 md:px-12 max-w-7xl mx-auto">
      <div className="mb-20">
        <SectionLabel text="Collection" />
        <h1 className="text-5xl md:text-7xl font-serif text-gold mb-4 mt-4 leading-tight">
          {category.name}
        </h1>
        {category.description && (
          <p className="text-muted-foreground max-w-xl leading-relaxed mt-4">
            {category.description}
          </p>
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
              imageUrl={piece.coverImage || piece.imageUrl || piece.images?.[0] || ''}
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
