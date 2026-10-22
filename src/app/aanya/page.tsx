'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Play } from 'lucide-react';
import VoiceCallPanel from '@/components/VoiceCallPanel';
import { aanyaAgent } from '@/lib/agents/aanyaAgent';
import { AgentConfig } from '@/lib/agents/types';

export default function AanyaPage() {
  const [selectedAgentForCall, setSelectedAgentForCall] = useState<AgentConfig | null>(null);

  const handleStartCall = async () => {
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtxClass({ latencyHint: 'playback' });
      await ctx.resume();
      (window as any).__primedAudioContext = ctx;
    } catch (_) {}
    setSelectedAgentForCall(aanyaAgent);
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-slate-50 text-slate-900 flex flex-col justify-between font-sans select-none relative">
      <header className="w-full flex items-center justify-between px-4 sm:px-8 py-3.5 border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-3.5">
          <Link
            href="/"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center transition-all cursor-pointer shadow-sm"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </Link>

          <div>
            <h1 className="font-bold text-sm sm:text-base text-slate-900 leading-tight">
              SwipeLoan Credit Marketplace
            </h1>
            <p className="text-[11px] font-semibold text-blue-700 tracking-wide">
              Aanya — Inbound Voice Concierge
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-9 sm:h-10 px-2.5 bg-white border border-slate-200 rounded-xl shadow-xs flex items-center justify-center overflow-hidden">
            <img
              src="https://swipeloan.in/wp-content/uploads/2024/04/swipefund_logo.png"
              alt="SwipeLoan Logo"
              className="h-6 sm:h-7 w-auto object-contain"
            />
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-10 sm:py-16 text-center max-w-2xl mx-auto w-full">
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-2xl shadow-md border border-slate-200/80 p-3 flex items-center justify-center mb-6 overflow-hidden">
          <img
            src="https://swipeloan.in/wp-content/uploads/2024/04/swipefund_logo.png"
            alt="SwipeLoan Official Logo"
            className="w-full h-full object-contain"
          />
        </div>

        <div className="inline-block bg-blue-50 text-blue-900 border border-blue-200 text-[10px] sm:text-[11px] font-extrabold tracking-[0.18em] uppercase px-4 py-1 rounded-full mb-4 shadow-xs">
          SWIPELOAN LOAN CONCIERGE
        </div>

        <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4 leading-tight">
          Talk to Aanya
        </h2>

        <p className="text-xs sm:text-sm md:text-base text-slate-600 mb-8 font-medium leading-relaxed max-w-lg">
          Ask about personal loans, instant loan matching, interest rates, eligibility criteria, or schedule a Loan Specialist callback in Hindi, Hinglish, or English.
        </p>

        <button
          onClick={handleStartCall}
          className="inline-flex items-center justify-center gap-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold px-8 py-3.5 text-xs sm:text-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer tracking-wider uppercase border border-slate-800"
        >
          <Play size={14} fill="currentColor" className="text-white shrink-0" />
          <span>Talk to Aanya</span>
        </button>
      </main>

      {selectedAgentForCall && (
        <VoiceCallPanel
          isOpen={!!selectedAgentForCall}
          onClose={() => setSelectedAgentForCall(null)}
          agent={selectedAgentForCall}
        />
      )}

      <footer className="w-full border-t border-slate-200 bg-white py-4 text-center text-[11px] text-slate-500 font-medium">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 KGIL Fintech Solutions Private Limited (SwipeLoan)</span>
          <span className="text-blue-700 font-semibold">URL Route: /talktoaanya · Agent 1</span>
        </div>
      </footer>
    </div>
  );
}
