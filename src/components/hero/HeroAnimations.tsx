'use client';

import { useState, useEffect, useRef } from 'react';

/* ─── ROTATING WORD ────────────────────────────────────────
   Cycles through words with a vertical slide + fade.
   ───────────────────────────────────────────────────────── */

const ROTATE_WORDS = [
  { text: 'Get Hired', color: '#B3201F' },
  { text: 'Ship Faster', color: '#122BB2' },
  { text: 'Get Paid', color: '#a16207' },
  { text: 'Own Your Code', color: '#dc2626' },
];

export function RotatingWord({ isVibe, vibeColor }: { isVibe: boolean; vibeColor?: string }) {
  const [index, setIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setIndex(i => (i + 1) % ROTATE_WORDS.length);
        setIsTransitioning(false);
      }, 400);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const word = ROTATE_WORDS[index];
  const color = isVibe ? vibeColor || word.color : word.color;

  return (
    <span className="inline-flex relative overflow-hidden h-[1.15em] align-bottom">
      <span
        className="inline-block transition-all duration-400 ease-out whitespace-nowrap"
        style={{
          transform: isTransitioning ? 'translateY(-110%)' : 'translateY(0)',
          opacity: isTransitioning ? 0 : 1,
          color,
        }}
      >
        {word.text}
      </span>
    </span>
  );
}

/* ─── LIVE GRID ────────────────────────────────────────────
   4×3 animated mini-tile grid showing marketplace "activity".
   ───────────────────────────────────────────────────────── */

interface TileContent {
  text: string;
  type: 'name' | 'skill' | 'status' | 'stat' | 'block';
}

const TILE_CONTENTS: TileContent[][] = [
  [
    { text: 'sarah.dev', type: 'name' },
    { text: 'React', type: 'skill' },
    { text: '847', type: 'stat' },
    { text: '', type: 'block' },
  ],
  [
    { text: '✓ Hired!', type: 'status' },
    { text: 'kai.ts', type: 'name' },
    { text: 'Rust', type: 'skill' },
    { text: '$4.2k', type: 'stat' },
  ],
  [
    { text: 'GPT-4', type: 'skill' },
    { text: 'Shipped!', type: 'status' },
    { text: 'luna.rs', type: 'name' },
    { text: '', type: 'block' },
  ],
];

const ALT_CONTENTS: TileContent[][] = [
  [
    { text: 'Next.js', type: 'skill' },
    { text: '$8.5k', type: 'stat' },
    { text: 'alex.py', type: 'name' },
    { text: '', type: 'block' },
  ],
  [
    { text: 'mira.go', type: 'name' },
    { text: '✓ Hired!', type: 'status' },
    { text: 'Claude', type: 'skill' },
    { text: '2.4k', type: 'stat' },
  ],
  [
    { text: 'Shipped!', type: 'status' },
    { text: 'TypeScript', type: 'skill' },
    { text: '$12k', type: 'stat' },
    { text: '', type: 'block' },
  ],
];

const VIBE_COLORS = ['#B3201F', '#122BB2', '#a16207', '#dc2626', '#1e40af'];

function tileColor(type: TileContent['type'], i: number, isVibe: boolean) {
  if (isVibe) return VIBE_COLORS[i % VIBE_COLORS.length];
  switch (type) {
    case 'status': return '#D80018';
    case 'stat': return 'var(--vc-text)';
    case 'name': return 'var(--vc-text-secondary)';
    case 'skill': return 'var(--vc-text)';
    default: return 'transparent';
  }
}

function tileBg(type: TileContent['type'], i: number, isVibe: boolean) {
  if (type === 'block')
    return isVibe ? `${VIBE_COLORS[i % VIBE_COLORS.length]}18` : 'var(--vc-dark)';
  if (type === 'status')
    return isVibe ? `${VIBE_COLORS[i % VIBE_COLORS.length]}0A` : 'rgba(216, 0, 24, 0.04)';
  return 'var(--vc-surface)';
}

export function LiveGrid({ isVibe }: { isVibe: boolean }) {
  const [grid, setGrid] = useState(TILE_CONTENTS);
  const [swapping, setSwapping] = useState<Set<string>>(new Set());
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    function scheduleSwaps() {
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 4; c++) {
          if (TILE_CONTENTS[r][c].type === 'block') continue;
          const delay = (r * 4 + c) * 400 + Math.random() * 2000;
          const id = setTimeout(() => {
            const key = `${r}-${c}`;
            setSwapping(prev => new Set(prev).add(key));
            setTimeout(() => {
              setGrid(prev => {
                const next = prev.map(row => [...row]);
                const isOriginal = prev[r][c].text === TILE_CONTENTS[r][c].text;
                next[r][c] = isOriginal ? ALT_CONTENTS[r][c] : TILE_CONTENTS[r][c];
                return next;
              });
              setSwapping(prev => { const s = new Set(prev); s.delete(key); return s; });
            }, 300);
          }, delay);
          timeoutsRef.current.push(id);
        }
      }
    }
    scheduleSwaps();
    const interval = setInterval(scheduleSwaps, 6000);
    return () => { clearInterval(interval); timeoutsRef.current.forEach(clearTimeout); timeoutsRef.current = []; };
  }, []);

  return (
    <div className="grid grid-cols-4 gap-px bg-vc-border border border-vc-border rounded-lg overflow-hidden w-full max-w-[380px] mx-auto hero-animated">
      {grid.flat().map((tile, i) => {
        const key = `${Math.floor(i / 4)}-${i % 4}`;
        const isSwapping = swapping.has(key);
        return (
          <div
            key={key}
            className="aspect-square flex items-center justify-center transition-all duration-300 relative overflow-hidden"
            style={{ background: tileBg(tile.type, i, isVibe) }}
          >
            {tile.type === 'block' ? (
              <div
                className="w-4 h-4 rounded-sm transition-colors duration-500"
                style={{ backgroundColor: isVibe ? VIBE_COLORS[i % VIBE_COLORS.length] : 'var(--vc-dark)' }}
              />
            ) : (
              <span
                className={`text-[9px] md:text-[10px] font-sans tracking-wide transition-all duration-300 text-center px-1 leading-tight ${
                  tile.type === 'status' ? 'font-semibold' : tile.type === 'stat' ? 'font-bold text-[11px] md:text-xs' : ''
                }`}
                style={{
                  color: tileColor(tile.type, i, isVibe),
                  opacity: isSwapping ? 0 : 1,
                  transform: isSwapping ? 'translateY(-6px)' : 'translateY(0)',
                }}
              >
                {tile.text}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── ANIMATED COUNTER ─────────────────────────────────────
   Counts from 0 → target with easeOutExpo on scroll-into-view.
   ───────────────────────────────────────────────────────── */

function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

export function AnimatedCounter({
  target, duration = 2000, prefix = '', suffix = '', className = '', style,
}: {
  target: number; duration?: number; prefix?: string; suffix?: string; className?: string; style?: React.CSSProperties;
}) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !hasStarted) setHasStarted(true); },
      { threshold: 0.3 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted || target === 0) return;
    let start: number | null = null;
    let raf: number;
    function step(ts: number) {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setCount(Math.floor(easeOutExpo(progress) * target));
      if (progress < 1) raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [hasStarted, target, duration]);

  return (
    <span ref={ref} className={className} style={style}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}

/* ─── FLOATING PARTICLES ───────────────────────────────────
   CSS-only animated small squares drifting in the hero bg.
   ───────────────────────────────────────────────────────── */

const PARTICLES = [
  { size: 6, x: '12%', y: '20%', delay: 0, dur: 8, color: '#B3201F' },
  { size: 4, x: '78%', y: '35%', delay: 1.5, dur: 10, color: '#122BB2' },
  { size: 5, x: '45%', y: '70%', delay: 3, dur: 7, color: '#a16207' },
  { size: 3, x: '88%', y: '15%', delay: 4.5, dur: 9, color: '#dc2626' },
  { size: 4, x: '25%', y: '80%', delay: 2, dur: 11, color: '#1e40af' },
];

export function FloatingParticles({ isVibe }: { isVibe: boolean }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none hero-animated" aria-hidden="true">
      {PARTICLES.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-[1px]"
          style={{
            width: p.size,
            height: p.size,
            left: p.x,
            top: p.y,
            backgroundColor: isVibe ? p.color : 'var(--vc-brand)',
            opacity: isVibe ? 0.2 : 'var(--hero-particle-opacity)',
            animation: `hero-float ${p.dur}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

/* ─── STAT PILL ────────────────────────────────────────────
   Small stat block with animated counter.
   ───────────────────────────────────────────────────────── */

export function StatPill({
  label, value, suffix = '+', isVibe, vibeColor,
}: {
  label: string; value: number; suffix?: string; isVibe: boolean; vibeColor?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <AnimatedCounter
        target={value}
        suffix={suffix}
        className="text-lg md:text-xl font-sans font-bold tabular-nums transition-colors duration-300"
        style={{ color: isVibe && vibeColor ? vibeColor : 'var(--vc-text)' }}
      />
      <span className="text-[9px] font-sans uppercase tracking-[0.15em] text-vc-text-secondary">{label}</span>
    </div>
  );
}
