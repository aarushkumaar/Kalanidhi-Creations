'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getCategories } from '@/utils/firebase/db';

function withTimeout<T>(p: Promise<T>, ms = 1500, fallback: T): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>(resolve => setTimeout(() => resolve(fallback), ms)),
  ]);
}

// Shimmer skeleton
function CollectionSkeleton() {
  return (
    <div className="flex flex-col items-start">
      <div className="w-full aspect-[4/5] skeleton mb-6 rounded-none" />
      <div className="h-7 w-2/3 skeleton mb-3" />
      <div className="h-4 w-full skeleton mb-1" />
      <div className="h-4 w-3/4 skeleton" />
    </div>
  );
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    withTimeout(getCategories().catch(() => []), 1500, [])
      .then((data: any[]) => {
        setCollections(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen py-32 px-6 md:px-12 max-w-7xl mx-auto">
      <div className="flex flex-col items-center text-center mb-24">
        <span className="text-[10px] uppercase tracking-[0.35em] text-[#c9a96e] font-medium block">
          Our Collections
        </span>
        <h1 className="text-5xl md:text-7xl font-serif text-gold mb-8 mt-4 tracking-wide">
          Masterpieces
        </h1>
        <p className="text-muted-foreground max-w-2xl text-balance leading-relaxed">
          Explore our distinct collections, each carrying its own legacy of exquisite design, rare gemstones, and unmatched artistry.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <CollectionSkeleton key={i} />)
          : collections.map((col: any) => (
            <Link
              href={`/collections/${col.slug}`}
              key={col.id}
              prefetch
              className="group flex flex-col items-start cursor-pointer"
            >
              <div className="w-full aspect-[4/5] bg-muted relative mb-6 overflow-hidden">
                <div className="absolute inset-0 border border-gold/20 m-4 z-10 pointer-events-none" />
                {(col.coverImage || col.imageUrl || col.images?.[0]) ? (
                  <Image
                    src={col.coverImage || col.imageUrl || col.images?.[0]}
                    alt={col.name}
                    fill
                    unoptimized
                    loading="lazy"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full skeleton" />
                )}
              </div>
              <h2 className="text-2xl font-serif text-foreground group-hover:text-gold transition-colors duration-300">
                {col.name}
              </h2>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{col.description}</p>
              <span className="text-[10px] uppercase tracking-[0.25em] text-gold mt-5 border-b border-transparent group-hover:border-gold pb-0.5 transition-all duration-300">
                Explore Collection
              </span>
            </Link>
          ))
        }
        {!loading && collections.length === 0 && (
          <div className="col-span-3 text-center py-24 text-muted-foreground uppercase tracking-widest text-xs">
            No collections available yet.
          </div>
        )}
      </div>
    </div>
  );
}
