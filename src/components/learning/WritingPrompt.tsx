'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Pencil, Star } from 'lucide-react';
import { evaluateWriting, type WritingEvalResult } from '@/lib/writing-evaluator';

interface Props {
  content: any;
  onAnswer: (answer: string) => void;
  showResult: boolean;
  isCorrect: boolean | null;
}

const MIN_CHARS_DEFAULT = 20;

const DETAIL_LABELS = [
  { key: 'length' as const,    label: '글자 수',   max: 3, color: '#2ECC71' },
  { key: 'sentences' as const, label: '문장 구성', max: 2, color: '#3498DB' },
  { key: 'variety' as const,   label: '어휘 다양성', max: 3, color: '#9B59B6' },
  { key: 'structure' as const, label: '내용 구조', max: 2, color: '#E67E22' },
];

export default function WritingPrompt({ content, onAnswer, showResult }: Props) {
  const [text, setText] = useState('');
  const [evalResult, setEvalResult] = useState<WritingEvalResult | null>(null);

  const prompt = content?.prompt || content?.text || '자유롭게 써보세요.';
  const minChars = content?.minChars || content?.min_chars || MIN_CHARS_DEFAULT;
  const charCount = text.length;
  const meetsMinimum = charCount >= minChars;

  const handleSubmit = () => {
    if (!text.trim()) return;
    const result = evaluateWriting(text.trim(), minChars);
    setEvalResult(result);
    onAnswer(text.trim());
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

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`h-2 rounded-full transition-all ${meetsMinimum ? 'bg-[#2ECC71]' : 'bg-muted'}`}
                style={{ width: `${Math.min((charCount / minChars) * 100, 100)}%`, minWidth: 8, maxWidth: 120 }}
              />
              <span className={`text-xs font-medium ${meetsMinimum ? 'text-[#2ECC71]' : 'text-muted-foreground'}`}>
                {charCount}자 / 최소 {minChars}자
              </span>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={!meetsMinimum}
              className="rounded-xl font-bold bg-[#2ECC71] hover:bg-[#2ECC71]/90"
            >
              {meetsMinimum ? '제출하기' : `${minChars - charCount}자 더 써주세요`}
            </Button>
          </div>
        </motion.div>
      )}

      {/* Result */}
      {showResult && evalResult && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full flex flex-col items-center gap-4"
        >
          {/* 내가 쓴 글 */}
          <div className="w-full rounded-xl bg-muted/50 p-4 border">
            <p className="text-sm text-muted-foreground mb-2 font-medium">내가 쓴 글</p>
            <p className="text-base leading-relaxed whitespace-pre-wrap"
              style={{ fontFamily: 'var(--font-handwriting, inherit)' }}>
              {text || '(작성한 내용)'}
            </p>
          </div>

          {/* 별점 + 점수 */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center gap-2"
          >
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <motion.div
                  key={n}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1 + n * 0.08, type: 'spring', stiffness: 300 }}
                >
                  <Star
                    className="h-8 w-8"
                    style={{
                      fill: n <= evalResult.stars ? '#F1C40F' : 'transparent',
                      stroke: n <= evalResult.stars ? '#F1C40F' : '#CBD5E1',
                    }}
                  />
                </motion.div>
              ))}
            </div>
            <p className="text-2xl font-black text-foreground">
              {evalResult.score}
              <span className="text-base font-medium text-muted-foreground"> / 10점</span>
            </p>
            <p className="text-base font-semibold text-[#2ECC71]">{evalResult.feedback}</p>
            <p className="text-sm text-muted-foreground mt-1 text-center">{evalResult.tip}</p>
          </motion.div>

          {/* 세부 항목 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="w-full rounded-xl border bg-card p-4 flex flex-col gap-3"
          >
            {DETAIL_LABELS.map(({ key, label, max, color }) => {
              const val = evalResult.details[key];
              const pct = (val / max) * 100;
              return (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-20 shrink-0">{label}</span>
                  <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, delay: 0.7 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  </div>
                  <span className="text-xs font-semibold w-10 text-right">
                    {val}/{max}
                  </span>
                </div>
              );
            })}
          </motion.div>
        </motion.div>
      )}

      {/* showResult이지만 evalResult가 없는 경우 (이전 세션 복구 등) */}
      {showResult && !evalResult && (
        <div className="flex items-center gap-2 rounded-full bg-green-50 border border-green-200 px-5 py-2 text-sm font-bold text-green-700">
          <span>잘 썼어요! {charCount}자를 썼어요</span>
        </div>
      )}
    </div>
  );
}
