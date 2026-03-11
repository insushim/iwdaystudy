'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, HelpCircle } from 'lucide-react';
interface Props {
  content: any;
  answer: any;
  onAnswer: (answer: string) => void;
  showResult: boolean;
  isCorrect: boolean | null;
}

export default function VocabQuestion({ content, answer, onAnswer, showResult, isCorrect }: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  // Support both formats
  const meanings: string[] = content?.meanings || content?.clues || [];
  const correctAnswer = answer?.answer || answer?.correct || answer?.text || '';
  const choices: string[] = content?.choices || [];

  const handleSelect = (choice: string) => {
    if (showResult) return;
    setSelected(choice);
    onAnswer(choice);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-center text-lg font-medium text-muted-foreground">
        힌트를 보고 알맞은 낱말을 고르세요!
      </p>

      {/* Meaning cards */}
      <div className="flex flex-col gap-3 w-full max-w-md">
        {meanings.map((meaning: string, i: number) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15 }}
            className="flex items-center gap-3 rounded-xl border-2 border-[#FF8BA7]/20 bg-[#FF8BA7]/5 px-5 py-4"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#FF8BA7]/20 flex items-center justify-center">
              <HelpCircle className="h-4 w-4 text-[#FF8BA7]" />
            </div>
            <p className="text-lg font-medium">{meaning}</p>
          </motion.div>
        ))}
      </div>

      {/* Multiple choice options */}
      {!showResult && choices.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: meanings.length * 0.15 + 0.1 }}
          className="grid grid-cols-2 gap-3 w-full max-w-md"
        >
          {choices.map((choice, i) => (
            <Button
              key={i}
              variant="outline"
              onClick={() => handleSelect(choice)}
              className={`h-14 text-lg font-bold rounded-xl border-2 transition-all ${
                selected === choice
                  ? 'border-[#FF8BA7] bg-[#FF8BA7]/10 text-[#FF8BA7]'
                  : 'border-border hover:border-[#FF8BA7]/40'
              }`}
            >
              {choice}
            </Button>
          ))}
        </motion.div>
      )}

      {/* Fallback: text input if no choices */}
      {!showResult && choices.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: meanings.length * 0.15 }}
          className="flex items-center gap-3 w-full max-w-sm"
        >
          <input
            type="text"
            value={selected || ''}
            onChange={(e) => setSelected(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && selected?.trim()) onAnswer(selected.trim()); }}
            placeholder="낱말을 입력하세요"
            className="flex-1 h-14 text-center text-xl font-bold rounded-xl border-2 border-[#FF8BA7]/30 focus:border-[#FF8BA7] focus:ring-2 focus:ring-[#FF8BA7]/20 outline-none px-4"
            autoFocus
          />
          <Button
            onClick={() => selected?.trim() && onAnswer(selected.trim())}
            disabled={!selected?.trim()}
            className="h-14 px-6 rounded-xl text-lg font-bold bg-[#FF8BA7] hover:bg-[#FF8BA7]/90"
          >
            확인
          </Button>
        </motion.div>
      )}

      {/* Result */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4"
          >
            {/* Answer reveal */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="text-5xl font-black text-foreground"
            >
              {correctAnswer}
            </motion.div>

            {/* Show meanings below answer */}
            <div className="text-center text-sm text-muted-foreground">
              <span className="font-medium">뜻:</span> {meanings.join(', ')}
            </div>

            <div className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-bold ${
              isCorrect
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {isCorrect ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>맞았어요!</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-500" />
                  <span>정답은 &ldquo;{correctAnswer}&rdquo; 이에요</span>
                </>
              )}
            </div>

            {/* Show all choices with correct highlighted */}
            {choices.length > 0 && (
              <div className="grid grid-cols-2 gap-2 w-full max-w-md mt-2">
                {choices.map((choice, i) => (
                  <div
                    key={i}
                    className={`h-12 flex items-center justify-center text-base font-bold rounded-xl border-2 ${
                      choice === correctAnswer
                        ? 'border-green-400 bg-green-50 text-green-700'
                        : selected === choice
                          ? 'border-red-300 bg-red-50 text-red-500 line-through'
                          : 'border-border text-muted-foreground'
                    }`}
                  >
                    {choice}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
