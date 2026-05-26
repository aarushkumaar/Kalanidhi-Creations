'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getCategories } from '@/utils/firebase/db';

function withTimeout<T>(p: Promise<T>, ms = 3000, fallback: T): Promise<T> {
  return Promise.race([p, new Promise<T>(resolve => setTimeout(() => resolve(fallback), ms))]);
}

function CollectionSkeleton() {
  return (
    <div className="flex flex-col items-start">
      <div className="w-full skeleton mb-4" style={{ height: 320, borderRadius: 0 }} />
      <div className="h-6 w-2/3 skeleton mb-2" />
      <div className="h-4 w-full skeleton mb-1" />
      <div className="h-4 w-3/4 skeleton" />
    </div>
  );
}

function CollectionsInner() {
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const sort = searchParams.get('sort');

  useEffect(() => {
    withTimeout(getCategories().catch(() => []), 3000, [])
      .then((data: any[]) => {
        let sorted = [...data];
        if (sort === 'featured') {
          sorted = sorted.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        }
        setCollections(sorted);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [sort]);

  return (
    <div className="min-h-screen py-32 px-6 md:px-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-20">
        <span className="text-[10px] uppercase tracking-[0.35em] text-[#c9a96e] font-medium block">
          Our Collections
        </span>
        <h1 className="text-5xl md:text-7xl font-serif text-gold mb-8 mt-4 tracking-wide">
          Masterpieces
        </h1>
        <p className="text-muted-foreground max-w-2xl text-balance leading-relaxed">
          Explore our distinct collections, each carrying its own legacy of exquisite design and unmatched artistry.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <CollectionSkeleton key={i} />)
          : collections.map((col: any) => {
              const imgSrc = col.coverImage || col.imageUrl || col.images?.[0] || '';
              const hasImage = Boolean(imgSrc);

              return (
                <Link
                  href={`/collections/${col.slug}`}
                  key={col.id}
                  className="group flex flex-col items-start cursor-pointer"
                >
                  {/* Card image area */}
                  <div
                    className="w-full overflow-hidden relative"
                    style={{ height: 320, background: hasImage ? '#1a1410' : '#F2D9D0' }}
                  >
                    {hasImage ? (
                      <>
                        <img
                          src={imgSrc}
                          alt={col.name}
                          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        {/* gradient overlay */}
                        <div
                          className="absolute inset-0"
                          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)' }}
                        />
                        {/* name on image */}
                        <div className="absolute bottom-0 inset-x-0 p-6">
                          <h2 className="text-2xl font-serif text-white leading-snug group-hover:text-[#c9a96e] transition-colors duration-300">
                            {col.name}
                          </h2>
                          <span className="text-[10px] uppercase tracking-[0.25em] text-[#c9a96e] mt-2 block opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            Explore Collection →
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="absolute inset-0 border border-gold/20 m-4 z-10 pointer-events-none" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-[10px] uppercase tracking-[0.35em] text-[#c9a96e]/60">
                            {col.name}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Below image: name + description (when no image, full info below) */}
                  {!hasImage && (
                    <>
                      <h2 className="text-2xl font-serif text-foreground group-hover:text-gold transition-colors duration-300 mt-5">
                        {col.name}
                      </h2>
                      {col.description && (
                        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{col.description}</p>
                      )}
                      <span className="text-[10px] uppercase tracking-[0.25em] text-gold mt-4 border-b border-transparent group-hover:border-gold pb-0.5 transition-all duration-300">
                        Explore Collection
                      </span>
                    </>
                  )}
                  {hasImage && col.description && (
                    <p className="text-muted-foreground mt-4 text-sm leading-relaxed line-clamp-2">{col.description}</p>
                  )}
                </Link>
              );
            })}
        {!loading && collections.length === 0 && (
          <div className="col-span-3 text-center py-24 text-muted-foreground uppercase tracking-widest text-xs">
            No collections available yet.
          </div>
        )}
      </div>
    </div>
  );
}

export default function CollectionsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen py-32 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col items-center text-center mb-20">
          <div className="h-3 w-32 skeleton mb-6" />
          <div className="h-16 w-64 skeleton mb-6" />
          <div className="h-4 w-96 skeleton" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {Array.from({ length: 6 }).map((_, i) => <CollectionSkeleton key={i} />)}
        </div>
      </div>
    }>
      <CollectionsInner />
    </Suspense>
  );
}
