import SectionLabel from '@/components/ui/SectionLabel';
import Link from 'next/link';
import { getPieceById } from '@/utils/firebase/db';
import { notFound } from 'next/navigation';

export default async function PiecePage({ params }: { params: { id: string } }) {
  const piece = await getPieceById(params.id) as any;

  if (!piece) {
    notFound();
  }

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto flex flex-col md:flex-row gap-16">
      <div className="w-full md:w-1/2">
        <div className="w-full aspect-[3/4] bg-muted relative mb-4">
           {piece.coverImage ? (
             <img src={piece.coverImage} alt={piece.name} className="w-full h-full object-cover" />
           ) : (
             <div className="w-full h-full bg-muted-foreground/20 animate-pulse" />
           )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {piece.images?.slice(1, 3).map((img: string, i: number) => (
             <div key={i} className="aspect-square bg-muted">
               <img src={img} alt={`${piece.name} detail ${i}`} className="w-full h-full object-cover" />
             </div>
          )) || (
            <>
              <div className="aspect-square bg-muted">
                <div className="w-full h-full bg-muted-foreground/10 animate-pulse" />
              </div>
              <div className="aspect-square bg-muted">
                <div className="w-full h-full bg-muted-foreground/10 animate-pulse" />
              </div>
            </>
          )}
        </div>
      </div>
      
      <div className="w-full md:w-1/2 flex flex-col items-start">
        <SectionLabel text={piece.categorySlug?.replace('-', ' ') || 'Collection'} />
        <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-6 mt-2">{piece.name}</h1>
        <p className="text-2xl text-gold font-light mb-10 tracking-widest">
          {piece.price && piece.price > 0 ? `₹${piece.price.toLocaleString()}` : 'Price on Request'}
        </p>
        
        <p className="text-muted-foreground mb-10 leading-relaxed">
          {piece.description}
        </p>
        
        <div className="w-full space-y-6 mb-12">
          {piece.fabric && (
            <div className="flex justify-between border-b border-border pb-4">
              <span className="text-muted-foreground uppercase tracking-widest text-xs">Material</span>
              <span className="text-foreground tracking-wide text-sm text-right">{piece.fabric}</span>
            </div>
          )}
          {piece.tags && (
            <div className="flex justify-between border-b border-border pb-4">
              <span className="text-muted-foreground uppercase tracking-widest text-xs">Tags</span>
              <span className="text-foreground tracking-wide text-sm text-right">{piece.tags.join(', ')}</span>
            </div>
          )}
          <div className="flex justify-between border-b border-border pb-4">
            <span className="text-muted-foreground uppercase tracking-widest text-xs">Availability</span>
            <span className={`tracking-wide text-sm text-right ${piece.isAvailable ? 'text-green-600' : 'text-red-500'}`}>
              {piece.isAvailable ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>
        </div>
        
        <Link href={`/contact?piece=${piece.id}`} className="w-full py-5 bg-gold text-background text-center uppercase tracking-[0.2em] font-medium hover:bg-gold-light transition-colors">
          Enquire About This Piece
        </Link>
      </div>
    </div>
  );
}
