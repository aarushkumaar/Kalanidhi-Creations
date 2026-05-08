import nextDynamic from 'next/dynamic';
import HomeHero from '@/components/sections/HomeHero';
import Marquee from '@/components/sections/Marquee';

// All heavy / data-fetching components are loaded client-side only.
// This page renders instantly — Firestore is never awaited on the server.
const LehangaSection = nextDynamic(
  () => import('@/components/sections/LehangaSection'),
  { ssr: false }
);

const WorldMap = nextDynamic(
  () => import('@/components/sections/WorldMap'),
  { ssr: false }
);

const TestimonialsMarquee = nextDynamic(
  () => import('@/components/sections/TestimonialsMarquee'),
  { ssr: false }
);

const HomeClient = nextDynamic(
  () => import('@/components/sections/HomeClient'),
  { ssr: false }
);

// Plain server component — no async, no Firestore, renders immediately.
export default function Home() {
  return (
    <div className="w-full">
      {/* 1 — Hero (pure JSX, zero deps) */}
      <HomeHero />

      {/* 2 — Scroll-driven canvas animation */}
      <LehangaSection />

      {/* 3 — Gold marquee */}
      <Marquee text="New Bridal Collection • Exquisite Lehengas • Everyday Elegance • Handcrafted Heritage • " />

      {/* 4 — Products + collections + brand story — fetches its own data client-side */}
      <HomeClient />

      {/* 5 — World map */}
      <WorldMap />

      {/* 6 — Testimonials marquee — fetches its own data client-side */}
      <TestimonialsMarquee />
    </div>
  );
}
