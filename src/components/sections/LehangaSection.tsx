'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

const TOTAL_FRAMES = 192;
const FRAME_PATH = (i: number) =>
  `/assets/lehanga/${String(i + 1).padStart(4, '0')}.jpg`;

interface TextStage {
  startPct: number;
  endPct: number;
  side: 'left' | 'right';
  text: string;
  large?: boolean;
  color?: string;
}

// ── Wider ranges = text stays longer on screen ──────────────────────────────
const TEXT_STAGES: TextStage[] = [
  { startPct: 0.22, endPct: 0.52, side: 'right', text: 'Since 2005',             large: true, color: '#C9A84C' },
  { startPct: 0.48, endPct: 0.70, side: 'left',  text: '25+ Years of Excellence',             color: '#FAF7F2' },
  { startPct: 0.66, endPct: 0.90, side: 'right', text: 'Handcrafted with Love',               color: '#FAF7F2' },
];

export default function LehangaSection() {
  const sectionRef   = useRef<HTMLDivElement>(null);
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const framesRef    = useRef<(HTMLImageElement | null)[]>(Array(TOTAL_FRAMES).fill(null));
  const loadedRef    = useRef(0);
  const rafRef       = useRef<number>(0);
  const drawnFrameRef = useRef(-1);

  const [opacity,      setOpacity]      = useState(0);
  const [progress,     setProgress]     = useState(0);
  const [loadPct,      setLoadPct]      = useState(0);
  const [framesReady,  setFramesReady]  = useState(false);

  // ── Preload all frames ──────────────────────────────────────────────────────
  useEffect(() => {
    let alive = true;
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      framesRef.current[i] = img;
      img.src = FRAME_PATH(i);
      img.onload = img.onerror = () => {
        if (!alive) return;
        loadedRef.current++;
        setLoadPct(loadedRef.current / TOTAL_FRAMES);
        if (loadedRef.current >= 1) setFramesReady(true);
      };
    }
    return () => { alive = false; };
  }, []);

  // ── Draw frame — top-anchored so model's face is never cropped ─────────────
  const drawFrame = useCallback((index: number) => {
    const canvas = canvasRef.current;
    const img    = framesRef.current[index];
    if (!canvas || !img?.complete || !img.naturalWidth) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = (canvas.width  = window.innerWidth);
    const H = (canvas.height = window.innerHeight);

    // Scale to cover the viewport (object-fit: cover)
    const scale   = Math.max(W / img.naturalWidth, H / img.naturalHeight);
    const scaledW = img.naturalWidth  * scale;
    const scaledH = img.naturalHeight * scale;

    // Horizontal: center the image
    const x = (W - scaledW) / 2;

    // Vertical: anchor to TOP when taller than viewport (preserves face/head).
    // Only center when the scaled image is shorter (rare edge case).
    const y = scaledH > H ? 0 : (H - scaledH) / 2;

    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(img, x, y, scaledW, scaledH);
  }, []);

  // ── Scroll handler ─────────────────────────────────────────────────────────
  useEffect(() => {
    let pending = false;

    const onScroll = () => {
      if (pending) return;
      pending = true;
      rafRef.current = requestAnimationFrame(() => {
        pending = false;
        const section = sectionRef.current;
        if (!section) return;

        const scrollY  = window.scrollY;
        const viewH    = window.innerHeight;
        const secTop   = section.offsetTop;
        const secH     = section.offsetHeight;
        const scrollEnd = secTop + secH - viewH;

        const prog = Math.max(0, Math.min(
          (scrollY - secTop) / Math.max(scrollEnd - secTop, 1), 1
        ));
        setProgress(prog);

        // Fade in over first 300 px, fade out over last 300 px
        const scrolledIn  = scrollY - secTop;
        const scrolledOut = secTop + secH - scrollY - viewH;
        const alpha = Math.min(
          Math.max(scrolledIn  / 300, 0),
          Math.max(scrolledOut / 300, 0),
          1
        );
        setOpacity(alpha);

        const frameIndex = Math.min(Math.round(prog * (TOTAL_FRAMES - 1)), TOTAL_FRAMES - 1);
        if (frameIndex !== drawnFrameRef.current) {
          drawnFrameRef.current = frameIndex;
          drawFrame(frameIndex);
        }
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, [drawFrame]);

  // ── Text helpers — work correctly for both down AND up scrolling ────────────
  function stageOpacity(stage: TextStage, prog: number): number {
    const fadeLen = 0.07; // longer fade window
    if (prog < stage.startPct || prog > stage.endPct) return 0;
    if (prog < stage.startPct + fadeLen) return (prog - stage.startPct) / fadeLen;
    if (prog > stage.endPct   - fadeLen) return (stage.endPct - prog)   / fadeLen;
    return 1;
  }

  function stageTranslate(stage: TextStage, prog: number): string {
    const so = stageOpacity(stage, prog);
    // Direction-aware: slide from the correct edge whether scrolling in or out
    if (so === 0) {
      // Below the stage (scrolling down, not reached yet) → slide in from edge
      // Above the stage (scrolled past)                   → slide out to edge
      const dir = prog < stage.startPct ? 1 : -1;
      return stage.side === 'right'
        ? `translateX(${32 * dir}px)`
        : `translateX(${-32 * dir}px)`;
    }
    return 'translateX(0px)';
  }

  const visible = opacity > 0.02;

  return (
    <div ref={sectionRef} style={{ height: '400vh', position: 'relative' }}>
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 10,
          opacity, transition: 'opacity 0.4s ease',
          pointerEvents: visible ? 'auto' : 'none',
          background: '#0a0807',
        }}
      >
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />

        {/* Loading bar */}
        {loadPct < 1 && visible && (
          <div style={{ position: 'absolute', bottom: 36, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 100, height: 1, background: 'rgba(201,169,110,0.2)', overflow: 'hidden', position: 'relative' }}>
              <div style={{ position: 'absolute', inset: 0, width: `${loadPct * 100}%`, background: '#c9a96e', transition: 'width 0.2s linear' }} />
            </div>
            <span style={{ color: 'rgba(201,169,110,0.6)', fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase' }}>Loading</span>
          </div>
        )}

        {/* Text overlays — with text-shadow for legibility */}
        {visible && framesReady && TEXT_STAGES.map((stage, i) => {
          const so = stageOpacity(stage, progress);
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                top: '50%',
                [stage.side]: '5%',
                transform: `translateY(-50%) ${stageTranslate(stage, progress)}`,
                opacity: so,
                transition: 'opacity 0.5s ease, transform 0.5s ease',
                maxWidth: '28%',
                textAlign: stage.side === 'right' ? 'right' : 'left',
                pointerEvents: 'none',
              }}
            >
              <p style={{
                fontFamily: '"Cormorant Garamond", Georgia, serif',
                color:       stage.color ?? '#FAF7F2',
                fontSize:    stage.large
                  ? 'clamp(2.8rem, 5.5vw, 4.4rem)'
                  : 'clamp(1.6rem, 3.2vw, 2.6rem)',
                fontWeight:    300,
                lineHeight:    1.2,
                letterSpacing: '0.04em',
                // ── Subtle drop-shadow so text pops against any background ──
                textShadow: '0 2px 24px rgba(0,0,0,0.7), 0 0 48px rgba(0,0,0,0.4)',
              }}>{stage.text}</p>
            </div>
          );
        })}

        {/* Scroll hint */}
        {visible && progress < 0.05 && framesReady && (
          <div style={{ position: 'absolute', bottom: 36, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, animation: 'float 2s ease-in-out infinite' }}>
            <span style={{ color: 'rgba(201,169,110,0.7)', fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase' }}>Scroll</span>
            <div style={{ width: 1, height: 40, background: 'linear-gradient(to bottom, rgba(201,169,110,0.7), transparent)' }} />
          </div>
        )}
      </div>
    </div>
  );
}
