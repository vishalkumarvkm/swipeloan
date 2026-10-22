'use client';

import React, { useEffect, useRef } from 'react';

export type VoiceState = 'idle' | 'connecting' | 'listening' | 'processing' | 'speaking' | 'error';

interface RadialVisualizerProps {
  state: VoiceState;
  audioVolume?: number; // 0 to 1 fallback
  getAudioData?: () => Uint8Array | null;
  intensity?: number;
  size?: number;
  innerRadius?: number;
  agentAccent?: string; // hex like #10B981 or #1D4ED8
  className?: string;
}

const TAU = Math.PI * 2;
const N_MAIN = 110;
const N_ECHO = 80;
const N_PULSE = 24;

interface Profile {
  alpha: number;
  rotate: number;
  gain: number;
  attack: number;
  release: number;
}

const PROFILES: Record<VoiceState, Profile> = {
  idle: { alpha: 0.45, rotate: 0.02, gain: 0, attack: 0.1, release: 0.06 },
  connecting: { alpha: 0.85, rotate: 0.08, gain: 0, attack: 0.1, release: 0.06 },
  listening: { alpha: 1, rotate: 0.05, gain: 1, attack: 0.35, release: 0.12 },
  processing: { alpha: 0.85, rotate: 0.28, gain: 0, attack: 0.08, release: 0.06 },
  speaking: { alpha: 1, rotate: 0.09, gain: 1.25, attack: 0.32, release: 0.1 },
  error: { alpha: 0.3, rotate: 0, gain: 0, attack: 0.08, release: 0.08 },
};

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

export function RadialVisualizer({
  state,
  audioVolume = 0,
  getAudioData,
  intensity = 1,
  size = 320,
  innerRadius,
  agentAccent = '#1D4ED8',
  className = '',
}: RadialVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Derive base HSL hue from agent accent color
  const baseHue = agentAccent.toLowerCase().includes('10b981') || agentAccent.toLowerCase().includes('emerald')
    ? 160 // Emerald for Aanya
    : 218; // SwipeLoan default

  const live = useRef({ state, audioVolume, getAudioData, intensity, baseHue });
  useEffect(() => {
    live.current = { state, audioVolume, getAudioData, intensity, baseHue };
  }, [state, audioVolume, getAudioData, intensity, baseHue]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);

    const cx = size / 2;
    const cy = size / 2;
    const r0 = innerRadius ?? size * 0.22;
    const maxLen = size / 2 - r0 - size * 0.045;
    const minLen = Math.max(3, size * 0.01);

    const target = new Float32Array(N_MAIN);
    const tmp = new Float32Array(N_MAIN);
    const cur = new Float32Array(N_MAIN);
    const echo = new Float32Array(N_ECHO);

    let t = 0;
    let rot = 0;
    let last = performance.now();
    let peak = 0.3;
    let alphaS = PROFILES[live.current.state].alpha;
    let rotS = PROFILES[live.current.state].rotate;
    let raf = 0;

    const hueAt = (a: number) => {
      const bHue = live.current.baseHue;
      return bHue + 28 * Math.sin(t * 0.3 + a * 0.8) + 12 * Math.sin(t * 0.6 - a * 2);
    };

    function computeTargets(st: VoiceState, p: Profile, data: Uint8Array | null, vol: number) {
      const hasData = p.gain > 0 && data && data.length > 8;

      if (hasData) {
        const usable = Math.max(12, Math.floor(data.length * 0.5));
        let frameMax = 0;
        for (let i = 0; i < N_MAIN; i++) {
          const u = i / N_MAIN;
          const m = u < 0.5 ? u * 2 : (1 - u) * 2;
          const drift = u < 0.5 ? 0 : 2 * Math.sin(t * 0.4);
          const pos = Math.min(usable - 2, 2 + Math.pow(m, 1.55) * (usable - 4) + drift);
          const lo = Math.floor(pos);
          const f = pos - lo;
          const raw = (data[lo] * (1 - f) + data[lo + 1] * f) / 255;
          tmp[i] = raw;
          if (raw > frameMax) frameMax = raw;
        }
        peak = Math.max(peak * 0.992, frameMax, 0.28);
        for (let i = 0; i < N_MAIN; i++) {
          const a = (i / N_MAIN) * TAU;
          const organic = 0.88 + 0.12 * Math.sin(a * 3 + t * 1.3) * Math.sin(a * 5 - t * 0.9);
          tmp[i] = clamp01(Math.pow(tmp[i] / peak, 1.25) * organic * p.gain);
        }
      } else if (vol > 0.01 && (st === 'listening' || st === 'speaking')) {
        // Fallback to audio volume RMS if frequency reader is null
        for (let i = 0; i < N_MAIN; i++) {
          const a = (i / N_MAIN) * TAU;
          const lobe = Math.abs(Math.sin(a * 2 + t * 2));
          const wave = 0.5 + 0.5 * Math.sin(a * 4 - t * 3);
          tmp[i] = clamp01(vol * (0.4 + 0.6 * lobe * wave) * 1.3);
        }
      } else {
        for (let i = 0; i < N_MAIN; i++) {
          const a = (i / N_MAIN) * TAU;
          if (st === 'processing') tmp[i] = 0.12 + 0.1 * (0.5 + 0.5 * Math.sin(2 * a - t * 2.4));
          else if (st === 'error') tmp[i] = 0.025;
          else tmp[i] = 0.06 + 0.03 * Math.sin(a * 5 + t * 0.6);
        }
      }

      for (let pass = 0; pass < 2; pass++) {
        for (let i = 0; i < N_MAIN; i++) {
          target[i] = 0.25 * tmp[(i + N_MAIN - 1) % N_MAIN] + 0.5 * tmp[i] + 0.25 * tmp[(i + 1) % N_MAIN];
        }
        tmp.set(target);
      }
    }

    function stroke(x0: number, y0: number, x1: number, y1: number, w: number, style: string) {
      ctx!.strokeStyle = style;
      ctx!.lineWidth = w;
      ctx!.beginPath();
      ctx!.moveTo(x0, y0);
      ctx!.lineTo(x1, y1);
      ctx!.stroke();
    }

    function drawRing(
      vals: Float32Array,
      n: number,
      skew: number,
      lenScale: number,
      lw: number,
      alphaMul: number,
      hueShift: number,
      step: number,
      sampleFrom: Float32Array,
      sampleN: number,
    ) {
      const k = live.current.intensity;
      for (let i = 0; i < n; i++) {
        let v: number;
        if (sampleFrom === vals && sampleN === n) v = vals[i];
        else {
          const pos = (i / n) * sampleN;
          const lo = Math.floor(pos) % sampleN;
          const f = pos - Math.floor(pos);
          v = sampleFrom[lo] * (1 - f) + sampleFrom[(lo + 1) % sampleN] * f;
        }
        const len = (minLen + v * (maxLen - minLen) * k) * lenScale;
        const a = (i / n) * TAU - Math.PI / 2 + rot * step;
        const a2 = a + (skew * len) / (r0 + len);
        const ca = Math.cos(a);
        const sa = Math.sin(a);
        const x0 = cx + ca * r0;
        const y0 = cy + sa * r0;
        const x1 = cx + Math.cos(a2) * (r0 + len);
        const y1 = cy + Math.sin(a2) * (r0 + len);
        const xm = x0 + (x1 - x0) * 0.55;
        const ym = y0 + (y1 - y0) * 0.55;

        const h = hueAt(a) + hueShift;
        const e = clamp01(0.35 + v * 0.9);
        const A = alphaS * alphaMul;

        // Radiant, modern tips with bright core
        stroke(x0, y0, x1, y1, lw * 3.2, `hsla(${h}, 92%, 58%, ${0.08 * A * e})`);
        stroke(x0, y0, x1, y1, lw, `hsla(${h}, 90%, 65%, ${0.88 * A})`);
        stroke(x0, y0, xm, ym, lw, `hsla(${h}, 50%, 96%, ${0.92 * A})`);
      }
    }

    function drawPulse() {
      const bHue = live.current.baseHue;
      for (let k = 0; k < 3; k++) {
        const ph = (t * 0.55 + k / 3) % 1;
        const r = r0 + 8 + ph * (maxLen * 0.85);
        const a = (1 - ph) * 0.8 * alphaS;
        ctx!.fillStyle = `hsla(${bHue}, 85%, 60%, ${a * 0.6})`;
        for (let i = 0; i < N_PULSE; i++) {
          const ang = (i / N_PULSE) * TAU + k * 0.2 + rot;
          ctx!.beginPath();
          ctx!.arc(cx + Math.cos(ang) * r, cy + Math.sin(ang) * r, 1.6 + (1 - ph) * 0.8, 0, TAU);
          ctx!.fill();
        }
      }
    }

    function frame(now: number) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      t += dt;

      const { state: st, audioVolume: vol, getAudioData: pull } = live.current;
      const p = PROFILES[st];

      alphaS += (p.alpha - alphaS) * 0.08;
      rotS += (p.rotate - rotS) * 0.05;
      rot += rotS * dt;

      const data = pull ? pull() : null;
      computeTargets(st, p, data, vol);

      let energy = 0;
      for (let i = 0; i < N_MAIN; i++) {
        const d = target[i] - cur[i];
        cur[i] += d * (d > 0 ? p.attack : p.release);
        energy += cur[i];
      }
      energy /= N_MAIN;

      for (let i = 0; i < N_ECHO; i++) {
        const src = cur[Math.floor((i / N_ECHO) * N_MAIN)];
        echo[i] += (src - echo[i]) * 0.05;
      }

      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx!.clearRect(0, 0, size, size);
      ctx!.lineCap = 'round';

      // Idle breathing organic motion from Aria: 1 → 1.03 → 1 over ~3.6s
      const breathe = 1 + 0.016 * (1 - Math.cos((t * TAU) / 3.6)) * (st === 'idle' ? 1 : 0.6);
      ctx!.translate(cx, cy);
      ctx!.scale(breathe, breathe);
      ctx!.translate(-cx, -cy);

      // Luminous radial glow halo
      const haloR = r0 + maxLen * (0.75 + energy * 0.5);
      const g = ctx!.createRadialGradient(cx, cy, r0 * 0.8, cx, cy, haloR);
      const ha = 0.16 * alphaS * (0.35 + energy * 1.6);
      g.addColorStop(0, `hsla(${hueAt(0)}, 90%, 60%, ${ha})`);
      g.addColorStop(0.55, `hsla(${hueAt(2)}, 90%, 60%, ${ha * 0.35})`);
      g.addColorStop(1, `hsla(${hueAt(4)}, 90%, 60%, 0)`);
      ctx!.fillStyle = g;
      ctx!.fillRect(0, 0, size, size);

      if (st === 'connecting') {
        drawPulse();
      } else {
        // Layer 1: slower counter-slanted echo ring (crosshatch depth)
        drawRing(echo, N_ECHO, -0.34, 0.78, 1.2, 0.38, -14, -0.6, echo, N_ECHO);

        // Layer 2: crisp main ring with white-hot core
        drawRing(cur, N_MAIN, 0.36, 1.0, 1.6, 1.0, 0, 1.0, cur, N_MAIN);
      }

      raf = requestAnimationFrame(frame);
    }

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [size, innerRadius]);

  return (
    <div
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <canvas
        ref={canvasRef}
        style={{ width: size, height: size }}
        className="pointer-events-none"
      />
    </div>
  );
}
