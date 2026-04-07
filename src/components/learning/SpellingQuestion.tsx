"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle } from "lucide-react";

interface Props {
  content: Record<string, unknown>;
  answer: Record<string, unknown>;
  onAnswer: (answer: string) => void;
  showResult: boolean;
  isCorrect: boolean | null;
  hideCorrectAnswer?: boolean;
}

const OPTION_LABELS = ["1", "2", "3", "4"];

export default function SpellingQuestion({
  content,
  answer,
  onAnswer,
  showResult,
  hideCorrectAnswer = false,
}: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const variant = (content?.variant as string) || "sentence";
  const options: string[] = (content?.options as string[]) || [];
  const correctAnswer = String(answer?.correct ?? answer?.text ?? "");
  const explanation = (answer?.explanation ||
    content?.explanation ||
    "") as string;
  const wrongSentence = (content?.wrongSentence as string) || "";
  const correctPart = (content?.correctPart as string) || "";

  const handleSelect = (choice: string) => {
    if (showResult) return;
    setSelected(choice);
    onAnswer(choice);
  };

  // Prompt text based on variant
  const promptText =
    variant === "word"
      ? "다음 문장에서 맞춤법이 틀린 부분을 찾으세요"
      : variant === "correct"
        ? "다음 문장을 올바르게 고치면?"
        : "올바른 문장을 골라주세요";

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-center text-lg font-medium text-muted-foreground">
        {promptText}
      </p>

      {/* Show the wrong sentence for 'word' and 'correct' variants */}
      {(variant === "word" || variant === "correct") && wrongSentence && (
        <div className="w-full max-w-2xl rounded-xl border-2 border-dashed border-[#A18CD1]/40 bg-[#A18CD1]/5 p-5">
          <p className="text-center text-xl font-medium leading-relaxed break-keep sm:text-2xl">
            {variant === "word"
              ? wrongSentence.split(/\s+/).map((word, i) => (
                  <span key={i}>
                    {i > 0 && " "}
                    <span className="underline decoration-[#A18CD1]/60 decoration-2 underline-offset-4">
                      {word}
                    </span>
                  </span>
                ))
              : wrongSentence}
          </p>
        </div>
      )}

      {options.length === 0 && !showResult && (
        <div className="text-center text-muted-foreground text-sm py-4">
          선택지를 불러올 수 없습니다.
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
        {options.map((option, index) => (
          <motion.button
            key={`${option}-${index}`}
            whileHover={!showResult ? { scale: 1.02 } : undefined}
            whileTap={!showResult ? { scale: 0.97 } : undefined}
            onClick={() => handleSelect(option)}
            disabled={showResult}
            className={`relative flex flex-col items-center gap-3 rounded-2xl border-2 p-6 text-left transition-all disabled:cursor-default min-h-[72px] ${
              selected === option && !showResult
                ? "border-[#A18CD1] bg-[#A18CD1]/10 ring-2 ring-[#A18CD1]/30 shadow-md shadow-[#A18CD1]/10"
                : "border-border hover:border-[#A18CD1]/50 hover:bg-[#A18CD1]/5"
            } ${
              showResult && option === correctAnswer && !(hideCorrectAnswer && selected !== option)
                ? "border-green-400 bg-green-50 ring-2 ring-green-200"
                : ""
            } ${
              showResult && selected === option && option !== correctAnswer
                ? "border-red-400 bg-red-50 ring-2 ring-red-200"
                : ""
            }`}
          >
            <div className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#A18CD1]/10 min-w-[32px]">
              <span className="text-sm font-bold text-[#A18CD1]">
                {OPTION_LABELS[index]}
              </span>
            </div>

            <p className="pt-4 text-xl font-medium leading-relaxed text-center break-keep sm:text-2xl">
              {option}
            </p>

            {showResult && option === correctAnswer && !(hideCorrectAnswer && selected !== option) && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring" }}
              >
                <CheckCircle className="h-8 w-8 text-green-500" />
              </motion.div>
            )}
            {showResult && selected === option && option !== correctAnswer && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring" }}
              >
                <XCircle className="h-8 w-8 text-red-500" />
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>

      {/* Show correction info for 'word' variant after answering */}
      <AnimatePresence>
        {showResult && variant === "word" && correctPart && !(hideCorrectAnswer && selected !== correctAnswer) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-2xl rounded-xl border border-green-200 bg-green-50 p-4"
          >
            <p className="text-sm font-medium text-green-700">
              올바른 표현: <span className="font-bold">{correctPart}</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showResult && explanation && !(hideCorrectAnswer && selected !== correctAnswer) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-2xl rounded-xl border border-[#A18CD1]/20 bg-[#A18CD1]/10 p-4"
          >
            <p className="text-sm font-medium text-[#A18CD1]">설명</p>
            <p className="mt-1 text-sm leading-relaxed">{explanation}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
