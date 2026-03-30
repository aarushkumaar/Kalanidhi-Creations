'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-center px-4">
      <h2 className="text-3xl font-serif text-gold mb-6">Something went wrong</h2>
      <p className="text-muted-foreground max-w-md mb-12">
        We encountered an unexpected issue while loading this experience.
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="border border-gold text-gold py-3 px-8 uppercase tracking-widest text-sm hover:bg-gold hover:text-background transition-colors"
        >
          Try Again
        </button>
        <Link href="/" className="bg-gold text-background py-3 px-8 uppercase tracking-widest text-sm hover:bg-gold-light transition-colors">
          Return Home
        </Link>
      </div>
    </div>
  );
}
