'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, ChevronRight } from 'lucide-react';
import VoiceCallPanel from '@/components/VoiceCallPanel';
import { aanyaAgent } from '@/lib/agents/aanyaAgent';

const POPUP_MESSAGES = [
  { text: "👋 Namaste! Need help finding the best loan?", highlight: "loan options" },
  { text: "⚡ Check instant eligibility & lowest interest rates", highlight: "lowest rates" },
  { text: "💬 Salaried or self-employed? Ask me anything!", highlight: "instant answers" },
  { text: "🎙️ Tap here to speak directly with Aanya", highlight: "AI Voice" },
];

export default function AanyaEmbedPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [msgIndex, setMsgIndex] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Auto-open if inside an embed iframe (e.g., opened via host script)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
      setIsOpen(true);
    }
  }, []);

  // WhatsApp-like Notification Loop: Appears -> Stays for 4.8s -> Disappears -> Pauses 3.2s -> Next message -> Repeats
  useEffect(() => {
    if (isDismissed || isOpen) {
      setShowPopup(false);
      return;
    }

    let isMounted = true;
    let hideTimer: NodeJS.Timeout;
    let nextTimer: NodeJS.Timeout;

    const startNotificationCycle = () => {
      if (!isMounted || isDismissed || isOpen) return;
      // 1. Appear
      setShowPopup(true);

      // 2. Stay visible for 4.8s, then disappear
      hideTimer = setTimeout(() => {
        if (!isMounted || isDismissed || isOpen) return;
        setShowPopup(false);

        // 3. Stay disappeared for 3.2s, then advance to next message & re-appear
        nextTimer = setTimeout(() => {
          if (!isMounted || isDismissed || isOpen) return;
          setMsgIndex((prev) => (prev + 1) % POPUP_MESSAGES.length);
          startNotificationCycle();
        }, 3200);
      }, 4800);
    };

    // Initial delay of 1.4s before first appearance
    const initialDelay = setTimeout(startNotificationCycle, 1400);

    return () => {
      isMounted = false;
      clearTimeout(initialDelay);
      clearTimeout(hideTimer);
      clearTimeout(nextTimer);
    };
  }, [isDismissed, isOpen]);

  useEffect(() => {
    // Prime audio context on mount or first user interaction
    const primeAudio = () => {
      try {
        const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtxClass && !(window as any).__primedAudioContext) {
          const ctx = new AudioCtxClass({ latencyHint: 'playback' });
          ctx.resume().catch(() => {});
          (window as any).__primedAudioContext = ctx;
        }
      } catch (_) {}
    };

    primeAudio();
    window.addEventListener('click', primeAudio, { once: true });
    window.addEventListener('touchstart', primeAudio, { once: true });

    // Handle messages from host window
    const handleHostMessage = (e: MessageEvent) => {
      if (!e.data) return;
      if (e.data.type === 'swipeloan_open_call') {
        setIsOpen(true);
      } else if (e.data.type === 'swipeloan_close_call') {
        setIsOpen(false);
      }
    };
    window.addEventListener('message', handleHostMessage);

    return () => {
      window.removeEventListener('click', primeAudio);
      window.removeEventListener('touchstart', primeAudio);
      window.removeEventListener('message', handleHostMessage);
    };
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'swipeloan_widget_close', agentId: 'aanya-website' }, '*');
    }
  };

  const handleStartCall = () => {
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass && !(window as any).__primedAudioContext) {
        const ctx = new AudioCtxClass({ latencyHint: 'playback' });
        ctx.resume().catch(() => {});
        (window as any).__primedAudioContext = ctx;
      }
    } catch (_) {}
    setIsOpen(true);
  };

  return (
    <div className="w-full h-full min-h-screen bg-transparent overflow-hidden relative">
      {isOpen ? (
        <VoiceCallPanel
          isOpen={isOpen}
          onClose={handleClose}
          agent={aanyaAgent}
        />
      ) : (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
          {/* Animated Message Pop-up - Clean message only */}
          <AnimatePresence>
            {showPopup && !isDismissed && (
              <motion.div
                initial={{ opacity: 0, y: 22, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.92, transition: { duration: 0.25, ease: 'easeInOut' } }}
                transition={{ type: 'spring', stiffness: 450, damping: 26 }}
                className="relative mb-3 max-w-[275px] sm:max-w-[300px] cursor-pointer select-none"
                onClick={handleStartCall}
              >
                <div className="relative rounded-2xl py-3 px-3.5 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 hover:border-emerald-500/60 shadow-[0_12px_32px_rgba(0,0,0,0.5),0_0_20px_rgba(16,185,129,0.18)] transition-all duration-300 flex items-start justify-between gap-2.5">
                  {/* Clean message text */}
                  <p className="text-[13px] text-slate-100 font-medium leading-snug">
                    {POPUP_MESSAGES[msgIndex].text}
                  </p>

                  {/* Discreet dismiss button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsDismissed(true);
                    }}
                    className="shrink-0 text-slate-400 hover:text-white p-0.5 rounded-full hover:bg-slate-800/80 transition-colors cursor-pointer mt-0.5"
                    aria-label="Dismiss message"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Speech Bubble Arrow pointing to the launcher button */}
                <div className="absolute right-8 -bottom-1.5 w-3 h-3 bg-slate-900 border-r border-b border-slate-700/80 transform rotate-45" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating Launcher Button */}
          <button
            onClick={handleStartCall}
            aria-label="Start Call with Aanya"
            className="group relative flex items-center gap-3.5 py-2.5 pl-3 pr-4 rounded-full bg-slate-900/95 hover:bg-slate-900 backdrop-blur-xl border border-slate-800 hover:border-emerald-500/50 shadow-[0_12px_36px_rgba(0,0,0,0.45),0_0_20px_rgba(16,185,129,0.12)] hover:shadow-[0_16px_44px_rgba(0,0,0,0.55),0_0_28px_rgba(16,185,129,0.25)] transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] cursor-pointer select-none"
          >
            {/* Subtle Gradient Glow Ring */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500/10 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

            {/* Avatar Badge with Refined Glow Ring */}
            <div className="relative w-11 h-11 rounded-full bg-white p-1.5 flex items-center justify-center shadow-md shrink-0 ring-2 ring-emerald-500/40 ring-offset-2 ring-offset-slate-900 group-hover:ring-emerald-400 transition-all">
              <img
                src={aanyaAgent.avatarUrl}
                alt="SwipeLoan"
                className="w-full h-full object-contain"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900 shadow-xs">
                <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
              </span>
            </div>

            {/* Content & Typography */}
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-2">
                <span className="text-[14px] sm:text-[15px] font-bold text-slate-100 tracking-tight leading-snug group-hover:text-emerald-300 transition-colors">
                  Talk to Aanya
                </span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold tracking-wide uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                  AI Voice
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                <div className="flex items-end gap-[2px] h-2.5">
                  <span className="w-[2px] h-2 bg-emerald-400 rounded-full group-hover:animate-pulse" />
                  <span className="w-[2px] h-2.5 bg-emerald-400 rounded-full group-hover:animate-pulse delay-75" />
                  <span className="w-[2px] h-1.5 bg-emerald-400 rounded-full group-hover:animate-pulse delay-150" />
                </div>
                <span className="group-hover:text-slate-300 transition-colors">
                  Instant Loan Assistance
                </span>
              </div>
            </div>

            {/* Interactive Mic CTA Circle */}
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 group-hover:bg-emerald-500 text-emerald-400 group-hover:text-slate-950 flex items-center justify-center transition-all duration-300 ml-1 shrink-0 border border-emerald-500/20 group-hover:border-emerald-400">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
              </svg>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}


