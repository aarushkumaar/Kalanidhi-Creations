import SectionLabel from '@/components/ui/SectionLabel';
import GoldRule from '@/components/ui/GoldRule';

export default function StoryPage() {
  return (
    <div className="min-h-screen w-full">
      <div className="h-[60vh] w-full bg-muted relative flex items-center justify-center">
         <div className="absolute inset-0 bg-gold/5" />
         <h1 className="text-6xl md:text-8xl font-serif text-foreground mix-blend-exclusion z-10 tracking-widest text-center">OUR STORY</h1>
      </div>
      
      <div className="max-w-4xl mx-auto py-24 px-6 md:px-12 text-center md:text-left">
        <SectionLabel text="Heritage & Craft" />
        <h2 className="text-3xl md:text-5xl font-serif text-gold mb-12 leading-snug">
          Decades of passion, crystallized into moments of everlasting beauty.
        </h2>
        
        <div className="space-y-8 text-muted-foreground leading-relaxed text-lg">
          <p>
            The Kalanidhi legacy began with a profound reverence for the earth’s most exquisite offerings. Born from a lineage of master artisans, our brand marries the rich architectural heritage of Indian royal jewelry with minimalist, contemporary elegance.
          </p>
          <p>
            Every gem is ethically sourced, hand-selected for its fire and brilliance, and set in gold that is sculpted to perfection. For us, jewelry is not merely ornamentation; it is wearable art, designed to become a cherished heirloom passed through generations.
          </p>
          <p>
            Welcome to Kalanidhi, where every piece is a poem in gold.
          </p>
        </div>
      </div>
      <GoldRule />
    </div>
  );
}
