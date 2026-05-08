'use client';

import { useState, useEffect } from 'react';
import { getActiveTestimonials } from '@/utils/firebase/db';

/* ─── Timeout helper ────────────────────────────────────────────────────────── */
function withTimeout<T>(p: Promise<T>, ms = 1500, fallback: T): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>(resolve => setTimeout(() => resolve(fallback), ms)),
  ]);
}

interface Testimonial {
  id: string;
  name?: string;
  authorName?: string;
  location?: string;
  authorDetail?: string;
  message?: string;
  quote?: string;
  active?: boolean;
  isFeatured?: boolean;
}

// Normalise field names across old and new schema
function normalise(t: Testimonial) {
  return {
    id:       t.id,
    name:     t.name     ?? t.authorName   ?? 'Valued Customer',
    location: t.location ?? t.authorDetail ?? 'India',
    message:  t.message  ?? t.quote        ?? '',
  };
}

// Pastel card colors
const CARD_COLORS = [
  { bg: '#F2D9D0', text: '#1a1a1a' }, // blush
  { bg: '#D4E2D4', text: '#1a1a1a' }, // sage
  { bg: '#EDE0D8', text: '#1a1a1a' }, // warm blush
  { bg: '#D8E8D8', text: '#1a1a1a' }, // light sage
];

function TestimonialCard({ t, index }: { t: ReturnType<typeof normalise>; index: number }) {
  const colors = CARD_COLORS[index % CARD_COLORS.length];
  return (
    <div
      style={{
        background:   colors.bg,
        flexShrink:   0,
        width:        300,
        padding:      '28px 28px 24px',
        borderRadius: 4,
        boxShadow:    '0 2px 16px rgba(0,0,0,0.06)',
        marginRight:  24,
      }}
    >
      <p style={{
        fontFamily: '"Cormorant Garamond", Georgia, serif',
        fontSize:   15,
        fontStyle:  'italic',
        color:      colors.text,
        lineHeight: 1.65,
        marginBottom: 20,
        fontWeight: 400,
      }}>
        &ldquo;{t.message}&rdquo;
      </p>
      <div style={{ borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: 14 }}>
        <p style={{ fontSize: 13, fontWeight: 600, fontFamily: '"Cormorant Garamond", Georgia, serif', color: colors.text }}>
          {t.name}
        </p>
        <p style={{ fontSize: 10, color: '#7a6a60', textTransform: 'uppercase', letterSpacing: '0.18em', marginTop: 3 }}>
          {t.location}
        </p>
      </div>
    </div>
  );
}

// Placeholder cards shown before data loads
const PLACEHOLDER_TESTIMONIALS: Testimonial[] = Array.from({ length: 6 }, (_, i) => ({
  id: `placeholder-${i}`,
  name: 'Valued Customer',
  location: 'India',
  message: 'An exquisite experience from start to finish. The craftsmanship is truly unparalleled.',
}));

export default function TestimonialsMarquee() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(PLACEHOLDER_TESTIMONIALS);

  useEffect(() => {
    withTimeout(getActiveTestimonials().catch(() => []), 1500, [])
      .then((data: any[]) => {
        if (data && data.length > 0) setTestimonials(data);
      })
      .catch(() => {/* keep placeholders */});
  }, []);

  const normalised = testimonials.map(normalise);

  // Pad to at least 12 cards so marquee never gaps
  let cards = [...normalised];
  while (cards.length < 12) cards = [...cards, ...normalised];
  // Duplicate for seamless loop
  const row1 = [...cards, ...cards];
  const row2 = [...cards, ...cards].reverse();

  return (
    <section style={{ background: '#FAF7F2', padding: '80px 0 100px', overflow: 'hidden' }}>
      {/* Heading */}
      <div style={{ textAlign: 'center', marginBottom: 56, padding: '0 24px' }}>
        <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.35em', color: '#C9A84C', fontWeight: 500 }}>
          Testimonials
        </span>
        <h2 style={{
          fontFamily: '"Cormorant Garamond", Georgia, serif',
          fontSize: 'clamp(1.8rem,3.5vw,2.8rem)',
          fontWeight: 300,
          color: '#1a1a1a',
          marginTop: 14,
          letterSpacing: '0.02em',
        }}>
          Voices of our Patrons
        </h2>
        <div style={{ width: 40, height: 1, background: 'rgba(201,168,76,0.5)', margin: '16px auto 0' }} />
      </div>

      {/* Row 1 — left to right */}
      <div style={{ overflow: 'hidden', marginBottom: 20 }}>
        <div className="marquee-ltr" style={{ display: 'flex', width: 'max-content' }}>
          {row1.map((t, i) => <TestimonialCard key={`r1-${t.id}-${i}`} t={t} index={i} />)}
        </div>
      </div>

      {/* Row 2 — right to left */}
      <div style={{ overflow: 'hidden' }}>
        <div className="marquee-rtl" style={{ display: 'flex', width: 'max-content' }}>
          {row2.map((t, i) => <TestimonialCard key={`r2-${t.id}-${i}`} t={t} index={i + 2} />)}
        </div>
      </div>
    </section>
  );
}
