'use client';

import { useCallback, useRef } from 'react';
import { useUIStore } from '@/stores/uiStore';

type SoundName = 'correct' | 'wrong' | 'complete' | 'start';

export function useSound() {
  const { isSoundEnabled } = useUIStore();
  const audioCache = useRef<Record<string, HTMLAudioElement>>({});

  const play = useCallback(
    (sound: SoundName) => {
      if (!isSoundEnabled || typeof window === 'undefined') return;
      try {
        if (!audioCache.current[sound]) {
          audioCache.current[sound] = new Audio(`/sounds/${sound}.mp3`);
        }
        audioCache.current[sound].currentTime = 0;
        audioCache.current[sound].play().catch(() => {});
      } catch {
        // Silently fail if audio is unavailable
      }
    },
    [isSoundEnabled]
  );

  return { play };
}
