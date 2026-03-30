import Link from 'next/link';
import CustomCursor from '@/components/cursor/CustomCursor';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-center px-4">
      <CustomCursor />
      <h1 className="text-8xl md:text-9xl font-serif text-gold mb-6 opacity-30 select-none">404</h1>
      <h2 className="text-2xl md:text-3xl font-serif text-foreground mb-8">Page Not Found</h2>
      <p className="text-muted-foreground max-w-md mb-12 leading-relaxed">
        We apologize, but the page you are looking for has been moved or no longer exists in our boutique.
      </p>
      <Link href="/" className="bg-gold text-background py-4 px-10 uppercase tracking-widest text-sm hover:bg-gold-light transition-colors font-medium">
        Return to Boutique
      </Link>
    </div>
  );
}
