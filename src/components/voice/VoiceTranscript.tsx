'use client';

import React, { memo, useMemo } from 'react';

interface Props {
  text: string;
  speaker: 'user' | 'assistant';
  agentName?: string;
}

const MAX_WORDS = 52;

export const VoiceTranscript = memo(function VoiceTranscript({ text, speaker, agentName = 'AI' }: Props) {
  const sentences = useMemo(() => {
    const words = text.trim().split(/\s+/).filter(Boolean);
    const clipped = words.length > MAX_WORDS;
    const finalWords = clipped ? words.slice(-MAX_WORDS) : words;
    const out: string[][] = [];
    let cur: string[] = [];

    finalWords.forEach((w, i) => {
      cur.push(clipped && i === 0 ? `…${w}` : w);
      if (/[.!?…。！？]["')\]]?$/.test(w)) {
        out.push(cur);
        cur = [];
      }
    });
    if (cur.length) out.push(cur);
    return out;
  }, [text]);

  if (!text.trim()) return null;

  return (
    <div className="flex min-h-[5.5rem] max-h-[8.5rem] w-full items-center justify-center overflow-hidden px-4 text-center">
      <div className="pb-1 max-w-xl">
        <span
          className={`inline-block text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full border mb-1.5 ${
            speaker === 'assistant'
              ? 'text-blue-700 bg-blue-50 border-blue-100'
              : 'text-slate-600 bg-slate-100 border-slate-200'
          }`}
        >
          {speaker === 'assistant' ? `${agentName} speaking` : 'You speaking'}
        </span>
        <p
          className={`text-center text-[15px] sm:text-[17px] leading-relaxed font-medium tracking-tight ${
            speaker === 'user' ? 'text-slate-600' : 'text-slate-900'
          }`}
        >
          {sentences.map((words, si) => (
            <span
              key={si}
              style={{ opacity: si === sentences.length - 1 ? 1 : 0.45 }}
              className="transition-opacity duration-300"
            >
              {words.map((w, wi) => (
                <span key={wi}>
                  <span className="word">{w}</span>{' '}
                </span>
              ))}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
});
