'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export type ToastType = { id: string; message: string; type?: 'success' | 'error' | 'info' };

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastType[]>([]);

  useEffect(() => {
    const handleAdd = (e: CustomEvent<ToastType>) => {
      setToasts((prev) => [...prev, e.detail]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== e.detail.id));
      }, 5000);
    };

    window.addEventListener('add-toast' as any, handleAdd);
    return () => window.removeEventListener('add-toast' as any, handleAdd);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            className={`flex items-center gap-3 px-4 py-3 min-w-[300px] border shadow-lg bg-background text-foreground ${
              toast.type === 'error' ? 'border-red-500/50' : 'border-gold/50'
            }`}
          >
            <span className="flex-1 text-sm font-medium">{toast.message}</span>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export const toast = (message: string, type: ToastType['type'] = 'info') => {
  const event = new CustomEvent('add-toast', {
    detail: { id: Math.random().toString(36).substring(7), message, type },
  });
  window.dispatchEvent(event);
};
