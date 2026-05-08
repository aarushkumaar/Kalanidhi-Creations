import type { Metadata } from 'next';
import { Cormorant_Garamond, DM_Sans } from 'next/font/google';
import './globals.css';
import dynamic from 'next/dynamic';
const CustomCursor = dynamic(() => import('@/components/cursor/CustomCursor'), { ssr: false });
import PageTransition from '@/components/ui/PageTransition';
import ToastContainer from '@/components/ui/Toast';
import Navigation from '@/components/nav/Navigation';
import Footer from '@/components/Footer';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Kalanidhi | Luxury Indian Art Boutique',
  description: 'Discover timeless jewellery and handcrafted art pieces from Kalanidhi — a luxury Indian boutique rooted in heritage and unparalleled craftsmanship.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${cormorant.variable} ${dmSans.variable} font-sans antialiased`}
      >
        <CustomCursor />
        <ToastContainer />
        <Navigation />
        <PageTransition>
          <main className="min-h-screen pt-24">
            {children}
          </main>
        </PageTransition>
        <Footer />
      </body>
    </html>
  );
}
