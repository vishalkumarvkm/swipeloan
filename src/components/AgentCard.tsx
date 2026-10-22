'use client';

import React from 'react';
import { Headset, ShieldCheck, Sparkles } from 'lucide-react';
import { AgentConfig } from '@/lib/agents/types';

interface AgentCardProps {
  agent: AgentConfig;
  onSelect: (agent: AgentConfig) => void;
  badgeText: string;
}

export const AgentCard: React.FC<AgentCardProps> = ({ agent, onSelect, badgeText }) => {
  const isAanya = agent.id === 'aanya-inbound' || agent.id === 'aanya-website';

  return (
    <div className={`relative group rounded-3xl p-6 sm:p-7 transition-all duration-300 border bg-slate-900/90 backdrop-blur-xl flex flex-col justify-between overflow-hidden shadow-xl hover:shadow-2xl ${
      isAanya 
        ? 'border-emerald-500/30 hover:border-emerald-400/60 shadow-emerald-950/20' 
        : 'border-indigo-500/30 hover:border-indigo-400/60 shadow-indigo-950/20'
    }`}>
      {/* Background Accent Gradient Blur */}
      <div className={`absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl pointer-events-none transition-all duration-500 group-hover:scale-125 ${
        isAanya ? 'bg-emerald-500/10' : 'bg-indigo-500/10'
      }`} />

      <div>
        {/* Header Tag */}
        <div className="flex items-center justify-between mb-5">
          <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${
            isAanya 
              ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/30' 
              : 'bg-indigo-950/80 text-indigo-400 border-indigo-500/30'
          }`}>
            {badgeText}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Gemini Live Native
          </span>
        </div>

        {/* Profile Avatar & Title */}
        <div className="flex items-start gap-4 mb-5">
          <div className="relative">
            <img
              src={agent.avatarUrl}
              alt={agent.name}
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 shadow-md ${
                isAanya ? 'border-emerald-400/50' : 'border-indigo-400/50'
              }`}
            />
            <span className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-slate-900 flex items-center justify-center ${
              isAanya ? 'bg-emerald-500' : 'bg-indigo-500'
            }`}>
              <Sparkles className="w-3 h-3 text-slate-950" />
            </span>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              {agent.name}
            </h2>
            <p className={`text-xs sm:text-sm font-semibold mb-1 ${
              isAanya ? 'text-emerald-400' : 'text-indigo-400'
            }`}>
              {agent.role}
            </p>
            <p className="text-[11px] text-slate-400 font-medium">
              {agent.channel}
            </p>
          </div>
        </div>

        {/* Feature Bullet Highlights */}
        <div className="space-y-2 mb-6 text-xs text-slate-300">
          {isAanya ? (
            <>
              <p className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Answers Loan Offers, Eligibility & Market Disclosures
              </p>
              <p className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Schedules Specialist Callbacks with Consent
              </p>
              <p className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Hindi, Hinglish & English Code-switching
              </p>
            </>
          ) : (
            <>
              <p className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                Follow-up on Stalled KYC & Application Journeys
              </p>
              <p className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                Compliant Time-Window & Opt-out/DND Handling
              </p>
              <p className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                Outbound Telephony & CRM Auto-Disposition
              </p>
            </>
          )}
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={() => onSelect(agent)}
        className={`w-full py-3.5 px-5 rounded-2xl font-bold text-xs sm:text-sm text-slate-950 flex items-center justify-center gap-2.5 transition-all duration-300 cursor-pointer shadow-lg hover:scale-[1.02] active:scale-[0.98] ${
          isAanya 
            ? 'bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 shadow-emerald-500/20' 
            : 'bg-gradient-to-r from-indigo-400 to-cyan-300 hover:from-indigo-300 hover:to-cyan-200 shadow-indigo-500/20'
        }`}
      >
        <Headset className="w-4 h-4" />
        <span>Start Voice Call with Aanya</span>
      </button>

    </div>
  );
};
