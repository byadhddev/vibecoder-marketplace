'use client';

import { useEffect, useRef } from 'react';

export interface MagnetLinesProps {
  rows?: number;
  cols?: number;
  lineColor?: string;
  lineWidth?: number;
  lineLength?: number;
  baseAngle?: number;
}

export function MagnetLines(props: MagnetLinesProps) {
  const {
    rows = 30, cols = 20, lineColor = '#37352f',
    lineWidth = 1, lineLength = 12, baseAngle = 0,
  } = props;

  const propsRef = useRef(props);
  useEffect(() => {
    propsRef.current = { rows, cols, lineColor, lineWidth, lineLength, baseAngle };
  }, [rows, cols, lineColor, lineWidth, lineLength, baseAngle]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const wander = { x: 0, y: 0, angle: 0 };

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = window.devicePixelRatio || 1;
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    // Track mouse globally, translate to canvas-relative coords
    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
    };

    const onMouseLeave = () => {
      mouseRef.current.active = false;
    };

    const render = () => {
      const {
        rows = 30, cols = 20, lineColor = '#37352f',
        lineWidth = 1, lineLength = 12, baseAngle = 0,
      } = propsRef.current;

      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);

      ctx.clearRect(0, 0, width * 2, height * 2);
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = lineWidth;

      let targetX: number, targetY: number;

      if (mouseRef.current.active) {
        targetX = mouseRef.current.x;
        targetY = mouseRef.current.y;
      } else {
        wander.angle += (Math.random() - 0.5) * 0.08;
        wander.x += Math.cos(wander.angle) * 1.5;
        wander.y += Math.sin(wander.angle) * 1.5;
        if (wander.x < 0) wander.x = width;
        if (wander.x > width) wander.x = 0;
        if (wander.y < 0) wander.y = height;
        if (wander.y > height) wander.y = 0;
        if (Math.random() < 0.01)
          wander.angle += Math.atan2(height / 2 - wander.y, width / 2 - wander.x) * 0.1;
        targetX = wander.x;
        targetY = wander.y;
        if (targetX === 0 && targetY === 0) {
          wander.x = targetX = width / 2;
          wander.y = targetY = height / 2;
        }
      }

      const cellW = width / cols;
      const cellH = height / rows;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const cx = c * cellW + cellW / 2;
          const cy = r * cellH + cellH / 2;
          const angle = Math.atan2(targetY - cy, targetX - cx) + (baseAngle * Math.PI) / 180;

          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(angle);
          ctx.beginPath();
          ctx.moveTo(-lineLength / 2, 0);
          ctx.lineTo(lineLength / 2, 0);
          ctx.stroke();
          ctx.restore();
        }
      }

      animationId = requestAnimationFrame(render);
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);
    resize();
    render();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return <canvas ref={canvasRef} className="w-full h-full block" />;
}
