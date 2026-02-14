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
   4×4 tile grid. Avatars fly in one-by-one from off-screen,
   land in a tile, and vibe it up with color. The grid
   progressively fills, creating a "marketplace coming alive"
   feeling.
   ───────────────────────────────────────────────────────── */

const VIBE_COLORS = ['#B3201F', '#122BB2', '#a16207', '#dc2626', '#1e40af'];

interface AvatarTile {
  name: string;
  avatar: string;
  role: string;
}

const BUILDERS: AvatarTile[] = [
  { name: 'sarah.dev', avatar: 'https://i.pravatar.cc/150?img=1', role: 'React' },
  { name: 'kai.ts', avatar: 'https://i.pravatar.cc/150?img=3', role: 'Rust' },
  { name: 'luna.rs', avatar: 'https://i.pravatar.cc/150?img=5', role: 'ML' },
  { name: 'alex.py', avatar: 'https://i.pravatar.cc/150?img=8', role: 'Design' },
  { name: 'mira.go', avatar: 'https://i.pravatar.cc/150?img=9', role: 'Backend' },
  { name: 'dev.sol', avatar: 'https://i.pravatar.cc/150?img=11', role: 'Web3' },
  { name: 'nova.ai', avatar: 'https://i.pravatar.cc/150?img=16', role: 'AI' },
  { name: 'zed.cpp', avatar: 'https://i.pravatar.cc/150?img=12', role: 'Systems' },
  { name: 'rio.vue', avatar: 'https://i.pravatar.cc/150?img=14', role: 'Frontend' },
  { name: 'ash.rb', avatar: 'https://i.pravatar.cc/150?img=20', role: 'Full Stack' },
  { name: 'zen.go', avatar: 'https://i.pravatar.cc/150?img=22', role: 'DevOps' },
  { name: 'ivy.ml', avatar: 'https://i.pravatar.cc/150?img=25', role: 'Data' },
];

type TileState = 'empty' | 'flying' | 'landed' | 'vibed';

interface GridTile {
  state: TileState;
  builder: AvatarTile | null;
  vibeColor: string;
}

const GRID_SIZE = 12; // 4×3 grid

export function LiveGrid({ isVibe }: { isVibe: boolean }) {
  const [tiles, setTiles] = useState<GridTile[]>(() =>
    Array.from({ length: GRID_SIZE }, (_, i) => ({
      state: 'empty' as TileState,
      builder: null,
      vibeColor: VIBE_COLORS[i % VIBE_COLORS.length],
    }))
  );
  const cycleRef = useRef(0);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Shuffle fill order each cycle
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
      const builderOffset = cycleRef.current * GRID_SIZE;

      // Reset all tiles
      setTiles(Array.from({ length: GRID_SIZE }, (_, i) => ({
        state: 'empty' as TileState,
        builder: null,
        vibeColor: VIBE_COLORS[i % VIBE_COLORS.length],
      })));

      // Stagger: each tile fills with flying → landed → vibed
      order.forEach((tileIdx, seqIdx) => {
        const builder = BUILDERS[(builderOffset + tileIdx) % BUILDERS.length];
        const baseDelay = seqIdx * 350;

        // Phase 1: flying in
        setTimeout(() => {
          setTiles(prev => {
            const next = [...prev];
            next[tileIdx] = { ...next[tileIdx], state: 'flying', builder };
            return next;
          });
        }, baseDelay);

        // Phase 2: landed
        setTimeout(() => {
          setTiles(prev => {
            const next = [...prev];
            next[tileIdx] = { ...next[tileIdx], state: 'landed' };
            return next;
          });
        }, baseDelay + 400);

        // Phase 3: vibed — tile gets color
        setTimeout(() => {
          setTiles(prev => {
            const next = [...prev];
            next[tileIdx] = { ...next[tileIdx], state: 'vibed' };
            return next;
          });
        }, baseDelay + 800);
      });

      cycleRef.current++;
    }

    runCycle();
    // Total cycle time: GRID_SIZE * 350 + 800 (last tile vibes) + 2s pause
    const cycleDuration = GRID_SIZE * 350 + 800 + 2500;
    const interval = setInterval(runCycle, cycleDuration);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      ref={gridRef}
      className="grid grid-cols-4 gap-px bg-vc-border border border-vc-border rounded-lg overflow-hidden w-full max-w-[380px] mx-auto"
    >
      {tiles.map((tile, i) => {
        const vibeColor = isVibe ? VIBE_COLORS[i % VIBE_COLORS.length] : tile.vibeColor;
        const isVibed = tile.state === 'vibed';
        const isLanded = tile.state === 'landed' || isVibed;
        const isFlying = tile.state === 'flying';

        return (
          <div
            key={i}
            className="aspect-square flex items-center justify-center relative overflow-hidden"
            style={{
              background: isVibed
                ? `radial-gradient(circle at center, ${vibeColor}20 0%, ${vibeColor}08 70%)`
                : 'var(--vc-surface)',
              transition: 'background 0.5s ease-out',
            }}
          >
            {/* Empty state — subtle dot */}
            {tile.state === 'empty' && (
              <div className="w-1.5 h-1.5 rounded-full bg-vc-border transition-opacity duration-300" />
            )}

            {/* Flying in — avatar image fills the tile */}
            {(isFlying || isLanded) && tile.builder && (
              <div
                className="absolute inset-0 transition-all ease-out"
                style={{
                  opacity: isFlying ? 0 : 1,
                  transform: isFlying
                    ? 'translateY(100%) scale(0.8)'
                    : 'translateY(0) scale(1)',
                  transitionDuration: '0.4s',
                }}
              >
                {/* Full-bleed avatar image */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={tile.builder.avatar}
                  alt={tile.builder.name}
                  className="absolute inset-0 w-full h-full object-cover transition-all duration-500"
                  style={{ filter: isVibed ? 'none' : 'grayscale(1)' }}
                />

                {/* Name + role overlay at bottom */}
                <div
                  className="absolute bottom-0 left-0 right-0 px-1 py-0.5 flex flex-col items-center transition-all duration-500"
                  style={{
                    background: isVibed
                      ? `linear-gradient(transparent, ${vibeColor}90)`
                      : 'linear-gradient(transparent, rgba(0,0,0,0.6))',
                    opacity: isLanded ? 1 : 0,
                  }}
                >
                  <span className="text-[7px] md:text-[8px] font-sans leading-tight text-white truncate max-w-full">
                    {tile.builder.name}
                  </span>
                  <span
                    className="text-[5px] md:text-[6px] font-sans uppercase tracking-wider leading-tight transition-all duration-500"
                    style={{
                      color: isVibed ? '#fff' : 'rgba(255,255,255,0.5)',
                      opacity: isVibed ? 0.9 : 0.6,
                    }}
                  >
                    {tile.builder.role}
                  </span>
                </div>
              </div>
            )}

            {/* Vibe ring — subtle colored border appears */}
            {isVibed && (
              <div
                className="absolute inset-0 pointer-events-none transition-opacity duration-500"
                style={{
                  boxShadow: `inset 0 0 0 1px ${vibeColor}30`,
                  opacity: 1,
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

