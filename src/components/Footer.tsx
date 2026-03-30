import Link from 'next/link';
import { contactInfo } from '@/config/contact';

export default function Footer() {
  return (
    <footer className="w-full bg-primary text-primary-foreground py-16 px-8 border-t border-gold/30">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-2">
          <h2 className="text-3xl font-serif text-gold mb-6 tracking-widest">KALANIDHI</h2>
          <p className="text-muted/80 text-balance max-w-sm leading-relaxed">
            Crafting timeless elegance and unparalleled luxury for those who seek the extraordinary.
          </p>
        </div>
        
        <div className="flex flex-col gap-4">
          <h3 className="uppercase tracking-[0.2em] text-xs text-gold-light mb-2 font-medium">Explore</h3>
          <Link href="/collections" className="hover:text-gold transition-colors w-fit text-sm">Collections</Link>
          <Link href="/story" className="hover:text-gold transition-colors w-fit text-sm">Our Story</Link>
          <Link href="/contact" className="hover:text-gold transition-colors w-fit text-sm">Contact</Link>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="uppercase tracking-[0.2em] text-xs text-gold-light mb-2 font-medium">Connect</h3>
          <a href={`mailto:${contactInfo.email}`} className="hover:text-gold transition-colors w-fit text-sm">
            {contactInfo.email}
          </a>
          <a href={`tel:${contactInfo.phone}`} className="hover:text-gold transition-colors w-fit text-sm">
            {contactInfo.phone}
          </a>
          <a href={contactInfo.instagram} target="_blank" rel="noreferrer" className="hover:text-gold transition-colors w-fit mt-4 text-sm">
            Instagram
          </a>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-gold/20 flex flex-col md:flex-row justify-between items-center text-xs text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Kalanidhi. All rights reserved.</p>
        <div className="flex gap-6 mt-4 md:mt-0">
          <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
