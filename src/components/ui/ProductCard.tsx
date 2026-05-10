'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  category?: string;
  inStock?: boolean;
  index?: number;
}

export default function ProductCard({
  id,
  name,
  price,
  imageUrl,
  category,
  inStock = true,
  index = 0,
}: ProductCardProps) {
  const formattedPrice = `₹${Number(price).toLocaleString('en-IN')}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: index * 0.1 }}
      className="group relative"
    >
      <Link href={`/pieces/${id}`} className="block">
        {/* Image container */}
        <div className="relative aspect-[3/4] overflow-hidden bg-muted">
          {/* Sold Out ribbon */}
          {!inStock && (
            <div className="absolute top-0 left-0 z-20 bg-foreground text-background text-[10px] uppercase tracking-[0.2em] px-3 py-1.5 font-medium">
              Sold Out
            </div>
          )}

          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              fill
              unoptimized
              loading="lazy"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full skeleton" />
          )}

          {/* Dark overlay on hover */}
          <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition-all duration-500 z-10" />

          {/* View button — slides up on hover */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileHover={{ y: 0, opacity: 1 }}
            className="absolute bottom-0 inset-x-0 z-20 flex items-center justify-center py-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <span className="bg-background text-foreground text-[10px] uppercase tracking-[0.25em] px-8 py-3 font-medium hover:bg-gold hover:text-background transition-colors duration-300">
              View Piece
            </span>
          </motion.div>
        </div>

        {/* Info */}
        <div className="pt-4 pb-2">
          {category && (
            <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-1.5">
              {category.replace(/-/g, ' ')}
            </p>
          )}
          <h3 className="font-serif text-xl leading-snug text-foreground group-hover:text-gold transition-colors duration-300">
            {name}
          </h3>
          <p className={`text-sm mt-2 font-light tracking-wide ${inStock ? 'text-gold' : 'text-muted-foreground line-through'}`}>
            {formattedPrice}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
