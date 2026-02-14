'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

/* ─── MOUSE POSITION HOOK ─────────────────────────────────
   Tracks cursor position relative to a container element.
   ───────────────────────────────────────────────────────── */

export function useMousePosition() {
  const [pos, setPos] = useState({ x: -1000, y: -1000 });
  useEffect(() => {
    const onMove = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    const onLeave = () => setPos({ x: -1000, y: -1000 });
    window.addEventListener('mousemove', onMove);
    document.addEventListener('mouseleave', onLeave);
    return () => { window.removeEventListener('mousemove', onMove); document.removeEventListener('mouseleave', onLeave); };
  }, []);
  return pos;
}

/* ─── CURSOR GLOW ─────────────────────────────────────────
   Soft ambient spotlight that follows the cursor.
   ───────────────────────────────────────────────────────── */

export function CursorGlow({ isVibe, vibeColor }: { isVibe: boolean; vibeColor?: string }) {
  const pos = useMousePosition();
  const color = isVibe && vibeColor ? vibeColor : 'var(--vc-brand)';
  return (
    <div
      className="fixed pointer-events-none z-[1] transition-opacity duration-500"
      style={{
        left: pos.x - 200,
        top: pos.y - 200,
        width: 400,
        height: 400,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${color}08 0%, transparent 70%)`,
        opacity: pos.x === -1000 ? 0 : 1,
      }}
    />
  );
}

/* ─── INTERACTIVE WORD ────────────────────────────────────
   Each word in a sentence lights up on hover individually.
   ───────────────────────────────────────────────────────── */

export function InteractiveText({
  text, isVibe, className = '',
}: {
  text: string; isVibe: boolean; className?: string;
}) {
  const [hoveredIdx, setHoveredIdx] = useState(-1);
  const words = text.split(' ');
  const VIBE = ['#B3201F', '#122BB2', '#a16207', '#dc2626', '#1e40af'];

  return (
    <p className={className}>
      {words.map((word, i) => (
        <span
          key={i}
          onMouseEnter={() => setHoveredIdx(i)}
          onMouseLeave={() => setHoveredIdx(-1)}
          className="inline-block transition-all duration-300 cursor-default mx-[2px]"
          style={{
            color: hoveredIdx === i
              ? (isVibe ? VIBE[i % VIBE.length] : 'var(--vc-text)')
              : undefined,
            opacity: hoveredIdx === -1 ? undefined : hoveredIdx === i ? 1 : 0.4,
            transform: hoveredIdx === i ? 'translateY(-1px)' : 'translateY(0)',
          }}
        >
          {word}
        </span>
      ))}
    </p>
  );
}

/* ─── LIVE GRID ────────────────────────────────────────────
   4×3 animated grid with cursor-proximity magnetism.
   Tiles glow + scale when cursor is near.
   Ripples on celebration trigger.
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

function tileTextColor(type: TileContent['type'], i: number, isVibe: boolean) {
  if (isVibe) return VIBE_COLORS[i % VIBE_COLORS.length];
  switch (type) {
    case 'status': return '#D80018';
    case 'stat': return 'var(--vc-text)';
    case 'name': return 'var(--vc-text-secondary)';
    case 'skill': return 'var(--vc-text)';
    default: return 'transparent';
  }
}

function tileBgColor(type: TileContent['type'], i: number, isVibe: boolean) {
  if (type === 'block')
    return isVibe ? `${VIBE_COLORS[i % VIBE_COLORS.length]}18` : 'var(--vc-dark)';
  if (type === 'status')
    return isVibe ? `${VIBE_COLORS[i % VIBE_COLORS.length]}0A` : 'rgba(216, 0, 24, 0.04)';
  return 'var(--vc-surface)';
}

export function LiveGrid({ isVibe, celebrating = false }: { isVibe: boolean; celebrating?: boolean }) {
  const [grid, setGrid] = useState(TILE_CONTENTS);
  const [swapping, setSwapping] = useState<Set<string>>(new Set());
  const [ripple, setRipple] = useState<number[]>([]);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const gridRef = useRef<HTMLDivElement>(null);
  const tileRectsRef = useRef<DOMRect[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const [, forceRender] = useState(0);

  // Track mouse for proximity effect
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      forceRender(n => n + 1);
    };
    const onLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
      forceRender(n => n + 1);
    };
    window.addEventListener('mousemove', onMove);
    document.addEventListener('mouseleave', onLeave);
    return () => { window.removeEventListener('mousemove', onMove); document.removeEventListener('mouseleave', onLeave); };
  }, []);

  // Cache tile positions
  useEffect(() => {
    function measure() {
      if (!gridRef.current) return;
      const tiles = gridRef.current.querySelectorAll('[data-tile]');
      tileRectsRef.current = Array.from(tiles).map(t => t.getBoundingClientRect());
    }
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure);
    return () => { window.removeEventListener('resize', measure); window.removeEventListener('scroll', measure); };
  }, []);

  // Content swap cycle
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

  // Celebration ripple
  useEffect(() => {
    if (!celebrating) return;
    const total = 12;
    const center = 5; // center-ish tile index
    const delays: number[] = [];
    for (let i = 0; i < total; i++) {
      const row = Math.floor(i / 4), col = i % 4;
      const cr = Math.floor(center / 4), cc = center % 4;
      const dist = Math.abs(row - cr) + Math.abs(col - cc);
      delays.push(dist * 80);
    }
    // Stagger ripple
    const ids: ReturnType<typeof setTimeout>[] = [];
    delays.forEach((d, i) => {
      ids.push(setTimeout(() => setRipple(prev => [...prev, i]), d));
      ids.push(setTimeout(() => setRipple(prev => prev.filter(x => x !== i)), d + 500));
    });
    return () => ids.forEach(clearTimeout);
  }, [celebrating]);

  // Calculate proximity factor (0-1) for each tile
  function getProximity(i: number): number {
    const rect = tileRectsRef.current[i];
    if (!rect || mouseRef.current.x === -1000) return 0;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = mouseRef.current.x - cx;
    const dy = mouseRef.current.y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxDist = 180;
    return Math.max(0, 1 - dist / maxDist);
  }

  return (
    <div ref={gridRef} className="grid grid-cols-4 gap-px bg-vc-border border border-vc-border rounded-lg overflow-hidden w-full max-w-[380px] mx-auto hero-animated">
      {grid.flat().map((tile, i) => {
        const key = `${Math.floor(i / 4)}-${i % 4}`;
        const isSwapping = swapping.has(key);
        const prox = getProximity(i);
        const isRippling = ripple.includes(i);
        const vibeColor = VIBE_COLORS[i % VIBE_COLORS.length];

        return (
          <div
            key={key}
            data-tile
            className="aspect-square flex items-center justify-center relative overflow-hidden"
            style={{
              background: isRippling
                ? `${vibeColor}30`
                : tileBgColor(tile.type, i, isVibe),
              transform: `scale(${1 + prox * 0.08})`,
              boxShadow: prox > 0.1
                ? `inset 0 0 ${20 * prox}px ${isVibe ? vibeColor : 'var(--vc-brand)'}${Math.round(prox * 25).toString(16).padStart(2, '0')}`
                : 'none',
              transition: 'transform 0.15s ease-out, box-shadow 0.15s ease-out, background 0.3s',
              zIndex: prox > 0.5 ? 2 : 1,
            }}
          >
            {tile.type === 'block' ? (
              <div
                className="w-4 h-4 rounded-sm transition-all duration-500"
                style={{
                  backgroundColor: isRippling ? vibeColor : isVibe ? vibeColor : 'var(--vc-dark)',
                  transform: `scale(${1 + prox * 0.3})`,
                }}
              />
            ) : (
              <span
                className={`text-[9px] md:text-[10px] font-sans tracking-wide text-center px-1 leading-tight ${
                  tile.type === 'status' ? 'font-semibold' : tile.type === 'stat' ? 'font-bold text-[11px] md:text-xs' : ''
                }`}
                style={{
                  color: isRippling ? vibeColor : tileTextColor(tile.type, i, isVibe),
                  opacity: isSwapping ? 0 : 1,
                  transform: isSwapping ? 'translateY(-6px)' : 'translateY(0)',
                  transition: 'all 0.3s ease-out',
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

/* ─── STAGGERED ENTRANCE ───────────────────────────────────
   Wraps children with a staggered fade-in from bottom.
   ───────────────────────────────────────────────────────── */

export function StaggerIn({ children, delay = 0, className = '' }: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(id);
  }, [delay]);
  return (
    <div
      className={`transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} ${className}`}
    >
      {children}
    </div>
  );
}

