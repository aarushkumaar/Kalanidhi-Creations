import { contactInfo } from '@/config/contact';
import SectionLabel from '@/components/ui/SectionLabel';

export default function ContactPage() {
  return (
    <div className="min-h-screen py-32 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16">
      <div className="flex flex-col">
        <SectionLabel text="Get in Touch" />
        <h1 className="text-5xl md:text-7xl font-serif text-foreground mb-8 mt-4 tracking-wide">Contact Us</h1>
        <p className="text-muted-foreground mb-12 max-w-md text-balance">
          Whether you are looking for a custom masterpiece or have inquiries regarding our collections, our luxury concierge is here to assist you.
        </p>
        
        <div className="space-y-8 text-sm">
          <div>
            <h3 className="uppercase tracking-[0.2em] text-gold mb-2 font-medium">Email</h3>
            <a href={`mailto:${contactInfo.email}`} className="text-lg hover:text-gold transition-colors">{contactInfo.email}</a>
          </div>
          <div>
            <h3 className="uppercase tracking-[0.2em] text-gold mb-2 font-medium">Phone</h3>
            <a href={`tel:${contactInfo.phone}`} className="text-lg hover:text-gold transition-colors">{contactInfo.phone}</a>
          </div>
          <div>
            <h3 className="uppercase tracking-[0.2em] text-gold mb-2 font-medium">Boutique</h3>
            <p className="text-lg max-w-xs">{contactInfo.address}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-muted/30 border border-gold/10 p-8 md:p-12">
        <h3 className="text-2xl font-serif mb-8 text-gold">Send an Enquiry</h3>
        <form className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Name</label>
            <input type="text" className="bg-transparent border-b border-border py-2 focus:outline-none focus:border-gold transition-colors" required />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Email</label>
            <input type="email" className="bg-transparent border-b border-border py-2 focus:outline-none focus:border-gold transition-colors" required />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Message</label>
            <textarea rows={4} className="bg-transparent border-b border-border py-2 focus:outline-none focus:border-gold transition-colors resize-none" required />
          </div>
          <button type="button" className="mt-4 bg-gold text-background py-4 flex items-center justify-center uppercase tracking-widest text-sm hover:bg-gold-light transition-colors font-medium">
            Submit Enquiry
          </button>
        </form>
      </div>
    </div>
  );
}
