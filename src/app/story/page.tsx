'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import SectionLabel from '@/components/ui/SectionLabel';
import GoldRule from '@/components/ui/GoldRule';

/* ── Fade-up helper ──────────────────────────────────────────────────────────── */
function FadeUp({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      viewport={{ once: true }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function StoryPage() {
  return (
    <div className="min-h-screen w-full">

      {/* ── HERO BANNER ─────────────────────────────────────────────────────── */}
      <div className="h-[60vh] w-full bg-muted relative flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gold/5" />
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="text-6xl md:text-8xl font-serif text-foreground mix-blend-exclusion z-10 tracking-widest text-center px-4"
        >
          OUR STORY
        </motion.h1>
      </div>

      {/* ── BRAND HERITAGE ──────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto py-24 px-6 md:px-12 text-center md:text-left">
        <FadeUp>
          <SectionLabel text="Heritage &amp; Craft" />
          <h2 className="text-3xl md:text-5xl font-serif text-gold mb-12 leading-snug mt-4">
            Decades of passion, crystallized into moments of everlasting beauty.
          </h2>
        </FadeUp>

        <FadeUp delay={0.1} className="space-y-8 text-muted-foreground leading-relaxed text-lg">
          <p>
            The Kalanidhi legacy began with a profound reverence for the earth&apos;s most exquisite offerings.
            Born from a lineage of master artisans, our brand marries the rich architectural heritage of Indian
            royal fashion with minimalist, contemporary elegance.
          </p>
          <p>
            Every fabric is ethically sourced, hand-selected for its texture and drape, and crafted to perfection.
            For us, clothing is not merely ornamentation; it is wearable art, designed to become a cherished
            memory passed through generations.
          </p>
          <p>
            Welcome to Kalanidhi, where every piece is a poem in silk.
          </p>
        </FadeUp>
      </div>

      <GoldRule />

      {/* ── FOUNDER SECTION ─────────────────────────────────────────────────── */}
      <section className="py-20 md:py-28 px-6 md:px-16 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true }}
          className="flex flex-col-reverse md:flex-row items-center gap-16 md:gap-20"
        >

          {/* LEFT — About Text (55%) */}
          <div className="w-full md:w-[55%]">
            <FadeUp delay={0.15}>

              {/* Label */}
              <span className="founder-label">About the Founder</span>

              {/* Heading */}
              <h2 className="founder-heading">The woman behind every stitch</h2>

              {/* Body */}
              <div className="founder-body space-y-5">
                <p>
                  With over two decades of dedication to Indian fashion, she began Kalanidhi not as a business,
                  but as a love letter to craft. Every fabric she chooses, every silhouette she imagines, carries
                  the memory of women she has admired — her mother, her grandmother, her customers who became family.
                </p>
                <p>
                  She believes that a garment is not just something you wear. It is something you feel. From the
                  first drape to the final stitch, her hands have been part of every piece that has left this studio.
                </p>
                <p>
                  Kalanidhi — treasury of art — was named for what she believes every woman carries within her: an
                  irreplaceable wealth of stories, grace, and beauty.
                </p>
              </div>

              {/* Gold rule */}
              <div className="founder-rule" />

              {/* Signature */}
              <p className="founder-name">Founder</p>
              <p className="founder-title">Founder &amp; CEO, Kalanidhi</p>
            </FadeUp>
          </div>

          {/* RIGHT — Image (45%) */}
          <FadeUp delay={0.25} className="w-full md:w-[45%] flex flex-col items-center">
            <div className="founder-img-frame">
              <Image
                src="/images/founder.jpg"
                alt="Founder of Kalanidhi"
                fill
                unoptimized
                style={{ objectFit: 'cover', objectPosition: 'center top' }}
                sizes="(max-width: 768px) 100vw, 420px"
                priority
              />
            </div>

            {/* Caption */}
            <div className="founder-caption">
              <div className="founder-caption-line" />
              <span className="founder-caption-text">Founder &nbsp;|&nbsp; CEO</span>
              <div className="founder-caption-line" />
            </div>
          </FadeUp>

        </motion.div>
      </section>

      <GoldRule />

      {/* ── CTA ─────────────────────────────────────────────────────────────── */}
      <FadeUp className="py-16 flex justify-center">
        <Link
          href="/collections"
          className="py-4 px-12 border border-[#c9a96e] text-[#c9a96e] hover:bg-[#c9a96e] hover:text-white transition-all duration-500 uppercase tracking-[0.25em] text-xs font-medium"
        >
          Explore the Collection
        </Link>
      </FadeUp>

    </div>
  );
}
