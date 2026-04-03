// 引用箇所ハイライト表示
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SourceHighlightProps {
  text: string;
}

export default function SourceHighlight({ text }: SourceHighlightProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="my-2">
      <button
        onClick={() => setIsExpanded((previous) => !previous)}
        className="
          inline-flex items-center gap-1.5
          text-xs font-medium text-accent
          bg-accent-light/60 px-2.5 py-1
          rounded-[var(--radius-sm)]
          hover:bg-accent-light
          transition-colors duration-[var(--transition-fast)]
          cursor-pointer
        "
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9l6 6 6-6" />
        </svg>
        参照箇所を{isExpanded ? '閉じる' : '表示'}
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="
              mt-2 px-3 py-2
              border-l-2 border-accent
              bg-accent-light/30
              rounded-r-[var(--radius-sm)]
            ">
              <p className="text-xs text-text-secondary leading-relaxed whitespace-pre-wrap font-mono">
                {text}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
