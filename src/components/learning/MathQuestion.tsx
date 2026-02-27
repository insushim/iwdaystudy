'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Lightbulb } from 'lucide-react';

interface Props {
  content: any;
  answer: any;
  onAnswer: (answer: string) => void;
  showResult: boolean;
  isCorrect: boolean | null;
}

export default function MathQuestion({ content, answer, onAnswer, showResult, isCorrect }: Props) {
  const [inputValue, setInputValue] = useState('');
  const [showSteps, setShowSteps] = useState(false);

  const expression = content?.expression || '';
  // Handle both generator format (answer.correct) and curriculum format (answer.answer)
  const correctAnswer = answer?.correct ?? answer?.answer ?? '';
  const steps: string[] = answer?.steps || [];
  const parts = expression.split(/([+\-x÷×])/);

  const isVerticalLayout = expression.includes('+') || expression.includes('-');
  const operator = expression.match(/[+\-]/)?.[0] || '';
  const operands = expression.split(/\s*[+\-]\s*/).map((s: string) => s.trim());

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
      {/* Unit badge */}
      <span className="inline-flex items-center gap-1 rounded-full bg-[#FF6B35]/10 px-3 py-1 text-xs font-semibold text-[#FF6B35]">
        {content.unit}
      </span>

      {/* Expression display - horizontal */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex items-center justify-center gap-2"
      >
        <div className="text-4xl sm:text-5xl font-black tracking-wide text-foreground select-none text-center leading-relaxed">
          {expression} = <span className="text-muted-foreground/50">?</span>
        </div>
      </motion.div>

      {/* Vertical layout for addition/subtraction */}
      {isVerticalLayout && operands.length === 2 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border-2 border-dashed border-[#FF6B35]/30 bg-[#FF6B35]/5 p-6 font-mono"
        >
          <div className="flex flex-col items-end gap-1 text-3xl font-bold">
            <div className="pr-2">{operands[0]}</div>
            <div className="flex items-center gap-2 border-b-2 border-foreground pb-1">
              <span className="text-[#FF6B35]">{operator}</span>
              <span>{operands[1]}</span>
            </div>
            <div className="pr-2 pt-1 text-muted-foreground/40">
              {showResult ? correctAnswer : '?'}
            </div>
          </div>
        </motion.div>
      )}

      {/* Input area */}
      {!showResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-3 w-full max-w-xs"
        >
          <Input
            type="number"
            inputMode="numeric"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="답을 입력하세요"
            className="h-14 text-center text-2xl font-bold rounded-xl border-2 border-[#FF6B35]/30 focus-visible:border-[#FF6B35] focus-visible:ring-[#FF6B35]/20"
            autoFocus
          />
          <Button
            onClick={handleSubmit}
            disabled={!inputValue.trim()}
            className="h-14 px-6 rounded-xl text-lg font-bold bg-[#FF6B35] hover:bg-[#FF6B35]/90"
          >
            확인
          </Button>
        </motion.div>
      )}

      {/* Result display */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex flex-col items-center gap-4 w-full"
          >
            <div className={`flex items-center gap-3 rounded-2xl px-6 py-4 text-lg font-bold ${
              isCorrect
                ? 'bg-green-50 text-green-700 border-2 border-green-200'
                : 'bg-red-50 text-red-700 border-2 border-red-200'
            }`}>
              {isCorrect ? (
                <CheckCircle className="h-6 w-6 text-green-500" />
              ) : (
                <XCircle className="h-6 w-6 text-red-500" />
              )}
              <span>
                {isCorrect ? '정답이에요!' : `정답: ${correctAnswer}`}
              </span>
            </div>

            {/* Step-by-step solution */}
            {steps.length > 0 && (
              <div className="w-full max-w-sm">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSteps(!showSteps)}
                  className="gap-1 text-muted-foreground"
                >
                  <Lightbulb className="h-4 w-4" />
                  {showSteps ? '풀이 접기' : '풀이 보기'}
                </Button>
                <AnimatePresence>
                  {showSteps && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2 rounded-xl bg-muted/50 p-4 space-y-2">
                        {steps.map((step: string, i: number) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.15 }}
                            className="flex items-start gap-2 text-sm"
                          >
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#FF6B35]/10 text-[#FF6B35] flex items-center justify-center text-xs font-bold">
                              {i + 1}
                            </span>
                            <span className="pt-0.5">{step}</span>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
