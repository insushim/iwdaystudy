"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, CheckCircle, XCircle, Pencil } from "lucide-react";

interface Props {
  content: Record<string, unknown>;
  answer: Record<string, unknown>;
  onAnswer: (answer: string) => void;
  showResult: boolean;
  isCorrect: boolean | null;
  hideCorrectAnswer?: boolean;
}

const OPTION_LABELS = ["1", "2", "3", "4"];

type HanjaVariant = "reading" | "meaning" | "character" | "word" | "writing";

// ── 한자 카드 (모듈 레벨: 부모 재렌더 시 재마운트 방지) ──
const CharacterCard = ({
  character,
  strokes,
  size = 100,
  showStroke = true,
}: {
  character: string;
  strokes: number;
  size?: number;
  showStroke?: boolean;
}) => (
  <motion.div
    initial={{ scale: 0, rotate: -10 }}
    animate={{ scale: 1, rotate: 0 }}
    transition={{ type: "spring", stiffness: 200, damping: 15 }}
    className="relative flex items-center justify-center rounded-3xl border-2 border-[#8B4513]/20 bg-gradient-to-br from-[#8B4513]/5 to-[#8B4513]/15"
    style={{ width: size * 1.6, height: size * 1.6 }}
  >
    <span
      className="select-none font-serif leading-none text-[#8B4513]"
      style={{ fontSize: size }}
    >
      {character}
    </span>
    {showStroke && strokes > 0 && (
      <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#8B4513] text-xs font-bold text-white shadow-md">
        {strokes}
      </div>
    )}
  </motion.div>
);

// ── 결과 뱃지 ──
const ResultBadge = ({
  correct,
  isCorrect,
  hideCorrectAnswer,
}: {
  correct: string;
  isCorrect: boolean | null;
  hideCorrectAnswer: boolean;
}) => (
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
    <span>
      {isCorrect
        ? "정답이에요!"
        : hideCorrectAnswer
          ? "틀렸어요! 나중에 다시 풀어봐요"
          : `정답: ${correct}`}
    </span>
  </motion.div>
);

// ── 예문 블록 ──
const SentenceBlock = ({ text }: { text: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="max-w-md rounded-xl border border-[#8B4513]/15 bg-[#8B4513]/5 px-5 py-3"
  >
    <p className="mb-1 flex items-center gap-1 text-sm font-medium text-muted-foreground">
      <BookOpen className="h-3.5 w-3.5" />
      예문
    </p>
    <p className="text-base leading-relaxed">{text}</p>
  </motion.div>
);

// ── 단어 뱃지 ──
const WordBadges = ({ words }: { words: string[] }) =>
  words.length > 0 ? (
    <div className="flex flex-wrap justify-center gap-2">
      {words.map((word, index) => (
        <Badge
          key={`${word}-${index}`}
          variant="outline"
          className="rounded-full border-[#8B4513]/30 bg-[#8B4513]/5 px-3 py-1 text-sm text-[#8B4513]"
        >
          {word}
        </Badge>
      ))}
    </div>
  ) : null;

// ── 4지선다 공통 ──
const ChoiceGrid = ({
  items,
  correct,
  selected,
  showResult,
  isCorrect,
  hideCorrectAnswer,
  onSelect,
}: {
  items: string[];
  correct: string;
  selected: string | null;
  showResult: boolean;
  isCorrect: boolean | null;
  hideCorrectAnswer: boolean;
  onSelect: (choice: string) => void;
}) => (
  <>
    {!showResult && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 gap-3 w-full max-w-md"
      >
        {items.map((choice, index) => (
          <motion.div key={`${choice}-${index}`} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              onClick={() => onSelect(choice)}
              className={`w-full h-14 min-h-[48px] text-lg font-bold rounded-xl border-2 transition-all ${
                selected === choice
                  ? "border-[#8B4513] bg-[#8B4513]/10 text-[#8B4513] shadow-md shadow-[#8B4513]/10"
                  : "border-border hover:border-[#8B4513]/40"
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
          exit={{ opacity: 0 }}
          className="flex flex-col items-center gap-3 w-full"
        >
          <ResultBadge
            correct={correct}
            isCorrect={isCorrect}
            hideCorrectAnswer={hideCorrectAnswer}
          />
          <div className="grid grid-cols-2 gap-2 w-full max-w-md">
            {items.map((choice, index) => (
              <div
                key={`${choice}-${index}`}
                className={`flex items-center justify-center rounded-xl border-2 px-4 py-3 text-base font-bold min-h-[44px] ${
                  hideCorrectAnswer && !isCorrect
                    ? selected === choice
                      ? "border-red-300 bg-red-50 text-red-500"
                      : "border-border text-muted-foreground"
                    : choice === correct
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
  </>
);

export default function HanjaQuestion({
  content,
  answer,
  onAnswer,
  showResult,
  isCorrect,
  hideCorrectAnswer = false,
}: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const variant = (content?.variant as HanjaVariant) || "reading";
  const correctAnswer = String(
    answer?.correct ?? answer?.reading ?? answer?.text ?? "",
  );
  const choices: string[] = (content?.choices as string[]) || [];
  const character = String(content?.character ?? "");
  const meaning = String(content?.meaning ?? "");
  const reading = String(content?.reading ?? "");
  const strokes = Number(content?.strokes ?? 0);
  const words = (content?.words as string[]) || [];
  const sentence = String(content?.sentence ?? "");
  const questionText = String(content?.text ?? "");

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleInputSubmit();
  };

  // ════════════════════════════════════════════════════════════════
  // 유형 1: 음 맞추기 - 한자+뜻 보고 음 고르기
  // ════════════════════════════════════════════════════════════════
  if (variant === "reading") {
    return (
      <div className="flex flex-col items-center gap-6">
        <CharacterCard character={character} strokes={strokes} />
        <div className="text-center">
          <p className="text-2xl font-bold text-foreground">{meaning}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            이 한자의 음(소리)을 골라보세요
          </p>
        </div>
        {sentence && <SentenceBlock text={sentence} />}
        <WordBadges words={words} />
        <ChoiceGrid
          items={choices}
          correct={correctAnswer}
          selected={selected}
          showResult={showResult}
          isCorrect={isCorrect}
          hideCorrectAnswer={hideCorrectAnswer}
          onSelect={handleSelect}
        />
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════
  // 유형 2: 뜻 맞추기 - 한자 보고 뜻 고르기
  // ════════════════════════════════════════════════════════════════
  if (variant === "meaning") {
    return (
      <div className="flex flex-col items-center gap-6">
        <CharacterCard character={character} strokes={strokes} />
        <div className="text-center">
          <p className="text-lg font-bold text-[#8B4513]">{reading}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            이 한자의 뜻(훈)을 골라보세요
          </p>
        </div>
        <ChoiceGrid
          items={choices}
          correct={correctAnswer}
          selected={selected}
          showResult={showResult}
          isCorrect={isCorrect}
          hideCorrectAnswer={hideCorrectAnswer}
          onSelect={handleSelect}
        />
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════
  // 유형 3: 한자 맞추기 - 음+뜻 보고 한자 고르기
  // ════════════════════════════════════════════════════════════════
  if (variant === "character") {
    return (
      <div className="flex flex-col items-center gap-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-3xl font-bold text-[#8B4513] mb-1">{meaning}</p>
          <p className="text-lg text-muted-foreground">
            음: <span className="font-bold text-foreground">{reading}</span>
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            맞는 한자를 골라보세요
          </p>
        </motion.div>

        {!showResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 gap-4 w-full max-w-sm"
          >
            {choices.map((choice, index) => (
              <motion.div key={`${choice}-${index}`} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  onClick={() => handleSelect(choice)}
                  className={`w-full h-24 text-5xl font-serif rounded-2xl border-2 transition-all ${
                    selected === choice
                      ? "border-[#8B4513] bg-[#8B4513]/10 text-[#8B4513] shadow-md"
                      : "border-border hover:border-[#8B4513]/40 text-[#8B4513]/80"
                  }`}
                >
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
              className="flex flex-col items-center gap-4 w-full"
            >
              <ResultBadge
                correct={correctAnswer}
                isCorrect={isCorrect}
                hideCorrectAnswer={hideCorrectAnswer}
              />
              <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
                {choices.map((choice, index) => (
                  <div
                    key={`${choice}-${index}`}
                    className={`flex items-center justify-center rounded-2xl border-2 h-24 text-5xl font-serif ${
                      hideCorrectAnswer && !isCorrect
                        ? selected === choice
                          ? "border-red-300 bg-red-50 text-red-400"
                          : "border-border text-muted-foreground/50"
                        : choice === correctAnswer
                          ? "border-green-400 bg-green-50 text-green-700"
                          : selected === choice
                            ? "border-red-300 bg-red-50 text-red-400"
                            : "border-border text-muted-foreground/50"
                    }`}
                  >
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

  // ════════════════════════════════════════════════════════════════
  // 유형 4: 단어 맞추기 - 한자 보고 이 한자가 쓰인 단어 고르기
  // ════════════════════════════════════════════════════════════════
  if (variant === "word") {
    return (
      <div className="flex flex-col items-center gap-6">
        <CharacterCard character={character} strokes={strokes} size={80} />
        <div className="text-center">
          <p className="text-lg font-bold text-foreground">
            {character}({meaning}) ={" "}
            <span className="text-[#8B4513]">{reading}</span>
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            이 한자가 들어간 단어를 골라보세요
          </p>
        </div>
        <ChoiceGrid
          items={choices}
          correct={correctAnswer}
          selected={selected}
          showResult={showResult}
          isCorrect={isCorrect}
          hideCorrectAnswer={hideCorrectAnswer}
          onSelect={handleSelect}
        />
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════
  // 유형 5: 따라쓰기 - 한자+뜻 보여주고 음을 직접 입력
  // ════════════════════════════════════════════════════════════════
  if (variant === "writing") {
    return (
      <div className="flex flex-col items-center gap-6">
        <CharacterCard character={character} strokes={strokes} />
        <div className="text-center">
          <p className="text-2xl font-bold text-foreground">{meaning}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            <Pencil className="inline h-3.5 w-3.5 mr-1" />이 한자의 음(소리)을
            직접 써보세요
          </p>
        </div>

        {sentence && <SentenceBlock text={sentence} />}

        {!showResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3 w-full max-w-xs"
          >
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="음을 입력하세요"
              className="text-center text-2xl font-bold h-14 rounded-xl border-2 border-[#8B4513]/30 focus-visible:border-[#8B4513] focus-visible:ring-[#8B4513]/20"
              autoFocus
              maxLength={5}
            />
            <Button
              onClick={handleInputSubmit}
              disabled={!inputValue.trim()}
              className="h-14 px-6 rounded-xl font-bold bg-[#8B4513] hover:bg-[#8B4513]/90"
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
              className="flex flex-col items-center gap-3"
            >
              <ResultBadge
                correct={correctAnswer}
                isCorrect={isCorrect}
                hideCorrectAnswer={hideCorrectAnswer}
              />
              {!isCorrect && (
                <p className="text-sm text-muted-foreground">
                  내가 쓴 답:{" "}
                  <span className="font-bold text-red-500">{selected}</span>
                </p>
              )}
              {!(hideCorrectAnswer && !isCorrect) && (
                <div className="flex items-center gap-2 text-lg font-bold text-[#8B4513]">
                  <span className="font-serif text-4xl">{character}</span>
                  <span>=</span>
                  <span>{meaning}</span>
                  <span>=</span>
                  <span>{correctAnswer}</span>
                </div>
              )}
              <WordBadges words={words} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // fallback
  return (
    <div className="flex flex-col items-center gap-6">
      <CharacterCard character={character} strokes={strokes} />
      <p className="text-lg">{questionText}</p>
      <ChoiceGrid
        items={choices}
        correct={correctAnswer}
        selected={selected}
        showResult={showResult}
        isCorrect={isCorrect}
        hideCorrectAnswer={hideCorrectAnswer}
        onSelect={handleSelect}
      />
    </div>
  );
}
