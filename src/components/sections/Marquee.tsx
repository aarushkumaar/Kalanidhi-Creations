'use client';

import { motion } from 'framer-motion';

export default function Marquee({ text, speed = 20 }: { text: string; speed?: number }) {
  return (
    <div className="w-full overflow-hidden bg-primary text-primary-foreground py-4 flex whitespace-nowrap border-y border-gold/20">
      <motion.div
        className="flex gap-8 items-center text-sm md:text-base uppercase tracking-[0.3em]"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ repeat: Infinity, ease: 'linear', duration: speed }}
      >
        {/* Duplicate text 4 times for seamless loop */}
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex gap-8 items-center">
            <span>{text}</span>
            <span className="w-2 h-2 rounded-full bg-gold inline-block" />
          </div>
        ))}
      </motion.div>
    </div>
  );
}
