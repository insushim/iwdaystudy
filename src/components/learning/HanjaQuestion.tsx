'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, BookOpen } from 'lucide-react';
interface Props {
  content: any;
  answer: any;
  onAnswer: (answer: string) => void;
  showResult: boolean;
  isCorrect: boolean | null;
}

export default function HanjaQuestion({ content, answer, onAnswer, showResult, isCorrect }: Props) {
  const correctReading = answer?.reading || answer?.correct || answer?.text || '';
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

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Large character display */}
      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="relative flex items-center justify-center w-40 h-40 rounded-3xl bg-gradient-to-br from-[#8B4513]/5 to-[#8B4513]/15 border-2 border-[#8B4513]/20"
      >
        <span className="text-[100px] leading-none font-serif text-[#8B4513] select-none">
          {content.character}
        </span>
        {/* Stroke count badge */}
        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#8B4513] text-white flex items-center justify-center text-xs font-bold shadow-md">
          {content.strokes}획
        </div>
      </motion.div>

      {/* Reading and meaning */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center"
      >
        <p className="text-2xl font-bold text-foreground">
          {content.meaning} <span className="text-[#8B4513]">{content.reading}</span>
        </p>
      </motion.div>

      {/* Sentence */}
      {content.sentence && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl bg-[#8B4513]/5 border border-[#8B4513]/15 px-5 py-3 max-w-md"
        >
          <p className="text-sm text-muted-foreground mb-1 font-medium flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5" />
            예문
          </p>
          <p className="text-base leading-relaxed">{content.sentence}</p>
        </motion.div>
      )}

      {/* Related words */}
      {content.words && content.words.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap justify-center gap-2"
        >
          <span className="text-sm text-muted-foreground font-medium mr-1">관련 단어:</span>
          {content.words.map((word, i) => (
            <Badge
              key={i}
              variant="outline"
              className="rounded-full border-[#8B4513]/30 text-[#8B4513] bg-[#8B4513]/5 px-3 py-1 text-sm"
            >
              {word}
            </Badge>
          ))}
        </motion.div>
      )}

      {/* Practice input */}
      {!showResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col items-center gap-3 w-full max-w-sm"
        >
          <p className="text-sm font-medium text-muted-foreground">
            이 한자의 음(소리)을 입력하세요
          </p>
          <div className="flex items-center gap-3 w-full">
            <Input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="예: 산"
              className="h-14 text-center text-2xl font-bold rounded-xl border-2 border-[#8B4513]/30 focus-visible:border-[#8B4513] focus-visible:ring-[#8B4513]/20"
              autoFocus
            />
            <Button
              onClick={handleSubmit}
              disabled={!inputValue.trim()}
              className="h-14 px-6 rounded-xl text-lg font-bold bg-[#8B4513] hover:bg-[#8B4513]/90 text-white"
            >
              확인
            </Button>
          </div>
        </motion.div>
      )}

      {/* Result */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-3"
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
                  <span>정답: {correctReading}</span>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
