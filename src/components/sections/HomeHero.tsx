'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

function LotusOrb() {
  return (
    <motion.div
      className="absolute pointer-events-none select-none"
      style={{ top: '12%', right: '8%', opacity: 0.18 }}
      animate={{ y: [0, -18, 0], rotate: [0, 6, 0] }}
      transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', repeatType: 'mirror' }}
    >
      <svg width="220" height="220" viewBox="0 0 220 220" fill="none">
        <circle cx="110" cy="110" r="108" stroke="#c9a96e" strokeWidth="0.6" />
        <circle cx="110" cy="110" r="80" stroke="#c9a96e" strokeWidth="0.4" strokeDasharray="4 6" />
        <circle cx="110" cy="110" r="54" stroke="#c9a96e" strokeWidth="0.6" />
        {[0,45,90,135,180,225,270,315].map((deg, i) => (
          <ellipse key={i} cx="110" cy="110" rx="18" ry="46" stroke="#c9a96e" strokeWidth="0.5" fill="none" transform={`rotate(${deg} 110 110)`} />
        ))}
        <circle cx="110" cy="110" r="8" fill="#c9a96e" fillOpacity="0.4" />
      </svg>
    </motion.div>
  );
}

function CornerOrb() {
  return (
    <motion.div
      className="absolute pointer-events-none select-none"
      style={{ bottom: '15%', left: '6%', opacity: 0.12 }}
      animate={{ y: [0, 14, 0], rotate: [0, -5, 0] }}
      transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', repeatType: 'mirror', delay: 1.5 }}
    >
      <svg width="140" height="140" viewBox="0 0 140 140" fill="none">
        <circle cx="70" cy="70" r="68" stroke="#c9a96e" strokeWidth="0.6" />
        <circle cx="70" cy="70" r="48" stroke="#c9a96e" strokeWidth="0.4" strokeDasharray="3 5" />
        {[0,60,120,180,240,300].map((deg, i) => (
          <ellipse key={i} cx="70" cy="70" rx="12" ry="34" stroke="#c9a96e" strokeWidth="0.5" fill="none" transform={`rotate(${deg} 70 70)`} />
        ))}
        <circle cx="70" cy="70" r="5" fill="#c9a96e" fillOpacity="0.35" />
      </svg>
    </motion.div>
  );
}

export default function HomeHero() {
  const [mounted,   setMounted]   = useState(false);
  const [heroOpacity, setHeroOpacity] = useState(1);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => {
      const progress = Math.min(window.scrollY / window.innerHeight, 1);
      setHeroOpacity(1 - progress);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.3 } },
  };
  const letterVariants = {
    hidden: { opacity: 0, y: 60, filter: 'blur(12px)' },
    visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { type: 'spring' as const, damping: 18, stiffness: 80 } },
  };

  return (
    <section
      className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-[#FAF7F2]"
      style={{ opacity: heroOpacity, zIndex: 20, position: 'relative' }}
    >
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(242,217,208,0.45) 0%, transparent 70%)' }} />
      <AnimatePresence>
        {mounted && <><LotusOrb /><CornerOrb /></>}
      </AnimatePresence>
      <motion.div
        className="absolute top-[18%] left-0 right-0 flex items-center pointer-events-none px-12"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 0.25 }}
        transition={{ duration: 1.8, delay: 0.5, ease: 'easeOut' }}
        style={{ originX: '0%' }}
      >
        <div className="flex-1 h-px bg-[#c9a96e]" />
        <div className="w-1.5 h-1.5 rounded-full bg-[#c9a96e] mx-4 flex-shrink-0" />
        <div className="flex-1 h-px bg-[#c9a96e]" />
      </motion.div>
      <motion.div
        className="absolute bottom-[22%] left-0 right-0 flex items-center pointer-events-none px-12"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 0.25 }}
        transition={{ duration: 1.8, delay: 0.7, ease: 'easeOut' }}
        style={{ originX: '100%' }}
      >
        <div className="flex-1 h-px bg-[#c9a96e]" />
        <div className="w-1.5 h-1.5 rounded-full bg-[#c9a96e] mx-4 flex-shrink-0" />
        <div className="flex-1 h-px bg-[#c9a96e]" />
      </motion.div>
      <div className="relative z-10 text-center px-4 w-full">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex justify-center mb-6 overflow-visible">
          {'KALANIDHI'.split('').map((letter, i) => (
            <motion.span key={i} variants={letterVariants} className="font-serif inline-block leading-none text-[#1a1a1a]"
              style={{ fontSize: 'clamp(3.5rem, 10vw, 11rem)', fontWeight: 300, letterSpacing: '0.12em' }}>
              {letter}
            </motion.span>
          ))}
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 1.2, ease: 'easeOut' }}
          className="text-[#7a6a60] font-light uppercase max-w-xl mx-auto mt-2"
          style={{ fontSize: 'clamp(0.6rem, 1.2vw, 0.85rem)', letterSpacing: '0.35em' }}
        >
          Where Heritage Meets Exquisite Craftsmanship
        </motion.p>
        <motion.div className="flex items-center justify-center gap-4 mt-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8, duration: 1 }}>
          <div className="w-16 h-px bg-[#c9a96e]" />
          <div className="w-1 h-1 rounded-full bg-[#c9a96e]" />
          <div className="w-16 h-px bg-[#c9a96e]" />
        </motion.div>
      </div>
      <AnimatePresence>
        {mounted && (
          <motion.div
            key="scroll-indicator"
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-10"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ delay: 2.2, duration: 1 }}
          >
            <span className="text-[9px] uppercase tracking-[0.3em] text-[#c9a96e]">Discover</span>
            <div className="w-px h-14 overflow-hidden bg-[#c9a96e]/20 relative">
              <motion.div
                className="absolute top-0 left-0 w-full bg-[#c9a96e]"
                style={{ height: '100%' }}
                animate={{ y: ['-100%', '100%'] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
