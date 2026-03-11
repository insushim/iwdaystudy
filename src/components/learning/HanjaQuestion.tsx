'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, BookOpen, RotateCcw, Pen } from 'lucide-react';

interface Props {
  content: any;
  answer: any;
  onAnswer: (answer: string) => void;
  showResult: boolean;
  isCorrect: boolean | null;
}

/** Drawable canvas for Hanja stroke practice */
function HanjaCanvas({ character, onDrawComplete }: { character: string; onDrawComplete: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const hasDrawn = useRef(false);
  const [strokeCount, setStrokeCount] = useState(0);

  const getPos = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ('touches' in e) {
      const touch = e.touches[0] || e.changedTouches[0];
      return { x: (touch.clientX - rect.left) * scaleX, y: (touch.clientY - rect.top) * scaleY };
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  }, []);

  const drawGuide = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Background
    ctx.fillStyle = '#FFFAF0';
    ctx.fillRect(0, 0, w, h);

    // Grid lines (田 pattern)
    ctx.strokeStyle = '#e8d5b8';
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 4]);
    // Vertical center
    ctx.beginPath(); ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h); ctx.stroke();
    // Horizontal center
    ctx.beginPath(); ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2); ctx.stroke();
    // Diagonals
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(w, h); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(w, 0); ctx.lineTo(0, h); ctx.stroke();
    ctx.setLineDash([]);

    // Ghost character
    ctx.font = `${w * 0.7}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(139, 69, 19, 0.08)';
    ctx.fillText(character, w / 2, h / 2 + w * 0.03);

    // Border
    ctx.strokeStyle = '#c9a96e';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, w - 2, h - 2);
  }, [character]);

  useEffect(() => {
    drawGuide();
  }, [drawGuide]);

  const startDraw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    isDrawing.current = true;
    hasDrawn.current = true;
    lastPos.current = getPos(e);
  }, [getPos]);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pos = getPos(e);
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPos.current = pos;
  }, [getPos]);

  const endDraw = useCallback(() => {
    if (isDrawing.current) {
      isDrawing.current = false;
      setStrokeCount(c => c + 1);
    }
  }, []);

  const handleClear = useCallback(() => {
    setStrokeCount(0);
    hasDrawn.current = false;
    drawGuide();
  }, [drawGuide]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Pen className="h-3.5 w-3.5" />
        <span>따라 써 보세요</span>
        {strokeCount > 0 && (
          <Badge variant="secondary" className="text-xs ml-1">{strokeCount}획</Badge>
        )}
      </div>

      <div className="relative rounded-2xl overflow-hidden shadow-md border-2 border-[#c9a96e]/40">
        <canvas
          ref={canvasRef}
          width={280}
          height={280}
          className="touch-none cursor-crosshair"
          style={{ width: 280, height: 280 }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleClear}
          className="gap-1 rounded-lg text-xs"
        >
          <RotateCcw className="h-3 w-3" />
          지우기
        </Button>
        {strokeCount >= 1 && (
          <Button
            size="sm"
            onClick={onDrawComplete}
            className="gap-1 rounded-lg text-xs bg-[#8B4513] hover:bg-[#8B4513]/90 text-white"
          >
            <CheckCircle className="h-3 w-3" />
            쓰기 완료
          </Button>
        )}
      </div>
    </div>
  );
}

export default function HanjaQuestion({ content, answer, onAnswer, showResult, isCorrect }: Props) {
  const correctReading = answer?.reading || answer?.correct || answer?.text || '';
  const [inputValue, setInputValue] = useState('');
  const [drawDone, setDrawDone] = useState(false);

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
          {content.words.map((word: string, i: number) => (
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

      {/* Hanja writing canvas */}
      {!showResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <HanjaCanvas
            character={content.character}
            onDrawComplete={() => setDrawDone(true)}
          />
        </motion.div>
      )}

      {/* Practice input - shows after drawing or as fallback */}
      {!showResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col items-center gap-3 w-full max-w-sm"
        >
          {!drawDone && (
            <p className="text-xs text-muted-foreground text-center">
              위 캔버스에 한자를 따라 쓴 후, 아래에 음(소리)을 입력하세요
            </p>
          )}
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
              autoFocus={drawDone}
            />
            <Button
              onClick={handleSubmit}
              disabled={!inputValue.trim() || !drawDone}
              className="h-14 px-6 rounded-xl text-lg font-bold bg-[#8B4513] hover:bg-[#8B4513]/90 text-white"
            >
              확인
            </Button>
          </div>
          {!drawDone && inputValue.trim() && (
            <p className="text-xs text-orange-500 font-medium">
              먼저 위 캔버스에 한자를 따라 써 주세요
            </p>
          )}
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
