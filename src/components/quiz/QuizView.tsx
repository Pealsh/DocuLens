'use client';

import { useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import QuizCard from './QuizQuestion';
import QuizResult from './QuizResult';
import { useQuiz } from '@/hooks/useQuiz';

interface QuizViewProps {
  hasDocuments: boolean;
  combinedDocumentText: string;
  documentCount: number;
}

export default function QuizView({ hasDocuments, combinedDocumentText, documentCount }: QuizViewProps) {
  const questionCount = documentCount * 10;
  const {
    quiz,
    status,
    error,
    currentIndex,
    currentQuestion,
    answers,
    selectedIndex,
    isAnswered,
    correctCount,
    totalCount,
    allAnswered,
    canGoPrev,
    canGoNext,
    generateQuiz,
    selectAnswer,
    goNext,
    goPrev,
    goToIndex,
    resetQuiz,
  } = useQuiz();

  // ← / → のスライド方向を記録（AnimatePresence の initial/exit に使う）
  const navDir = useRef(1);

  const handleNext = useCallback(() => {
    navDir.current = 1;
    goNext();
  }, [goNext]);

  const handlePrev = useCallback(() => {
    navDir.current = -1;
    goPrev();
  }, [goPrev]);

  const handleGenerate = () => generateQuiz(combinedDocumentText, questionCount);
  const handleRetry = () => generateQuiz(combinedDocumentText, questionCount);

  /* ── 未開始 / 生成中 ── */
  if (status === 'idle' || status === 'generating') {
    return (
      <div className="rounded-[var(--radius-lg)] border border-border bg-bg-secondary flex flex-col items-center justify-center min-h-[420px] gap-5 p-8">
        {status === 'generating' ? (
          <>
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <p className="text-text-muted text-sm">クイズを生成しています...</p>
          </>
        ) : !hasDocuments ? (
          <>
            <QuizIcon className="text-text-muted w-10 h-10" />
            <p className="text-text-muted text-sm">ドキュメントを追加するとクイズを生成できます</p>
          </>
        ) : (
          <>
            <QuizIcon className="text-accent w-10 h-10" />
            <div className="text-center space-y-1">
              <p className="text-text-primary font-medium">ドキュメントの内容でクイズに挑戦</p>
              <p className="text-text-muted text-sm">
                AI が4択問題を{questionCount}問自動生成します（ドキュメント1件につき10問）
              </p>
            </div>
            {error && <p className="text-error text-sm text-center max-w-xs">{error}</p>}
            <button
              onClick={handleGenerate}
              className="px-6 py-2.5 bg-accent text-white rounded-[var(--radius-sm)] text-sm font-medium hover:bg-accent-hover transition-colors cursor-pointer"
            >
              クイズを生成する
            </button>
          </>
        )}
      </div>
    );
  }

  /* ── 結果表示 ── */
  if (status === 'completed' && quiz) {
    return (
      <QuizResult
        quiz={quiz}
        answers={answers}
        correctCount={correctCount}
        onRetry={handleRetry}
        onReset={resetQuiz}
      />
    );
  }

  /* ── 回答中 ── */
  if (status !== 'answering' || !currentQuestion) return null;

  return (
    <div className="space-y-4">
      {/* カードエリア（横スライドアニメーション） */}
      <div className="overflow-hidden">
        <AnimatePresence
          mode="wait"
          initial={false}
          custom={navDir.current}
        >
          <motion.div
            key={currentIndex}
            custom={navDir.current}
            variants={{
              enter: (dir: number) => ({ opacity: 0, x: dir * 50 }),
              center: { opacity: 1, x: 0 },
              exit: (dir: number) => ({ opacity: 0, x: dir * -50 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
          >
            <QuizCard
              question={currentQuestion}
              isFlipped={isAnswered}
              selectedIndex={selectedIndex}
              onSelect={selectAnswer}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ナビゲーションバー */}
      <div className="flex flex-col items-center gap-2">
        {/* ← X/Y → を横一列にまとめる */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            disabled={!canGoPrev}
            className="
              w-7 h-7 flex items-center justify-center
              rounded-full border border-border
              text-text-secondary
              hover:border-accent hover:text-accent hover:bg-accent-light
              disabled:opacity-30 disabled:cursor-not-allowed
              disabled:hover:border-border disabled:hover:text-text-secondary disabled:hover:bg-transparent
              transition-all cursor-pointer
            "
            aria-label="前の問題"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <span className="text-sm font-medium text-text-secondary tabular-nums w-14 text-center">
            {currentIndex + 1} / {totalCount}
          </span>

          <button
            onClick={handleNext}
            disabled={!canGoNext}
            className="
              w-7 h-7 flex items-center justify-center
              rounded-full border border-border
              text-text-secondary
              hover:border-accent hover:text-accent hover:bg-accent-light
              disabled:opacity-30 disabled:cursor-not-allowed
              disabled:hover:border-border disabled:hover:text-text-secondary disabled:hover:bg-transparent
              transition-all cursor-pointer
            "
            aria-label="次の問題"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* ドットインジケーター */}
        <div className="flex gap-1.5">
          {quiz?.questions.map((q, i) => {
            const answer = answers.find((a) => a.questionId === q.id);
            const answered = !!answer;
            const isCurrent = i === currentIndex;
            const canJump = i <= currentIndex || answered;

            return (
              <button
                key={i}
                onClick={() => {
                  if (!canJump) return;
                  navDir.current = i > currentIndex ? 1 : -1;
                  goToIndex(i);
                }}
                disabled={!canJump}
                className={`
                  h-2 rounded-full transition-all
                  ${canJump ? 'cursor-pointer' : 'cursor-default'}
                  ${isCurrent ? 'w-5 bg-accent' : 'w-2'}
                  ${!isCurrent && answered && answer?.isCorrect ? 'bg-success' : ''}
                  ${!isCurrent && answered && !answer?.isCorrect ? 'bg-error' : ''}
                  ${!isCurrent && !answered ? 'bg-border-strong' : ''}
                `}
                aria-label={`問題 ${i + 1}`}
              />
            );
          })}
        </div>

        {/* 全問回答時に結果ボタン */}
        {allAnswered && (
          <motion.button
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => { navDir.current = 1; handleNext(); }}
            className="px-4 py-1.5 bg-accent text-white rounded-full text-xs font-medium hover:bg-accent-hover transition-colors cursor-pointer"
          >
            結果を見る
          </motion.button>
        )}
      </div>
    </div>
  );
}

function QuizIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}
