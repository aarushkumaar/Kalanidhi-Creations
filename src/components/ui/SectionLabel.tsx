export default function SectionLabel({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-4 text-gold uppercase tracking-[0.2em] text-sm mb-6">
      <span className="w-8 h-px bg-gold opacity-50 block" />
      <span>{text}</span>
    </div>
  );
}
