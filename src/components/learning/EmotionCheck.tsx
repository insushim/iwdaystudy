'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { EMOTION_CATEGORIES } from '@/lib/constants';
import type { EmotionData } from '@/types/learning';

interface Props {
  onAnswer: (answer: EmotionData) => void;
  showResult: boolean;
}

const EMOTION_EMOJIS: Record<string, string[]> = {
  '에너지': ['😴', '😐', '😊', '😄', '🔥'],
  '기분': ['😢', '😕', '🙂', '😁', '🥳'],
  '건강': ['🤒', '😷', '😐', '😊', '💪'],
  '의욕': ['😩', '😑', '🙂', '💪', '🚀'],
  '감정': ['😰', '😟', '😌', '😊', '💖'],
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

  const handleChange = (key: keyof EmotionData, value: number) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    onAnswer(values);
  };

  const getEmojiIndex = (value: number) => Math.min(Math.floor(value / 25), 4);
  const getColor = (value: number) => EMOTION_COLORS[getEmojiIndex(value)];

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto">
      <motion.p
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center text-lg font-medium text-muted-foreground"
      >
        오늘 기분은 어때요?
      </motion.p>

      <div className="w-full space-y-5">
        {EMOTION_CATEGORIES.map((cat, i) => {
          const key = KEYS[i];
          const value = values[key];
          const emojis = EMOTION_EMOJIS[cat] || ['😐', '😐', '😐', '😐', '😐'];
          const emojiIndex = getEmojiIndex(value);
          const color = getColor(value);

          return (
            <motion.div
              key={cat}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-foreground">{cat}</span>
                <motion.span
                  key={emojiIndex}
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  className="text-2xl"
                >
                  {emojis[emojiIndex]}
                </motion.span>
              </div>

              {/* Custom slider bar */}
              <div className="relative h-10 flex items-center">
                {/* Track background */}
                <div className="absolute inset-x-0 h-4 rounded-full bg-muted overflow-hidden">
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
                  className="relative z-10 w-full h-10 appearance-none bg-transparent cursor-pointer disabled:cursor-default
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-7 [&::-webkit-slider-thumb]:h-7 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-3 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer
                    [&::-moz-range-thumb]:w-7 [&::-moz-range-thumb]:h-7 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-3 [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer"
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
          transition={{ delay: 0.5 }}
        >
          <Button
            onClick={handleSubmit}
            className="h-12 px-8 rounded-xl text-lg font-bold bg-[#FF8BA7] hover:bg-[#FF8BA7]/90"
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
