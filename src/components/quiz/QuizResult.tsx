'use client';

import { motion } from 'framer-motion';
import type { Quiz, UserAnswer } from '@/types/quiz';

const OPTION_LABELS = ['A', 'B', 'C', 'D'] as const;

interface QuizResultProps {
  quiz: Quiz;
  answers: UserAnswer[];
  correctCount: number;
  onRetry: () => void;
  onReset: () => void;
}

export default function QuizResult({ quiz, answers, correctCount, onRetry, onReset }: QuizResultProps) {
  const total = quiz.questions.length;
  const percentage = Math.round((correctCount / total) * 100);

  const grade =
    percentage >= 90 ? { label: '優秀', color: 'text-success' } :
    percentage >= 70 ? { label: '合格', color: 'text-accent' } :
    percentage >= 50 ? { label: 'もう少し', color: 'text-warning' } :
    { label: '要復習', color: 'text-error' };

  return (
    <div className="space-y-6">
      {/* スコア */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center py-6 space-y-2"
      >
        <div className={`text-5xl font-bold ${grade.color}`}>{percentage}%</div>
        <div className="text-text-muted text-sm">{correctCount} / {total} 問正解 — {grade.label}</div>
      </motion.div>

      {/* 問題ごとの振り返り */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-text-secondary">振り返り</h3>
        {quiz.questions.map((question, qIndex) => {
          const answer = answers.find((a) => a.questionId === question.id);
          const isCorrect = answer?.isCorrect ?? false;

          return (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: qIndex * 0.05 }}
              className="rounded-[var(--radius-md)] border border-border bg-bg-secondary p-4 space-y-3"
            >
              <div className="flex items-start gap-2">
                <span className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${isCorrect ? 'bg-success/20 text-success' : 'bg-error/20 text-error'}`}>
                  {isCorrect ? (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  )}
                </span>
                <p className="text-sm text-text-primary font-medium leading-snug">{question.question}</p>
              </div>

              <div className="grid grid-cols-1 gap-1 pl-7">
                {question.options.map((option, oIndex) => {
                  const isChosen = answer?.selectedIndex === oIndex;
                  const isCorrectOption = question.correctIndex === oIndex;
                  return (
                    <div
                      key={oIndex}
                      className={`flex items-center gap-2 text-xs py-0.5 ${
                        isCorrectOption ? 'text-success font-medium' :
                        isChosen ? 'text-error' : 'text-text-muted'
                      }`}
                    >
                      <span className="font-bold w-4">{OPTION_LABELS[oIndex]}.</span>
                      {option}
                      {isCorrectOption && <span className="text-success">(正解)</span>}
                      {isChosen && !isCorrectOption && <span className="text-error">(あなたの回答)</span>}
                    </div>
                  );
                })}
              </div>

              <p className="text-xs text-text-secondary pl-7 leading-relaxed border-t border-border pt-2">
                {question.explanation}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* ボタン */}
      <div className="flex gap-3 justify-end">
        <button
          onClick={onReset}
          className="px-4 py-2 text-sm rounded-[var(--radius-sm)] border border-border text-text-secondary hover:text-text-primary hover:border-border-strong transition-colors cursor-pointer"
        >
          新しいクイズを作成
        </button>
        <button
          onClick={onRetry}
          className="px-4 py-2 text-sm rounded-[var(--radius-sm)] bg-accent text-white hover:bg-accent-hover transition-colors cursor-pointer"
        >
          もう一度解く
        </button>
      </div>
    </div>
  );
}
