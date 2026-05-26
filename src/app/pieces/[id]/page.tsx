'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import SectionLabel from '@/components/ui/SectionLabel';
import Link from 'next/link';
import { getPieceById } from '@/utils/firebase/db';

function withTimeout<T>(p: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>(resolve => setTimeout(() => resolve(fallback), ms)),
  ]);
}

export default function PiecePage() {
  const { id } = useParams<{ id: string }>();
  const [piece, setPiece] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    withTimeout(getPieceById(id).catch(() => null), 5000, null)
      .then(data => {
        if (!data) setNotFound(true);
        else setPiece(data);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto flex flex-col md:flex-row gap-16">
        {/* Image skeleton */}
        <div className="w-full md:w-1/2">
          <div className="w-full aspect-[3/4] skeleton" />
        </div>
        {/* Details skeleton */}
        <div className="w-full md:w-1/2 flex flex-col gap-6">
          <div className="h-3 w-24 skeleton" />
          <div className="h-12 w-3/4 skeleton" />
          <div className="h-8 w-32 skeleton" />
          <div className="h-4 w-full skeleton" />
          <div className="h-4 w-5/6 skeleton" />
          <div className="h-4 w-4/6 skeleton" />
        </div>
      </div>
    );
  }

  if (notFound || !piece) {
    return (
      <div className="min-h-screen pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl font-serif text-gold mb-4">Piece Not Found</h1>
        <p className="text-muted-foreground mb-8">This piece doesn&apos;t exist or could not be loaded.</p>
        <Link href="/collections" className="text-xs uppercase tracking-[0.25em] border-b border-gold pb-1 hover:text-gold transition-colors">
          Browse Collections
        </Link>
      </div>
    );
  }

  const formattedPrice = piece.price && piece.price > 0
    ? `₹${Number(piece.price).toLocaleString('en-IN')}`
    : 'Price on Request';

  const imgSrc = piece.coverImage || piece.imageUrl || piece.images?.[0] || '';
  const extraImages: string[] = (piece.images || []).filter((img: string) => img && img !== imgSrc).slice(0, 2);

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto flex flex-col md:flex-row gap-16">
      {/* Images */}
      <div className="w-full md:w-1/2">
        <div className="w-full aspect-[3/4] bg-muted relative mb-4 overflow-hidden">
          {imgSrc ? (
            <img
              src={imgSrc}
              alt={piece.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full skeleton" />
          )}
        </div>
        {extraImages.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            {extraImages.map((imgUrl: string, idx: number) => (
              <div key={idx} className="aspect-square bg-muted relative overflow-hidden">
                <img
                  src={imgUrl}
                  alt={`${piece.name} view ${idx + 2}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Details */}
      <div className="w-full md:w-1/2 flex flex-col items-start">
        <SectionLabel text={piece.categorySlug?.replace(/-/g, ' ') || 'Collection'} />
        <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-6 mt-2 leading-tight">{piece.name}</h1>
        <p className="text-2xl text-gold font-light mb-10 tracking-widest">
          {formattedPrice}
        </p>

        {!piece.isAvailable && (
          <span className="mb-6 border border-foreground/20 text-foreground/50 text-[10px] uppercase tracking-[0.25em] px-4 py-2">
            Sold Out
          </span>
        )}

        <p className="text-muted-foreground mb-10 leading-relaxed text-balance">
          {piece.description}
        </p>

        <div className="w-full space-y-4 mb-12">
          {piece.fabric && (
            <div className="flex justify-between border-b border-border pb-4">
              <span className="text-muted-foreground uppercase tracking-widest text-xs">Material</span>
              <span className="text-foreground tracking-wide text-sm text-right">{piece.fabric}</span>
            </div>
          )}
          {piece.tags?.length > 0 && (
            <div className="flex justify-between border-b border-border pb-4">
              <span className="text-muted-foreground uppercase tracking-widest text-xs">Tags</span>
              <span className="text-foreground tracking-wide text-sm text-right">{piece.tags.join(', ')}</span>
            </div>
          )}
          <div className="flex justify-between border-b border-border pb-4">
            <span className="text-muted-foreground uppercase tracking-widest text-xs">Availability</span>
            <span className={`tracking-wide text-sm ${piece.isAvailable ? 'text-green-600' : 'text-muted-foreground'}`}>
              {piece.isAvailable ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>
        </div>

        <Link
          href={`/contact?piece=${piece.id}`}
          className="w-full py-5 bg-gold text-background text-center uppercase tracking-[0.25em] text-sm font-medium hover:bg-gold-light transition-colors duration-300"
        >
          Enquire About This Piece
        </Link>
      </div>
    </div>
  );
}
