'use client';

import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

// Dynamic import with SSR disabled to prevent Three.js errors during server-side rendering
const HeroCanvas = dynamic(() => import('../three/HeroCanvas'), { ssr: false });

export default function HomeHero() {
  const title = "KALANIDHI";
  const subtitle = "The Epitome of Fine Jewelry & Extraordinary Craftsmanship.";

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const letterVariants = {
    hidden: { opacity: 0, y: 50, filter: 'blur(10px)' },
    visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { type: 'spring' as const, damping: 15, stiffness: 100 } },
  };

  return (
    <section className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-background">
      {/* 3D Background */}
      <HeroCanvas />

      {/* Content Overlay */}
      <div className="relative z-10 text-center px-4 mix-blend-exclusion dark:mix-blend-normal pointer-events-none w-full">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex justify-center mb-6 overflow-hidden md:px-12 w-full"
        >
          {title.split('').map((letter, index) => (
            <motion.span
              key={index}
              variants={letterVariants}
              className="text-6xl md:text-8xl lg:text-[10rem] font-serif text-primary-foreground tracking-widest inline-block"
            >
              {letter}
            </motion.span>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 1.2, ease: 'easeOut' }}
          className="text-primary-foreground/90 text-sm md:text-lg font-light tracking-[0.2em] uppercase max-w-2xl mx-auto"
        >
          {subtitle}
        </motion.p>
      </div>

      {/* Scroll indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 text-gold z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 1 }}
      >
        <span className="text-[10px] uppercase tracking-widest">Discover</span>
        <div className="w-[1px] h-16 overflow-hidden bg-gold/20">
          <motion.div 
            className="w-full h-full bg-gold origin-top"
            animate={{ scaleY: [0, 1, 0], translateY: ['0%', '0%', '100%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>
    </section>
  );
}
