'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

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
   PreviewStage-style dock + grid. Fetches real signed-in
   users from /api/marketplace/vibelopers. The entire grid
   shows ONE person's details. Mac-style dock at the bottom
   holds avatar thumbnails (real images, grayscale → color).
   On scroll the avatar pops from dock to grid.
   Colors match lab/studio exactly.
   ───────────────────────────────────────────────────────── */

/* ─── Extract primary + secondary colors from image (lab/vibeloper algo) ─── */
type RGB = [number, number, number];
const DEFAULT_VIBE: { primary: RGB; secondary: RGB } = { primary: [136, 136, 136], secondary: [100, 100, 100] };

function extractDominantColors(src: string): Promise<{ primary: RGB; secondary: RGB }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const cvs = document.createElement('canvas');
      const sz = 64;
      cvs.width = sz;
      cvs.height = sz;
      const ctx = cvs.getContext('2d');
      if (!ctx) { resolve(DEFAULT_VIBE); return; }
      ctx.drawImage(img, 0, 0, sz, sz);
      const d = ctx.getImageData(0, 0, sz, sz).data;

      const pixels: RGB[] = [];
      for (let i = 0; i < d.length; i += 16) {
        const r = d[i], g = d[i + 1], bl = d[i + 2], a = d[i + 3];
        if (a < 128) continue;
        const lum = 0.299 * r + 0.587 * g + 0.114 * bl;
        if (lum > 25 && lum < 230) pixels.push([r, g, bl]);
      }
      if (pixels.length < 2) { resolve(DEFAULT_VIBE); return; }

      // Quantize into 4-bit buckets
      const buckets = new Map<string, { sum: [number, number, number]; count: number }>();
      for (const px of pixels) {
        const key = `${px[0] >> 4},${px[1] >> 4},${px[2] >> 4}`;
        const existing = buckets.get(key);
        if (existing) {
          existing.sum[0] += px[0]; existing.sum[1] += px[1]; existing.sum[2] += px[2];
          existing.count++;
        } else {
          buckets.set(key, { sum: [px[0], px[1], px[2]], count: 1 });
        }
      }

      const sorted = [...buckets.values()].sort((a, b) => b.count - a.count);
      const avg = (b: (typeof sorted)[0]): RGB => [
        Math.round(b.sum[0] / b.count),
        Math.round(b.sum[1] / b.count),
        Math.round(b.sum[2] / b.count),
      ];

      const primary = avg(sorted[0]);
      let secondary = primary;
      for (let i = 1; i < sorted.length; i++) {
        const c = avg(sorted[i]);
        const dist = Math.sqrt((c[0] - primary[0]) ** 2 + (c[1] - primary[1]) ** 2 + (c[2] - primary[2]) ** 2);
        if (dist > 60) { secondary = c; break; }
      }
      resolve({ primary, secondary });
    };
    img.onerror = () => resolve(DEFAULT_VIBE);
    img.src = src;
  });
}

interface Vibeloper {
  username: string;
  name: string;
  avatar_url: string;
  showcase_count: number;
  available_for_hire: boolean;
  skills: string[];
  earnings?: string;
}

type DemoPhase = 'idle' | 'waiting' | 'dragging' | 'landed' | 'vibed';
interface DragRect { sx: number; sy: number; sw: number; sh: number; ex: number; ey: number; ew: number; eh: number; }

export function LiveGrid({ isVibe }: { isVibe: boolean }) {
  const [users, setUsers] = useState<Vibeloper[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [demoPhase, setDemoPhase] = useState<DemoPhase>('idle');
  const [dragRect, setDragRect] = useState<DragRect | null>(null);
  const [userColors, setUserColors] = useState<Record<string, { primary: RGB; secondary: RGB }>>({});

  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const thumbRefs = useRef(new Map<number, HTMLDivElement>());
  const scrollCooldownRef = useRef(false);
  const total = users.length;

  // Local stock avatars for testing (enable with NEXT_PUBLIC_USE_LOCAL_AVATARS=true)
  const LOCAL_AVATARS: Vibeloper[] = [
    { username: 'tom', name: 'Tom', avatar_url: '/studio/avatars/01-tom.jpg', showcase_count: 12, available_for_hire: true, skills: ['React', 'TypeScript', 'Node.js'], earnings: '$18.4k' },
    { username: 'spiderman', name: 'Spider-Man', avatar_url: '/studio/avatars/02-spiderman.jpg', showcase_count: 8, available_for_hire: true, skills: ['Next.js', 'GraphQL', 'Python'], earnings: '$12.1k' },
    { username: 'pink-panther', name: 'Pink Panther', avatar_url: '/studio/avatars/03-pink-panther.jpg', showcase_count: 5, available_for_hire: false, skills: ['CSS', 'Tailwind', 'Figma'], earnings: '$6.2k' },
    { username: 'courage', name: 'Courage', avatar_url: '/studio/avatars/04-courage.jpg', showcase_count: 15, available_for_hire: true, skills: ['Rust', 'Go', 'Docker'], earnings: '$24.8k' },
    { username: 'powerpuff', name: 'Powerpuff', avatar_url: '/studio/avatars/05-powerpuff.jpg', showcase_count: 9, available_for_hire: true, skills: ['Vue', 'Nuxt', 'Firebase'], earnings: '$9.7k' },
    { username: 'nobitha', name: 'Nobitha', avatar_url: '/studio/avatars/06-nobitha.jpg', showcase_count: 3, available_for_hire: false, skills: ['Java', 'Spring'], earnings: '$3.1k' },
    { username: 'doremon', name: 'Doremon', avatar_url: '/studio/avatars/07-doremon.jpg', showcase_count: 20, available_for_hire: true, skills: ['AI', 'ML', 'Python', 'TensorFlow'], earnings: '$31.5k' },
    { username: 'shinchan', name: 'Shin-chan', avatar_url: '/studio/avatars/08-shinchan.jpg', showcase_count: 7, available_for_hire: true, skills: ['Swift', 'iOS', 'Kotlin'], earnings: '$8.3k' },
    { username: 'ben-tennison', name: 'Ben Tennison', avatar_url: '/studio/avatars/09-ben-tennison.jpg', showcase_count: 11, available_for_hire: true, skills: ['AWS', 'Terraform', 'K8s'], earnings: '$19.6k' },
    { username: 'kick-buttowski', name: 'Kick Buttowski', avatar_url: '/studio/avatars/10-kick-buttowski.jpg', showcase_count: 6, available_for_hire: false, skills: ['Svelte', 'Deno'], earnings: '$5.4k' },
  ];

  // Fetch real users or use local avatars
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_USE_LOCAL_AVATARS === 'true') {
      setUsers(LOCAL_AVATARS);
      return;
    }
    const fetchUsers = () => {
      fetch('/api/marketplace/vibelopers')
        .then(r => r.json())
        .then(data => { if (data.vibelopers?.length) setUsers(data.vibelopers); })
        .catch(() => { setUsers(LOCAL_AVATARS); });
    };
    fetchUsers();
    // Refetch on window focus so new sign-ins appear
    const onFocus = () => fetchUsers();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Extract primary + secondary colors from avatar images
  useEffect(() => {
    if (!users.length) return;
    users.forEach(user => {
      if (!user.avatar_url || userColors[user.username]) return;
      extractDominantColors(user.avatar_url).then(colors => {
        setUserColors(prev => ({ ...prev, [user.username]: colors }));
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users]);

  const u = users[currentIndex];
  const vc = u ? (userColors[u.username] || DEFAULT_VIBE) : DEFAULT_VIBE;
  const pRgb = vc.primary.join(',');
  const sRgb = vc.secondary.join(',');
  const hasLanded = demoPhase === 'landed' || demoPhase === 'vibed';
  const showContent = demoPhase === 'vibed';

  // Vibe style helpers — primary/secondary from avatar (lab/vibeloper pattern)
  // R = primary gradient, B = secondary gradient, alternated per cell
  function vibeBg(fallback: string, useSecondary = false) {
    if (!showContent) return fallback;
    const rgb = useSecondary ? sRgb : pRgb;
    return `linear-gradient(${useSecondary ? '315deg' : '135deg'}, rgba(${rgb},0.12) 0%, rgba(${rgb},0.04) 40%, rgba(255,255,255,0) 100%)`;
  }
  function vibeText(useSecondary = false): React.CSSProperties | undefined {
    if (!showContent) return undefined;
    const rgb = useSecondary ? sRgb : pRgb;
    return { color: `rgb(${rgb})` };
  }
  function vibeHex(useSecondary = false): string {
    const c = useSecondary ? vc.secondary : vc.primary;
    return `#${c.map(v => v.toString(16).padStart(2, '0')).join('')}`;
  }

  // Measure dock thumb → grid avatar position (PreviewStage pattern)
  const measurePositions = useCallback((): DragRect | null => {
    const stage = stageRef.current;
    const thumb = thumbRefs.current.get(currentIndex);
    const grid = gridRef.current;
    if (!stage || !thumb || !grid) return null;
    const sr = stage.getBoundingClientRect();
    const tr = thumb.getBoundingClientRect();
    const gr = grid.getBoundingClientRect();
    return {
      sx: tr.left - sr.left, sy: tr.top - sr.top, sw: tr.width, sh: tr.height,
      ex: gr.left - sr.left + 1, ey: gr.top - sr.top + 1, ew: Math.round(gr.width / 4), eh: Math.round(gr.width / 4),
    };
  }, [currentIndex]);

  // Phase state machine — waiting → dragging → landed (grayscale) → vibed (color)
  useEffect(() => {
    if (demoPhase === 'idle' || demoPhase === 'vibed') return;
    let delay: number;
    if (demoPhase === 'waiting') delay = 100;
    else if (demoPhase === 'dragging') delay = 800;
    else if (demoPhase === 'landed') delay = 50;
    else return;

    const timer = setTimeout(() => {
      if (demoPhase === 'waiting') {
        setDragRect(measurePositions());
        setDemoPhase('dragging');
      } else if (demoPhase === 'dragging') {
        setDragRect(null);
        setDemoPhase('landed');
      } else if (demoPhase === 'landed') {
        setDemoPhase('vibed');
      }
    }, delay);
    return () => clearTimeout(timer);
  }, [demoPhase, measurePositions]);

  // Auto-play: start first card on mount, then cycle every 3s
  useEffect(() => {
    if (!total) return;
    if (demoPhase === 'idle') {
      const startTimer = setTimeout(() => setDemoPhase('waiting'), 600);
      return () => clearTimeout(startTimer);
    }
    if (demoPhase === 'vibed') {
      const nextTimer = setTimeout(() => {
        setCurrentIndex(p => (p + 1) % total);
        setDemoPhase('waiting');
      }, 3000);
      return () => clearTimeout(nextTimer);
    }
  }, [demoPhase, total]);

  

  if (!total || !u) return (
    <div className="w-full max-w-[520px] mx-auto">
      {/* Grid skeleton */}
      <div className="grid grid-cols-4 gap-px border border-vc-border rounded-lg overflow-hidden bg-vc-border">
        <div className="col-span-1 row-span-2 bg-vc-dark animate-pulse" style={{ minHeight: 120 }} />
        <div className="col-span-2 px-4 py-4 bg-vc-surface">
          <div className="h-4 w-24 bg-vc-surface-raised rounded animate-pulse mb-2" />
          <div className="h-2 w-16 bg-vc-surface-raised rounded animate-pulse" />
        </div>
        <div className="col-span-1 px-3 py-4 bg-vc-dark flex flex-col items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-vc-surface-raised animate-pulse mb-1.5" />
          <div className="h-2 w-6 bg-vc-surface-raised/30 rounded animate-pulse" />
        </div>
        <div className="col-span-1 px-3 py-4 bg-vc-surface flex flex-col items-center justify-center">
          <div className="h-5 w-10 bg-vc-surface-raised rounded animate-pulse mb-1" />
          <div className="h-2 w-10 bg-vc-surface-raised rounded animate-pulse" />
        </div>
        <div className="col-span-1 px-3 py-4 bg-vc-surface-raised flex flex-col items-center justify-center">
          <div className="h-5 w-6 bg-vc-border rounded animate-pulse mb-1" />
          <div className="h-2 w-12 bg-vc-border rounded animate-pulse" />
        </div>
        <div className="col-span-4 px-4 py-3 bg-vc-surface flex gap-2">
          {[1,2,3,4].map(k => <div key={k} className="h-5 w-12 bg-vc-surface-raised rounded animate-pulse" />)}
        </div>
      </div>
      {/* Counter skeleton */}
      <div className="flex justify-center mt-2">
        <div className="h-2 w-10 bg-vc-surface-raised rounded animate-pulse" />
      </div>
      {/* Dock skeleton */}
      <div className="flex justify-center py-4">
        <div className="inline-flex items-end gap-1 px-3 py-2 bg-vc-surface-raised/80 border border-vc-border rounded-2xl">
          {[1,2,3,4,5].map(k => <div key={k} className="w-8 h-8 rounded-xl bg-vc-border animate-pulse" />)}
        </div>
      </div>
    </div>
  );

  return (
    <div ref={containerRef} tabIndex={0} className="w-full max-w-[520px] mx-auto outline-none">
      <div ref={stageRef} className="relative">

        {/* ── Grid — entire grid = one person ── */}
        <div
          ref={gridRef}
          className="grid grid-cols-4 gap-px border border-vc-border rounded-lg overflow-hidden bg-vc-border"
        >
          {/* Avatar — 1 col, 2 rows */}
          <div className="col-span-1 row-span-2 relative overflow-hidden bg-vc-dark" style={{ minHeight: 120 }}>
            {u.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={u.avatar_url}
                alt=""
                className="absolute inset-0 w-full h-full object-cover transition-all duration-500"
                style={{
                  opacity: hasLanded ? 1 : 0,
                  filter: showContent ? 'grayscale(0)' : 'grayscale(1)',
                  transform: hasLanded ? 'scale(1)' : 'scale(1.05)',
                }}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-serif text-white/20">{u.name?.[0] || '?'}</span>
              </div>
            )}
          </div>

          {/* Name + username — primary */}
          <div className="col-span-2 px-4 py-4 flex flex-col justify-center transition-all duration-[400ms]" style={{ background: vibeBg('var(--vc-surface)') }}>
            <span
              className={`text-sm md:text-base font-serif leading-tight truncate transition-colors duration-[400ms] ${showContent ? '' : 'text-vc-border'}`}
              style={showContent ? vibeText() : undefined}
            >
              {u.name || u.username}
            </span>
            <span
              className="text-[8px] md:text-[9px] font-sans uppercase tracking-widest mt-1 transition-colors duration-[400ms]"
              style={{ color: showContent ? 'var(--vc-text-secondary)' : 'var(--vc-border)' }}
            >
              {u.username}
            </span>
          </div>

          {/* Status — secondary */}
          <div className="col-span-1 px-3 py-4 flex flex-col items-center justify-center transition-all duration-[400ms]" style={{ background: vibeBg('var(--vc-dark)', true) }}>
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0 mb-1.5 transition-colors duration-[400ms]"
              style={{ backgroundColor: showContent ? (u.available_for_hire ? '#16a34a' : 'var(--vc-text-muted)') : 'var(--vc-dark-hover)' }}
            />
            <span
              className="text-[7px] md:text-[8px] font-sans font-medium uppercase tracking-wider text-center leading-tight transition-colors duration-[400ms]"
              style={{ color: showContent ? (u.available_for_hire ? '#16a34a' : 'var(--vc-text-secondary)') : 'var(--vc-dark-hover)' }}
            >
              {u.available_for_hire ? 'Hire' : 'N/A'}
            </span>
          </div>

          {/* Earnings — primary */}
          <div className="col-span-1 px-3 py-4 flex flex-col items-center justify-center transition-all duration-[400ms]" style={{ background: vibeBg('var(--vc-surface)') }}>
            <span
              className={`text-lg md:text-xl font-serif leading-none transition-colors duration-[400ms] ${showContent ? '' : 'text-vc-border'}`}
              style={showContent ? vibeText() : undefined}
            >
              {u.earnings || '$0'}
            </span>
            <span className="text-[7px] md:text-[8px] font-sans text-vc-text-secondary uppercase tracking-wider mt-1">earned</span>
          </div>

          {/* Showcases — secondary */}
          <div className="col-span-1 px-3 py-4 flex flex-col items-center justify-center transition-all duration-[400ms]" style={{ background: vibeBg('var(--vc-surface-raised)', true) }}>
            <span
              className={`text-lg md:text-xl font-serif leading-none transition-colors duration-[400ms] ${showContent ? '' : 'text-vc-border'}`}
              style={showContent ? vibeText(true) : undefined}
            >
              {u.showcase_count}
            </span>
            <span className="text-[7px] md:text-[8px] font-sans text-vc-text-secondary uppercase tracking-wider mt-1">showcases</span>
          </div>

          {/* Skills tags — alternating primary/secondary */}
          <div className="col-span-4 px-4 py-3 flex items-center gap-2 flex-wrap transition-all duration-[400ms]" style={{ background: vibeBg('var(--vc-surface)') }}>
            {(u.skills || []).slice(0, 6).map((skill, si) => {
              const sec = si % 2 === 1;
              const hex = vibeHex(sec);
              return (
                <span
                  key={skill}
                  className="text-[8px] md:text-[9px] font-sans px-2 py-1 rounded transition-all duration-[400ms]"
                  style={{
                    color: showContent ? `rgb(${sec ? sRgb : pRgb})` : 'var(--vc-border)',
                    backgroundColor: showContent ? `${hex}15` : 'var(--vc-surface)',
                  }}
                >
                  {skill}
                </span>
              );
            })}
            {(!u.skills || u.skills.length === 0) && (
              <span className="text-[8px] font-sans italic text-vc-text-secondary">No skills listed</span>
            )}
          </div>
        </div>

        {/* ── Flying avatar — arcs up then drops into grid tile ── */}
        {demoPhase === 'dragging' && dragRect && u.avatar_url && (
          <div
            className="absolute z-40 rounded-xl overflow-hidden shadow-xl ring-1 ring-black/10 pointer-events-none"
            style={{
              left: dragRect.sx,
              top: dragRect.sy,
              width: dragRect.sw,
              height: dragRect.sh,
            }}
            ref={el => {
              if (!el) return;
              // Arc: start → peak (up) → land (grid tile)
              const sx = dragRect.sx, sy = dragRect.sy, sw = dragRect.sw, sh = dragRect.sh;
              const ex = dragRect.ex, ey = dragRect.ey, ew = dragRect.ew, eh = dragRect.eh;
              // Peak point: midway horizontally, 60px above the higher of start/end
              const peakY = Math.min(sy, ey) - 60;
              const midX = (sx + ex) / 2;
              const midW = (sw + ew) / 2;
              const midH = (sh + eh) / 2;

              // Phase 1: fly up to peak
              requestAnimationFrame(() => {
                el.style.transition = 'all 0.4s cubic-bezier(0.33,1,0.68,1)';
                el.style.left = `${midX}px`;
                el.style.top = `${peakY}px`;
                el.style.width = `${midW}px`;
                el.style.height = `${midH}px`;

                // Phase 2: drop down into tile
                setTimeout(() => {
                  el.style.transition = 'all 0.3s cubic-bezier(0.55,0,1,0.45)';
                  el.style.left = `${ex}px`;
                  el.style.top = `${ey}px`;
                  el.style.width = `${ew}px`;
                  el.style.height = `${eh}px`;
                }, 450);
              });
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={u.avatar_url} alt="" className="w-full h-full object-cover grayscale" />
          </div>
        )}
      </div>

      {/* Counter */}
      <div className="flex justify-center mt-2">
        <span className="text-[7px] font-mono text-vc-text-secondary">{currentIndex + 1} / {total}</span>
      </div>

      {/* ── Mac-style dock ── */}
      <div className="flex justify-center py-4 px-2">
        <div className="inline-flex items-end gap-1 px-2 py-2 bg-vc-surface-raised/80 backdrop-blur-xl border border-vc-border rounded-2xl shadow-lg shadow-black/[0.04] max-w-full overflow-x-auto scrollbar-none">
          {users.map((user, i) => {
            const isActive = i === currentIndex;
            const isVibed = isActive && demoPhase === 'vibed';
            const uc = userColors[user.username];
            const ringColor = uc ? `rgb(${uc.primary.join(',')})` : undefined;
            return (
              <div key={user.username} className="flex flex-col items-center gap-1">
                <div
                  ref={el => { if (el) thumbRefs.current.set(i, el); else thumbRefs.current.delete(i); }}
                  onClick={() => { if (i !== currentIndex || demoPhase === 'idle') { setCurrentIndex(i); setDemoPhase('waiting'); } }}
                  className={`shrink-0 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 ${
                    isActive ? 'shadow-md' : 'hover:shadow-sm'
                  }`}
                  style={{
                    width: isActive ? 44 : 32,
                    height: isActive ? 44 : 32,
                    transition: 'width 0.3s cubic-bezier(0.22,1,0.36,1), height 0.3s cubic-bezier(0.22,1,0.36,1), box-shadow 0.3s',
                    boxShadow: isVibed && ringColor ? `0 0 0 2px ${ringColor}` : undefined,
                  }}
                >
                  {user.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.avatar_url}
                      alt=""
                      className={`w-full h-full object-cover transition-all duration-500 ${isVibed ? 'grayscale-0' : 'grayscale'}`}
                    />
                  ) : (
                    <div className="w-full h-full bg-[#242423] flex items-center justify-center text-white text-xs font-serif">
                      {user.name?.[0] || '?'}
                    </div>
                  )}
                </div>
                <div
                  className="w-1 h-1 rounded-full transition-all duration-200"
                  style={{ backgroundColor: isVibed && ringColor ? ringColor : isActive ? 'var(--vc-text)' : 'transparent' }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


/* ─── PARTICLE NAV ─────────────────────────────────────────
   3D rotating particle illustrations (EconomicsVisual style).
   Each section = a unique shape. Click to open.
   ───────────────────────────────────────────────────────── */

interface ParticleNavSection {
  id: string;
  label: string;
}

interface ParticleNavProps {
  sections: ParticleNavSection[];
  openSection: string | null;
  onToggle: (id: string) => void;
  isVibe?: boolean;
  vibeColors?: string[];
}

export function ParticleNav({ sections, openSection, onToggle, isVibe, vibeColors = [] }: ParticleNavProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, hoverIdx: -1 });
  const sectionsRef = useRef(sections);
  const openRef = useRef(openSection);
  sectionsRef.current = sections;
  openRef.current = openSection;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;
    const N = sections.length;
    const PER = 200;

    // Shape generators — relevant to each section
    const shapes: ((i: number, count: number) => { x: number; y: number; z: number })[] = [
      // 0: The Problem — fractured sphere (broken, scattered)
      (i, c) => {
        const phi = Math.acos(1 - 2 * (i + 0.5) / c);
        const theta = Math.PI * (1 + Math.sqrt(5)) * i;
        const r = 0.38;
        const crack = Math.sin(phi * 5) * 0.08;
        return { x: r * Math.sin(phi) * Math.cos(theta) + crack, y: r * Math.cos(phi), z: r * Math.sin(phi) * Math.sin(theta) + crack };
      },
      // 1: Builders & Seekers — two orbiting clusters (connection)
      (i, c) => {
        const half = c / 2;
        const side = i < half ? -1 : 1;
        const ii = i % half;
        const phi = Math.acos(1 - 2 * (ii + 0.5) / half);
        const theta = Math.PI * (1 + Math.sqrt(5)) * ii;
        const r = 0.2;
        return { x: r * Math.sin(phi) * Math.cos(theta) + side * 0.25, y: r * Math.cos(phi), z: r * Math.sin(phi) * Math.sin(theta) };
      },
      // 2: How It Works — vortex funnel (process flow)
      (i, c) => {
        const p = i / c;
        const h = (p - 0.5) * 1.2;
        const r = p * 0.45;
        const theta = p * Math.PI * 10;
        return { x: Math.cos(theta) * r, y: h, z: Math.sin(theta) * r };
      },
      // 3: Philosophy — fibonacci flower (organic growth)
      (i, c) => {
        const angle = i * 2.39996;
        const r = 0.45 * Math.sqrt(i / c);
        return { x: r * Math.cos(angle), y: (0.2 - r * r) * 1.5, z: r * Math.sin(angle) };
      },
      // 4: Vibeloper — DNA double helix (identity)
      (i, c) => {
        const t = (i / c) * Math.PI * 8;
        const strand = i % 2 === 0 ? 1 : -1;
        return { x: Math.cos(t) * 0.3 * strand, y: (i / c - 0.5) * 1.0, z: Math.sin(t) * 0.3 * strand };
      },
      // 5: Features — cube lattice (structure)
      (i, c) => {
        const side = Math.ceil(Math.cbrt(c));
        const ix = i % side, iy = Math.floor(i / side) % side, iz = Math.floor(i / (side * side));
        const s = 0.7;
        return { x: (ix / (side - 1) - 0.5) * s, y: (iy / (side - 1) - 0.5) * s, z: (iz / (side - 1) - 0.5) * s };
      },
    ];

    interface Pt { group: number; x: number; y: number; z: number; tx: number; ty: number; tz: number; size: number; }
    const points: Pt[] = [];
    for (let g = 0; g < N; g++) {
      const shapeFn = shapes[g % shapes.length];
      for (let i = 0; i < PER; i++) {
        const t = shapeFn(i, PER);
        const scale = 30;
        points.push({ group: g, x: t.x * scale, y: t.y * scale, z: t.z * scale, tx: t.x * scale, ty: t.y * scale, tz: t.z * scale, size: Math.random() * 0.7 + 0.3 });
      }
    }

    // Cache color
    let fillHex = '#37352f';
    const cacheColor = () => {
      const raw = getComputedStyle(document.documentElement).getPropertyValue('--vc-text').trim();
      if (raw.startsWith('#')) fillHex = raw;
    };

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = parent.clientWidth * dpr;
      canvas.height = parent.clientHeight * dpr;
      canvas.style.width = `${parent.clientWidth}px`;
      canvas.style.height = `${parent.clientHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cacheColor();
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
      // hoverIdx computed in render() for responsive layout
    };
    const handleMouseLeave = () => { mouseRef.current.x = -1; mouseRef.current.y = -1; mouseRef.current.hoverIdx = -1; };
    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const w = rect.width;
      const isMob = w < 500;
      const cols = isMob ? 3 : N;
      const slotW = w / cols;
      const rowH = rect.height / (isMob ? 2 : 1);
      const col = Math.min(cols - 1, Math.floor(x / slotW));
      const row = isMob ? Math.min(1, Math.floor(y / rowH)) : 0;
      const idx = Math.min(N - 1, row * cols + col);
      if (idx >= 0 && idx < sectionsRef.current.length) {
        onToggle(sectionsRef.current[idx].id);
      }
    };

    const render = () => {
      time += 0.012;
      const w = canvas.width / (window.devicePixelRatio || 1);
      const h = canvas.height / (window.devicePixelRatio || 1);
      ctx.clearRect(0, 0, w, h);

      // Responsive layout: 2 rows of 3 on narrow, 1 row of 6 on wide
      const isMobile = w < 500;
      const cols = isMobile ? 3 : N;
      const rows = isMobile ? 2 : 1;
      const slotW = w / cols;
      const rowH = h / rows;

      const getSlot = (g: number) => {
        const col = isMobile ? g % 3 : g;
        const row = isMobile ? Math.floor(g / 3) : 0;
        return { cx: slotW * col + slotW / 2, cy: rowH * row + rowH * 0.42 };
      };

      // Hit detection for mobile grid
      const getGroupFromPos = (x: number, y: number) => {
        const col = Math.min(cols - 1, Math.floor(x / slotW));
        const row = isMobile ? Math.min(rows - 1, Math.floor(y / rowH)) : 0;
        return Math.min(N - 1, row * cols + col);
      };
      mouseRef.current.hoverIdx = mouseRef.current.x >= 0 ? getGroupFromPos(mouseRef.current.x, mouseRef.current.y) : -1;

      // Draw labels
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      const fontSize = isMobile ? 8 : 10;
      for (let g = 0; g < N; g++) {
        const slot = getSlot(g);
        const labelY = rowH * (isMobile ? Math.floor(g / 3) : 0) + rowH - (isMobile ? 14 : 18);
        const isActive = sectionsRef.current[g]?.id === openRef.current;
        const isHover = g === mouseRef.current.hoverIdx;
        ctx.font = `500 ${fontSize}px system-ui, sans-serif`;
        ctx.globalAlpha = isActive ? 1 : isHover ? 0.8 : 0.4;
        ctx.fillStyle = fillHex;
        ctx.fillText(sectionsRef.current[g]?.label || '', slot.cx, labelY);
      }

      // Draw particles
      ctx.fillStyle = fillHex;
      const camDist = 600;
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        const isHover = p.group === mouseRef.current.hoverIdx;
        const isActive = sectionsRef.current[p.group]?.id === openRef.current;
        const rotSpeed = isHover ? 2.0 : 0.4;
        const t = time * rotSpeed;

        let tx = p.tx, ty = p.ty, tz = p.tz;
        if (isHover) {
          tx += (Math.random() - 0.5) * 2;
          ty += (Math.random() - 0.5) * 2;
        }
        p.x += (tx - p.x) * 0.08;
        p.y += (ty - p.y) * 0.08;
        p.z += (tz - p.z) * 0.08;

        const cosY = Math.cos(t + p.group * 0.7);
        const sinY = Math.sin(t + p.group * 0.7);
        const rx = p.x * cosY - p.z * sinY;
        const rz0 = p.x * sinY + p.z * cosY;
        const tilt = 0.3;
        const ry = p.y * Math.cos(tilt) - rz0 * Math.sin(tilt);
        const rz = p.y * Math.sin(tilt) + rz0 * Math.cos(tilt);

        const slot = getSlot(p.group);
        const particleScale = isMobile ? 0.7 : 1;
        const scale = camDist / (camDist + rz);
        const fx = (slot.cx + rx * particleScale - w / 2) * scale + w / 2;
        const fy = (slot.cy + ry * particleScale - h / 2) * scale + h / 2;

        const depth = Math.max(-1, Math.min(1, rz / 35));
        const df = 1 - (depth + 1) / 2;
        const baseAlpha = isActive ? 0.7 : isHover ? 0.6 : 0.35;
        ctx.globalAlpha = Math.max(0.05, baseAlpha * (0.5 + df * 0.5));
        ctx.beginPath();
        ctx.arc(fx, fy, p.size * scale, 0, Math.PI * 2);
        ctx.fill();
      }

      animationId = requestAnimationFrame(render);
    };

    resize();
    render();
    window.addEventListener('resize', resize);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    canvas.addEventListener('click', handleClick);
    // Re-cache color when theme toggles (class change on <html>)
    const themeObserver = new MutationObserver(() => cacheColor());
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => {
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      canvas.removeEventListener('click', handleClick);
      themeObserver.disconnect();
      cancelAnimationFrame(animationId);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={containerRef} className="relative w-full mb-4 shrink-0">
      <div className="w-full h-[140px] md:h-[100px] bg-vc-surface rounded-lg border border-vc-border overflow-hidden cursor-pointer">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>
    </div>
  );
}
