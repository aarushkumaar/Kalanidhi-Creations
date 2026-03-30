'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const links = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/pieces', label: 'Pieces' },
    { href: '/admin/categories', label: 'Categories' },
    { href: '/admin/testimonials', label: 'Testimonials' },
    { href: '/admin/enquiries', label: 'Enquiries' },
    { href: '/admin/settings', label: 'Settings' },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <aside className="w-full md:w-64 bg-primary text-primary-foreground flex flex-col h-auto md:min-h-screen p-6 border-b md:border-r border-gold/20">
      <div className="mb-8 md:mb-12">
        <h2 className="text-2xl font-serif text-gold tracking-widest pt-4">ADMIN</h2>
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
      <div className="mt-8">
        <button onClick={handleLogout} className="text-xs uppercase tracking-widest text-muted-foreground hover:text-white transition-colors w-full text-left px-4 pb-4">
          Logout
        </button>
      </div>
    </aside>
  );
}
