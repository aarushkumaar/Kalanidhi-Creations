'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useIsMobile } from '@/hooks/useIsMobile';

const TOTAL_FRAMES = 192;
const FRAME_PATH = (i: number) =>
  `/assets/lehanga/${String(i + 1).padStart(4, '0')}.jpg`;

// ── Opacity helper for scroll-driven text ──────────────────────────────────
function getOpacity(
  progress: number,
  fadeIn: [number, number],
  hold: [number, number],
  fadeOut: [number, number]
): number {
  if (progress < fadeIn[0] || progress > fadeOut[1]) return 0;
  if (progress <= fadeIn[1]) return (progress - fadeIn[0]) / (fadeIn[1] - fadeIn[0]);
  if (progress <= hold[1]) return 1;
  return 1 - (progress - fadeOut[0]) / (fadeOut[1] - fadeOut[0]);
}

interface TextStage {
  side: 'left' | 'right';
  text: string;
  large?: boolean;
  color?: string;
  fadeIn: [number, number];
  hold: [number, number];
  fadeOut: [number, number];
}

const TEXT_STAGES: TextStage[] = [
  {
    side: 'right',
    text: 'Since 2005',
    large: true,
    color: '#C9A84C',
    fadeIn: [0.20, 0.28],
    hold: [0.28, 0.45],
    fadeOut: [0.45, 0.52],
  },
  {
    side: 'left',
    text: '25+ Years of Excellence',
    color: '#FAF7F2',
    fadeIn: [0.48, 0.56],
    hold: [0.56, 0.68],
    fadeOut: [0.68, 0.75],
  },
  {
    side: 'right',
    text: 'Handcrafted with Love',
    color: '#FAF7F2',
    fadeIn: [0.72, 0.80],
    hold: [0.80, 0.88],
    fadeOut: [0.88, 0.94],
  },
];

// Mobile time-based visibility windows (in ms)
const MOBILE_STAGES = [
  { showAt: 2000, hideAt: 4500 },
  { showAt: 4000, hideAt: 6500 },
  { showAt: 6000, hideAt: 8500 },
];

export default function LehangaSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<(HTMLImageElement | null)[]>(Array(TOTAL_FRAMES).fill(null));
  const loadedRef = useRef(0);
  const rafRef = useRef<number>(0);
  const drawnFrameRef = useRef(-1);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);

  const [opacity, setOpacity] = useState(0);
  const [progress, setProgress] = useState(0);
  const [loadPct, setLoadPct] = useState(0);
  const [framesReady, setFramesReady] = useState(false);
  const [scrollIndicatorVisible, setScrollIndicatorVisible] = useState(true);

  // Mobile time-based animation state
  const [mobileElapsed, setMobileElapsed] = useState(0); // ms since animation started
  const mobileStartRef = useRef<number | null>(null);
  const mobileIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mobileTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userHasInteractedRef = useRef(false);

  const isMobile = useIsMobile();

  // ── Preload all frames ──────────────────────────────────────────────────
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

  // ── Draw frame ─────────────────────────────────────────────────────────
  const drawFrame = useCallback((index: number) => {
    const canvas = canvasRef.current;
    const img = framesRef.current[index];
    if (!canvas || !img?.complete || !img.naturalWidth) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = (canvas.width = window.innerWidth);
    const H = (canvas.height = window.innerHeight);

    const scale = Math.max(W / img.naturalWidth, H / img.naturalHeight);
    const scaledW = img.naturalWidth * scale;
    const scaledH = img.naturalHeight * scale;

    const x = (W - scaledW) / 2;
    const y = scaledH > H ? 0 : (H - scaledH) / 2;

    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(img, x, y, scaledW, scaledH);
  }, []);

  // ── MOBILE: time-driven animation ─────────────────────────────────────
  useEffect(() => {
    if (!isMobile || !framesReady) return;

    mobileStartRef.current = Date.now();
    let frame = 0;
    const frameInterval = 8000 / TOTAL_FRAMES; // ~41.7ms per frame

    // Set section visible
    setOpacity(1);

    const interval = setInterval(() => {
      frame = (frame + 1) % TOTAL_FRAMES;
      drawFrame(frame);

      const elapsed = Date.now() - (mobileStartRef.current ?? Date.now());
      setMobileElapsed(elapsed % 8000); // loop every 8s
    }, frameInterval);

    mobileIntervalRef.current = interval;

    return () => {
      if (mobileIntervalRef.current) clearInterval(mobileIntervalRef.current);
    };
  }, [isMobile, framesReady, drawFrame]);

  // ── MOBILE: scroll nudge after 2.5s ───────────────────────────────────
  useEffect(() => {
    if (!isMobile) return;

    const onTouch = () => { userHasInteractedRef.current = true; };
    document.addEventListener('touchstart', onTouch, { once: true });

    const timer = setTimeout(() => {
      if (window.scrollY === 0 && !userHasInteractedRef.current) {
        window.scrollTo({ top: 60, behavior: 'smooth' });
        setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 600);
      }
    }, 2500);

    mobileTimerRef.current = timer;

    return () => {
      clearTimeout(timer);
      document.removeEventListener('touchstart', onTouch);
    };
  }, [isMobile]);

  // ── DESKTOP: scroll-driven animation ──────────────────────────────────
  useEffect(() => {
    if (isMobile) return; // desktop only

    let pending = false;

    const onScroll = () => {
      if (pending) return;
      pending = true;
      rafRef.current = requestAnimationFrame(() => {
        pending = false;
        const section = sectionRef.current;
        if (!section) return;

        const scrollY = window.scrollY;
        const viewH = window.innerHeight;
        const secTop = section.offsetTop;
        const secH = section.offsetHeight;
        const scrollEnd = secTop + secH - viewH;

        const prog = Math.max(0, Math.min(
          (scrollY - secTop) / Math.max(scrollEnd - secTop, 1), 1
        ));
        setProgress(prog);

        const scrolledIn = scrollY - secTop;
        const scrolledOut = secTop + secH - scrollY - viewH;
        const alpha = Math.min(
          Math.max(scrolledIn / 300, 0),
          Math.max(scrolledOut / 300, 0),
          1
        );
        setOpacity(alpha);

        // Update scroll indicator opacity
        if (scrollIndicatorRef.current) {
          scrollIndicatorRef.current.style.opacity = window.scrollY > 80 ? '0' : '1';
        }

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
  }, [isMobile, drawFrame]);

  // ── Scroll indicator hide-on-scroll (also for mobile, after nudge) ────
  useEffect(() => {
    const onScroll = () => {
      setScrollIndicatorVisible(window.scrollY <= 80);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── Text overlay opacity/translate for desktop ─────────────────────────
  function stageOpacityDesktop(stage: TextStage): number {
    return getOpacity(progress, stage.fadeIn, stage.hold, stage.fadeOut);
  }

  function stageTranslateDesktop(stage: TextStage): string {
    const so = stageOpacityDesktop(stage);
    if (so === 0) {
      const dir = progress < stage.fadeIn[0] ? 1 : -1;
      return stage.side === 'right'
        ? `translateX(${40 * dir}px)`
        : `translateX(${-40 * dir}px)`;
    }
    return 'translateX(0px)';
  }

  // ── Mobile text opacity by elapsed time ────────────────────────────────
  function mobileTextOpacity(stageIdx: number): number {
    const { showAt, hideAt } = MOBILE_STAGES[stageIdx];
    const fadeLen = 400; // ms
    if (mobileElapsed < showAt || mobileElapsed > hideAt) return 0;
    if (mobileElapsed < showAt + fadeLen) return (mobileElapsed - showAt) / fadeLen;
    if (mobileElapsed > hideAt - fadeLen) return (hideAt - mobileElapsed) / fadeLen;
    return 1;
  }

  const visible = isMobile ? framesReady : opacity > 0.02;

  return (
    <div
      ref={sectionRef}
      style={{ height: isMobile ? '100vh' : '400vh', position: 'relative' }}
    >
      <div
        style={{
          position: isMobile ? 'relative' : 'fixed',
          inset: 0,
          zIndex: 10,
          opacity: isMobile ? 1 : opacity,
          transition: isMobile ? 'none' : 'opacity 0.4s ease',
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

        {/* Text overlays */}
        {visible && framesReady && TEXT_STAGES.map((stage, i) => {
          const so = isMobile ? mobileTextOpacity(i) : stageOpacityDesktop(stage);
          const translateX = isMobile
            ? (so === 0 ? (stage.side === 'right' ? 'translateX(40px)' : 'translateX(-40px)') : 'translateX(0)')
            : stageTranslateDesktop(stage);
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                top: '50%',
                [stage.side]: isMobile ? '5%' : '5%',
                transform: `translateY(-50%) ${translateX}`,
                opacity: so,
                transition: 'opacity 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                maxWidth: isMobile ? '45%' : '28%',
                textAlign: stage.side === 'right' ? 'right' : 'left',
                pointerEvents: 'none',
                // Backdrop blur card
                background: 'rgba(5, 5, 5, 0.45)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                borderRadius: 4,
                padding: isMobile ? '12px 16px' : '16px 28px',
                border: '1px solid rgba(201, 168, 76, 0.2)',
              }}
            >
              <p style={{
                fontFamily: '"Cormorant Garamond", Georgia, serif',
                color: stage.color ?? '#FAF7F2',
                fontSize: stage.large
                  ? (isMobile ? 'clamp(1.8rem, 6vw, 2.8rem)' : 'clamp(3.36rem, 6.6vw, 5.28rem)')
                  : (isMobile ? 'clamp(1rem, 4vw, 1.5rem)' : 'clamp(1.92rem, 3.84vw, 3.12rem)'),
                fontWeight: 300,
                lineHeight: 1.2,
                letterSpacing: '0.04em',
                textShadow: '0 2px 12px rgba(0,0,0,0.6)',
                margin: 0,
              }}>{stage.text}</p>
            </div>
          );
        })}

        {/* Hero overlay text — lower-left, appears after 1.5s */}
        {visible && framesReady && (
          <div
            style={{
              position: 'absolute',
              bottom: isMobile ? 100 : 80,
              left: isMobile ? 20 : 60,
              pointerEvents: 'none',
              animation: 'heroTextFadeIn 0.8s ease 1.5s both',
            }}
          >
            <p style={{
              fontFamily: "'Bodoni Moda', 'Cormorant Garamond', Georgia, serif",
              fontSize: '0.7rem',
              letterSpacing: '0.6em',
              color: '#C9A84C',
              textTransform: 'uppercase',
              marginBottom: 6,
              textShadow: '0 2px 12px rgba(0,0,0,0.6)',
            }}>
              Kalanidhi
            </p>
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '0.75rem',
              color: '#FAF7F2',
              fontStyle: 'italic',
              textShadow: '0 2px 12px rgba(0,0,0,0.6)',
              margin: 0,
            }}>
              {isMobile ? 'Swipe up to discover the collection' : 'Scroll to discover the collection'}
            </p>
          </div>
        )}

        {/* Scroll indicator — bottom center */}
        {visible && framesReady && (
          <div
            ref={scrollIndicatorRef}
            id="scroll-indicator"
            style={{
              position: 'absolute',
              bottom: 36,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              opacity: scrollIndicatorVisible ? 1 : 0,
              transition: 'opacity 0.5s ease',
              pointerEvents: 'none',
              animation: 'scrollPulse 2s ease-in-out infinite',
            }}
          >
            {/* Vertical line */}
            <div style={{
              width: 1,
              height: 48,
              background: '#C9A84C',
              flexShrink: 0,
            }} />
            {/* Chevron */}
            <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
              <path d="M1 1l5 5 5-5" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '0.55rem',
              letterSpacing: '0.4em',
              textTransform: 'uppercase',
              color: '#C9A84C',
              opacity: 0.8,
              marginTop: 4,
            }}>
              {isMobile ? 'Swipe Up' : 'Scroll to Explore'}
            </span>
          </div>
        )}
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes scrollPulse {
          0%, 100% { opacity: 1; transform: translateX(-50%) translateY(0); }
          50%       { opacity: 0.3; transform: translateX(-50%) translateY(8px); }
        }
        @keyframes heroTextFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
