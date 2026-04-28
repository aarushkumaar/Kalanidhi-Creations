'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/pieces', label: 'Pieces' },
    { href: '/admin/categories', label: 'Collections' },
    { href: '/admin/testimonials', label: 'Testimonials' },
    { href: '/admin/enquiries', label: 'Enquiries' },
    { href: '/admin/settings', label: 'Settings' },
  ];

  return (
    <aside className="w-full md:w-64 bg-primary text-primary-foreground flex flex-col h-auto md:min-h-screen p-6 border-b md:border-r border-gold/20">
      <div className="mb-8 md:mb-12">
        <h2 className="text-2xl font-serif text-gold tracking-widest pt-4">KALANIDHI</h2>
        <p className="text-[10px] uppercase tracking-[0.25em] text-primary-foreground/40 mt-1">Admin Portal</p>
      </div>
      <nav className="flex-1 flex flex-col gap-2 md:gap-4">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`uppercase tracking-widest text-xs py-3 px-4 transition-colors ${
              pathname === link.href ? 'bg-gold text-background font-medium' : 'hover:text-gold'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="mt-8 px-4 pb-4">
        <div className="w-8 h-px bg-gold/30 mb-3" />
        <p className="text-[10px] uppercase tracking-widest text-primary-foreground/30">Kalanidhi &copy; {new Date().getFullYear()}</p>
      </div>
    </aside>
  );
}
