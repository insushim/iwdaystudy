'use client';

import { useCallback, useRef } from 'react';
import { useUIStore } from '@/stores/uiStore';

type SoundName = 'correct' | 'wrong' | 'complete' | 'start';

/** Generate short synth sounds via Web Audio API – no mp3 files needed */
function playSynth(sound: SoundName) {
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  gain.gain.value = 0.18;

  switch (sound) {
    case 'correct': {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523, ctx.currentTime);      // C5
      osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1); // E5
      osc.frequency.setValueAtTime(784, ctx.currentTime + 0.2); // G5
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start(); osc.stop(ctx.currentTime + 0.4);
      break;
    }
    case 'wrong': {
      osc.type = 'square';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.setValueAtTime(150, ctx.currentTime + 0.15);
      gain.gain.value = 0.1;
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start(); osc.stop(ctx.currentTime + 0.3);
      break;
    }
    case 'complete': {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523, ctx.currentTime);       // C5
      osc.frequency.setValueAtTime(659, ctx.currentTime + 0.12); // E5
      osc.frequency.setValueAtTime(784, ctx.currentTime + 0.24); // G5
      osc.frequency.setValueAtTime(1047, ctx.currentTime + 0.36);// C6
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.start(); osc.stop(ctx.currentTime + 0.6);
      break;
    }
    case 'start': {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(392, ctx.currentTime);       // G4
      osc.frequency.setValueAtTime(523, ctx.currentTime + 0.15); // C5
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.start(); osc.stop(ctx.currentTime + 0.35);
      break;
    }
  }
}

export function useSound() {
  const { isSoundEnabled } = useUIStore();
  const lastPlayed = useRef(0);

  const play = useCallback(
    (sound: SoundName) => {
      if (!isSoundEnabled || typeof window === 'undefined') return;
      // Debounce – prevent double-fire within 100ms
      const now = Date.now();
      if (now - lastPlayed.current < 100) return;
      lastPlayed.current = now;
      try {
        playSynth(sound);
      } catch {
        // Silently fail if Web Audio is unavailable
      }
    },
    [isSoundEnabled]
  );

  return { play };
}
