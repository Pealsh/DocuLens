'use client';

import { AnimatePresence } from 'framer-motion';
import Card from '@/components/ui/Card';
import QuizQuestion from './QuizQuestion';
import QuizResult from './QuizResult';
import { useQuiz } from '@/hooks/useQuiz';

interface QuizViewProps {
  hasDocuments: boolean;
  combinedDocumentText: string;
}

export default function QuizView({ hasDocuments, combinedDocumentText }: QuizViewProps) {
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
    generateQuiz,
    selectAnswer,
    nextQuestion,
    resetQuiz,
  } = useQuiz();

  const handleGenerate = () => {
    generateQuiz(combinedDocumentText, 5);
  };

  const handleRetry = () => {
    generateQuiz(combinedDocumentText, 5);
  };

  return (
    <Card className="min-h-[420px]">
      <AnimatePresence mode="wait">

        {/* 未開始 */}
        {status === 'idle' && (
          <div key="idle" className="flex flex-col items-center justify-center h-64 gap-4">
            {!hasDocuments ? (
              <>
                <QuizIcon className="text-text-muted" />
                <p className="text-text-muted text-sm">ドキュメントを追加するとクイズを生成できます</p>
              </>
            ) : (
              <>
                <QuizIcon className="text-accent" />
                <div className="text-center space-y-1">
                  <p className="text-text-primary font-medium">ドキュメントの内容でクイズに挑戦</p>
                  <p className="text-text-muted text-sm">AI が4択問題を5問自動生成します</p>
                </div>
                {error && (
                  <p className="text-error text-sm text-center max-w-xs">{error}</p>
                )}
                <button
                  onClick={handleGenerate}
                  className="px-6 py-2.5 bg-accent text-white rounded-[var(--radius-sm)] text-sm font-medium hover:bg-accent-hover transition-colors cursor-pointer"
                >
                  クイズを生成する
                </button>
              </>
            )}
          </div>
        )}

        {/* 生成中 */}
        {status === 'generating' && (
          <div key="generating" className="flex flex-col items-center justify-center h-64 gap-4">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <p className="text-text-muted text-sm">クイズを生成しています...</p>
          </div>
        )}

        {/* 回答中 */}
        {status === 'answering' && currentQuestion && (
          <div key={`question-${currentIndex}`}>
            <QuizQuestion
              question={currentQuestion}
              questionNumber={currentIndex + 1}
              totalCount={totalCount}
              selectedIndex={selectedIndex}
              isAnswered={isAnswered}
              onSelect={selectAnswer}
              onNext={nextQuestion}
              isLast={currentIndex + 1 === totalCount}
            />
          </div>
        )}

        {/* 結果 */}
        {status === 'completed' && quiz && (
          <div key="result">
            <QuizResult
              quiz={quiz}
              answers={answers}
              correctCount={correctCount}
              onRetry={handleRetry}
              onReset={resetQuiz}
            />
          </div>
        )}

      </AnimatePresence>
    </Card>
  );
}

function QuizIcon({ className }: { className?: string }) {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}
