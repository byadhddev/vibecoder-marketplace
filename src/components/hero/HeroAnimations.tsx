'use client';

import { useState, useEffect, useRef } from 'react';

/* ─── MOUSE POSITION HOOK ───────────────────────────────── */

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

/* ─── INTERACTIVE TEXT ─────────────────────────────────────
   Each word lights up individually on hover.
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

/* ─── LIVE GRID ────────────────────────────────────────────
   4×3 tile grid inspired by the VibeloperCard layout.
   Tiles start empty, then builder profiles "arrive" one by
   one — sliding in from below. Each tile starts grayscale/
   muted and then vibes up with color (like the studio's
   avatar → vibe transition). The grid cycles endlessly.
   ───────────────────────────────────────────────────────── */

const VIBE_COLORS = ['#B3201F', '#122BB2', '#a16207', '#dc2626', '#1e40af'];

interface Builder {
  initial: string;
  name: string;
  role: string;
  bg: string; // dark color for the avatar block
}

const BUILDERS: Builder[] = [
  { initial: 'S', name: 'sarah.dev', role: 'React', bg: '#2d1b2e' },
  { initial: 'K', name: 'kai.ts', role: 'Rust', bg: '#1b2433' },
  { initial: 'L', name: 'luna.rs', role: 'ML', bg: '#2b2218' },
  { initial: 'A', name: 'alex.py', role: 'Design', bg: '#1e2b2b' },
  { initial: 'M', name: 'mira.go', role: 'Backend', bg: '#2a1a1e' },
  { initial: 'D', name: 'dev.sol', role: 'Web3', bg: '#1a2028' },
  { initial: 'N', name: 'nova.ai', role: 'AI', bg: '#242118' },
  { initial: 'Z', name: 'zed.cpp', role: 'Systems', bg: '#1e1e28' },
  { initial: 'R', name: 'rio.vue', role: 'Frontend', bg: '#281e1e' },
  { initial: 'I', name: 'ivy.ml', role: 'Data', bg: '#1e2822' },
  { initial: 'J', name: 'jag.tsx', role: 'Full Stack', bg: '#222028' },
  { initial: 'V', name: 'val.rs', role: 'DevOps', bg: '#28221e' },
];

type TileState = 'empty' | 'entering' | 'landed' | 'vibed';

interface GridTile {
  state: TileState;
  builder: Builder | null;
  vibeColor: string;
}

const GRID_SIZE = 12;

export function LiveGrid({ isVibe }: { isVibe: boolean }) {
  const [tiles, setTiles] = useState<GridTile[]>(() =>
    Array.from({ length: GRID_SIZE }, (_, i) => ({
      state: 'empty' as TileState,
      builder: null,
      vibeColor: VIBE_COLORS[i % VIBE_COLORS.length],
    }))
  );
  const cycleRef = useRef(0);

  useEffect(() => {
    function shuffle(arr: number[]) {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }

    function runCycle() {
      const order = shuffle(Array.from({ length: GRID_SIZE }, (_, i) => i));
      const offset = cycleRef.current * GRID_SIZE;

      // Reset
      setTiles(Array.from({ length: GRID_SIZE }, (_, i) => ({
        state: 'empty' as TileState, builder: null,
        vibeColor: VIBE_COLORS[i % VIBE_COLORS.length],
      })));

      const ids: ReturnType<typeof setTimeout>[] = [];

      order.forEach((tileIdx, seq) => {
        const builder = BUILDERS[(offset + tileIdx) % BUILDERS.length];
        const base = seq * 300;

        // Enter — slide up from below
        ids.push(setTimeout(() => {
          setTiles(prev => {
            const n = [...prev];
            n[tileIdx] = { ...n[tileIdx], state: 'entering', builder };
            return n;
          });
        }, base));

        // Landed — in position, still muted
        ids.push(setTimeout(() => {
          setTiles(prev => {
            const n = [...prev];
            n[tileIdx] = { ...n[tileIdx], state: 'landed' };
            return n;
          });
        }, base + 350));

        // Vibed — color comes alive
        ids.push(setTimeout(() => {
          setTiles(prev => {
            const n = [...prev];
            n[tileIdx] = { ...n[tileIdx], state: 'vibed' };
            return n;
          });
        }, base + 700));
      });

      cycleRef.current++;
      return ids;
    }

    let ids = runCycle();
    const cycleDuration = GRID_SIZE * 300 + 700 + 3000;
    const interval = setInterval(() => { ids.forEach(clearTimeout); ids = runCycle(); }, cycleDuration);
    return () => { clearInterval(interval); ids.forEach(clearTimeout); };
  }, []);

  return (
    <div className="grid grid-cols-4 gap-px bg-vc-border border border-vc-border rounded-lg overflow-hidden w-full max-w-[380px] mx-auto">
      {tiles.map((tile, i) => {
        const vc = isVibe ? VIBE_COLORS[i % VIBE_COLORS.length] : tile.vibeColor;
        const isVibed = tile.state === 'vibed';
        const isLanded = tile.state === 'landed' || isVibed;
        const isEntering = tile.state === 'entering';

        return (
          <div
            key={i}
            className="aspect-square relative overflow-hidden"
            style={{
              background: tile.state === 'empty' ? 'var(--vc-surface)' : tile.builder?.bg || 'var(--vc-dark)',
              transition: 'background 0.4s ease-out',
            }}
          >
            {/* Empty — subtle dot */}
            {tile.state === 'empty' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-vc-border" />
              </div>
            )}

            {/* Builder content */}
            {tile.builder && (
              <>
                {/* Large initial letter — the "avatar" */}
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{
                    opacity: isEntering ? 0 : 1,
                    transform: isEntering ? 'translateY(100%)' : 'translateY(0)',
                    transition: 'all 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
                  }}
                >
                  <span
                    className="text-2xl md:text-3xl font-serif leading-none select-none"
                    style={{
                      color: isVibed ? vc : 'rgba(255,255,255,0.15)',
                      transition: 'color 0.4s ease-out',
                    }}
                  >
                    {tile.builder.initial}
                  </span>
                </div>

                {/* Vibe gradient overlay */}
                {isVibed && (
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: `radial-gradient(circle at 30% 30%, ${vc}25 0%, transparent 70%)`,
                      transition: 'opacity 0.5s',
                    }}
                  />
                )}

                {/* Name + role at bottom */}
                <div
                  className="absolute bottom-0 left-0 right-0 px-1.5 py-1 flex flex-col"
                  style={{
                    opacity: isLanded ? 1 : 0,
                    transform: isLanded ? 'translateY(0)' : 'translateY(8px)',
                    transition: 'all 0.3s ease-out',
                  }}
                >
                  <span
                    className="text-[7px] md:text-[8px] font-sans leading-tight truncate"
                    style={{ color: isVibed ? vc : 'rgba(255,255,255,0.5)', transition: 'color 0.4s' }}
                  >
                    {tile.builder.name}
                  </span>
                  <span
                    className="text-[5px] md:text-[6px] font-sans uppercase tracking-wider leading-tight"
                    style={{ color: isVibed ? `${vc}99` : 'rgba(255,255,255,0.25)', transition: 'color 0.4s' }}
                  >
                    {tile.builder.role}
                  </span>
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

