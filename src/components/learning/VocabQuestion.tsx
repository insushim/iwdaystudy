'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
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
  const [inputValue, setInputValue] = useState('');

  // Support both formats
  const meanings: string[] = content?.meanings || content?.clues || [];
  const correctAnswer = answer?.answer || answer?.correct || answer?.text || '';

  const handleSubmit = () => {
    if (inputValue.trim()) {
      onAnswer(inputValue.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-center text-lg font-medium text-muted-foreground">
        힌트를 보고 낱말을 맞혀 보세요!
      </p>

      {/* Meaning cards */}
      <div className="flex flex-col gap-3 w-full max-w-md">
        {meanings.map((meaning: string, i: number) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.2 }}
            className="flex items-center gap-3 rounded-xl border-2 border-[#FF8BA7]/20 bg-[#FF8BA7]/5 px-5 py-4"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#FF8BA7]/20 flex items-center justify-center">
              <HelpCircle className="h-4 w-4 text-[#FF8BA7]" />
            </div>
            <p className="text-lg font-medium">{meaning}</p>
          </motion.div>
        ))}
      </div>

      {/* Input area */}
      {!showResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: meanings.length * 0.2 }}
          className="flex items-center gap-3 w-full max-w-sm"
        >
          <Input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="낱말을 입력하세요"
            className="h-14 text-center text-xl font-bold rounded-xl border-2 border-[#FF8BA7]/30 focus-visible:border-[#FF8BA7] focus-visible:ring-[#FF8BA7]/20"
            autoFocus
          />
          <Button
            onClick={handleSubmit}
            disabled={!inputValue.trim()}
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
            {/* Answer reveal animation */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="text-5xl font-black text-foreground"
            >
              {correctAnswer}
            </motion.div>

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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
