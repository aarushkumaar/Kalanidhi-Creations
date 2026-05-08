import SectionLabel from '@/components/ui/SectionLabel';
import Link from 'next/link';
import Image from 'next/image';
import { getPieceById } from '@/utils/firebase/db';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function PiecePage({ params }: { params: { id: string } }) {
  const piece = await getPieceById(params.id) as any;

  if (!piece) {
    notFound();
  }

  const formattedPrice = piece.price && piece.price > 0
    ? `₹${Number(piece.price).toLocaleString('en-IN')}`
    : 'Price on Request';

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto flex flex-col md:flex-row gap-16">
      {/* Images */}
      <div className="w-full md:w-1/2">
        <div className="w-full aspect-[3/4] bg-muted relative mb-4 overflow-hidden">
          {piece.coverImage ? (
            <Image
              src={piece.coverImage}
              alt={piece.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="w-full h-full skeleton" />
          )}
        </div>
        {piece.images?.length > 1 && (
          <div className="grid grid-cols-2 gap-4">
            {piece.images.slice(1, 3).map((imgUrl: string, idx: number) => (
              <div key={idx} className="aspect-square bg-muted relative overflow-hidden">
                <Image
                  src={imgUrl}
                  alt={`${piece.name} view ${idx + 2}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Details */}
      <div className="w-full md:w-1/2 flex flex-col items-start">
        <SectionLabel text={piece.categorySlug?.replace(/-/g, ' ') || 'Collection'} />
        <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-6 mt-2 leading-tight">{piece.name}</h1>
        <p className="text-2xl text-gold font-light mb-10 tracking-widest">
          {formattedPrice}
        </p>

        {!piece.isAvailable && (
          <span className="mb-6 border border-foreground/20 text-foreground/50 text-[10px] uppercase tracking-[0.25em] px-4 py-2">
            Sold Out
          </span>
        )}

        <p className="text-muted-foreground mb-10 leading-relaxed text-balance">
          {piece.description}
        </p>

        <div className="w-full space-y-4 mb-12">
          {piece.fabric && (
            <div className="flex justify-between border-b border-border pb-4">
              <span className="text-muted-foreground uppercase tracking-widest text-xs">Material</span>
              <span className="text-foreground tracking-wide text-sm text-right">{piece.fabric}</span>
            </div>
          )}
          {piece.tags?.length > 0 && (
            <div className="flex justify-between border-b border-border pb-4">
              <span className="text-muted-foreground uppercase tracking-widest text-xs">Tags</span>
              <span className="text-foreground tracking-wide text-sm text-right">{piece.tags.join(', ')}</span>
            </div>
          )}
          <div className="flex justify-between border-b border-border pb-4">
            <span className="text-muted-foreground uppercase tracking-widest text-xs">Availability</span>
            <span className={`tracking-wide text-sm ${piece.isAvailable ? 'text-green-600' : 'text-muted-foreground'}`}>
              {piece.isAvailable ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>
        </div>

        <Link
          href={`/contact?piece=${piece.id}`}
          className="w-full py-5 bg-gold text-background text-center uppercase tracking-[0.25em] text-sm font-medium hover:bg-gold-light transition-colors duration-300"
        >
          Enquire About This Piece
        </Link>
      </div>
    </div>
  );
}
