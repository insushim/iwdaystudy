'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Volume2 } from 'lucide-react';
interface Props {
  content: any;
  answer: any;
  onAnswer: (answer: string) => void;
  showResult: boolean;
  isCorrect: boolean | null;
}

export default function EnglishQuestion({ content, answer, onAnswer, showResult, isCorrect }: Props) {
  const correctWord = answer?.word || answer?.correct || answer?.text || '';
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

  // Highlight the focus word in the sentence
  const highlightSentence = (sentence: string, word: string) => {
    const lowerSentence = sentence.toLowerCase();
    const lowerWord = word.toLowerCase();
    const idx = lowerSentence.indexOf(lowerWord);
    if (idx === -1) return <span>{sentence}</span>;

    const before = sentence.slice(0, idx);
    const match = sentence.slice(idx, idx + word.length);
    const after = sentence.slice(idx + word.length);

    return (
      <span>
        {before}
        <span className="bg-[#4169E1]/20 text-[#4169E1] font-bold px-1 rounded">{match}</span>
        {after}
      </span>
    );
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* English sentence */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg rounded-2xl bg-gradient-to-r from-[#4169E1]/5 to-[#4169E1]/10 border border-[#4169E1]/20 p-6 text-center"
      >
        <p className="text-2xl sm:text-3xl font-bold text-foreground leading-relaxed">
          {highlightSentence(content.sentence, content.word)}
        </p>
      </motion.div>

      {/* Korean translation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center"
      >
        <p className="text-lg text-muted-foreground">{content.translation}</p>
      </motion.div>

      {/* Pronunciation and focus word info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-wrap items-center justify-center gap-3"
      >
        <div className="flex items-center gap-2 rounded-full bg-[#4169E1]/10 px-4 py-2">
          <Volume2 className="h-4 w-4 text-[#4169E1]" />
          <span className="text-sm font-semibold text-[#4169E1]">{content.word}</span>
        </div>
        {content.pronunciation && (
          <div className="rounded-full bg-muted px-4 py-2">
            <span className="text-sm text-muted-foreground">[{content.pronunciation}]</span>
          </div>
        )}
      </motion.div>

      {/* Input area */}
      {!showResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col items-center gap-3 w-full max-w-sm"
        >
          <p className="text-sm font-medium text-muted-foreground">
            밑줄 친 단어를 따라 써보세요
          </p>
          <div className="flex items-center gap-3 w-full">
            <Input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`${content.word}을(를) 입력`}
              className="h-14 text-center text-xl font-bold rounded-xl border-2 border-[#4169E1]/30 focus-visible:border-[#4169E1] focus-visible:ring-[#4169E1]/20"
              autoFocus
            />
            <Button
              onClick={handleSubmit}
              disabled={!inputValue.trim()}
              className="h-14 px-6 rounded-xl text-lg font-bold bg-[#4169E1] hover:bg-[#4169E1]/90"
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
                  <span>Great job!</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-500" />
                  <span>정답: {correctWord}</span>
                </>
              )}
            </div>

            {/* Practice words */}
            {content.practice && content.practice.length > 0 && (
              <div className="mt-2 flex flex-wrap justify-center gap-2">
                <span className="text-xs text-muted-foreground">연습 단어:</span>
                {content.practice.map((p, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-[#4169E1]/10 px-3 py-1 text-xs font-medium text-[#4169E1]"
                  >
                    {p}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
