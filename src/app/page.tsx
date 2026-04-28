import Link from 'next/link';
import HomeHero from '@/components/sections/HomeHero';
import Marquee from '@/components/sections/Marquee';
import SectionLabel from '@/components/ui/SectionLabel';
import GoldRule from '@/components/ui/GoldRule';
import ProductCard from '@/components/ui/ProductCard';
import { getFeaturedPieces, getTestimonials, getCategories } from '@/utils/firebase/db';
import Image from 'next/image';

export const revalidate = 60; // ISR: revalidate every 60s

export default async function Home() {
  const featuredPieces = await getFeaturedPieces(3).catch(() => []) as any[];
  const testimonials = await getTestimonials().catch(() => []) as any[];
  const collections = await getCategories().catch(() => []) as any[];

  const featuredTestimonial = testimonials.find(t => t.isFeatured) || testimonials[0];
  const featuredCollections = collections.slice(0, 3);

  return (
    <div className="w-full">
      {/* ── HERO ── */}
      <HomeHero />

      {/* ── MARQUEE ── */}
      <Marquee text="New Bridal Collection • Exquisite Necklaces • Everyday Elegance • " />

      {/* ── FEATURED PIECES ── */}
      <section className="py-28 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col items-center text-center mb-16">
          <SectionLabel text="Curated Selection" />
          <h2 className="text-5xl md:text-6xl text-foreground font-serif mt-4 mb-6 leading-tight max-w-2xl">
            Featured Masterpieces
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Each piece tells a story of heritage, precision, and unparalleled beauty.
          </p>
        </div>

        {featuredPieces.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredPieces.map((piece: any, i: number) => (
              <ProductCard
                key={piece.id}
                id={piece.id}
                name={piece.name}
                price={piece.price}
                imageUrl={piece.coverImage}
                category={piece.categorySlug}
                inStock={piece.isAvailable !== false}
                index={i}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="aspect-[3/4] skeleton" />
            ))}
          </div>
        )}

        <div className="flex justify-center mt-16">
          <Link
            href="/collections"
            prefetch
            className="py-4 px-12 border border-gold text-gold hover:bg-gold hover:text-background transition-all duration-500 uppercase tracking-[0.25em] text-xs font-medium"
          >
            Explore All Pieces
          </Link>
        </div>
      </section>

      <GoldRule />

      {/* ── COLLECTIONS TILES ── */}
      {featuredCollections.length > 0 && (
        <section className="py-28 px-6 md:px-12 max-w-7xl mx-auto">
          <div className="flex flex-col items-center text-center mb-16">
            <SectionLabel text="Collections" />
            <h2 className="text-5xl md:text-6xl font-serif mt-4 mb-6 leading-tight">
              Shop by Collection
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredCollections.map((col: any) => (
              <Link
                key={col.id}
                href={`/collections/${col.slug}`}
                prefetch
                className="group relative aspect-[4/5] overflow-hidden bg-muted block"
              >
                {col.coverImage ? (
                  <Image
                    src={col.coverImage}
                    alt={col.name}
                    fill
                    loading="lazy"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width:640px) 100vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full bg-muted" />
                )}
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/10 to-transparent" />
                {/* Label */}
                <div className="absolute bottom-0 inset-x-0 p-6">
                  <h3 className="font-serif text-2xl text-background group-hover:text-gold transition-colors duration-300">
                    {col.name}
                  </h3>
                  <span className="text-[10px] uppercase tracking-[0.25em] text-background/70 mt-2 inline-block group-hover:text-gold/80 transition-colors">
                    Explore →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <GoldRule />

      {/* ── STORY TEASER ── */}
      <section className="py-28 px-6 md:px-12 max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        <div className="aspect-square bg-muted relative overflow-hidden">
          <div className="absolute inset-0 border border-gold/30 m-6 z-10 pointer-events-none" />
          <div className="w-full h-full skeleton" />
        </div>
        <div className="flex flex-col items-start text-left">
          <SectionLabel text="Our Heritage" />
          <h2 className="text-4xl md:text-5xl font-serif mt-4 mb-8 leading-tight">
            A Legacy of <br />
            <em className="text-gold not-italic">Lustrous Elegance</em>
          </h2>
          <p className="text-muted-foreground mb-10 leading-relaxed text-balance max-w-md">
            Rooted in generations of master craftsmanship, Kalanidhi transforms ethically sourced gems into wearable art. Our design philosophy intertwines traditional motifs with contemporary minimalism.
          </p>
          <Link
            href="/story"
            prefetch
            className="py-4 px-8 border-b border-foreground hover:border-gold hover:text-gold transition-all duration-300 uppercase tracking-[0.2em] text-xs font-medium"
          >
            Read Our Story
          </Link>
        </div>
      </section>

      {/* ── TESTIMONIAL ── */}
      {featuredTestimonial && (
        <section className="py-32 bg-primary text-primary-foreground text-center px-6 border-t border-gold/10">
          <div className="max-w-3xl mx-auto flex flex-col items-center">
            <div className="w-8 h-px bg-gold mb-10" />
            <p className="text-2xl md:text-4xl font-serif italic leading-relaxed mb-10 text-balance">
              &ldquo;{featuredTestimonial.quote}&rdquo;
            </p>
            <div className="flex flex-col items-center gap-1">
              <span className="uppercase tracking-[0.25em] text-xs text-gold">{featuredTestimonial.authorName}</span>
              <span className="text-xs text-primary-foreground/50 uppercase tracking-widest">{featuredTestimonial.authorDetail}</span>
            </div>
            <div className="w-8 h-px bg-gold mt-10" />
          </div>
        </section>
      )}
    </div>
  );
}
