import Link from 'next/link';
import HomeHero from '@/components/sections/HomeHero';
import Marquee from '@/components/sections/Marquee';
import SectionLabel from '@/components/ui/SectionLabel';
import GoldRule from '@/components/ui/GoldRule';
import { getFeaturedPieces, getTestimonials } from '@/utils/firebase/db';

export default async function Home() {
  const featuredPieces = await getFeaturedPieces(3) as any[];
  const testimonials = await getTestimonials() as any[];
  const featuredTestimonial = testimonials.find(t => t.isFeatured) || testimonials[0];

  return (
    <div className="w-full">
      <HomeHero />
      <Marquee text="New Bridal Collection • Exquisite Necklaces • Everyday Elegance • " />
      
      {/* Featured Pieces */}
      <section className="min-h-screen py-24 px-6 md:px-12 max-w-7xl mx-auto flex flex-col items-center justify-center text-center">
        <SectionLabel text="Curated Selection" />
        <h2 className="text-4xl md:text-6xl text-foreground font-serif mb-8 max-w-3xl leading-tight">Featured Masterpieces</h2>
        <p className="text-muted-foreground max-w-xl mx-auto mb-16 px-4">
          Each piece tells a unique story of heritage, precision, and unparalleled beauty. Discover our curated selection of signature jewelry.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          {featuredPieces.map((piece: any) => (
            <div key={piece.id} className="aspect-[3/4] bg-muted/30 border border-gold/10 flex flex-col justify-end p-8 hover:border-gold/50 transition-all duration-500 group cursor-pointer relative overflow-hidden">
              <div className="absolute inset-0 bg-gold/5 mb-6 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent z-10" />
                {piece.coverImage ? (
                   <img src={piece.coverImage} alt={piece.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                   <div className="w-full h-full bg-muted/80 animate-pulse" />
                )}
              </div>
              <div className="relative z-20 text-left">
                <p className="text-gold text-xs uppercase tracking-widest mb-3">{piece.categorySlug?.replace('-', ' ')}</p>
                <h3 className="text-2xl font-serif text-foreground group-hover:text-gold transition-colors">{piece.name}</h3>
                <Link href={`/pieces/${piece.id}`} className="text-muted-foreground text-xs uppercase tracking-[0.2em] mt-6 flex items-center gap-2 group-hover:text-foreground transition-colors w-fit">
                  <span className="w-4 h-px bg-current" />
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-16">
          <Link href="/collections" className="py-4 px-10 border border-gold text-gold hover:bg-gold hover:text-background transition-colors uppercase tracking-[0.2em] text-sm font-medium">
            Explore All Pieces
          </Link>
        </div>
      </section>

      <GoldRule />

      {/* Story Teaser */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        <div className="aspect-square bg-muted/50 relative overflow-hidden">
          <div className="absolute inset-0 border-[1px] border-gold/40 m-4 z-10 mix-blend-difference pointer-events-none" />
          <div className="w-full h-full bg-muted animate-pulse" />
        </div>
        <div className="flex flex-col items-start text-left">
          <SectionLabel text="Our Heritage" />
          <h2 className="text-4xl md:text-5xl font-serif mb-8 leading-tight">A Legacy of <br/><span className="text-gold italic">Lustrous Elegance</span></h2>
          <p className="text-muted-foreground mb-10 leading-relaxed text-balance">
            Rooted in generations of master craftsmanship, Kalanidhi transforms ethically sourced gems into wearable art. Our design philosophy intertwines traditional motifs with contemporary minimalism.
          </p>
          <Link href="/story" className="py-4 px-8 border-b border-foreground hover:border-gold hover:text-gold transition-all uppercase tracking-[0.2em] text-sm">
            Read Our Story
          </Link>
        </div>
      </section>
      
      {/* Testimonials Strip */}
      {featuredTestimonial && (
        <section className="py-32 bg-primary text-primary-foreground text-center px-6 border-b border-gold/20">
          <div className="max-w-4xl mx-auto flex flex-col items-center">
            <span className="text-gold mb-8">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M14.017 18L14.017 10.609C14.017 4.905 17.748 1.039 23 0L23.995 2.151C21.563 3.068 20 5.789 20 8H24V18H14.017ZM0 18V10.609C0 4.905 3.748 1.038 9 0L9.996 2.151C7.563 3.068 6 5.789 6 8H9.983L9.983 18L0 18Z" />
              </svg>
            </span>
            <p className="text-2xl md:text-4xl font-serif text-balance leading-relaxed mb-8">
              "{featuredTestimonial.quote}"
            </p>
            <div className="flex flex-col items-center gap-1">
              <span className="uppercase tracking-[0.2em] text-sm text-gold">{featuredTestimonial.authorName}</span>
              <span className="text-xs text-muted-foreground uppercase tracking-widest">{featuredTestimonial.authorDetail}</span>
            </div>
          </div>
        </section>
      )}
      
    </div>
  );
}
