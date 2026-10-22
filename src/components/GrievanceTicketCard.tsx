'use client';

import React, { useState } from 'react';
import { CheckCircle2, ShieldAlert, Copy, Check, Clock, Phone, User, Calendar, ExternalLink } from 'lucide-react';
import confetti from 'canvas-confetti';
import { EscalationTicket, CallbackRecord, ApplicationLinkRecord } from '@/lib/agents/types';

interface EscalationCardProps {
  ticket: EscalationTicket;
}

export const EscalationCard: React.FC<EscalationCardProps> = ({ ticket }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(ticket.ticketId);
    setCopied(true);
    confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900/90 border border-amber-500/40 rounded-2xl p-4 text-slate-100 shadow-xl relative overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400 bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-500/30">
            Escalation Triggered
          </span>
        </div>
        <span className="text-[11px] font-mono text-slate-400">{ticket.createdAt}</span>
      </div>

      <div className="bg-slate-950/80 rounded-xl p-3 mb-3 border border-amber-500/20 flex items-center justify-between">
        <div>
          <p className="text-[10px] text-amber-400 uppercase tracking-widest font-mono">Ticket Reference</p>
          <p className="text-base font-bold font-mono text-amber-300">{ticket.ticketId}</p>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center space-x-1 px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg text-xs transition-all"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      <div className="space-y-1.5 text-xs text-slate-300">
        <p><span className="text-slate-500">Complainant:</span> {ticket.customerName || 'Lead'}</p>
        <p><span className="text-slate-500">Reason:</span> <span className="font-semibold text-amber-200">{ticket.reason}</span></p>
        <p><span className="text-slate-500">Priority:</span> <span className="font-bold text-red-400">{ticket.priority}</span></p>
      </div>
    </div>
  );
};

export const CallbackCard: React.FC<{ callback: CallbackRecord }> = ({ callback }) => {
  return (
    <div className="bg-slate-900/90 border border-emerald-500/40 rounded-2xl p-4 text-slate-100 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
        <div className="flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
            Callback Scheduled
          </span>
        </div>
        <span className="text-[11px] font-mono text-slate-400">{callback.scheduledAt}</span>
      </div>

      <div className="space-y-1 text-xs">
        <p className="flex items-center gap-1.5 text-slate-200 font-semibold">
          <Calendar className="w-3.5 h-3.5 text-emerald-400" />
          {callback.date} ({callback.timeWindow})
        </p>
        <p className="text-slate-400">Language: {callback.languagePref}</p>
        <p className="text-[10px] font-mono text-emerald-400">Ref ID: {callback.id}</p>
      </div>
    </div>
  );
};
