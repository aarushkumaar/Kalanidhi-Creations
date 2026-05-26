'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { getFeaturedPieces, getCategories } from '@/utils/firebase/db';
import ProductPanel, { type PieceData } from '@/components/ui/ProductPanel';

function withTimeout<T>(p: Promise<T>, ms = 3000, fallback: T): Promise<T> {
  return Promise.race([p, new Promise<T>(resolve => setTimeout(() => resolve(fallback), ms))]);
}

function FadeUp({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 48 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

function Label({ text }: { text: string }) {
  return <span className="text-[10px] uppercase tracking-[0.35em] text-[#c9a96e] font-medium block">{text}</span>;
}

function GoldDivider() {
  return (
    <div className="flex items-center justify-center gap-4 my-6">
      <div className="w-12 h-px bg-[#c9a96e]/40" />
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 0L9.5 6.5L16 8L9.5 9.5L8 16L6.5 9.5L0 8L6.5 6.5L8 0Z" fill="#c9a96e" fillOpacity="0.6" />
      </svg>
      <div className="w-12 h-px bg-[#c9a96e]/40" />
    </div>
  );
}

/* ─── Carousel Card ─────────────────────────────────────────────────────── */
function CarouselCard({ piece, onSelect }: { piece: any; onSelect: (p: PieceData) => void }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const imgSrc = piece.coverImage || piece.imageUrl || piece.images?.[0] || '';
  const price = piece.price && piece.price > 0
    ? `₹${Number(piece.price).toLocaleString('en-IN')}`
    : 'Price on enquiry';

  return (
    <div
      onClick={() => onSelect(piece)}
      style={{
        flexShrink: 0,
        width: 'clamp(200px, 22vw, 280px)',
        marginRight: 20,
        cursor: 'pointer',
        transition: 'transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94)',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-8px)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
      }}
    >
      {/* Image */}
      <div style={{
        aspectRatio: '3/4',
        background: '#F2D9D0',
        overflow: 'hidden',
        position: 'relative',
        boxShadow: '0 4px 24px rgba(26,20,16,0.07)',
        transition: 'box-shadow 0.4s',
      }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 40px rgba(201,168,76,0.18)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 24px rgba(26,20,16,0.07)';
        }}
      >
        {!imgLoaded && (
          <div style={{ position: 'absolute', inset: 0, background: '#F2D9D0' }} className="skeleton" />
        )}
        {imgSrc && (
          <img
            src={imgSrc}
            alt={piece.name || ''}
            onLoad={() => setImgLoaded(true)}
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              opacity: imgLoaded ? 1 : 0,
              transition: 'opacity 0.3s, transform 0.6s',
              display: 'block',
            }}
          />
        )}
      </div>
      {/* Info */}
      <div style={{ paddingTop: 12 }}>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '0.88rem', color: '#1a1410', lineHeight: 1.4, marginBottom: 4 }}>
          {piece.name}
        </p>
        <p style={{
          fontFamily: "'Cormorant Garamond',Georgia,serif",
          fontSize: '0.95rem',
          color: piece.price && piece.price > 0 ? '#C9A84C' : '#9b8e86',
          fontStyle: piece.price && piece.price > 0 ? 'normal' : 'italic',
        }}>
          {price}
        </p>
      </div>
    </div>
  );
}

/* ─── Infinite Carousel ─────────────────────────────────────────────────── */
function InfiniteCarousel({ pieces, onSelect }: { pieces: any[]; onSelect: (p: PieceData) => void }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  // Need at least 2 full sets for seamless loop
  const doubled = pieces.length > 0 ? [...pieces, ...pieces, ...pieces] : [];

  if (pieces.length === 0) {
    return (
      <div style={{ display: 'flex', gap: 20, padding: '8px 0' }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} style={{ flexShrink: 0, width: 'clamp(200px,22vw,280px)' }}>
            <div style={{ aspectRatio: '3/4' }} className="skeleton" />
            <div style={{ height: 14, width: '70%', marginTop: 12 }} className="skeleton" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      ref={wrapperRef}
      style={{ overflow: 'hidden', width: '100%', position: 'relative', cursor: 'grab' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        style={{
          display: 'flex',
          width: 'fit-content',
          animation: `carouselScroll ${pieces.length * 4}s linear infinite`,
          animationPlayState: paused ? 'paused' : 'running',
        }}
      >
        {doubled.map((piece, i) => (
          <CarouselCard key={`${piece.id}-${i}`} piece={piece} onSelect={onSelect} />
        ))}
      </div>

      <style>{`
        @keyframes carouselScroll {
          from { transform: translateX(0); }
          to   { transform: translateX(calc(-100% / 3)); }
        }
      `}</style>
    </div>
  );
}

/* ─── Collection Tile ──────────────────────────────────────────────────── */
function CollectionTile({ col, index }: { col: any; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const [hovered, setHovered] = useState(false);
  const imgSrc = col.coverImage || col.imageUrl || col.images?.[0] || '';

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      className={index === 0 ? 'md:col-span-2' : 'md:col-span-1'}
    >
      <Link
        href={`/collections/${col.slug}`}
        className="group relative block overflow-hidden"
        style={{ aspectRatio: index === 0 ? '16/9' : '4/5' }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="absolute inset-0 bg-[#C9B8A8]">
          {imgSrc && (
            <img
              src={imgSrc}
              alt={col.name}
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
              style={{
                width: '100%', height: '100%', objectFit: 'cover',
                transition: 'transform 0.7s',
                transform: hovered ? 'scale(1.05)' : 'scale(1)',
              }}
            />
          )}
        </div>
        <div className="absolute inset-0" style={{
          background: hovered ? 'rgba(26,26,26,0.65)' : 'rgba(26,26,26,0.35)',
          transition: 'background 0.4s',
        }} />
        <div className="absolute bottom-0 inset-x-0 p-6 md:p-8">
          <h3 className="font-serif text-2xl md:text-3xl text-white leading-tight"
            style={{ transform: hovered ? 'translateY(-4px)' : 'translateY(0)', transition: 'transform 0.35s' }}>
            {col.name}
          </h3>
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#c9a96e] mt-2 block"
            style={{ opacity: hovered ? 1 : 0.6, transform: hovered ? 'translateY(0)' : 'translateY(4px)', transition: 'all 0.35s' }}>
            Explore Collection →
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

/* ─── Main export ──────────────────────────────────────────────────────── */
export default function HomeClient() {
  const [featuredPieces, setFeaturedPieces] = useState<any[]>([]);
  const [featuredCollections, setFeaturedCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPiece, setSelectedPiece] = useState<PieceData | null>(null);

  useEffect(() => {
    Promise.all([
      withTimeout(getFeaturedPieces(16).catch(() => []), 3000, []),
      withTimeout(getCategories().catch(() => []), 3000, []),
    ]).then(([pieces, collections]) => {
      setFeaturedPieces(pieces as any[]);
      setFeaturedCollections((collections as any[]).slice(0, 4));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <>
      {/* ── FEATURED MASTERPIECES CAROUSEL ───────────────────────────── */}
      <section className="py-24">
        <div className="px-6 md:px-12 max-w-7xl mx-auto">
          <FadeUp>
            <div className="flex flex-col items-center text-center mb-12">
              <Label text="Curated Selection" />
              <h2 className="text-4xl md:text-5xl font-serif text-[#1a1a1a] mt-4 mb-4 leading-tight" style={{ fontWeight: 300 }}>
                Featured Masterpieces
              </h2>
              <p className="text-[#7a6a60] max-w-md text-sm leading-relaxed">
                Each piece tells a story of heritage, precision, and unparalleled beauty.
              </p>
            </div>
          </FadeUp>
        </div>

        {/* Full-bleed carousel — no max-width cap */}
        <div className="px-6 md:px-12">
          {loading ? (
            <div style={{ display: 'flex', gap: 20 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} style={{ flexShrink: 0, width: 'clamp(200px,22vw,280px)' }}>
                  <div style={{ aspectRatio: '3/4' }} className="skeleton" />
                  <div style={{ height: 14, width: '70%', marginTop: 12 }} className="skeleton" />
                </div>
              ))}
            </div>
          ) : (
            <InfiniteCarousel pieces={featuredPieces} onSelect={setSelectedPiece} />
          )}
        </div>

        <FadeUp delay={0.2}>
          <div className="flex justify-center mt-14 px-6 md:px-12">
            <Link
              href="/collections"
              className="py-4 px-12 border border-[#c9a96e] text-[#c9a96e] hover:bg-[#c9a96e] hover:text-white transition-all duration-500 uppercase tracking-[0.25em] text-xs font-medium"
            >
              Explore All Pieces
            </Link>
          </div>
        </FadeUp>
      </section>

      {/* ── GOLD RULE ─────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="h-px bg-gradient-to-r from-transparent via-[#c9a96e]/30 to-transparent" />
      </div>

      {/* ── COLLECTION TILES ──────────────────────────────────────────── */}
      {!loading && featuredCollections.length > 0 && (
        <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
          <FadeUp>
            <div className="flex flex-col items-center text-center mb-12">
              <Label text="Collections" />
              <h2 className="text-4xl md:text-5xl font-serif text-[#1a1a1a] mt-4 leading-tight" style={{ fontWeight: 300 }}>
                Shop by Collection
              </h2>
            </div>
          </FadeUp>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {featuredCollections.map((col: any, i: number) => (
              <CollectionTile key={col.id} col={col} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* ── GOLD RULE ─────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="h-px bg-gradient-to-r from-transparent via-[#c9a96e]/30 to-transparent" />
      </div>

      {/* ── BRAND STORY ───────────────────────────────────────────────── */}
      <section className="py-28 px-6 md:px-12 max-w-3xl mx-auto text-center">
        <FadeUp>
          <Label text="Our Heritage" />
          <GoldDivider />
          <h2 className="text-3xl md:text-4xl font-serif text-[#1a1a1a] mt-2 mb-8 leading-snug" style={{ fontWeight: 300 }}>
            A Legacy of <em className="not-italic text-[#c9a96e]">Lustrous Elegance</em>
          </h2>
          <p className="font-serif italic text-[#7a6a60] text-xl md:text-2xl leading-relaxed text-balance" style={{ fontWeight: 300 }}>
            &ldquo;Rooted in generations of master craftsmanship, Kalanidhi transforms ethically sourced gems into wearable art. Our philosophy intertwines traditional motifs with contemporary minimalism — honouring the past while dressing the present.&rdquo;
          </p>
          <GoldDivider />
          <div className="mt-8">
            <Link href="/story" className="text-xs uppercase tracking-[0.3em] text-[#1a1a1a] border-b border-[#c9a96e] pb-1 hover:text-[#c9a96e] transition-colors duration-300">
              Read Our Story
            </Link>
          </div>
        </FadeUp>
      </section>

      {/* ── PRODUCT PANEL ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedPiece && (
          <ProductPanel piece={selectedPiece} onClose={() => setSelectedPiece(null)} />
        )}
      </AnimatePresence>
    </>
  );
}
