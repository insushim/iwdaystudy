'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Pencil, CheckCircle } from 'lucide-react';

interface Props {
  content: any;
  onAnswer: (answer: string) => void;
  showResult: boolean;
  isCorrect: boolean | null;
}

const MIN_CHARS_DEFAULT = 20;

export default function WritingPrompt({ content, onAnswer, showResult, isCorrect }: Props) {
  const [text, setText] = useState('');
  const prompt = content?.prompt || content?.text || '자유롭게 써보세요.';
  const minChars = content?.minChars || content?.min_chars || MIN_CHARS_DEFAULT;
  const charCount = text.length;
  const meetsMinimum = charCount >= minChars;

  const handleSubmit = () => {
    if (text.trim()) {
      onAnswer(text.trim());
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto">
      {/* Prompt card */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full rounded-2xl bg-gradient-to-br from-[#2ECC71]/5 via-[#2ECC71]/10 to-[#4ECDC4]/5 border-2 border-dashed border-[#2ECC71]/30 p-6"
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#2ECC71]/20 flex items-center justify-center">
            <Pencil className="h-5 w-5 text-[#2ECC71]" />
          </div>
          <div>
            <p className="text-xs font-medium text-[#2ECC71] mb-1">오늘의 글밥</p>
            <p className="text-xl font-bold leading-relaxed break-keep">{prompt}</p>
          </div>
        </div>
      </motion.div>

      {/* Textarea */}
      {!showResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full flex flex-col gap-3"
        >
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="여기에 자유롭게 써 보세요..."
            className="min-h-[180px] text-lg leading-relaxed rounded-xl border-2 border-[#2ECC71]/20 focus-visible:border-[#2ECC71] focus-visible:ring-[#2ECC71]/20 resize-none p-4"
            style={{ fontFamily: 'var(--font-handwriting, inherit)' }}
          />

          {/* Character count and submit */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`h-2 rounded-full transition-all ${meetsMinimum ? 'bg-[#2ECC71]' : 'bg-muted'}`}
                style={{ width: `${Math.min((charCount / minChars) * 100, 100)}%`, minWidth: 8, maxWidth: 120 }}
              />
              <span className={`text-xs font-medium ${meetsMinimum ? 'text-[#2ECC71]' : 'text-muted-foreground'}`}>
                {charCount}자 / 최소 {minChars}자
              </span>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={!text.trim()}
              className="rounded-xl font-bold bg-[#2ECC71] hover:bg-[#2ECC71]/90"
            >
              제출하기
            </Button>
          </div>
        </motion.div>
      )}

      {/* Result */}
      {showResult && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full flex flex-col items-center gap-4"
        >
          {/* Show submitted text */}
          <div className="w-full rounded-xl bg-muted/50 p-4 border">
            <p className="text-sm text-muted-foreground mb-2 font-medium">내가 쓴 글</p>
            <p className="text-base leading-relaxed whitespace-pre-wrap"
              style={{ fontFamily: 'var(--font-handwriting, inherit)' }}
            >
              {text || '(작성한 내용)'}
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full bg-green-50 border border-green-200 px-5 py-2 text-sm font-bold text-green-700">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span>잘 썼어요! {charCount}자를 썼어요</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
