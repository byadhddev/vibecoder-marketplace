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
    rows = 9, cols = 9, lineColor = '#37352f',
    lineWidth = 1, lineLength = 15, baseAngle = 0,
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
    const wander = { x: 0, y: 0, angle: 0, speed: 0.02 };

    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = parent.clientWidth * dpr;
        canvas.height = parent.clientHeight * dpr;
        canvas.style.width = `${parent.clientWidth}px`;
        canvas.style.height = `${parent.clientHeight}px`;
        ctx.scale(dpr, dpr);
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top, active: true };
    };

    const onMouseLeave = () => {
      mouseRef.current.active = false;
    };

    const render = () => {
      const {
        rows = 9, cols = 9, lineColor = '#37352f',
        lineWidth = 1, lineLength = 15, baseAngle = 0,
      } = propsRef.current;

      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);

      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = lineWidth;

      let targetX: number, targetY: number;

      if (mouseRef.current.active) {
        targetX = mouseRef.current.x;
        targetY = mouseRef.current.y;
      } else {
        wander.angle += (Math.random() - 0.5) * 0.1;
        wander.x += Math.cos(wander.angle) * 2;
        wander.y += Math.sin(wander.angle) * 2;
        if (wander.x < 0) wander.x = width;
        if (wander.x > width) wander.x = 0;
        if (wander.y < 0) wander.y = height;
        if (wander.y > height) wander.y = 0;
        if (Math.random() < 0.01)
          wander.angle += Math.atan2(height / 2 - wander.y, width / 2 - wander.x) * 0.1;
        targetX = wander.x;
        targetY = wander.y;
        if (targetX === 0 && targetY === 0) {
          targetX = width / 2;
          targetY = height / 2;
          wander.x = width / 2;
          wander.y = height / 2;
        }
      }

      const cellWidth = width / cols;
      const cellHeight = height / rows;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const centerX = c * cellWidth + cellWidth / 2;
          const centerY = r * cellHeight + cellHeight / 2;
          const dx = targetX - centerX;
          const dy = targetY - centerY;
          const angle = Math.atan2(dy, dx) + (baseAngle * Math.PI) / 180;

          ctx.save();
          ctx.translate(centerX, centerY);
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
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseleave', onMouseLeave);
    resize();
    render();

    return () => {
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseleave', onMouseLeave);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return <canvas ref={canvasRef} className="w-full h-full block opacity-80" />;
}
