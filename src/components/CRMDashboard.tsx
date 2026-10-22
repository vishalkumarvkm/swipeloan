'use client';

import React, { useState, useEffect } from 'react';
import { crmStore, CRMState } from '@/lib/crm/crmStore';
import { User, Phone, CheckCircle, ShieldAlert, FileText, Activity, Clock, Link as LinkIcon, Calendar } from 'lucide-react';
import { EscalationCard, CallbackCard } from './GrievanceTicketCard';

export const CRMDashboard: React.FC = () => {
  const [crmState, setCrmState] = useState<CRMState>(crmStore.getState());
  const [activeTab, setActiveTab] = useState<'leads' | 'logs' | 'dispositions' | 'escalations'>('leads');

  useEffect(() => {
    const unsubscribe = crmStore.subscribe(() => {
      setCrmState(crmStore.getState());
    });
    return () => unsubscribe();
  }, []);

  const { activeLead, leads, dispositions, escalations, callbacks, applicationLinks, toolLogs } = crmState;

  return (
    <div className="w-full bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 backdrop-blur-xl shadow-2xl text-slate-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              SwipeLoan CRM & Real-Time Agent Monitor
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Simulate caller profiles & track live Gemini Live tool declarations, dispositions, and escalations.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('leads')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
              activeTab === 'leads' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Leads ({leads.length})
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
              activeTab === 'logs' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Tool Logs ({toolLogs.length})
          </button>
          <button
            onClick={() => setActiveTab('dispositions')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
              activeTab === 'dispositions' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Dispositions ({dispositions.length})
          </button>
          <button
            onClick={() => setActiveTab('escalations')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
              activeTab === 'escalations' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Escalations ({escalations.length})
          </button>
        </div>
      </div>

      {/* Tab 1: Leads Selector & Profile View */}
      {activeTab === 'leads' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Lead List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-mono">Select Active Lead Profile</h4>
            {leads.map(lead => (
              <div
                key={lead.leadId}
                onClick={() => crmStore.setActiveLead(lead.leadId)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  activeLead.leadId === lead.leadId
                    ? 'bg-emerald-950/40 border-emerald-500/60 shadow-lg shadow-emerald-950/30'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-white text-sm">{lead.name}</span>
                  <span className="text-[10px] font-mono text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/30">
                    {lead.leadId}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{lead.requestedProduct} · {lead.employmentType}</p>
                <p className="text-[11px] text-amber-400 font-medium truncate mt-1">Stalled: {lead.stalledStep}</p>
              </div>
            ))}
          </div>

          {/* Active Lead Details */}
          <div className="md:col-span-2 bg-slate-950/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div>
                  <h4 className="text-lg font-extrabold text-white flex items-center gap-2">
                    <User className="w-5 h-5 text-emerald-400" />
                    {activeLead.name}
                  </h4>
                  <p className="text-xs text-slate-400 font-mono">Lead ID: {activeLead.leadId} | Phone: +91 {activeLead.phone}</p>
                </div>
                <span className="text-xs font-semibold px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/30">
                  Active Simulated Session
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs mb-6">
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">Requested Product</span>
                  <span className="font-semibold text-white">{activeLead.requestedProduct}</span>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">Employment Type</span>
                  <span className="font-semibold text-white capitalize">{activeLead.employmentType}</span>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">Masked PAN / Aadhaar</span>
                  <span className="font-semibold font-mono text-emerald-300">{activeLead.maskedPan} | {activeLead.maskedAadhaar}</span>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">Stalled Step</span>
                  <span className="font-semibold text-amber-300">{activeLead.stalledStep}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions / Activity overview */}
            <div className="border-t border-slate-800 pt-4 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Last interaction: {activeLead.lastActive}
              </span>
              <span className="text-slate-500">Ready for Aanya Voice Assistant interaction</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Tool Logs */}
      {activeTab === 'logs' && (
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {toolLogs.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-8 text-center">No tool calls executed yet. Start a conversation with Aanya to see real-time tool logs.</p>
          ) : (
            toolLogs.map((log, idx) => (
              <div key={idx} className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs font-mono">
                <div className="flex items-center justify-between text-slate-400 mb-1.5">
                  <span className="text-emerald-400 font-bold">[{log.agentId}] {log.toolName}</span>
                  <span className="text-[10px] text-slate-500">{log.timestamp}</span>
                </div>
                <div className="text-slate-300 mb-1">
                  <span className="text-slate-500">Args: </span>
                  {JSON.stringify(log.args)}
                </div>
                <div className="text-emerald-300">
                  <span className="text-slate-500">Result: </span>
                  {JSON.stringify(log.response)}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Dispositions */}
      {activeTab === 'dispositions' && (
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {dispositions.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-8 text-center">No CRM dispositions logged yet.</p>
          ) : (
            dispositions.map(disp => (
              <div key={disp.id} className="bg-slate-950 border border-emerald-500/20 rounded-xl p-3.5 text-xs flex items-center justify-between">
                <div>
                  <p className="font-bold text-emerald-400">{disp.dispositionValue}</p>
                  <p className="text-slate-400 text-[11px]">Agent: {disp.agentId} | Lead: {disp.leadId}</p>
                </div>
                <span className="text-[10px] font-mono text-slate-500">{disp.timestamp}</span>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 4: Escalations & Callbacks */}
      {activeTab === 'escalations' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-1">
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-amber-400 font-mono">Escalations ({escalations.length})</h4>
            {escalations.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4">No escalations triggered.</p>
            ) : (
              escalations.map(ticket => <EscalationCard key={ticket.ticketId} ticket={ticket} />)
            )}
          </div>
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-400 font-mono">Scheduled Callbacks ({callbacks.length})</h4>
            {callbacks.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4">No callbacks scheduled.</p>
            ) : (
              callbacks.map(cb => <CallbackCard key={cb.id} callback={cb} />)
            )}
          </div>
        </div>
      )}
    </div>
  );
};
