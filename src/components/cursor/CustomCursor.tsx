'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    // Check if device supports hover (ignores mobile)
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const onMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseHover = () => setHovering(true);
    const handleMouseLeave = () => setHovering(false);

    document.addEventListener('mousemove', onMouseMove);

    const interactiveElements = document.querySelectorAll('a, button, input, select, textarea');
    interactiveElements.forEach((el) => {
      el.addEventListener('mouseenter', handleMouseHover);
      el.addEventListener('mouseleave', handleMouseLeave);
    });

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      interactiveElements.forEach((el) => {
        el.removeEventListener('mouseenter', handleMouseHover);
        el.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, []);

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 rounded-full border border-gold/70 pointer-events-none z-[9999] mix-blend-difference hidden md:block"
        animate={{
          x: position.x - 16,
          y: position.y - 16,
          scale: hovering ? 1.5 : 1,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30, mass: 0.5 }}
      />
      <motion.div
        className="fixed top-0 left-0 w-2 h-2 rounded-full bg-gold pointer-events-none z-[9999] mix-blend-difference hidden md:block"
        animate={{
          x: position.x - 4,
          y: position.y - 4,
          opacity: hovering ? 0 : 1,
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 28, mass: 0.1 }}
      />
    </>
  );
}
