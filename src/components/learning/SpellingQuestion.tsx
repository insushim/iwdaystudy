'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';
interface Props {
  content: any;
  answer: any;
  onAnswer: (answer: number) => void;
  showResult: boolean;
  isCorrect: boolean | null;
}

export default function SpellingQuestion({ content, answer, onAnswer, showResult, isCorrect }: Props) {
  const [selected, setSelected] = useState<number | null>(null);

  // Support both: curriculum format (q1/q2, answer is 1|2) and generator format (options[], correct is 0-based)
  const sentence1 = content?.q1 || content?.options?.[0] || '';
  const sentence2 = content?.q2 || content?.options?.[1] || '';
  // Correct answer as 1-based index
  const correctChoice: number = content?.q1
    ? (answer?.answer ?? answer?.correct ?? 1)
    : ((answer?.correct ?? 0) + 1);
  const explanation = answer?.explanation || content?.explanation || '';

  const handleSelect = (choice: 1 | 2) => {
    if (showResult) return;
    setSelected(choice);
    onAnswer(choice);
  };

  const getCardStyle = (choice: 1 | 2) => {
    if (!showResult) {
      return selected === choice
        ? 'border-[#A18CD1] bg-[#A18CD1]/10 ring-2 ring-[#A18CD1]/30'
        : 'border-border hover:border-[#A18CD1]/50 hover:bg-[#A18CD1]/5';
    }

    if (choice === correctChoice) {
      return 'border-green-400 bg-green-50 ring-2 ring-green-200';
    }
    if (choice === selected && choice !== correctChoice) {
      return 'border-red-400 bg-red-50 ring-2 ring-red-200';
    }
    return 'border-border opacity-50';
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-center text-lg font-medium text-muted-foreground">
        올바른 문장을 골라주세요
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
        {[1, 2].map((choice) => {
          const sentence = choice === 1 ? sentence1 : sentence2;
          return (
            <motion.button
              key={choice}
              whileHover={!showResult ? { scale: 1.02 } : undefined}
              whileTap={!showResult ? { scale: 0.98 } : undefined}
              onClick={() => handleSelect(choice as 1 | 2)}
              disabled={showResult}
              className={`relative flex flex-col items-center gap-3 rounded-2xl border-2 p-6 transition-all cursor-pointer disabled:cursor-default ${getCardStyle(choice as 1 | 2)}`}
            >
              {/* Number badge */}
              <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-[#A18CD1]/10 flex items-center justify-center">
                <span className="text-sm font-bold text-[#A18CD1]">{choice}</span>
              </div>

              {/* Sentence */}
              <p className="text-xl sm:text-2xl font-medium leading-relaxed pt-4 text-center break-keep">
                {sentence}
              </p>

              {/* Result icon */}
              {showResult && choice === correctChoice && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </motion.div>
              )}
              {showResult && choice === selected && choice !== correctChoice && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <XCircle className="h-8 w-8 text-red-500" />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Explanation */}
      <AnimatePresence>
        {showResult && explanation && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-2xl rounded-xl bg-[#A18CD1]/10 border border-[#A18CD1]/20 p-4"
          >
            <p className="text-sm font-medium text-[#A18CD1]">설명</p>
            <p className="mt-1 text-sm leading-relaxed">{explanation}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
