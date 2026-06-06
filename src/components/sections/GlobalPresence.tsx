'use client';

import { motion } from 'framer-motion';

const COUNTRY_DATA = [
  {
    flag: '🇮🇳',
    country: 'India',
    tagline: 'Where every thread begins',
  },
  {
    flag: '🇨🇦',
    country: 'Canada',
    tagline: 'Carrying traditions across oceans',
  },
  {
    flag: '🇺🇸',
    country: 'United States',
    tagline: 'Elegance knows no borders',
  },
  {
    flag: '🇩🇪',
    country: 'Germany',
    tagline: 'Precision meets artistry',
  },
];

export default function GlobalPresence() {
  return (
    <section
      style={{
        background: '#FAF7F2',
        padding: 'clamp(60px,8vw,100px) clamp(20px,6vw,80px)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        style={{ textAlign: 'center', marginBottom: 56 }}
      >
        <span
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '0.6rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5em',
            color: '#C9A84C',
            fontWeight: 500,
            display: 'block',
            marginBottom: 20,
          }}
        >
          Our Reach
        </span>
        <h2
          style={{
            fontFamily: "'Bodoni Moda', 'Cormorant Garamond', Georgia, serif",
            fontSize: 'clamp(2.2rem, 4vw, 3.5rem)',
            fontWeight: 300,
            color: '#1a1410',
            marginBottom: 16,
            lineHeight: 1.2,
          }}
        >
          Delivering Joy Across the World
        </h2>
        <p
          style={{
            fontFamily: "'DM Serif Display', 'Cormorant Garamond', Georgia, serif",
            fontSize: '1rem',
            color: '#6b5f52',
            fontStyle: 'italic',
            marginBottom: 28,
          }}
        >
          Handcrafted in India. Worn with love across four continents.
        </p>
        {/* Thin gold rule */}
        <div
          style={{
            width: 80,
            height: 1,
            background: 'rgba(201,168,76,0.6)',
            margin: '0 auto',
          }}
        />
      </motion.div>

      {/* Country Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 20,
          maxWidth: 1100,
          margin: '0 auto 40px',
        }}
      >
        {COUNTRY_DATA.map((item, i) => (
          <motion.div
            key={item.country}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            style={{
              background: '#ffffff',
              border: '1px solid rgba(200,165,90,0.15)',
              borderTop: '3px solid #C9A84C',
              borderRadius: 2,
              padding: '32px 28px',
            }}
          >
            {/* Flag + Country Name */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 16,
              }}
            >
              <span style={{ fontSize: '2rem', lineHeight: 1 }}>{item.flag}</span>
              <span
                style={{
                  fontFamily: "'Bodoni Moda', 'Cormorant Garamond', Georgia, serif",
                  fontSize: '1.3rem',
                  color: '#1a1410',
                  fontWeight: 400,
                  lineHeight: 1.2,
                }}
              >
                {item.country}
              </span>
            </div>

            {/* Thin divider */}
            <div
              style={{
                height: 1,
                background: 'rgba(200,165,90,0.2)',
                marginBottom: 16,
              }}
            />

            {/* Label */}
            <span
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.65rem',
                color: '#C9A84C',
                textTransform: 'uppercase',
                letterSpacing: '0.2em',
                display: 'block',
                marginBottom: 8,
              }}
            >
              Happy Customers
            </span>

            {/* Tagline */}
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.8rem',
                color: '#6b5f52',
                fontStyle: 'italic',
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              {item.tagline}
            </p>
          </motion.div>
        ))}
      </div>

      {/* "And counting..." */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.5 }}
        style={{ textAlign: 'center' }}
      >
        <p
          style={{
            fontFamily: "'Bodoni Moda', 'Cormorant Garamond', Georgia, serif",
            fontSize: '1.1rem',
            fontStyle: 'italic',
            color: '#C9A84C',
          }}
        >
          And counting...
        </p>
      </motion.div>
    </section>
  );
}
