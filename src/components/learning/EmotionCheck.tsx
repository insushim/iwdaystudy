'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { EMOTION_CATEGORIES } from '@/lib/constants';
import type { EmotionData } from '@/types/learning';

interface Props {
  onAnswer: (answer: EmotionData) => void;
  showResult: boolean;
}

const EMOTION_EMOJIS: Record<string, string[]> = {
  '\uC5D0\uB108\uC9C0': ['\uD83D\uDE34', '\uD83D\uDE10', '\uD83D\uDE0A', '\uD83D\uDE04', '\uD83D\uDD25'],
  '\uAE30\uBD84': ['\uD83D\uDE22', '\uD83D\uDE15', '\uD83D\uDE42', '\uD83D\uDE01', '\uD83E\uDD73'],
  '\uAC74\uAC15': ['\uD83E\uDD12', '\uD83D\uDE37', '\uD83D\uDE10', '\uD83D\uDE0A', '\uD83D\uDCAA'],
  '\uC758\uC695': ['\uD83D\uDE29', '\uD83D\uDE11', '\uD83D\uDE42', '\uD83D\uDCAA', '\uD83D\uDE80'],
  '\uAC10\uC815': ['\uD83D\uDE30', '\uD83D\uDE1F', '\uD83D\uDE0C', '\uD83D\uDE0A', '\uD83D\uDC96'],
};

const EMOTION_COLORS = ['#E74C3C', '#FF6B35', '#F9CA24', '#2ECC71', '#4169E1'];

const KEYS: (keyof EmotionData)[] = ['energy', 'mood', 'health', 'motivation', 'feeling'];

export default function EmotionCheck({ onAnswer, showResult }: Props) {
  const [values, setValues] = useState<EmotionData>({
    energy: 50,
    mood: 50,
    health: 50,
    motivation: 50,
    feeling: 50,
  });

  const handleEmojiSelect = (key: keyof EmotionData, emojiIndex: number) => {
    if (showResult) return;
    const value = emojiIndex * 25;
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleChange = (key: keyof EmotionData, value: number) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    onAnswer(values);
  };

  const getEmojiIndex = (value: number) => Math.min(Math.floor(value / 25), 4);
  const getColor = (value: number) => EMOTION_COLORS[getEmojiIndex(value)];

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <p className="text-lg font-bold text-foreground">
          오늘 기분은 어때요?
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          이모지를 눌러 오늘의 기분을 알려주세요
        </p>
      </motion.div>

      <div className="w-full space-y-4">
        {EMOTION_CATEGORIES.map((cat, i) => {
          const key = KEYS[i];
          const value = values[key];
          const emojis = EMOTION_EMOJIS[cat] || ['\uD83D\uDE10', '\uD83D\uDE10', '\uD83D\uDE10', '\uD83D\uDE10', '\uD83D\uDE10'];
          const emojiIndex = getEmojiIndex(value);
          const color = getColor(value);

          return (
            <motion.div
              key={cat}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl border bg-card p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-foreground">{cat}</span>
                <motion.span
                  key={emojiIndex}
                  initial={{ scale: 0.5, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="text-2xl"
                >
                  {emojis[emojiIndex]}
                </motion.span>
              </div>

              {/* Emoji picker buttons */}
              <div className="flex items-center justify-between gap-2 mb-2">
                {emojis.map((emoji, ei) => (
                  <motion.button
                    key={ei}
                    type="button"
                    onClick={() => handleEmojiSelect(key, ei)}
                    disabled={showResult}
                    whileHover={!showResult ? { scale: 1.2 } : undefined}
                    whileTap={!showResult ? { scale: 0.9 } : undefined}
                    className={`flex-1 flex items-center justify-center h-11 rounded-xl text-xl transition-all min-h-[44px] ${
                      ei === emojiIndex
                        ? 'ring-2 shadow-sm scale-110'
                        : 'hover:bg-muted/50 opacity-60'
                    } ${showResult ? 'cursor-default' : 'cursor-pointer'}`}
                    style={ei === emojiIndex ? {
                      ringColor: color,
                      backgroundColor: `${color}15`,
                      borderColor: color,
                    } : {}}
                  >
                    {emoji}
                  </motion.button>
                ))}
              </div>

              {/* Custom slider bar */}
              <div className="relative h-8 flex items-center">
                {/* Track background */}
                <div className="absolute inset-x-0 h-3 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: color }}
                    animate={{ width: `${value}%` }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  />
                </div>

                {/* Range input */}
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={value}
                  onChange={(e) => handleChange(key, Number(e.target.value))}
                  disabled={showResult}
                  className="relative z-10 w-full h-8 appearance-none bg-transparent cursor-pointer disabled:cursor-default
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-3 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer
                    [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-3 [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer"
                  style={{
                    // @ts-ignore
                    '--webkit-slider-thumb-border-color': color,
                  }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {!showResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            onClick={handleSubmit}
            className="h-12 px-8 rounded-xl text-lg font-bold bg-[#FF8BA7] hover:bg-[#FF8BA7]/90 shadow-md shadow-[#FF8BA7]/25 min-h-[44px]"
          >
            기분 체크 완료!
          </Button>
        </motion.div>
      )}

      {showResult && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2 rounded-full bg-[#FF8BA7]/10 border border-[#FF8BA7]/20 px-5 py-2 text-sm font-bold text-[#FF8BA7]"
        >
          오늘의 기분을 기록했어요!
        </motion.div>
      )}
    </div>
  );
}
