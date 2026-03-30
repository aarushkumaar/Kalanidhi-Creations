export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background text-gold">
      <div className="w-12 h-12 border-4 border-gold/20 border-t-gold rounded-full animate-spin mb-4" />
      <p className="uppercase tracking-[0.2em] text-xs animate-pulse">Loading</p>
    </div>
  );
}
