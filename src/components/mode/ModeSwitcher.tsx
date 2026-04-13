// 要約 ↔ FAQチャット モード切り替えタブ
'use client';

import { motion } from 'framer-motion';
import type { AppMode } from '@/lib/constants';
import { MODE_SUMMARY, MODE_CHAT, MODE_QUIZ } from '@/lib/constants';

// タブインジケーターとコンテンツ切り替えで共有する spring 設定
export const MODE_SWITCH_SPRING = {
  type: 'spring',
  stiffness: 400,
  damping: 30,
  mass: 1,
} as const;

interface ModeSwitcherProps {
  currentMode: AppMode;
  onModeSwitch: (mode: AppMode) => void;
}

const MODE_OPTIONS = [
  { key: MODE_SUMMARY, label: '要約', icon: SummaryIcon },
  { key: MODE_CHAT, label: 'FAQ チャット', icon: ChatIcon },
  { key: MODE_QUIZ, label: 'クイズ', icon: QuizIcon },
] as const;

export default function ModeSwitcher({ currentMode, onModeSwitch }: ModeSwitcherProps) {
  return (
    <div className="relative flex bg-bg-tertiary rounded-[var(--radius-md)] p-1">
      {MODE_OPTIONS.map((option) => {
        const isActive = currentMode === option.key;
        return (
          <button
            key={option.key}
            onClick={() => onModeSwitch(option.key)}
            className={`
              relative z-10 flex-1 flex items-center justify-center gap-2
              py-2.5 px-4 text-sm font-medium
              rounded-[var(--radius-sm)]
              transition-colors duration-[150ms]
              cursor-pointer
              ${isActive ? 'text-accent' : 'text-text-muted hover:text-text-secondary'}
            `}
          >
            <option.icon isActive={isActive} />
            {option.label}
            {isActive && (
              <motion.div
                layoutId="mode-indicator"
                className="absolute inset-0 bg-bg-primary rounded-[var(--radius-sm)] shadow-[var(--shadow-sm)]"
                style={{ zIndex: -1 }}
                transition={MODE_SWITCH_SPRING}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

function SummaryIcon({ isActive }: { isActive: boolean }) {
  return (
    <svg
      width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke={isActive ? 'var(--color-accent)' : 'currentColor'}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    >
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="16" y2="12" />
      <line x1="4" y1="18" x2="12" y2="18" />
    </svg>
  );
}

function ChatIcon({ isActive }: { isActive: boolean }) {
  return (
    <svg
      width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke={isActive ? 'var(--color-accent)' : 'currentColor'}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  );
}

function QuizIcon({ isActive }: { isActive: boolean }) {
  return (
    <svg
      width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke={isActive ? 'var(--color-accent)' : 'currentColor'}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}
