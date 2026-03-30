'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { X } from 'lucide-react';

const links = [
  { href: '/collections', label: 'Collections' },
  { href: '/story', label: 'Our Story' },
  { href: '/contact', label: 'Contact' },
];

export default function MobileMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: '-100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '-100%', transition: { duration: 0.5, ease: 'easeInOut' } }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-50 bg-primary text-primary-foreground flex flex-col p-8"
        >
          <div className="flex justify-between items-center mb-16">
            <span className="text-xl font-serif text-gold tracking-widest">KALANIDHI</span>
            <button onClick={onClose} className="p-2 -mr-2 text-gold hover:text-gold-light transition-colors">
              <X size={28} />
            </button>
          </div>

          <nav className="flex flex-col gap-8 flex-1 justify-center">
            {links.map((link, i) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i + 0.3, duration: 0.5 }}
              >
                <Link
                  href={link.href}
                  onClick={onClose}
                  className="text-4xl md:text-6xl font-serif hover:text-gold transition-colors inline-block"
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </nav>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="text-sm text-gold-dark uppercase tracking-[0.2em] text-center"
          >
            Luxury Reimagined
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
