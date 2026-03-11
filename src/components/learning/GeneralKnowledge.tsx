'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Lightbulb } from 'lucide-react';
interface Props {
  content: any;
  answer: any;
  onAnswer: (answer: string) => void;
  showResult: boolean;
  isCorrect: boolean | null;
}

export default function GeneralKnowledge({ content, answer, onAnswer, showResult, isCorrect }: Props) {
  const correctAnswer = answer?.answer || answer?.correct || answer?.text || '';
  const [selected, setSelected] = useState<string | null>(null);
  const choices: string[] = content?.choices || [];

  const handleSelect = (choice: string) => {
    if (showResult) return;
    setSelected(choice);
    onAnswer(choice);
  };

  // Split text around ___ to highlight the blank
  const renderText = () => {
    const parts = content.text.split('___');
    if (parts.length < 2) return <span>{content.text}</span>;

    return (
      <span>
        {parts[0]}
        {showResult ? (
          <span className={`inline-block min-w-[3ch] px-2 py-0.5 rounded font-bold ${
            isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {correctAnswer}
          </span>
        ) : (
          <span className="inline-block min-w-[4ch] border-b-2 border-[#F9CA24] px-2 mx-1">
            &nbsp;&nbsp;&nbsp;&nbsp;
          </span>
        )}
        {parts[1]}
      </span>
    );
  };

  const OPTION_LABELS = ['①', '②', '③', '④'];

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Category badge */}
      <Badge
        variant="outline"
        className="rounded-full border-[#F9CA24]/40 bg-[#F9CA24]/10 text-[#B8860B] px-3 py-1 text-sm font-semibold"
      >
        <Lightbulb className="h-3.5 w-3.5 mr-1" />
        {content.category}
      </Badge>

      {/* Question text */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg rounded-2xl bg-[#F9CA24]/5 border border-[#F9CA24]/20 p-6 text-center"
      >
        <p className="text-xl sm:text-2xl font-bold leading-relaxed">
          {renderText()}
        </p>
      </motion.div>

      {/* 4-choice options */}
      {!showResult && choices.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg"
        >
          {choices.map((choice, i) => (
            <Button
              key={i}
              variant="outline"
              onClick={() => handleSelect(choice)}
              className={`h-auto min-h-[52px] py-3 px-4 text-base font-bold rounded-xl border-2 whitespace-normal text-left transition-all ${
                selected === choice
                  ? 'border-[#F9CA24] bg-[#F9CA24]/10 text-[#B8860B]'
                  : 'border-border hover:border-[#F9CA24]/40'
              }`}
            >
              <span className="text-muted-foreground mr-2 flex-shrink-0">{OPTION_LABELS[i]}</span>
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
          transition={{ delay: 0.2 }}
          className="flex items-center gap-3 w-full max-w-sm"
        >
          <input
            type="text"
            value={selected || ''}
            onChange={(e) => setSelected(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && selected?.trim()) onAnswer(selected.trim()); }}
            placeholder="답을 입력하세요"
            className="flex-1 h-14 text-center text-xl font-bold rounded-xl border-2 border-[#F9CA24]/30 focus:border-[#F9CA24] focus:ring-2 focus:ring-[#F9CA24]/20 outline-none px-4"
            autoFocus
          />
          <Button
            onClick={() => selected?.trim() && onAnswer(selected.trim())}
            disabled={!selected?.trim()}
            className="h-14 px-6 rounded-xl text-lg font-bold bg-[#F9CA24] hover:bg-[#F9CA24]/90 text-[#1A1A2E]"
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
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-3 w-full"
          >
            <div className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-bold ${
              isCorrect
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {isCorrect ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>정답이에요!</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-500" />
                  <span>정답: {correctAnswer}</span>
                </>
              )}
            </div>

            {/* Show choices with correct highlighted */}
            {choices.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg mt-2">
                {choices.map((choice, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-2 h-auto min-h-[48px] py-2 px-4 text-sm font-bold rounded-xl border-2 ${
                      choice === correctAnswer
                        ? 'border-green-400 bg-green-50 text-green-700'
                        : selected === choice
                          ? 'border-red-300 bg-red-50 text-red-500'
                          : 'border-border text-muted-foreground'
                    }`}
                  >
                    <span className="text-muted-foreground flex-shrink-0">{OPTION_LABELS[i]}</span>
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
