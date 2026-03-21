"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, Lightbulb, XCircle } from "lucide-react";

interface Props {
  content: Record<string, unknown>;
  answer: Record<string, unknown>;
  onAnswer: (answer: string) => void;
  showResult: boolean;
  isCorrect: boolean | null;
}

const OPTION_LABELS = ["1", "2", "3", "4"];

export default function MathQuestion({
  content,
  answer,
  onAnswer,
  showResult,
  isCorrect,
}: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [showSteps, setShowSteps] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const variant = (content?.variant as string) || "choice";
  const expression = content?.expression || "";
  const correctAnswer = String(
    answer?.correct ?? answer?.answer ?? answer?.text ?? "",
  );
  const choices: string[] = content?.choices || [];
  const steps: string[] = answer?.steps || [];
  const operator = expression.match(/[+\-]/)?.[0] || "";
  const operands = expression
    .split(/\s*[+\-]\s*/)
    .map((item: string) => item.trim());
  const isVerticalLayout =
    (expression.includes("+") || expression.includes("-")) &&
    operands.length === 2;

  const handleSelect = (choice: string) => {
    if (showResult) return;
    setSelected(choice);
    onAnswer(choice);
  };

  const handleInputSubmit = () => {
    if (showResult || !inputValue.trim()) return;
    setSelected(inputValue.trim());
    onAnswer(inputValue.trim());
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {content?.unit && (
        <span className="inline-flex items-center gap-1 rounded-full bg-[#FF6B35]/10 px-3 py-1 text-xs font-semibold text-[#FF6B35]">
          {content.unit}
        </span>
      )}

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex items-center justify-center gap-2"
      >
        <div className="text-4xl sm:text-5xl font-black tracking-wide text-foreground select-none text-center leading-relaxed">
          {variant === "reverse" ? (
            <>
              {expression} = {String(content.result ?? "")}
            </>
          ) : (
            <>
              {expression} = <span className="text-muted-foreground/50">?</span>
            </>
          )}
        </div>
      </motion.div>

      {isVerticalLayout && variant !== "reverse" && (
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
              {showResult ? correctAnswer : "?"}
            </div>
          </div>
        </motion.div>
      )}

      {!showResult && variant === "input" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex gap-3 w-full max-w-md items-center"
        >
          <Input
            type="number"
            inputMode="numeric"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleInputSubmit()}
            placeholder="답을 입력하세요"
            className="h-14 text-xl font-bold text-center rounded-xl border-2 border-[#FF6B35]/30 focus:border-[#FF6B35]"
            autoFocus
          />
          <Button
            onClick={handleInputSubmit}
            disabled={!inputValue.trim()}
            className="h-14 px-6 text-lg font-bold rounded-xl bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white"
          >
            확인
          </Button>
        </motion.div>
      )}

      {!showResult && variant !== "input" && choices.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 gap-3 w-full max-w-md"
        >
          {choices.map((choice, index) => (
            <motion.div key={choice} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                onClick={() => handleSelect(choice)}
                className={`w-full h-14 min-h-[48px] text-lg font-bold rounded-xl border-2 transition-all ${
                  selected === choice
                    ? "border-[#FF6B35] bg-[#FF6B35]/10 text-[#FF6B35] shadow-md shadow-[#FF6B35]/10"
                    : "border-border hover:border-[#FF6B35]/40"
                }`}
              >
                <span className="mr-2 text-sm text-muted-foreground">
                  {OPTION_LABELS[index]}
                </span>
                {choice}
              </Button>
            </motion.div>
          ))}
        </motion.div>
      )}

      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex flex-col items-center gap-4 w-full"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
              className={`flex items-center gap-3 rounded-2xl px-6 py-4 text-lg font-bold ${
                isCorrect
                  ? "bg-green-50 text-green-700 border-2 border-green-200"
                  : "bg-red-50 text-red-700 border-2 border-red-200"
              }`}
            >
              {isCorrect ? (
                <CheckCircle className="h-6 w-6 text-green-500" />
              ) : (
                <XCircle className="h-6 w-6 text-red-500" />
              )}
              <span>{isCorrect ? "정답이에요" : `정답: ${correctAnswer}`}</span>
            </motion.div>

            {choices.length > 0 && (
              <div className="grid grid-cols-2 gap-2 w-full max-w-md">
                {choices.map((choice, index) => (
                  <div
                    key={choice}
                    className={`flex items-center justify-center rounded-xl border-2 px-4 py-3 text-base font-bold min-h-[44px] ${
                      choice === correctAnswer
                        ? "border-green-400 bg-green-50 text-green-700"
                        : selected === choice
                          ? "border-red-300 bg-red-50 text-red-500"
                          : "border-border text-muted-foreground"
                    }`}
                  >
                    <span className="mr-2 text-sm text-muted-foreground">
                      {OPTION_LABELS[index]}
                    </span>
                    {choice}
                  </div>
                ))}
              </div>
            )}

            {steps.length > 0 && (
              <div className="w-full max-w-sm">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSteps(!showSteps)}
                  className="gap-1 text-muted-foreground min-h-[36px]"
                >
                  <Lightbulb className="h-4 w-4" />
                  {showSteps ? "풀이 숨기기" : "풀이 보기"}
                </Button>
                <AnimatePresence>
                  {showSteps && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2 rounded-xl bg-muted/50 p-4 space-y-2">
                        {steps.map((step: string, index: number) => (
                          <div
                            key={`${step}-${index}`}
                            className="flex items-start gap-2 text-sm"
                          >
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#FF6B35]/10 text-xs font-bold text-[#FF6B35]">
                              {index + 1}
                            </span>
                            <span className="pt-0.5">{step}</span>
                          </div>
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
