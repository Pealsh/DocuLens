'use client';

import { AnimatePresence, motion } from 'framer-motion';
import type { QuizQuestion as QuizQuestionType } from '@/types/quiz';

const OPTION_LABELS = ['A', 'B', 'C', 'D'] as const;

const FLIP = {
  enter: { opacity: 0, rotateY: -90, scale: 0.97 },
  center: { opacity: 1, rotateY: 0, scale: 1 },
  exit: { opacity: 0, rotateY: 90, scale: 0.97 },
};

interface QuizCardProps {
  question: QuizQuestionType;
  isFlipped: boolean;
  selectedIndex: number | null;
  onSelect: (index: number) => void;
}

export default function QuizCard({ question, isFlipped, selectedIndex, onSelect }: QuizCardProps) {
  const isCorrect = selectedIndex === question.correctIndex;

  return (
    <div style={{ perspective: '1200px' }}>
      <AnimatePresence mode="wait" initial={false}>
        {!isFlipped ? (
          /* 表面 - 問題 + 選択肢 */
          <motion.div
            key="front"
            variants={FLIP}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="rounded-[var(--radius-lg)] border border-border bg-bg-secondary p-6 flex flex-col gap-5 min-h-[380px]">
              <p className="text-text-primary font-medium text-base leading-relaxed flex-1">
                {question.question}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {question.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => onSelect(index)}
                    className="
                      flex items-center gap-3 px-4 py-3
                      rounded-[var(--radius-md)] border border-border
                      bg-bg-primary text-left text-sm text-text-primary
                      hover:border-accent hover:bg-accent-light
                      active:scale-[0.98]
                      transition-all duration-150 cursor-pointer
                    "
                  >
                    <span className="
                      flex-shrink-0 w-6 h-6 rounded-full
                      border border-border-strong
                      text-xs font-bold flex items-center justify-center
                      text-text-muted
                    ">
                      {OPTION_LABELS[index]}
                    </span>
                    <span className="leading-snug">{option}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          /* 裏面 - 正誤 + 解説 */
          <motion.div
            key="back"
            variants={FLIP}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className={`
              rounded-[var(--radius-lg)] border p-6 flex flex-col gap-4 min-h-[380px]
              ${isCorrect
                ? 'border-success/40 bg-success/5'
                : 'border-error/40 bg-error/5'}
            `}>
              {/* 正誤バッジ */}
              <div className="flex items-center gap-2">
                {isCorrect ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="9 12 11 14 15 10" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-error)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                )}
                <span className={`font-bold text-base ${isCorrect ? 'text-success' : 'text-error'}`}>
                  {isCorrect ? '正解' : '不正解'}
                </span>
              </div>

              {/* 選択肢一覧 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1">
                {question.options.map((option, index) => {
                  const isCorrectOption = index === question.correctIndex;
                  const isChosen = selectedIndex === index;
                  const isWrong = isChosen && !isCorrectOption;

                  return (
                    <div
                      key={index}
                      className={`
                        flex items-center gap-3 px-4 py-3
                        rounded-[var(--radius-md)] border text-sm
                        ${isCorrectOption ? 'border-success/50 bg-success/10 text-success font-medium' : ''}
                        ${isWrong ? 'border-error/50 bg-error/10 text-error' : ''}
                        ${!isCorrectOption && !isWrong ? 'border-border bg-bg-primary/40 text-text-muted opacity-50' : ''}
                      `}
                    >
                      <span className={`
                        flex-shrink-0 w-6 h-6 rounded-full border
                        text-xs font-bold flex items-center justify-center
                        ${isCorrectOption ? 'border-success text-success' : ''}
                        ${isWrong ? 'border-error text-error' : ''}
                        ${!isCorrectOption && !isWrong ? 'border-border text-text-muted' : ''}
                      `}>
                        {OPTION_LABELS[index]}
                      </span>
                      <span className="flex-1 leading-snug">{option}</span>
                      {isCorrectOption && (
                        <svg className="flex-shrink-0" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                      {isWrong && (
                        <svg className="flex-shrink-0" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* 解説 */}
              <div className="border-t border-border pt-3">
                <p className="text-text-secondary text-sm leading-relaxed">
                  {question.explanation}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
