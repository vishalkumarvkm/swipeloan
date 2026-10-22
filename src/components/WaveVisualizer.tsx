'use client';

import React, { useEffect, useRef } from 'react';

interface WaveVisualizerProps {
  state: 'idle' | 'connecting' | 'listening' | 'speaking' | 'error';
  audioVolume: number;
  color?: string;
}

export const WaveVisualizer: React.FC<WaveVisualizerProps> = ({
  state,
  audioVolume,
  color = '#10B981'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      phase += 0.08;

      let numWaves = 3;
      let amplitude = 0;
      let frequency = 0.02;
      let speedFactor = 1;

      if (state === 'listening') {
        amplitude = 8 + audioVolume * 40;
        frequency = 0.02;
        numWaves = 4;
        speedFactor = 1.2;
      } else if (state === 'speaking') {
        amplitude = 12 + audioVolume * 50;
        frequency = 0.025;
        numWaves = 5;
        speedFactor = 1.5;
      } else if (state === 'connecting') {
        amplitude = 4;
        frequency = 0.01;
        numWaves = 2;
        speedFactor = 0.6;
      } else {
        amplitude = 0.8;
        frequency = 0.005;
        numWaves = 1;
        speedFactor = 0.2;
      }

      ctx.lineWidth = 1.5;

      for (let i = 0; i < numWaves; i++) {
        ctx.beginPath();
        const yOffset = (i - (numWaves - 1) / 2) * 2;
        const wavePhase = phase * speedFactor + i * (Math.PI / 6);
        const opacity = 0.9 - (i / numWaves) * 0.5;
        
        ctx.strokeStyle = color.startsWith('#')
          ? hexToRgba(color, opacity)
          : color;

        for (let x = 0; x < width; x++) {
          const envelope = Math.sin((x / width) * Math.PI);
          const y = height / 2 + yOffset + Math.sin(x * frequency + wavePhase) * amplitude * envelope;
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      animationFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [state, audioVolume, color]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};

function hexToRgba(hex: string, alpha: number): string {
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16) || 16;
  const g = parseInt(c.substring(2, 4), 16) || 185;
  const b = parseInt(c.substring(4, 6), 16) || 129;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
