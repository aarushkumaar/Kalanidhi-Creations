'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export interface PieceData {
  id: string;
  name: string;
  price?: number;
  coverImage?: string;
  imageUrl?: string;
  images?: string[];
  description?: string;
  categorySlug?: string;
  categoryId?: string;
  fabric?: string;
  tags?: string[];
  isAvailable?: boolean;
  isFeatured?: boolean;
}

interface ProductPanelProps {
  piece: PieceData | null;
  onClose: () => void;
}

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '918860507279';

/* ─── Full-screen Lightbox ─────────────────────────────────────────────── */
function Lightbox({
  images,
  startIndex,
  onClose,
}: {
  images: string[];
  startIndex: number;
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(startIndex);

  const prev = useCallback(() => setIdx(i => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setIdx(i => (i + 1) % images.length), [images.length]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, prev, next]);

  return (
    <motion.div
      className="fixed inset-0 z-[600] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.95)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      {/* Image */}
      <motion.img
        key={idx}
        src={images[idx]}
        alt=""
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        style={{ maxHeight: '90vh', maxWidth: '90vw', objectFit: 'contain' }}
        onClick={e => e.stopPropagation()}
      />

      {/* Counter */}
      <span
        style={{
          position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)',
          color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', letterSpacing: '0.15em',
        }}
      >
        {idx + 1} / {images.length}
      </span>

      {/* Close */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute', top: 20, right: 24,
          color: 'white', background: 'none', border: 'none',
          cursor: 'pointer', padding: 4,
        }}
      >
        <X size={32} />
      </button>

      {/* Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={e => { e.stopPropagation(); prev(); }}
            style={{
              position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
              color: 'white', background: 'rgba(255,255,255,0.1)', border: 'none',
              borderRadius: '50%', width: 44, height: 44,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={e => { e.stopPropagation(); next(); }}
            style={{
              position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
              color: 'white', background: 'rgba(255,255,255,0.1)', border: 'none',
              borderRadius: '50%', width: 44, height: 44,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}
    </motion.div>
  );
}

/* ─── Main Panel ───────────────────────────────────────────────────────── */
export default function ProductPanel({ piece, onClose }: ProductPanelProps) {
  const [activeImg, setActiveImg] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Collect all images
  const allImages: string[] = [];
  if (piece) {
    const primary = piece.coverImage || piece.imageUrl;
    if (primary) allImages.push(primary);
    (piece.images || []).forEach(img => {
      if (img && !allImages.includes(img)) allImages.push(img);
    });
    if (allImages.length === 0) allImages.push('');
  }

  useEffect(() => {
    setActiveImg(0);
  }, [piece?.id]);

  // Lock body scroll when panel open
  useEffect(() => {
    document.body.style.overflow = piece ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [piece]);

  if (!piece) return null;

  const displayPrice = piece.price && piece.price > 0
    ? `₹ ${Number(piece.price).toLocaleString('en-IN')}`
    : null;

  const whatsappMsg = encodeURIComponent(
    `Hi! I am interested in ${piece.name}. Could you please share more details?`
  );
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMsg}`;

  return (
    <AnimatePresence>
      {piece && (
        <>
          {/* Overlay */}
          <motion.div
            key="overlay"
            className="fixed inset-0 z-[499]"
            style={{ background: 'rgba(0,0,0,0.4)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.aside
            key="panel"
            className="fixed right-0 top-0 bottom-0 z-[500] overflow-y-auto"
            style={{
              width: '100%',
              maxWidth: 520,
              background: '#FAF7F2',
              boxShadow: '-8px 0 40px rgba(0,0,0,0.12)',
            }}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 35 }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              style={{
                position: 'absolute', top: 18, right: 20,
                background: 'none', border: 'none',
                cursor: 'pointer', color: '#C9A84C', zIndex: 10,
                padding: 4,
              }}
            >
              <X size={24} />
            </button>

            {/* ── IMAGE GALLERY ── */}
            <div style={{ position: 'relative' }}>
              {/* Main image */}
              <div
                style={{ width: '100%', height: 380, background: '#F2D9D0', cursor: 'zoom-in', overflow: 'hidden', position: 'relative' }}
                onClick={() => allImages[activeImg] && setLightboxOpen(true)}
              >
                {allImages[activeImg] ? (
                  <motion.img
                    key={activeImg}
                    src={allImages[activeImg]}
                    alt={piece.name}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.25 }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: '#F2D9D0' }} />
                )}

                {/* Counter */}
                {allImages.length > 1 && (
                  <span style={{
                    position: 'absolute', top: 12, right: 14,
                    fontSize: '0.7rem', color: 'rgba(255,255,255,0.85)',
                    background: 'rgba(0,0,0,0.35)', padding: '2px 8px',
                    letterSpacing: '0.1em',
                  }}>
                    {activeImg + 1} / {allImages.length}
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              {allImages.length > 1 && (
                <div style={{
                  display: 'flex', gap: 8, padding: '10px 16px',
                  overflowX: 'auto', background: '#FAF7F2',
                  borderBottom: '1px solid rgba(200,165,90,0.15)',
                }}>
                  {allImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      style={{
                        width: 72, height: 72, flexShrink: 0,
                        border: i === activeImg ? '2px solid #C9A84C' : '2px solid transparent',
                        padding: 0, cursor: 'pointer', overflow: 'hidden', background: '#F2D9D0',
                        transition: 'border-color 0.2s',
                      }}
                    >
                      {img && <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── PRODUCT INFO ── */}
            <div style={{ padding: '24px 28px' }}>
              {/* Name */}
              <h1 style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: '1.8rem', fontWeight: 300,
                color: '#1a1410', lineHeight: 1.2, marginBottom: 12,
              }}>
                {piece.name}
              </h1>

              {/* Price */}
              {displayPrice ? (
                <p style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: '1.3rem', color: '#C9A84C', marginBottom: 16,
                }}>
                  {displayPrice}
                </p>
              ) : (
                <p style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '0.9rem', color: '#9b8e86',
                  fontStyle: 'italic', marginBottom: 16,
                }}>
                  Price on enquiry
                </p>
              )}

              {/* Category pill */}
              {piece.categorySlug && (
                <span style={{
                  display: 'inline-block',
                  background: '#F2D9D0', color: '#6b5f52',
                  fontSize: '0.7rem', letterSpacing: '0.2em',
                  textTransform: 'uppercase', padding: '3px 12px',
                  marginBottom: 16,
                }}>
                  {piece.categorySlug.replace(/-/g, ' ')}
                </span>
              )}

              {/* Fabric */}
              {(piece as any).fabric && (
                <p style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '0.85rem', color: '#9b8e86', marginBottom: 8,
                }}>
                  Fabric: {(piece as any).fabric}
                </p>
              )}

              {/* Availability */}
              {piece.isAvailable === false && (
                <p style={{
                  fontSize: '0.75rem', letterSpacing: '0.2em',
                  textTransform: 'uppercase', color: '#c0392b',
                  marginBottom: 12,
                }}>
                  Sold Out
                </p>
              )}

              {/* Separator */}
              <div style={{ height: 1, background: 'rgba(200,165,90,0.2)', margin: '16px 0' }} />

              {/* Description */}
              {piece.description && (
                <>
                  <p style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '0.95rem', lineHeight: 1.8,
                    color: '#6b5f52',
                  }}>
                    {piece.description}
                  </p>
                  <div style={{ height: 1, background: 'rgba(200,165,90,0.2)', margin: '16px 0' }} />
                </>
              )}

              {/* Tags */}
              {piece.tags && piece.tags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                  {piece.tags.map(tag => (
                    <span key={tag} style={{
                      border: '1px solid rgba(200,165,90,0.4)',
                      color: '#C9A84C', fontSize: '0.68rem',
                      padding: '2px 10px', letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                    }}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* ── CTAs ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 24 }}>
                {/* WhatsApp */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: 10, background: '#075E54', color: 'white',
                    padding: '16px', textDecoration: 'none',
                    fontSize: '0.85rem', letterSpacing: '0.15em',
                    textTransform: 'uppercase', fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 500,
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#128C7E')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#075E54')}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  Enquire on WhatsApp
                </a>

                {/* Contact */}
                <a
                  href="/contact"
                  onClick={onClose}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '14px', textDecoration: 'none',
                    border: '1px solid rgba(200,165,90,0.6)',
                    color: '#C9A84C', fontSize: '0.8rem',
                    letterSpacing: '0.2em', textTransform: 'uppercase',
                    fontFamily: "'DM Sans', sans-serif",
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#C9A84C';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#C9A84C';
                  }}
                >
                  Send an Enquiry
                </a>
              </div>

              {/* Note */}
              <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.72rem', color: '#9b8e86',
                textAlign: 'center', fontStyle: 'italic',
                marginTop: 16, lineHeight: 1.6,
              }}>
                All pieces are made to order. Customisation available.
              </p>
            </div>
          </motion.aside>

          {/* Lightbox */}
          {lightboxOpen && allImages.length > 0 && (
            <Lightbox
              images={allImages.filter(Boolean)}
              startIndex={activeImg}
              onClose={() => setLightboxOpen(false)}
            />
          )}
        </>
      )}
    </AnimatePresence>
  );
}
