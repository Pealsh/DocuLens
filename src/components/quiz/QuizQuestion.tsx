'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { QuizQuestion as QuizQuestionType } from '@/types/quiz';

const OPTION_LABELS = ['A', 'B', 'C', 'D'] as const;

interface QuizQuestionProps {
  question: QuizQuestionType;
  questionNumber: number;
  totalCount: number;
  selectedIndex: number | null;
  isAnswered: boolean;
  onSelect: (index: number) => void;
  onNext: () => void;
  isLast: boolean;
}

export default function QuizQuestion({
  question,
  questionNumber,
  totalCount,
  selectedIndex,
  isAnswered,
  onSelect,
  onNext,
  isLast,
}: QuizQuestionProps) {
  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ type: 'tween', duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
      className="space-y-5"
    >
      {/* 進捗 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-text-muted">
          <span>{questionNumber} / {totalCount}</span>
          <span>{Math.round((questionNumber / totalCount) * 100)}%</span>
        </div>
        <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-accent rounded-full"
            initial={{ width: `${((questionNumber - 1) / totalCount) * 100}%` }}
            animate={{ width: `${(questionNumber / totalCount) * 100}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* 問題文 */}
      <p className="text-base font-medium text-text-primary leading-relaxed">
        {question.question}
      </p>

      {/* 選択肢 */}
      <div className="space-y-2.5">
        {question.options.map((option, index) => {
          const isSelected = selectedIndex === index;
          const isCorrect = index === question.correctIndex;

          let state: 'default' | 'selected' | 'correct' | 'wrong' | 'reveal' = 'default';
          if (isAnswered) {
            if (isCorrect) state = 'correct';
            else if (isSelected) state = 'wrong';
            else state = 'reveal';
          } else if (isSelected) {
            state = 'selected';
          }

          return (
            <button
              key={index}
              onClick={() => onSelect(index)}
              disabled={isAnswered}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-[var(--radius-md)]
                border text-left text-sm font-medium
                transition-all duration-150 cursor-pointer disabled:cursor-default
                ${state === 'default' ? 'border-border bg-bg-secondary text-text-primary hover:border-accent hover:bg-accent-light' : ''}
                ${state === 'selected' ? 'border-accent bg-accent-light text-accent' : ''}
                ${state === 'correct' ? 'border-success bg-success/10 text-success' : ''}
                ${state === 'wrong' ? 'border-error bg-error/10 text-error' : ''}
                ${state === 'reveal' ? 'border-border bg-bg-secondary text-text-muted opacity-60' : ''}
              `}
            >
              <span className={`
                flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border
                ${state === 'default' ? 'border-border-strong text-text-muted' : ''}
                ${state === 'selected' ? 'border-accent text-accent bg-accent/10' : ''}
                ${state === 'correct' ? 'border-success text-success bg-success/20' : ''}
                ${state === 'wrong' ? 'border-error text-error bg-error/20' : ''}
                ${state === 'reveal' ? 'border-border text-text-muted' : ''}
              `}>
                {OPTION_LABELS[index]}
              </span>
              {option}
              {isAnswered && isCorrect && (
                <svg className="ml-auto flex-shrink-0 text-success" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
              {isAnswered && isSelected && !isCorrect && (
                <svg className="ml-auto flex-shrink-0 text-error" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              )}
            </button>
          );
        })}
      </div>

      {/* 解説 */}
      <AnimatePresence>
        {isAnswered && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className={`rounded-[var(--radius-md)] px-4 py-3 text-sm leading-relaxed border ${
              selectedIndex === question.correctIndex
                ? 'bg-success/10 border-success/30 text-text-primary'
                : 'bg-error/10 border-error/30 text-text-primary'
            }`}
          >
            <span className={`font-semibold mr-2 ${selectedIndex === question.correctIndex ? 'text-success' : 'text-error'}`}>
              {selectedIndex === question.correctIndex ? '正解' : '不正解'}
            </span>
            {question.explanation}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 次へボタン */}
      {isAnswered && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="flex justify-end"
        >
          <button
            onClick={onNext}
            className="px-5 py-2 bg-accent text-white rounded-[var(--radius-sm)] text-sm font-medium hover:bg-accent-hover transition-colors cursor-pointer"
          >
            {isLast ? '結果を見る' : '次の問題'}
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
