import Link from 'next/link';
import Image from 'next/image';
import SectionLabel from '@/components/ui/SectionLabel';
import { getCategories } from '@/utils/firebase/db';

export const revalidate = 60;

export default async function CollectionsPage() {
  const collections = await getCategories().catch(() => []) as any[];

  return (
    <div className="min-h-screen py-32 px-6 md:px-12 max-w-7xl mx-auto">
      <div className="flex flex-col items-center text-center mb-24">
        <SectionLabel text="Our Collections" />
        <h1 className="text-5xl md:text-7xl font-serif text-gold mb-8 mt-4 tracking-wide">Masterpieces</h1>
        <p className="text-muted-foreground max-w-2xl text-balance leading-relaxed">
          Explore our distinct collections, each carrying its own legacy of exquisite design, rare gemstones, and unmatched artistry.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        {collections.map((col: any) => (
          <Link href={`/collections/${col.slug}`} key={col.id} prefetch className="group flex flex-col items-start cursor-pointer">
            <div className="w-full aspect-[4/5] bg-muted relative mb-6 overflow-hidden">
              <div className="absolute inset-0 border border-gold/20 m-4 z-10 pointer-events-none" />
              {col.coverImage ? (
                <Image
                  src={col.coverImage}
                  alt={col.name}
                  fill
                  loading="lazy"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              ) : (
                <div className="w-full h-full skeleton" />
              )}
            </div>
            <h2 className="text-2xl font-serif text-foreground group-hover:text-gold transition-colors duration-300">{col.name}</h2>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{col.description}</p>
            <span className="text-[10px] uppercase tracking-[0.25em] text-gold mt-5 border-b border-transparent group-hover:border-gold pb-0.5 transition-all duration-300">
              Explore Collection
            </span>
          </Link>
        ))}
        {collections.length === 0 && (
          <div className="col-span-3 text-center py-24 text-muted-foreground uppercase tracking-widest text-xs">
            No collections available yet.
          </div>
        )}
      </div>
    </div>
  );
}
