'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, ShieldCheck, CheckCircle2, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI, Modality } from '@google/genai';
import { AgentConfig } from '@/lib/agents/types';
import { resampleAudio, resampleInt16 } from '@/lib/audio/audioUtils';
import { crmStore } from '@/lib/crm/crmStore';
import { RadialVisualizer, VoiceState } from './voice/RadialVisualizer';
import { VoiceCenterButton } from './voice/VoiceCenterButton';
import { VoiceTranscript } from './voice/VoiceTranscript';
import confetti from 'canvas-confetti';

interface VoiceCallPanelProps {
  isOpen: boolean;
  onClose: () => void;
  agent: AgentConfig;
}

const GEMINI_LIVE_MODEL = 'gemini-3.1-flash-live-preview';
const OUTPUT_SAMPLE_RATE = 24000;
const INPUT_SAMPLE_RATE = 16000;

class SimpleFrequencyReader {
  readonly analyser: AnalyserNode;
  readonly data: Uint8Array;
  constructor(ctx: AudioContext) {
    this.analyser = ctx.createAnalyser();
    this.analyser.fftSize = 512;
    this.analyser.smoothingTimeConstant = 0.55;
    this.analyser.minDecibels = -90;
    this.analyser.maxDecibels = -20;
    this.data = new Uint8Array(this.analyser.frequencyBinCount);
  }
  read(): Uint8Array {
    this.analyser.getByteFrequencyData(this.data as any);
    return this.data;
  }
  disconnect() {
    try {
      this.analyser.disconnect();
    } catch (_) {}
  }
}

export default function VoiceCallPanel({ isOpen, onClose, agent }: VoiceCallPanelProps) {
  const [state, setState] = useState<VoiceState>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [actionToast, setActionToast] = useState<string | null>(null);
  const [callDuration, setCallDuration] = useState(0);

  // Live transcript state
  const [userTranscript, setUserTranscript] = useState('');
  const [assistantTranscript, setAssistantTranscript] = useState('');
  const [currentSpeaker, setCurrentSpeaker] = useState<'user' | 'assistant'>('assistant');
  const lastSpeakerRef = useRef<'user' | 'assistant'>('assistant');

  const [audioVolume, setAudioVolume] = useState(0);

  const wakeLockRef = useRef<any>(null);
  const playbackCtxRef = useRef<AudioContext | null>(null);
  const playbackReaderRef = useRef<SimpleFrequencyReader | null>(null);
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const micStreamRef = useRef<MediaStream | null>(null);
  const micCtxRef = useRef<AudioContext | null>(null);
  const micReaderRef = useRef<SimpleFrequencyReader | null>(null);
  const micProcessorRef = useRef<ScriptProcessorNode | null>(null);

  const sessionRef = useRef<any>(null);
  const scheduledEndRef = useRef(0);
  const activeConnectionIdRef = useRef(0);
  const connectingRef = useRef(false);
  const processedToolCallsRef = useRef<Set<string>>(new Set());
  const actualMicRateRef = useRef<number>(INPUT_SAMPLE_RATE);
  const timerIntervalRef = useRef<any>(null);

  const activeLead = crmStore.getState().activeLead;
  const agentColor = agent.accentColor || '#1D4ED8';

  // Format call duration MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  // Screen WakeLock
  const requestWakeLock = useCallback(async () => {
    try {
      if ('wakeLock' in navigator) {
        if (!wakeLockRef.current || wakeLockRef.current.released) {
          wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        }
      }
    } catch (_) {}
  }, []);

  const releaseWakeLock = useCallback(() => {
    try {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (isOpen) {
      requestWakeLock();
      timerIntervalRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      releaseWakeLock();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      setCallDuration(0);
    }
    return () => {
      releaseWakeLock();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isOpen, requestWakeLock, releaseWakeLock]);

  // Playback Context Unlocker
  const ensurePlaybackCtx = async (): Promise<AudioContext> => {
    const primed = (window as any).__primedAudioContext;
    const isPrimedValid = primed && primed.state !== 'closed';

    if (!playbackCtxRef.current || playbackCtxRef.current.state === 'closed') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      playbackCtxRef.current = isPrimedValid ? primed : new AudioCtx({ latencyHint: 'playback' });
      playbackReaderRef.current = new SimpleFrequencyReader(playbackCtxRef.current!);
    }
    if (playbackCtxRef.current!.state === 'suspended') {
      await playbackCtxRef.current!.resume();
    }
    return playbackCtxRef.current!;
  };

  // Audio Playback scheduler
  const scheduleAudioChunk = useCallback(
    async (base64Data: string) => {
      if (isMuted) return;
      try {
        const ctx = await ensurePlaybackCtx();
        const binary = atob(base64Data);
        const bytes = Uint8Array.from({ length: binary.length }, (_, i) => binary.charCodeAt(i));
        const pcm16 = new Int16Array(bytes.buffer);
        const float32 = Float32Array.from(pcm16, (s) => s / 32768.0);

        let sum = 0;
        for (let i = 0; i < float32.length; i++) sum += float32[i] * float32[i];
        const rms = Math.sqrt(sum / float32.length);
        setAudioVolume(Math.min(1.0, rms * 5.0));

        const actualRate = ctx.sampleRate;
        let audioData: Float32Array = new Float32Array(float32);
        let bufferRate = OUTPUT_SAMPLE_RATE;
        if (actualRate !== OUTPUT_SAMPLE_RATE) {
          audioData = resampleAudio(float32, OUTPUT_SAMPLE_RATE, actualRate);
          bufferRate = actualRate;
        }

        const buffer = ctx.createBuffer(1, audioData.length, bufferRate);
        buffer.getChannelData(0).set(audioData);
        const source = ctx.createBufferSource();
        source.buffer = buffer;

        const gainNode = ctx.createGain();
        gainNode.gain.value = 1.5;

        // Connect source -> gain -> frequency analyser -> destination
        source.connect(gainNode);
        if (playbackReaderRef.current) {
          gainNode.connect(playbackReaderRef.current.analyser);
          playbackReaderRef.current.analyser.connect(ctx.destination);
        } else {
          gainNode.connect(ctx.destination);
        }

        const now = ctx.currentTime;
        const startTime = Math.max(now, scheduledEndRef.current);
        source.start(startTime);
        scheduledEndRef.current = startTime + buffer.duration;

        activeSourcesRef.current.add(source);
        source.onended = () => {
          activeSourcesRef.current.delete(source);
          if (activeSourcesRef.current.size === 0) {
            setAudioVolume(0);
            setState('listening');
          }
        };
      } catch (e) {
        console.error('Error playing audio chunk:', e);
      }
    },
    [isMuted]
  );

  // Stop active playback immediately (barge-in / interruption)
  const interruptPlayback = useCallback(() => {
    activeSourcesRef.current.forEach((src) => {
      try {
        src.stop();
      } catch (_) {}
      src.disconnect();
    });
    activeSourcesRef.current.clear();
    scheduledEndRef.current = 0;
    setAudioVolume(0);
  }, []);

  const teardown = useCallback(() => {
    activeConnectionIdRef.current++;
    processedToolCallsRef.current.clear();
    scheduledEndRef.current = 0;
    interruptPlayback();

    if (playbackReaderRef.current) {
      playbackReaderRef.current.disconnect();
      playbackReaderRef.current = null;
    }
    if (playbackCtxRef.current) {
      try {
        playbackCtxRef.current.close().catch(() => {});
      } catch (_) {}
      playbackCtxRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    }
    if (micReaderRef.current) {
      micReaderRef.current.disconnect();
      micReaderRef.current = null;
    }
    if (micProcessorRef.current) {
      try {
        micProcessorRef.current.disconnect();
      } catch (_) {}
      micProcessorRef.current = null;
    }
    if (micCtxRef.current) {
      try {
        micCtxRef.current.close().catch(() => {});
      } catch (_) {}
      micCtxRef.current = null;
    }
    if (sessionRef.current) {
      try {
        sessionRef.current.close();
      } catch (_) {}
      sessionRef.current = null;
    }

    connectingRef.current = false;
    setState('idle');
    setAudioVolume(0);
    releaseWakeLock();
  }, [releaseWakeLock, interruptPlayback]);

  const startMic = async () => {
    try {
      let stream = micStreamRef.current;
      if (!stream) {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
          video: false,
        });
        micStreamRef.current = stream;
      }

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const micCtx = new AudioCtx({ sampleRate: INPUT_SAMPLE_RATE });
      micCtxRef.current = micCtx;
      actualMicRateRef.current = micCtx.sampleRate;
      if (micCtx.state === 'suspended') await micCtx.resume();

      const source = micCtx.createMediaStreamSource(stream);
      micReaderRef.current = new SimpleFrequencyReader(micCtx);
      source.connect(micReaderRef.current.analyser);

      const processor = micCtx.createScriptProcessor(4096, 1, 1);
      micProcessorRef.current = processor;
      source.connect(processor);
      processor.connect(micCtx.destination);

      processor.onaudioprocess = (e) => {
        if (!sessionRef.current || state === 'connecting' || isMuted) return;
        const inputData = e.inputBuffer.getChannelData(0);
        let pcm16: Int16Array;
        let sum = 0;

        if (actualMicRateRef.current !== INPUT_SAMPLE_RATE) {
          pcm16 = resampleInt16(inputData, actualMicRateRef.current, INPUT_SAMPLE_RATE);
          for (let i = 0; i < inputData.length; i++) sum += inputData[i] * inputData[i];
        } else {
          pcm16 = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            pcm16[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7fff;
            sum += inputData[i] * inputData[i];
          }
        }

        const rms = Math.sqrt(sum / inputData.length);
        if (state === 'listening') {
          setAudioVolume(Math.min(1.0, rms * 5.0));
        }

        const u8 = new Uint8Array(pcm16.buffer);
        const CHUNK_SIZE = 8192;
        let binary = '';
        for (let i = 0; i < u8.length; i += CHUNK_SIZE) {
          const slice = u8.subarray(i, Math.min(i + CHUNK_SIZE, u8.length));
          binary += String.fromCharCode.apply(null, Array.from(slice));
        }
        const base64 = btoa(binary);

        try {
          sessionRef.current.sendRealtimeInput({
            audio: { data: base64, mimeType: `audio/pcm;rate=${INPUT_SAMPLE_RATE}` },
          });
        } catch (_) {}
      };
    } catch (err: any) {
      console.error('Mic access error:', err);
      setState('error');
      setConnectionError('Microphone access denied. Please grant microphone permissions in browser.');
      teardown();
    }
  };

  const startConnection = useCallback(async () => {
    const connectionId = ++activeConnectionIdRef.current;
    if (connectingRef.current) return;
    connectingRef.current = true;

    setState('connecting');
    setConnectionError(null);
    lastSpeakerRef.current = 'assistant';
    setUserTranscript('');
    setAssistantTranscript('');
    setCurrentSpeaker('assistant');

    try {
      await ensurePlaybackCtx();
    } catch (_) {}

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        video: false,
      });
      micStreamRef.current = stream;
    } catch (err: any) {
      console.error('Mic access error:', err);
      setState('error');
      setConnectionError('Microphone permission required for voice calls.');
      connectingRef.current = false;
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      setConnectionError('NEXT_PUBLIC_GEMINI_API_KEY is not configured in .env.local');
      setState('error');
      connectingRef.current = false;
      return;
    }

    try {
      await ensurePlaybackCtx();
      if (connectionId !== activeConnectionIdRef.current) return;

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: { apiVersion: 'v1alpha' } as any,
      });

      const sessionPromise = (ai as any).live.connect({
        model: GEMINI_LIVE_MODEL,
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: agent.voiceName || 'Aoede' } },
          },
          systemInstruction: {
            parts: [{ text: agent.systemInstruction }],
          },
          tools: agent.tools,
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            if (connectionId !== activeConnectionIdRef.current) {
              teardown();
              return;
            }
            setState('listening');
            connectingRef.current = false;

            sessionPromise.then((session: any) => {
              if (connectionId !== activeConnectionIdRef.current) return;
              sessionRef.current = session;

              const activeLead = crmStore.getState().activeLead;
              const greetingPrompt = `User joined ai.swipeloan.in web voice widget. Introduce yourself as ${agent.name}, Loan Assistance Executive. Opening greeting: "${agent.greeting}". Speak in natural Hindi/Hinglish/English.`;

              try {
                session.sendRealtimeInput({ text: greetingPrompt });
              } catch (_) {}
              startMic();
            });
          },

          onmessage: async (msg: any) => {
            if (connectionId !== activeConnectionIdRef.current) return;

            // Handle interruption signal from Gemini
            if (msg.serverContent?.interrupted) {
              interruptPlayback();
              setState('listening');
              setUserTranscript('');
              lastSpeakerRef.current = 'user';
              setCurrentSpeaker('user');
              return;
            }

            // Extract input transcription (user speech)
            const inputTxt = msg.serverContent?.inputTranscription?.text;
            if (inputTxt) {
              if (lastSpeakerRef.current === 'assistant') {
                setUserTranscript(inputTxt);
                lastSpeakerRef.current = 'user';
                setCurrentSpeaker('user');
              } else {
                setUserTranscript((prev) => (prev && prev !== 'Listening to you...' ? `${prev} ${inputTxt}` : inputTxt));
              }
            }

            // Extract output transcription (assistant speech)
            const outputTxt = msg.serverContent?.outputTranscription?.text;
            if (outputTxt) {
              if (lastSpeakerRef.current === 'user') {
                setAssistantTranscript(outputTxt);
                lastSpeakerRef.current = 'assistant';
                setCurrentSpeaker('assistant');
              } else {
                setAssistantTranscript((prev) => (prev ? `${prev} ${outputTxt}` : outputTxt));
              }
            }

            // Also check modelTurn parts as fallback
            const parts = msg.serverContent?.modelTurn?.parts || [];
            for (const part of parts) {
              if (part.text) {
                if (lastSpeakerRef.current === 'user') {
                  setAssistantTranscript(part.text);
                  lastSpeakerRef.current = 'assistant';
                  setCurrentSpeaker('assistant');
                } else {
                  setAssistantTranscript((prev) => (prev ? `${prev} ${part.text}` : part.text));
                }
              }
            }

            // Handle tool calls
            const functionCalls =
              msg.toolCall?.functionCalls ||
              msg.serverContent?.modelTurn?.parts
                ?.filter((p: any) => p.functionCall)
                .map((p: any) => p.functionCall) ||
              [];

            for (const call of functionCalls) {
              const callId = call.id || call.name;
              if (processedToolCallsRef.current.has(callId)) continue;
              processedToolCallsRef.current.add(callId);

              // Execute tool against simulated CRM store
              const toolResult = crmStore.executeTool(agent.id, call.name, call.args);

              // Celebrate on significant achievements
              if (call.name === 'schedule_callback' || call.name === 'generate_application_link') {
                confetti({ particleCount: 45, spread: 75, origin: { y: 0.65 } });
                setActionToast(`Action Executed: ${call.name.replace(/_/g, ' ').toUpperCase()}`);
                setTimeout(() => setActionToast(null), 3500);
              } else if (call.name === 'create_escalation') {
                setActionToast(`Escalation Ticket Logged: ${call.args?.reason || 'Human Specialist'}`);
                setTimeout(() => setActionToast(null), 3500);
              }

              // Send tool response back to Gemini Live WebSocket
              sessionRef.current?.sendToolResponse({
                functionResponses: [
                  {
                    id: call.id,
                    name: call.name,
                    response: toolResult,
                  },
                ],
              });
            }

            // Playback incoming audio
            const audio = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audio) {
              setState('speaking');
              setCurrentSpeaker('assistant');
              scheduleAudioChunk(audio);
            }
          },

          onerror: (err: any) => {
            console.error('Gemini Live Error:', err);
            setState('error');
            setConnectionError(err?.message || 'Voice session connection failed.');
            connectingRef.current = false;
          },

          onclose: () => {
            if (connectionId === activeConnectionIdRef.current && state !== 'idle') {
              setState('idle');
            }
          },
        },
      });
    } catch (err: any) {
      console.error('Live session init error:', err);
      setState('error');
      setConnectionError(err?.message || 'Failed to establish Gemini Live connection');
      connectingRef.current = false;
    }
  }, [agent, teardown, scheduleAudioChunk, interruptPlayback, isMuted, state]);

  useEffect(() => {
    if (isOpen) {
      startConnection();
    } else {
      teardown();
    }
    return () => teardown();
  }, [isOpen]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'swipeloan_widget_state', state, agentId: agent.id }, '*');
    }
  }, [state, agent.id]);

  const handleTryClose = () => {
    teardown();
    if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'swipeloan_widget_close', agentId: agent.id }, '*');
    }
    onClose();
  };

  const handleRetry = () => {
    teardown();
    ensurePlaybackCtx().catch(() => {});
    startConnection();
  };

  // Center button click handler: toggle mute / interrupt AI / retry
  const handleCenterButtonClick = () => {
    if (state === 'error') {
      handleRetry();
    } else if (state === 'speaking') {
      interruptPlayback();
      setState('listening');
    } else {
      setIsMuted(!isMuted);
    }
  };

  // Visualizer audio data puller
  const getVisualizerAudioData = useCallback((): Uint8Array | null => {
    if (state === 'speaking' && playbackReaderRef.current) {
      return playbackReaderRef.current.read();
    }
    if (state === 'listening' && micReaderRef.current && !isMuted) {
      return micReaderRef.current.read();
    }
    return null;
  }, [state, isMuted]);

  if (!isOpen) return null;

  const currentTranscriptText = currentSpeaker === 'assistant' ? assistantTranscript : userTranscript;

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-slate-950/65 backdrop-blur-xl p-0 sm:p-4 transition-all duration-300">
      <div className="absolute inset-0" onClick={handleTryClose} />

      <AnimatePresence>
        <motion.div
          initial={{ y: '100%', opacity: 0.8 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 220 }}
          className="relative w-full max-w-full sm:max-w-[620px] md:max-w-[660px] bg-white/95 backdrop-blur-2xl border-t sm:border border-slate-200/80 rounded-t-[32px] sm:rounded-[32px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col z-10 p-6 sm:p-8 pb-7 select-none"
        >
          {/* Mobile Bottom Sheet Handle */}
          <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-3 sm:hidden block" />

          {/* Action Executed Floating Toast */}
          <AnimatePresence>
            {actionToast && (
              <motion.div
                initial={{ opacity: 0, y: -15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -15, scale: 0.95 }}
                className="absolute top-4 left-5 right-14 z-30 bg-emerald-600 text-white px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2.5 shadow-xl"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 text-white" />
                <span className="truncate">{actionToast}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Top Bar: Live Status + Timer + Dismiss */}
          <div className="flex items-center justify-between mb-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={state}
                initial={{ opacity: 0, y: 5, filter: 'blur(3px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -4, filter: 'blur(3px)' }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="flex items-center gap-2"
              >
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    state === 'listening'
                      ? 'bg-blue-600 animate-pulse'
                      : state === 'speaking'
                      ? 'bg-emerald-500 animate-pulse'
                      : state === 'connecting'
                      ? 'bg-amber-500 animate-pulse'
                      : state === 'error'
                      ? 'bg-red-500'
                      : 'bg-slate-400'
                  }`}
                />
                <span
                  className="text-[11px] font-extrabold uppercase tracking-widest"
                  style={{
                    color:
                      state === 'speaking'
                        ? agentColor
                        : state === 'listening'
                        ? '#2563EB'
                        : state === 'error'
                        ? '#EF4444'
                        : '#64748B',
                  }}
                >
                  {state === 'connecting'
                    ? 'Connecting...'
                    : state === 'listening'
                    ? 'Listening...'
                    : state === 'speaking'
                    ? `${agent.name.toUpperCase()} Speaking...`
                    : state === 'error'
                    ? 'Call Failed'
                    : 'Call Active'}
                </span>
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center gap-3">
              {/* Call Duration Clock */}
              <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200/80">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{formatTime(callDuration)}</span>
              </div>

              {/* End Call / Close Button */}
              <button
                onClick={handleTryClose}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-slate-500 transition-all cursor-pointer border border-slate-200 shadow-xs"
                aria-label="End call"
                title="End call"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Agent Banner Card */}
          <div className="flex items-center gap-3.5 mb-4 bg-slate-50/90 p-3.5 rounded-2xl border border-slate-200/70">
            <div
              className="w-11 h-11 rounded-xl bg-white p-1 flex items-center justify-center overflow-hidden shrink-0 shadow-xs border"
              style={{ borderColor: agentColor }}
            >
              <img
                src="https://swipeloan.in/wp-content/uploads/2024/04/swipefund_logo.png"
                alt="SwipeLoan Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-extrabold text-slate-900 text-base leading-tight truncate">
                  {agent.name}
                </h3>
                <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100 flex items-center gap-1 shrink-0">
                  <ShieldCheck className="w-3 h-3 text-blue-700" />
                  RBI Marketplace Compliant
                </span>
              </div>
              <p className="text-xs font-semibold truncate mt-0.5" style={{ color: agentColor }}>
                {agent.role}
              </p>
            </div>
          </div>

          {/* Aria-Inspired Radial Visualizer with Center Morph Button */}
          <div className="relative flex flex-col items-center justify-center my-1 py-1">
            <motion.div
              initial={{ opacity: 0, scale: 0.72 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 150, damping: 20, delay: 0.08 }}
              className="relative flex items-center justify-center"
              style={{ width: 310, height: 310 }}
            >
              {/* Radial canvas audio visualizer */}
              <RadialVisualizer
                state={state}
                audioVolume={audioVolume}
                getAudioData={getVisualizerAudioData}
                size={310}
                innerRadius={72}
                agentAccent={agentColor}
              />

              {/* Central Morphing / Interactive Button */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
                <VoiceCenterButton
                  state={state}
                  isMuted={isMuted}
                  agentAccent={agentColor}
                  onClick={handleCenterButtonClick}
                />
              </div>
            </motion.div>

            {/* Live Spoken Transcript Feed */}
            <div className="w-full max-w-xl mt-2 px-2 min-h-[5.5rem] flex items-center justify-center">
              {currentTranscriptText ? (
                <VoiceTranscript
                  text={currentTranscriptText}
                  speaker={currentSpeaker}
                  agentName={agent.name}
                />
              ) : (
                <p className="text-center text-xs sm:text-sm font-medium text-slate-400 py-3">
                  {state === 'connecting'
                    ? 'Connecting to AI Voice Officer...'
                    : state === 'listening'
                    ? 'Listening... Speak in Hindi, English, or Hinglish'
                    : ''}
                </p>
              )}
            </div>

            {state === 'error' && (
              <div className="text-center mt-2">
                <p className="text-xs text-red-600 font-semibold mb-2">
                  {connectionError || 'Connection error'}
                </p>
                <button
                  onClick={handleRetry}
                  className="px-4 py-1.5 bg-blue-700 text-white text-xs font-bold rounded-full hover:bg-blue-800 transition-colors shadow-sm"
                >
                  Retry Voice Link
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
