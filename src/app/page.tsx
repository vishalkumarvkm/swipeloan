'use client';

import React from 'react';
import Link from 'next/link';
import { Headset, PhoneCall, ArrowRight, ExternalLink } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen min-h-[100dvh] bg-slate-50 text-slate-900 flex flex-col justify-between font-sans select-none relative">
      {/* Header */}
      <header className="w-full flex items-center justify-between px-4 sm:px-8 py-3.5 border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="h-9 sm:h-10 px-2.5 bg-white border border-slate-200 rounded-xl shadow-xs flex items-center justify-center overflow-hidden">
            <img
              src="https://swipeloan.in/wp-content/uploads/2024/04/swipefund_logo.png"
              alt="SwipeLoan Logo"
              className="h-6 sm:h-7 w-auto object-contain"
            />
          </div>
          <div>
            <h1 className="font-bold text-sm sm:text-base text-slate-900 leading-tight">
              SwipeLoan Credit Marketplace
            </h1>
            <p className="text-[11px] font-semibold text-blue-700 tracking-wide">
              Pravakta.ai Voice Concierge Directory
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/guide"
            className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200 transition-all"
          >
            <span>Embed Guide</span>
          </Link>
          <a
            href="https://swipeloan.in"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-800 bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-200 transition-all"
          >
            <span>swipeloan.in</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </header>

      {/* Main Directory */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 text-center max-w-5xl mx-auto w-full">
        {/* Center Logo Box */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-2xl shadow-md border border-slate-200/80 p-3 flex items-center justify-center mb-6 overflow-hidden">
          <img
            src="https://swipeloan.in/wp-content/uploads/2024/04/swipefund_logo.png"
            alt="SwipeLoan Official Logo"
            className="w-full h-full object-contain"
          />
        </div>

        <div className="inline-block bg-blue-50 text-blue-900 border border-blue-200 text-[10px] sm:text-[11px] font-extrabold tracking-[0.18em] uppercase px-4 py-1 rounded-full mb-4 shadow-xs">
          SWIPELOAN AI VOICE DIRECTORY
        </div>

        <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4 leading-tight">
          Aanya Voice Assistant
        </h2>

        <p className="text-xs sm:text-sm text-slate-600 mb-10 max-w-xl font-medium leading-relaxed">
          Real-time Gemini Live AI Voice Concierge for SwipeLoan credit marketplace inquiries, eligibility checks, and loan consultations.
        </p>

        {/* 2-Column Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl text-left">
          {/* Dedicated Card linking to /talktoaanya */}
          <Link
            href="/talktoaanya"
            className="group bg-white hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300 rounded-3xl p-6 sm:p-8 transition-all duration-300 shadow-xs hover:shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 bg-slate-900 text-white rounded-full">
                  URL: /talktoaanya
                </span>
                <Headset className="w-6 h-6 text-emerald-600" />
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 group-hover:text-emerald-700 transition-colors mb-1">
                Aanya Live Page
              </h3>
              <p className="text-xs font-bold text-emerald-600 mb-3">
                Loan Assistance Executive · Web Voice Concierge
              </p>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6 font-medium">
                Full standalone WebRTC voice assistant page for loan options, instant eligibility matching, and callback booking.
              </p>
            </div>

            <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-emerald-700 group-hover:translate-x-1 transition-transform">
              <span>Open Voice Agent</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          {/* Integration & Embed Guide Card */}
          <Link
            href="/guide"
            className="group bg-white hover:bg-blue-50/60 border border-slate-200 hover:border-blue-300 rounded-3xl p-6 sm:p-8 transition-all duration-300 shadow-xs hover:shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 bg-blue-900 text-white rounded-full">
                  URL: /guide
                </span>
                <PhoneCall className="w-6 h-6 text-blue-600" />
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 group-hover:text-blue-700 transition-colors mb-1">
                Embed & Setup Guide
              </h3>
              <p className="text-xs font-bold text-blue-600 mb-3">
                URLs, 1-Line Script Tag & Platform Steps
              </p>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6 font-medium">
                Complete guide on how to add the floating voice launcher button and animated message pop-up to WordPress, Shopify, Webflow, or custom sites.
              </p>
            </div>

            <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-blue-700 group-hover:translate-x-1 transition-transform">
              <span>View All URLs & Steps</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 bg-white py-4 text-center text-[11px] text-slate-500 font-medium">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 KGIL Fintech Solutions Private Limited (SwipeLoan)</span>
          <div className="flex items-center gap-3 text-slate-600">
            <Link href="/guide" className="hover:text-emerald-700 font-semibold">Embed Guide</Link>
            <span>•</span>
            <Link href="/talktoaanya" className="hover:text-emerald-700 font-semibold">Talk to Aanya</Link>
            <span>•</span>
            <Link href="/aanya/embed" className="hover:text-emerald-700 font-semibold">Widget Demo</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
