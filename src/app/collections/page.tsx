import Link from 'next/link';
import SectionLabel from '@/components/ui/SectionLabel';
import { getCategories } from '@/utils/firebase/db';

export default async function CollectionsPage() {
  const collections = await getCategories() as any[];

  return (
    <div className="min-h-screen py-32 px-6 md:px-12 max-w-7xl mx-auto">
      <div className="flex flex-col items-center text-center mb-24">
        <SectionLabel text="Our Collections" />
        <h1 className="text-5xl md:text-7xl font-serif text-gold mb-8 mt-4 tracking-wider">Masterpieces</h1>
        <p className="text-muted-foreground max-w-2xl text-balance">Explore our distinct collections, each carrying its own legacy of exquisite design, rare gemstones, and unmatched artistry.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        {collections.map((col) => (
          <Link href={`/collections/${col.slug}`} key={col.id} className="group flex flex-col items-start cursor-pointer">
            <div className="w-full aspect-[4/5] bg-muted relative mb-8 overflow-hidden">
               <div className="absolute inset-0 border border-gold/20 m-4 z-10 mix-blend-difference pointer-events-none" />
               {col.coverImage ? (
                  <img src={col.coverImage} alt={col.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
               ) : (
                  <div className="w-full h-full bg-muted-foreground/10 animate-pulse transition-transform duration-700 group-hover:scale-105" />
               )}
            </div>
            <h2 className="text-2xl font-serif text-foreground group-hover:text-gold transition-colors">{col.name}</h2>
            <p className="text-muted-foreground mt-3 text-sm">{col.description}</p>
            <span className="text-xs uppercase tracking-[0.2em] text-gold mt-6 border-b border-transparent group-hover:border-gold pb-1 transition-all">Explore Collection</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
