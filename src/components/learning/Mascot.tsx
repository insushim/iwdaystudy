'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

type MascotState = 'default' | 'happy' | 'thinking' | 'correct' | 'encourage';

interface Props {
  state?: MascotState;
  message?: string;
  size?: number;
  className?: string;
}

const stateConfig: Record<MascotState, { mouthPath: string; eyeScale: number; blushOpacity: number; bodyBounce: number[] }> = {
  default: {
    mouthPath: 'M46 56 Q50 60 54 56',
    eyeScale: 1,
    blushOpacity: 0.3,
    bodyBounce: [0, -4, 0],
  },
  happy: {
    mouthPath: 'M44 55 Q50 64 56 55',
    eyeScale: 0.8,
    blushOpacity: 0.6,
    bodyBounce: [0, -10, 0],
  },
  thinking: {
    mouthPath: 'M46 58 Q50 56 54 58',
    eyeScale: 1.1,
    blushOpacity: 0.2,
    bodyBounce: [0, -2, 0],
  },
  correct: {
    mouthPath: 'M43 54 Q50 66 57 54',
    eyeScale: 0.6,
    blushOpacity: 0.7,
    bodyBounce: [0, -16, 0],
  },
  encourage: {
    mouthPath: 'M45 56 Q50 62 55 56',
    eyeScale: 1,
    blushOpacity: 0.5,
    bodyBounce: [0, -6, 0],
  },
};

export default function Mascot({ state = 'default', message, size = 80, className }: Props) {
  const config = stateConfig[state];
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    if (message) {
      setShowMessage(true);
      const timer = setTimeout(() => setShowMessage(false), 5000);
      return () => clearTimeout(timer);
    }
    setShowMessage(false);
  }, [message]);

  return (
    <div className={className} style={{ position: 'relative', width: size + 40, minHeight: size + 20 }}>
      {/* Speech bubble */}
      <AnimatePresence>
        {showMessage && message && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap rounded-2xl bg-white px-4 py-2 text-sm font-medium text-foreground shadow-lg border border-border z-10"
            style={{ maxWidth: 220 }}
          >
            <span style={{ whiteSpace: 'pre-wrap', wordBreak: 'keep-all' }}>{message}</span>
            <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-white" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Character */}
      <motion.div
        animate={{ y: config.bodyBounce }}
        transition={{ duration: state === 'correct' ? 0.5 : 2.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{ display: 'flex', justifyContent: 'center' }}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Soil shadow */}
          <ellipse cx="50" cy="86" rx="18" ry="5" fill="#2ECC71" opacity="0.15" />

          {/* Stem */}
          <motion.path
            d="M50 82 L50 42"
            stroke="#2ECC71"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Left leaf */}
          <motion.path
            d="M50 58 C38 55 30 44 36 32 C42 24 50 34 50 46"
            fill="#2ECC71"
            animate={{ rotate: state === 'happy' ? [-2, 2, -2] : [0, 0, 0] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            style={{ transformOrigin: '50px 58px' }}
          />

          {/* Right leaf */}
          <motion.path
            d="M50 50 C62 48 70 36 64 24 C58 16 50 26 50 38"
            fill="#27AE60"
            animate={{ rotate: state === 'happy' ? [2, -2, 2] : [0, 0, 0] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            style={{ transformOrigin: '50px 50px' }}
          />

          {/* Eyes */}
          <motion.circle
            cx="43"
            cy="52"
            r="2.5"
            fill="#1A1A2E"
            animate={{ scaleY: config.eyeScale }}
            style={{ transformOrigin: '43px 52px' }}
          />
          <motion.circle
            cx="57"
            cy="52"
            r="2.5"
            fill="#1A1A2E"
            animate={{ scaleY: config.eyeScale }}
            style={{ transformOrigin: '57px 52px' }}
          />

          {/* Mouth */}
          <motion.path
            d={config.mouthPath}
            stroke="#1A1A2E"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />

          {/* Blush */}
          <circle cx="37" cy="56" r="3.5" fill="#FF8BA7" opacity={config.blushOpacity} />
          <circle cx="63" cy="56" r="3.5" fill="#FF8BA7" opacity={config.blushOpacity} />

          {/* Pencil hat */}
          <path d="M50 42 L44 26 L50 14 L56 26 Z" fill="#F9CA24" />
          <path d="M50 14 L47 20 L53 20 Z" fill="#1A1A2E" />

          {/* Sparkles for correct/happy */}
          {(state === 'correct' || state === 'happy') && (
            <>
              <motion.circle
                cx="70"
                cy="20"
                r="2"
                fill="#F9CA24"
                animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0 }}
              />
              <motion.circle
                cx="28"
                cy="30"
                r="1.5"
                fill="#FF8BA7"
                animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
              />
              <motion.circle
                cx="72"
                cy="42"
                r="1.5"
                fill="#4ECDC4"
                animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.6 }}
              />
            </>
          )}

          {/* Question mark for thinking */}
          {state === 'thinking' && (
            <motion.text
              x="66"
              y="28"
              fontSize="16"
              fontWeight="bold"
              fill="#A18CD1"
              animate={{ opacity: [0.5, 1, 0.5], y: [28, 24, 28] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              ?
            </motion.text>
          )}
        </svg>
      </motion.div>
    </div>
  );
}
