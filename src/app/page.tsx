import HomeHero from '@/components/sections/HomeHero';
import Marquee from '@/components/sections/Marquee';
import { getFeaturedPieces, getTestimonials, getCategories } from '@/utils/firebase/db';
import HomeClient from '@/components/sections/HomeClient';

export const revalidate = 60;

export default async function Home() {
  const featuredPieces = await getFeaturedPieces(8).catch(() => []) as any[];
  const testimonials   = await getTestimonials().catch(() => []) as any[];
  const collections    = await getCategories().catch(() => []) as any[];

  const featuredTestimonial  = testimonials.find((t: any) => t.isFeatured) || testimonials[0];
  const featuredCollections  = collections.slice(0, 4);

  return (
    <div className="w-full">
      <HomeHero />
      <Marquee text="New Bridal Collection • Exquisite Necklaces • Everyday Elegance • Handcrafted Heritage • " />
      <HomeClient
        featuredPieces={featuredPieces}
        featuredCollections={featuredCollections}
        featuredTestimonial={featuredTestimonial ?? null}
      />
    </div>
  );
}
