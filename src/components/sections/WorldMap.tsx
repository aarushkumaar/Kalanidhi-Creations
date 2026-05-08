'use client';

import { motion } from 'framer-motion';

const GOLD   = '#C9A84C';
const MUTED  = '#D4C9B8';
const OCEAN  = '#EAE4DC';

/* ── Simplified world map SVG paths (Robinson-like projection) ── */
/* Countries are approximate outlines for visual effect            */
const COUNTRIES = [
  // Canada
  {
    id: 'CA', fill: GOLD,
    d: 'M 120,70 L 185,65 L 200,78 L 195,90 L 210,88 L 220,75 L 240,72 L 245,85 L 235,95 L 220,100 L 200,105 L 185,115 L 175,112 L 165,120 L 148,118 L 138,108 L 130,95 L 118,88 Z',
  },
  // United States
  {
    id: 'US', fill: GOLD,
    d: 'M 118,115 L 138,112 L 148,118 L 165,120 L 175,112 L 185,115 L 196,118 L 200,130 L 198,145 L 185,152 L 168,155 L 148,153 L 130,150 L 118,140 L 112,128 Z',
  },
  // Mexico + Central America (muted)
  {
    id: 'MX', fill: MUTED,
    d: 'M 118,153 L 148,153 L 152,162 L 148,172 L 140,175 L 130,170 L 120,162 Z',
  },
  // Greenland
  { id: 'GL', fill: MUTED, d: 'M 200,48 L 220,42 L 235,48 L 228,60 L 218,65 L 205,62 Z' },
  // South America
  { id: 'SA', fill: MUTED, d: 'M 150,180 L 175,172 L 185,185 L 190,210 L 182,235 L 168,248 L 155,240 L 145,220 L 140,200 L 142,185 Z' },
  // UK / Ireland
  { id: 'GB', fill: MUTED, d: 'M 302,88 L 308,85 L 312,90 L 310,96 L 304,98 L 300,93 Z' },
  // Scandinavia
  { id: 'SC', fill: MUTED, d: 'M 318,60 L 330,55 L 338,65 L 335,78 L 325,82 L 315,76 L 314,66 Z' },
  // Germany / Western Europe
  {
    id: 'DE', fill: GOLD,
    d: 'M 308,98 L 322,94 L 330,100 L 328,112 L 318,116 L 308,112 L 305,104 Z',
  },
  // France
  { id: 'FR', fill: MUTED, d: 'M 298,104 L 308,100 L 310,112 L 302,118 L 294,114 L 292,106 Z' },
  // Spain / Portugal
  { id: 'ES', fill: MUTED, d: 'M 290,115 L 304,112 L 306,122 L 296,128 L 287,124 Z' },
  // Italy
  { id: 'IT', fill: MUTED, d: 'M 316,112 L 322,108 L 326,118 L 322,128 L 316,126 L 312,118 Z' },
  // Eastern Europe / Poland
  { id: 'PL', fill: MUTED, d: 'M 322,92 L 340,88 L 345,100 L 338,108 L 328,108 L 320,100 Z' },
  // Russia
  { id: 'RU', fill: MUTED, d: 'M 335,55 L 420,45 L 435,60 L 440,80 L 420,90 L 390,88 L 360,85 L 340,78 L 332,65 Z' },
  // Turkey
  { id: 'TR', fill: MUTED, d: 'M 338,118 L 360,114 L 366,122 L 358,130 L 340,132 L 334,126 Z' },
  // Africa (North)
  { id: 'NA', fill: MUTED, d: 'M 292,132 L 360,128 L 368,145 L 355,158 L 330,162 L 308,158 L 292,148 Z' },
  // Africa (Sub-Saharan)
  { id: 'SS', fill: MUTED, d: 'M 300,162 L 358,158 L 362,180 L 350,205 L 332,215 L 318,210 L 302,195 L 295,178 Z' },
  // Middle East
  { id: 'ME', fill: MUTED, d: 'M 360,128 L 388,122 L 395,135 L 385,148 L 368,152 L 358,142 Z' },
  // India
  {
    id: 'IN', fill: GOLD,
    d: 'M 390,135 L 410,130 L 420,142 L 418,162 L 408,178 L 398,175 L 388,158 L 384,142 Z',
  },
  // Sri Lanka
  { id: 'LK', fill: MUTED, d: 'M 408,180 L 414,178 L 415,185 L 410,186 Z' },
  // China
  { id: 'CN', fill: MUTED, d: 'M 415,100 L 455,88 L 465,105 L 458,125 L 440,132 L 420,130 L 408,118 Z' },
  // South East Asia
  { id: 'SEA', fill: MUTED, d: 'M 448,128 L 470,122 L 478,138 L 468,148 L 450,145 L 442,135 Z' },
  // Japan / Korea
  { id: 'JP', fill: MUTED, d: 'M 468,95 L 478,90 L 482,100 L 475,108 L 466,105 Z' },
  // Australia
  { id: 'AU', fill: MUTED, d: 'M 445,195 L 490,185 L 498,205 L 490,225 L 468,232 L 448,222 L 438,208 Z' },
  // New Zealand
  { id: 'NZ', fill: MUTED, d: 'M 498,225 L 508,218 L 512,228 L 506,235 Z' },
  // Central Asia / Kazakhstan
  { id: 'KZ', fill: MUTED, d: 'M 368,88 L 415,82 L 420,100 L 408,110 L 388,112 L 368,105 Z' },
  // Pakistan / Afghanistan
  { id: 'PK', fill: MUTED, d: 'M 385,120 L 408,112 L 415,128 L 405,136 L 390,135 L 380,128 Z' },
];

const STATS = [
  { flag: '🇨🇦', country: 'Canada',        label: 'Happy Customers' },
  { flag: '🇺🇸', country: 'United States',  label: 'Happy Customers' },
  { flag: '🇩🇪', country: 'Germany',        label: 'Happy Customers' },
  { flag: '🇮🇳', country: 'India',          label: 'Happy Customers' },
];

export default function WorldMap() {
  return (
    <section style={{ background: '#FAF7F2', padding: '100px 0 80px', overflow: 'hidden' }}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        style={{ textAlign: 'center', marginBottom: 56 }}
      >
        <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.35em', color: '#C9A84C', fontWeight: 500 }}>
          Global Reach
        </span>
        <h2 style={{
          fontFamily: '"Cormorant Garamond", Georgia, serif',
          fontSize: 'clamp(2rem,4vw,3rem)',
          fontWeight: 300,
          color: '#1a1a1a',
          marginTop: 16,
          letterSpacing: '0.02em',
        }}>
          Delivering Joy Across the World
        </h2>
        <div style={{ width: 40, height: 1, background: 'rgba(201,168,76,0.5)', margin: '20px auto 0' }} />
      </motion.div>

      {/* SVG Map */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, delay: 0.2 }}
        style={{ width: '100%', maxWidth: 900, margin: '0 auto', padding: '0 24px' }}
      >
        <svg
          viewBox="80 40 460 215"
          style={{ width: '100%', height: 'auto', display: 'block' }}
          aria-label="World delivery map"
        >
          {/* Ocean background */}
          <rect x="80" y="40" width="460" height="215" fill={OCEAN} />

          {COUNTRIES.map(c => (
            <path
              key={c.id}
              d={c.d}
              fill={c.fill}
              stroke="#FAF7F2"
              strokeWidth="0.8"
              style={{ transition: 'fill 0.3s' }}
            />
          ))}

          {/* Gold glow dots on highlighted countries */}
          {[
            { cx: 168, cy: 105 }, // Canada center
            { cx: 157, cy: 133 }, // USA center
            { cx: 317, cy: 104 }, // Germany center
            { cx: 402, cy: 155 }, // India center
          ].map((pt, i) => (
            <g key={i}>
              <circle cx={pt.cx} cy={pt.cy} r={5} fill={GOLD} opacity={0.25} />
              <circle cx={pt.cx} cy={pt.cy} r={2.5} fill={GOLD} opacity={0.9} />
            </g>
          ))}
        </svg>
      </motion.div>

      {/* Stat cards */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.4 }}
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 24,
          flexWrap: 'wrap',
          maxWidth: 800,
          margin: '48px auto 0',
          padding: '0 24px',
        }}
      >
        {STATS.map((s, i) => (
          <motion.div
            key={s.country}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 + i * 0.08 }}
            style={{
              flex: '1 1 140px',
              maxWidth: 180,
              background: '#FAF7F2',
              border: '1px solid rgba(201,168,76,0.25)',
              padding: '24px 20px',
              textAlign: 'center',
              boxShadow: '0 4px 24px rgba(0,0,0,0.05)',
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 10 }}>{s.flag}</div>
            <p style={{
              fontFamily: '"Cormorant Garamond", Georgia, serif',
              fontSize: 16,
              color: '#1a1a1a',
              fontWeight: 600,
              marginBottom: 4,
            }}>{s.country}</p>
            <p style={{ fontSize: 10, color: '#7a6a60', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
              {s.label}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
