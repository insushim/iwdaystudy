"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle, Volume2, XCircle } from "lucide-react";

interface Props {
  content: Record<string, unknown>;
  answer: Record<string, unknown>;
  onAnswer: (answer: string) => void;
  showResult: boolean;
  isCorrect: boolean | null;
}

const OPTION_LABELS = ["1", "2", "3", "4"];

export default function EnglishQuestion({
  content,
  answer,
  onAnswer,
  showResult,
  isCorrect,
}: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const variant: string = (content?.variant as string) || "word";
  const correctWord = String(
    answer?.correct ?? answer?.word ?? answer?.text ?? "",
  );
  const choices: string[] = content?.choices || [];

  const handleSpeak = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(content.sentence);
    utterance.lang = "en-US";
    utterance.rate = 0.75;
    window.speechSynthesis.speak(utterance);
  }, [content.sentence]);

  const handleSelect = (choice: string) => {
    if (showResult) return;
    setSelected(choice);
    onAnswer(choice);
  };

  const maskedSentence = String(content?.sentence || "").replace(
    new RegExp(
      `\\b${String(content?.word || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
      "i",
    ),
    "_____",
  );

  return (
    <div className="flex flex-col items-center gap-6">
      {/* meaning variant: show Korean translation prominently */}
      {variant === "meaning" && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg rounded-2xl border border-[#4169E1]/20 bg-gradient-to-r from-[#4169E1]/5 to-[#4169E1]/10 p-6 text-center min-h-[80px]"
        >
          <p className="text-sm text-muted-foreground mb-2">
            다음 뜻에 해당하는 영단어를 고르세요
          </p>
          <p className="text-3xl font-black text-foreground">
            {content.translation || content.meaning || ""}
          </p>
        </motion.div>
      )}

      {/* input variant: show sentence with blank */}
      {variant === "input" && (
        <>
          <motion.button
            type="button"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleSpeak}
            whileTap={{ scale: 0.98 }}
            className="w-full max-w-lg rounded-2xl border border-[#4169E1]/20 bg-gradient-to-r from-[#4169E1]/5 to-[#4169E1]/10 p-6 text-center min-h-[80px] active:bg-[#4169E1]/15 transition-colors"
          >
            <p className="text-2xl font-bold leading-relaxed text-foreground sm:text-3xl">
              {maskedSentence}
            </p>
            <p className="mt-2 flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <Volume2 className="h-3 w-3" />
              문장을 눌러 발음을 들어보세요
            </p>
          </motion.button>
          {content.translation && (
            <p className="text-sm text-muted-foreground">
              뜻: {content.translation}
            </p>
          )}
        </>
      )}

      {/* word variant (default): show sentence with blank */}
      {variant === "word" && (
        <motion.button
          type="button"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleSpeak}
          whileTap={{ scale: 0.98 }}
          className="w-full max-w-lg rounded-2xl border border-[#4169E1]/20 bg-gradient-to-r from-[#4169E1]/5 to-[#4169E1]/10 p-6 text-center min-h-[80px] active:bg-[#4169E1]/15 transition-colors"
        >
          <p className="text-2xl font-bold leading-relaxed text-foreground sm:text-3xl">
            {maskedSentence}
          </p>
          <p className="mt-2 flex items-center justify-center gap-1 text-xs text-muted-foreground">
            <Volume2 className="h-3 w-3" />
            문장을 눌러 발음을 들어보세요
          </p>
        </motion.button>
      )}

      {variant !== "meaning" && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {content.pronunciation && (
            <div className="rounded-full bg-muted px-4 py-2 text-sm text-muted-foreground">
              [{content.pronunciation}]
            </div>
          )}
          {content.practice?.length > 0 && (
            <div className="rounded-full bg-[#4169E1]/10 px-4 py-2 text-sm font-medium text-[#4169E1]">
              관련 단어 {content.practice.join(", ")}
            </div>
          )}
        </div>
      )}

      {/* Multiple choice (word and meaning variants) */}
      {!showResult && choices.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-3 w-full max-w-md"
        >
          {choices.map((choice, index) => (
            <motion.div key={choice} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                onClick={() => handleSelect(choice)}
                className={`w-full h-14 min-h-[48px] text-lg font-bold rounded-xl border-2 transition-all ${
                  selected === choice
                    ? "border-[#4169E1] bg-[#4169E1]/10 text-[#4169E1] shadow-md shadow-[#4169E1]/10"
                    : "border-border hover:border-[#4169E1]/40"
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

      {/* Text input (input variant) */}
      {!showResult && choices.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-3 w-full max-w-sm"
        >
          <input
            type="text"
            value={selected || ""}
            onChange={(e) => setSelected(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && selected?.trim())
                onAnswer(selected.trim());
            }}
            placeholder="영단어를 입력하세요"
            className="flex-1 h-14 min-h-[48px] text-center text-xl font-bold rounded-xl border-2 border-[#4169E1]/30 focus:border-[#4169E1] focus:ring-2 focus:ring-[#4169E1]/20 outline-none px-4"
            autoFocus
          />
          <Button
            onClick={() => selected?.trim() && onAnswer(selected.trim())}
            disabled={!selected?.trim()}
            className="h-14 min-h-[48px] px-6 rounded-xl text-lg font-bold bg-[#4169E1] hover:bg-[#4169E1]/90"
          >
            확인
          </Button>
        </motion.div>
      )}

      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-3 w-full"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
              className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-bold ${
                isCorrect
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {isCorrect ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span>{isCorrect ? "정답이에요" : `정답: ${correctWord}`}</span>
            </motion.div>

            <div className="grid grid-cols-2 gap-2 w-full max-w-md">
              {choices.map((choice, index) => (
                <div
                  key={choice}
                  className={`flex items-center justify-center rounded-xl border-2 px-4 py-3 text-base font-bold min-h-[44px] ${
                    choice === correctWord
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
