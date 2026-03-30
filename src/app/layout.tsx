import type { Metadata } from 'next';
import { Bodoni_Moda, DM_Sans, DM_Serif_Display } from 'next/font/google';
import './globals.css';
import CustomCursor from '@/components/cursor/CustomCursor';
import PageTransition from '@/components/ui/PageTransition';
import ToastContainer from '@/components/ui/Toast';
import Navigation from '@/components/nav/Navigation';
import Footer from '@/components/Footer';

const bodoni = Bodoni_Moda({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-bodoni',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const dmSerif = DM_Serif_Display({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-dm-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Kalanidhi | Premium Design',
  description: 'A luxurious digital boutique by Kalanidhi.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${bodoni.variable} ${dmSans.variable} ${dmSerif.variable} font-sans antialiased`}
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
