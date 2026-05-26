'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import SectionLabel from '@/components/ui/SectionLabel';
import ProductPanel, { type PieceData } from '@/components/ui/ProductPanel';
import { getCategoryBySlug, getPiecesByCategory } from '@/utils/firebase/db';

function withTimeout<T>(p: Promise<T>, ms = 3000, fallback: T): Promise<T> {
  return Promise.race([p, new Promise<T>(resolve => setTimeout(() => resolve(fallback), ms))]);
}

type SortKey = 'newest' | 'price-asc' | 'price-desc' | 'featured';

function sortPieces(pieces: any[], sort: SortKey) {
  return [...pieces].sort((a, b) => {
    if (sort === 'price-asc') return (a.price || 0) - (b.price || 0);
    if (sort === 'price-desc') return (b.price || 0) - (a.price || 0);
    if (sort === 'featured') {
      const diff = (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      if (diff !== 0) return diff;
    }
    // newest first (default)
    const aTime = a.createdAt?.toDate?.()?.getTime?.() ?? 0;
    const bTime = b.createdAt?.toDate?.()?.getTime?.() ?? 0;
    return bTime - aTime;
  });
}

/* ─── Skeleton ─────────────────────────────────────────────────────────── */
function Skeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3">
          <div className="w-full aspect-[3/4] skeleton" />
          <div className="h-4 w-2/3 skeleton" />
          <div className="h-3 w-1/3 skeleton" />
        </div>
      ))}
    </div>
  );
}

/* ─── Piece Card (plain <img>, opens panel) ────────────────────────────── */
function PieceCard({ piece, onSelect, index }: { piece: any; onSelect: (p: PieceData) => void; index: number }) {
  const [loaded, setLoaded] = useState(false);
  const imgSrc = piece.coverImage || piece.imageUrl || piece.images?.[0] || '';

  return (
    <motion.div
      layout
      key={piece.id}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.3), ease: [0.22, 1, 0.36, 1] }}
      onClick={() => onSelect(piece)}
      style={{ cursor: 'pointer' }}
      className="group"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-[#F2D9D0]">
        {!loaded && <div className="absolute inset-0 skeleton" />}
        {imgSrc && (
          <img
            src={imgSrc}
            alt={piece.name || ''}
            onLoad={() => setLoaded(true)}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            style={{ opacity: loaded ? 1 : 0, transition: 'opacity 0.3s, transform 0.7s' }}
          />
        )}
        {piece.isFeatured && (
          <span className="absolute top-3 left-3 text-[9px] uppercase tracking-[0.25em] bg-[#c9a96e] text-white px-2.5 py-1">
            Featured
          </span>
        )}
        {piece.isAvailable === false && (
          <span className="absolute top-3 right-3 text-[9px] uppercase tracking-[0.25em] bg-[#1a1410] text-white px-2.5 py-1">
            Sold Out
          </span>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-[#1a1410]/0 group-hover:bg-[#1a1410]/20 transition-all duration-500 flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[#FAF7F2] text-[#1a1410] text-[10px] uppercase tracking-[0.25em] px-6 py-3">
            View Details
          </span>
        </div>
      </div>
      <div className="pt-3 pb-1">
        <p className="font-serif text-base text-[#1a1410] leading-snug group-hover:text-[#c9a96e] transition-colors duration-300">
          {piece.name}
        </p>
        <p className="text-sm mt-1" style={{ color: piece.price > 0 ? '#C9A84C' : '#9b8e86', fontStyle: piece.price > 0 ? 'normal' : 'italic' }}>
          {piece.price > 0 ? `₹${Number(piece.price).toLocaleString('en-IN')}` : 'Price on enquiry'}
        </p>
      </div>
    </motion.div>
  );
}

/* ─── Sort Bar ─────────────────────────────────────────────────────────── */
function SortBar({ count, sort, onChange }: { count: number; sort: SortKey; onChange: (s: SortKey) => void }) {
  return (
    <div
      style={{
        position: 'sticky', top: 96, zIndex: 40,
        background: 'rgba(250,247,242,0.95)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(200,165,90,0.2)',
        padding: '12px 0',
        marginBottom: 40,
      }}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '0.8rem', color: '#9b8e86', letterSpacing: '0.05em' }}>
          {count} {count === 1 ? 'piece' : 'pieces'}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '0.65rem', color: '#C9A84C', textTransform: 'uppercase', letterSpacing: '0.25em' }}>
            Sort by
          </span>
          <select
            value={sort}
            onChange={e => onChange(e.target.value as SortKey)}
            style={{
              background: 'transparent', border: 'none',
              fontFamily: "'DM Sans',sans-serif", fontSize: '0.8rem',
              color: '#1a1410', cursor: 'pointer',
              outline: 'none', appearance: 'auto',
            }}
          >
            <option value="newest">Newest First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="featured">Featured First</option>
          </select>
        </div>
      </div>
    </div>
  );
}

/* ─── Page ─────────────────────────────────────────────────────────────── */
export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<any>(null);
  const [pieces, setPieces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [sort, setSort] = useState<SortKey>('newest');
  const [selectedPiece, setSelectedPiece] = useState<PieceData | null>(null);

  useEffect(() => {
    if (!slug) return;
    async function load() {
      try {
        const cat = await withTimeout(getCategoryBySlug(slug), 3000, null);
        if (!cat) { setNotFound(true); setLoading(false); return; }
        setCategory(cat);
        const items = await withTimeout(
          getPiecesByCategory((cat as any).id, slug).catch(() => []),
          3000, []
        );
        setPieces(items as any[]);
      } catch { setNotFound(true); }
      finally { setLoading(false); }
    }
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="mb-16">
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
      <div className="min-h-screen pt-32 px-6 md:px-12 max-w-7xl mx-auto flex flex-col items-center justify-center">
        <h1 className="text-4xl font-serif text-gold mb-4">Collection Not Found</h1>
        <p className="text-muted-foreground">This collection doesn&apos;t exist or could not be loaded.</p>
      </div>
    );
  }

  const sorted = sortPieces(pieces, sort);

  return (
    <>
      <div className="min-h-screen">
        {/* Hero */}
        <div className="pt-32 pb-12 px-6 md:px-12 max-w-7xl mx-auto">
          <SectionLabel text="Collection" />
          <h1 className="text-5xl md:text-7xl font-serif text-gold mb-4 mt-4 leading-tight">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-muted-foreground max-w-xl leading-relaxed mt-4">{category.description}</p>
          )}
        </div>

        {/* Sort bar */}
        {!loading && pieces.length > 0 && (
          <SortBar count={pieces.length} sort={sort} onChange={setSort} />
        )}

        {/* Grid */}
        <div className="px-6 md:px-12 max-w-7xl mx-auto pb-32">
          {pieces.length > 0 ? (
            <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
              <AnimatePresence>
                {sorted.map((piece, i) => (
                  <PieceCard key={piece.id} piece={piece} onSelect={setSelectedPiece} index={i} />
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="py-24 text-center border border-dashed border-border">
              <p className="text-muted-foreground uppercase tracking-widest text-xs">
                No pieces in this collection yet.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Product Panel */}
      <AnimatePresence>
        {selectedPiece && (
          <ProductPanel piece={selectedPiece} onClose={() => setSelectedPiece(null)} />
        )}
      </AnimatePresence>
    </>
  );
}
