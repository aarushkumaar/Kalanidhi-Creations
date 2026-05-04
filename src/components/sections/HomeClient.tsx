'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useInView, AnimatePresence } from 'framer-motion';

/* ─── Reusable fade-up section wrapper ─────────────────────────────────────── */
function FadeUp({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 48 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Section label ─────────────────────────────────────────────────────────── */
function Label({ text }: { text: string }) {
  return (
    <span className="text-[10px] uppercase tracking-[0.35em] text-[#c9a96e] font-medium block">
      {text}
    </span>
  );
}

/* ─── Shimmer skeleton ───────────────────────────────────────────────────────── */
function Shimmer({ className = '' }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

/* ─── Product card with hover scale + shimmer load ────────────────────────── */
function ProductCard({ piece, index }: { piece: any; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href={`/pieces/${piece.id}`} className="group block">
        <div className="relative aspect-[3/4] overflow-hidden bg-[#F2D9D0]">
          {!imgLoaded && <Shimmer className="absolute inset-0" />}
          {piece.coverImage && (
            <Image
              src={piece.coverImage}
              alt={piece.name}
              fill
              onLoad={() => setImgLoaded(true)}
              className={`object-cover transition-transform duration-700 group-hover:scale-105 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
              sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw"
            />
          )}
          {piece.isFeatured && (
            <span className="absolute top-3 left-3 text-[9px] uppercase tracking-[0.25em] bg-[#c9a96e] text-white px-2.5 py-1">Featured</span>
          )}
        </div>
        <div className="pt-4">
          <p className="font-serif text-lg text-[#1a1a1a] leading-snug group-hover:text-[#c9a96e] transition-colors duration-300">{piece.name}</p>
          <p className="text-sm text-[#7a6a60] mt-1">₹{Number(piece.price).toLocaleString('en-IN')}</p>
        </div>
      </Link>
    </motion.div>
  );
}

/* ─── Horizontal scroll mosaic ──────────────────────────────────────────────── */
function ProductMosaic({ pieces }: { pieces: any[] }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  if (pieces.length === 0) {
    return (
      <div className="flex gap-6 overflow-x-auto pb-6 -mx-6 px-6 md:-mx-12 md:px-12 scrollbar-hide">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex-shrink-0 w-52 md:w-64">
            <Shimmer className="aspect-[3/4]" />
            <div className="mt-3 h-4 w-3/4 skeleton" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className="flex gap-6 overflow-x-auto pb-6 -mx-6 px-6 md:-mx-12 md:px-12"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
      transition={{ duration: 0.6 }}
    >
      {pieces.map((piece: any, i: number) => (
        <div key={piece.id} className="flex-shrink-0 w-52 md:w-64">
          <ProductCard piece={piece} index={i} />
        </div>
      ))}
    </motion.div>
  );
}

/* ─── Collection tile (half-width card) ─────────────────────────────────────── */
function CollectionTile({ col, index }: { col: any; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const [hovered, setHovered] = useState(false);

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
          {col.coverImage && (
            <Image
              src={col.coverImage}
              alt={col.name}
              fill
              loading="lazy"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width:768px) 100vw, 50vw"
            />
          )}
        </div>
        {/* overlay */}
        <AnimatePresence>
          <motion.div
            className="absolute inset-0"
            animate={{ backgroundColor: hovered ? 'rgba(26,26,26,0.65)' : 'rgba(26,26,26,0.35)' }}
            transition={{ duration: 0.4 }}
          />
        </AnimatePresence>
        <div className="absolute bottom-0 inset-x-0 p-6 md:p-8">
          <motion.h3
            className="font-serif text-2xl md:text-3xl text-white leading-tight"
            animate={{ y: hovered ? -4 : 0 }}
            transition={{ duration: 0.35 }}
          >
            {col.name}
          </motion.h3>
          <motion.span
            className="text-[10px] uppercase tracking-[0.25em] text-[#c9a96e] mt-2 block"
            animate={{ opacity: hovered ? 1 : 0.6, y: hovered ? 0 : 4 }}
            transition={{ duration: 0.35 }}
          >
            Explore Collection →
          </motion.span>
        </div>
      </Link>
    </motion.div>
  );
}

/* ─── Decorative divider ─────────────────────────────────────────────────────── */
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

/* ─── Main client component ──────────────────────────────────────────────────── */
interface Props {
  featuredPieces: any[];
  featuredCollections: any[];
  featuredTestimonial: any | null;
}

export default function HomeClient({ featuredPieces, featuredCollections, featuredTestimonial }: Props) {
  return (
    <>
      {/* ── PRODUCT MOSAIC ───────────────────────────────────────────────────── */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
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
        <ProductMosaic pieces={featuredPieces} />
        <FadeUp delay={0.2}>
          <div className="flex justify-center mt-14">
            <Link
              href="/collections"
              className="py-4 px-12 border border-[#c9a96e] text-[#c9a96e] hover:bg-[#c9a96e] hover:text-white transition-all duration-500 uppercase tracking-[0.25em] text-xs font-medium"
            >
              Explore All Pieces
            </Link>
          </div>
        </FadeUp>
      </section>

      {/* ── GOLD RULE ─────────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="h-px bg-gradient-to-r from-transparent via-[#c9a96e]/30 to-transparent" />
      </div>

      {/* ── COLLECTION TILES ─────────────────────────────────────────────────── */}
      {featuredCollections.length > 0 && (
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

      {/* ── GOLD RULE ─────────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="h-px bg-gradient-to-r from-transparent via-[#c9a96e]/30 to-transparent" />
      </div>

      {/* ── BRAND STORY ──────────────────────────────────────────────────────── */}
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
            <Link
              href="/story"
              className="text-xs uppercase tracking-[0.3em] text-[#1a1a1a] border-b border-[#c9a96e] pb-1 hover:text-[#c9a96e] transition-colors duration-300"
            >
              Read Our Story
            </Link>
          </div>
        </FadeUp>
      </section>

      {/* ── TESTIMONIAL ──────────────────────────────────────────────────────── */}
      {featuredTestimonial && (
        <section className="py-28 bg-[#1a1a1a] text-center px-6 border-t border-[#c9a96e]/10">
          <FadeUp>
            <div className="max-w-3xl mx-auto flex flex-col items-center">
              <div className="w-8 h-px bg-[#c9a96e] mb-10" />
              <p className="font-serif italic text-2xl md:text-3xl text-white/90 leading-relaxed mb-10 text-balance" style={{ fontWeight: 300 }}>
                &ldquo;{featuredTestimonial.quote}&rdquo;
              </p>
              <div className="flex flex-col items-center gap-1">
                <span className="uppercase tracking-[0.25em] text-xs text-[#c9a96e]">{featuredTestimonial.authorName}</span>
                <span className="text-xs text-white/40 uppercase tracking-widest">{featuredTestimonial.authorDetail}</span>
              </div>
              <div className="w-8 h-px bg-[#c9a96e] mt-10" />
            </div>
          </FadeUp>
        </section>
      )}

      {/* ── MINIMAL SERIF FOOTER ACCENT ──────────────────────────────────────── */}
      <div className="py-12 text-center">
        <FadeUp>
          <p className="font-serif italic text-[#C9B8A8] text-sm tracking-widest" style={{ fontWeight: 300 }}>
            Handcrafted with love · Kalanidhi Creations
          </p>
        </FadeUp>
      </div>
    </>
  );
}
