'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
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
  const [inputValue, setInputValue] = useState('');

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

      {/* Input */}
      {!showResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-3 w-full max-w-sm"
        >
          <Input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="답을 입력하세요"
            className="h-14 text-center text-xl font-bold rounded-xl border-2 border-[#F9CA24]/30 focus-visible:border-[#F9CA24] focus-visible:ring-[#F9CA24]/20"
            autoFocus
          />
          <Button
            onClick={handleSubmit}
            disabled={!inputValue.trim()}
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
            className="flex items-center gap-2 rounded-full px-5 py-2 text-sm font-bold"
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
