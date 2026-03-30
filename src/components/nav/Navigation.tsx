'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { Menu } from 'lucide-react';
import MobileMenu from './MobileMenu';

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() || 0;
    if (latest > previous && latest > 150) {
      setIsHidden(true);
    } else {
      setIsHidden(false);
    }
    setIsScrolled(latest > 50);
  });

  return (
    <>
      <motion.header
        variants={{
          visible: { y: 0 },
          hidden: { y: '-100%' },
        }}
        animate={isHidden ? 'hidden' : 'visible'}
        transition={{ duration: 0.35, ease: 'easeInOut' }}
        className={`fixed top-0 inset-x-0 z-40 transition-colors duration-500 ${
          isScrolled ? 'bg-background/90 backdrop-blur-md shadow-sm border-b border-gold/10' : 'bg-transparent text-foreground'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 h-20 md:h-24 flex items-center justify-between">
          <Link href="/" className="text-xl md:text-2xl font-serif tracking-[0.2em] text-gold hover:opacity-80 transition-opacity">
            KALANIDHI
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-12 uppercase tracking-[0.15em] text-xs font-medium">
            <Link href="/collections" className="hover:text-gold transition-colors relative group">
              Collections
              <span className="absolute -bottom-2 left-0 w-0 h-px bg-gold transition-all duration-300 group-hover:w-full" />
            </Link>
            <Link href="/story" className="hover:text-gold transition-colors relative group">
              Our Story
              <span className="absolute -bottom-2 left-0 w-0 h-px bg-gold transition-all duration-300 group-hover:w-full" />
            </Link>
            <Link href="/contact" className="hover:text-gold transition-colors relative group">
              Contact
              <span className="absolute -bottom-2 left-0 w-0 h-px bg-gold transition-all duration-300 group-hover:w-full" />
            </Link>
          </nav>

          {/* Mobile Toggle */}
          <button 
            className="md:hidden p-2 text-foreground hover:text-gold transition-colors"
            onClick={() => setIsMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>
        </div>
      </motion.header>

      <MobileMenu isOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)} />
    </>
  );
}
