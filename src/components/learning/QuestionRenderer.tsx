'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, MessageCircle } from 'lucide-react';
import { SUBJECTS } from '@/types/learning';
import { getSubjectColor } from '@/lib/utils';
import type { Question } from '@/types/database';
import MathQuestion from './MathQuestion';
import SpellingQuestion from './SpellingQuestion';
import VocabQuestion from './VocabQuestion';
import HanjaQuestion from './HanjaQuestion';
import EnglishQuestion from './EnglishQuestion';
import WritingPrompt from './WritingPrompt';
import EmotionCheck from './EmotionCheck';
import ReadinessChecklist from './ReadinessChecklist';
import GeneralKnowledge from './GeneralKnowledge';
import SafetyQuiz from './SafetyQuiz';

interface Props {
  question: Question;
  onAnswer: (answer: any) => void;
  showResult: boolean;
  isCorrect: boolean | null;
}

export default function QuestionRenderer({ question, onAnswer, showResult, isCorrect }: Props) {
  const [showHint, setShowHint] = useState(false);
  const subjectInfo = SUBJECTS[question.subject] || { name: question.subject, icon: '📝', color: '#2ECC71' };
  const color = getSubjectColor(question.subject);

  const renderQuestion = () => {
    const commonProps = {
      content: question.content,
      answer: question.answer,
      onAnswer,
      showResult,
      isCorrect,
    };

    // Route by subject first
    switch (question.subject) {
      case 'math':
        return <MathQuestion {...commonProps} />;

      case 'spelling':
        return <SpellingQuestion {...commonProps} />;

      case 'vocabulary':
        return <VocabQuestion {...commonProps} />;

      case 'hanja':
        return <HanjaQuestion {...commonProps} />;

      case 'english':
        return <EnglishQuestion {...commonProps} />;

      case 'writing':
      case 'creative':
        return (
          <WritingPrompt
            content={question.content}
            onAnswer={onAnswer}
            showResult={showResult}
            isCorrect={isCorrect}
          />
        );

      case 'safety':
        return <SafetyQuiz {...commonProps} />;

      case 'general_knowledge':
      case 'science':
      case 'social':
        return <GeneralKnowledge {...commonProps} />;

      default:
        break;
    }

    // Route by question_type for special types
    switch (question.question_type) {
      case 'emotion_check':
        return (
          <EmotionCheck
            onAnswer={onAnswer}
            showResult={showResult}
          />
        );

      case 'readiness_check':
        return (
          <ReadinessChecklist
            content={question.content}
            onAnswer={onAnswer}
            showResult={showResult}
          />
        );

      default:
        return <GeneralKnowledge {...commonProps} />;
    }
  };

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
    >
      <Card className="w-full max-w-2xl mx-auto overflow-hidden">
        {/* Subject-colored header */}
        <CardHeader
          className="py-3 px-4"
          style={{ backgroundColor: `${color}15`, borderBottom: `2px solid ${color}` }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{subjectInfo.icon}</span>
              <CardTitle className="text-base font-bold" style={{ color }}>
                {question.title || subjectInfo.name}
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {question.points > 0 && !['emotion_check', 'readiness_check'].includes(question.question_type) && (
                <Badge variant="outline" className="text-xs" style={{ borderColor: color, color }}>
                  {question.points}점
                </Badge>
              )}
              {question.hint && !showResult && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => setShowHint(!showHint)}
                >
                  <Lightbulb className="w-3 h-3 mr-1" />
                  힌트
                </Button>
              )}
            </div>
          </div>

          {/* Hint */}
          <AnimatePresence>
            {showHint && question.hint && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-2 p-2 bg-amber-50 rounded-lg text-sm text-amber-800 border border-amber-200 flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 flex-shrink-0 mt-0.5 text-amber-500" />
                  <span>{question.hint}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          <div className={showResult ? (isCorrect ? 'animate-correct' : (isCorrect === false ? 'animate-wrong' : '')) : ''}>
            {renderQuestion()}
          </div>

          {/* Explanation on result */}
          <AnimatePresence>
            {showResult && question.explanation && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200 flex items-start gap-2">
                  <MessageCircle className="h-4 w-4 flex-shrink-0 mt-0.5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-blue-800 mb-0.5">해설</p>
                    <p className="text-sm text-blue-700">{question.explanation}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}
