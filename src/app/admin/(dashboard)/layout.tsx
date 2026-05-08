'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@/components/admin/Sidebar';

const STORAGE_KEY = 'kalanidhi-admin';
const PW_STORAGE_KEY = 'kalanidhi-admin-pw';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);

  // Emergency kill-switch: if auth state is still null after 2500 ms
  // (e.g. useEffect stalled), default to locked rather than spinning forever.
  useEffect(() => {
    const kill = setTimeout(() => {
      setIsAuthenticated(prev => prev === null ? false : prev);
    }, 2500);
    return () => clearTimeout(kill);
  }, []);

  useEffect(() => {
    try {
      const auth = sessionStorage.getItem(STORAGE_KEY);
      setIsAuthenticated(auth === 'true');
    } catch {
      setIsAuthenticated(false);
    }
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const correctPw = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
    if (password === correctPw) {
      sessionStorage.setItem(STORAGE_KEY, 'true');
      sessionStorage.setItem(PW_STORAGE_KEY, password);
      setIsAuthenticated(true);
      setError(false);
    } else {
      setError(true);
      setShaking(true);
      setTimeout(() => setShaking(false), 600);
      setPassword('');
    }
  }

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4"
        style={{ background: 'linear-gradient(135deg, #FAF7F2 0%, #F2D9D0 50%, #FAF7F2 100%)' }}
      >
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-md"
          >
            {/* Brand mark */}
            <div className="text-center mb-12">
              <motion.p
                initial={{ opacity: 0, letterSpacing: '0.5em' }}
                animate={{ opacity: 1, letterSpacing: '0.3em' }}
                transition={{ delay: 0.3, duration: 1 }}
                className="text-3xl font-serif text-foreground tracking-[0.3em]"
              >
                KALANIDHI
              </motion.p>
              <div className="w-12 h-px bg-gold mx-auto mt-4" />
            </div>

            <motion.form
              onSubmit={handleSubmit}
              animate={shaking ? { x: [0, -8, 8, -8, 8, 0] } : { x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center gap-8"
            >
              <div className="text-center">
                <p className="text-muted-foreground text-sm uppercase tracking-[0.25em] font-light">
                  Speak the word
                </p>
              </div>

              <div className="w-full relative">
                <input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(false); }}
                  autoFocus
                  className="w-full bg-transparent border-b-2 border-taupe focus:border-gold text-center text-lg tracking-[0.3em] py-3 focus:outline-none transition-colors duration-300 text-foreground placeholder:text-muted-foreground/50 placeholder:tracking-widest"
                  placeholder="· · · · · ·"
                />
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center text-xs text-taupe uppercase tracking-[0.2em] mt-4 font-light"
                  >
                    The door remains closed
                  </motion.p>
                )}
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 border border-gold text-gold uppercase tracking-[0.3em] text-xs hover:bg-gold hover:text-background transition-all duration-500 font-medium"
              >
                Enter
              </motion.button>
            </motion.form>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background flex-col md:flex-row relative z-[99999]">
      <Sidebar />
      <main className="flex-1 p-6 md:p-12 overflow-y-auto w-full">
        {children}
      </main>
    </div>
  );
}
