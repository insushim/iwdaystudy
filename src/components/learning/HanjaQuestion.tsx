'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, CheckCircle, XCircle } from 'lucide-react';

interface Props {
  content: Record<string, unknown>;
  answer: Record<string, unknown>;
  onAnswer: (answer: string) => void;
  showResult: boolean;
  isCorrect: boolean | null;
}

const OPTION_LABELS = ['1', '2', '3', '4'];

export default function HanjaQuestion({ content, answer, onAnswer, showResult, isCorrect }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const correctReading = String(answer?.reading ?? answer?.correct ?? answer?.text ?? '');
  const choices: string[] = content?.choices || [];

  const handleSelect = (choice: string) => {
    if (showResult) return;
    setSelected(choice);
    onAnswer(choice);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="relative flex h-40 w-40 items-center justify-center rounded-3xl border-2 border-[#8B4513]/20 bg-gradient-to-br from-[#8B4513]/5 to-[#8B4513]/15"
      >
        <span className="select-none font-serif text-[100px] leading-none text-[#8B4513]">
          {content.character}
        </span>
        <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#8B4513] text-xs font-bold text-white shadow-md">
          {content.strokes}
        </div>
      </motion.div>

      <div className="text-center">
        <p className="text-2xl font-bold text-foreground">{content.meaning}</p>
        <p className="mt-1 text-sm text-muted-foreground">이 한자의 음을 골라보세요</p>
      </div>

      {content.sentence && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md rounded-xl border border-[#8B4513]/15 bg-[#8B4513]/5 px-5 py-3"
        >
          <p className="mb-1 flex items-center gap-1 text-sm font-medium text-muted-foreground">
            <BookOpen className="h-3.5 w-3.5" />
            예문
          </p>
          <p className="text-base leading-relaxed">{content.sentence}</p>
        </motion.div>
      )}

      {content.words?.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2">
          {content.words.map((word: string, index: number) => (
            <Badge
              key={`${word}-${index}`}
              variant="outline"
              className="rounded-full border-[#8B4513]/30 bg-[#8B4513]/5 px-3 py-1 text-sm text-[#8B4513]"
            >
              {word}
            </Badge>
          ))}
        </div>
      )}

      {!showResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-3 w-full max-w-md"
        >
          {choices.map((choice, index) => (
            <Button
              key={choice}
              variant="outline"
              onClick={() => handleSelect(choice)}
              className={`h-14 text-lg font-bold rounded-xl border-2 transition-all ${
                selected === choice
                  ? 'border-[#8B4513] bg-[#8B4513]/10 text-[#8B4513]'
                  : 'border-border hover:border-[#8B4513]/40'
              }`}
            >
              <span className="mr-2 text-sm text-muted-foreground">{OPTION_LABELS[index]}</span>
              {choice}
            </Button>
          ))}
        </motion.div>
      )}

      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-3 w-full"
          >
            <div className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-bold ${
              isCorrect
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {isCorrect ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />}
              <span>{isCorrect ? '정답이에요' : `정답: ${correctReading}`}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 w-full max-w-md">
              {choices.map((choice, index) => (
                <div
                  key={choice}
                  className={`flex items-center justify-center rounded-xl border-2 px-4 py-3 text-base font-bold ${
                    choice === correctReading
                      ? 'border-green-400 bg-green-50 text-green-700'
                      : selected === choice
                        ? 'border-red-300 bg-red-50 text-red-500'
                        : 'border-border text-muted-foreground'
                  }`}
                >
                  <span className="mr-2 text-sm text-muted-foreground">{OPTION_LABELS[index]}</span>
                  {choice}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
