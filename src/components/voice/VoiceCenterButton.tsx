'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, AlertCircle } from 'lucide-react';
import type { VoiceState } from './RadialVisualizer';

interface Props {
  state: VoiceState;
  isMuted?: boolean;
  agentAccent?: string;
  onClick: () => void;
}

type IconKey = 'mic' | 'muted' | 'wave' | 'speaker' | 'alert';

const LABEL_FOR: Record<VoiceState, string> = {
  idle: 'Tap to resume',
  connecting: 'Connecting...',
  listening: 'Tap to interrupt / mute',
  processing: 'Processing request...',
  speaking: 'Tap to interrupt AI',
  error: 'Tap to retry call',
};

export function VoiceCenterButton({ state, isMuted, agentAccent = '#1D4ED8', onClick }: Props) {
  let key: IconKey = 'mic';
  if (isMuted) key = 'muted';
  else if (state === 'speaking') key = 'speaker';
  else if (state === 'processing') key = 'wave';
  else if (state === 'error') key = 'alert';
  else key = 'mic';

  const dim = state === 'connecting' || state === 'idle';

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={state === 'connecting'}
      aria-label={LABEL_FOR[state]}
      title={LABEL_FOR[state]}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.94 }}
      transition={{ type: 'spring', stiffness: 380, damping: 25 }}
      className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center surface shadow-xl cursor-pointer relative z-20 group transition-all"
      style={{
        opacity: dim ? 0.75 : 1,
        borderColor: state === 'speaking' || state === 'listening' ? agentAccent : 'var(--sl-surface-border)',
      }}
    >
      {/* Subtle ring pulse */}
      {(state === 'listening' || state === 'speaking') && (
        <span
          className="absolute inset-0 rounded-full animate-ping opacity-25 pointer-events-none"
          style={{ backgroundColor: agentAccent }}
        />
      )}

      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={key}
          className="grid place-items-center"
          initial={{ opacity: 0, scale: 0.6, rotate: -20, filter: 'blur(4px)' }}
          animate={{ opacity: 1, scale: 1, rotate: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 0.6, rotate: 20, filter: 'blur(4px)' }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          {key === 'muted' && <MicOff className="w-6 h-6 text-red-500" strokeWidth={1.8} />}
          {key === 'mic' && (
            <Mic
              className="w-6 h-6 transition-colors"
              style={{ color: state === 'listening' ? agentAccent : '#475569' }}
              strokeWidth={1.8}
            />
          )}
          {key === 'speaker' && (
            <Volume2 className="w-6 h-6" style={{ color: agentAccent }} strokeWidth={1.8} />
          )}
          {key === 'alert' && <AlertCircle className="w-6 h-6 text-amber-500" strokeWidth={1.8} />}
          {key === 'wave' && (
            <span className="flex h-6 items-center gap-[3px]" aria-hidden="true">
              {[0, 0.15, 0.3, 0.15].map((d, i) => (
                <span
                  key={i}
                  className="wave-bar"
                  style={{
                    animationDelay: `${d}s`,
                    height: 18,
                    backgroundColor: agentAccent,
                  }}
                />
              ))}
            </span>
          )}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
