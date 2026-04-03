// 共通カードコンポーネント
'use client';

import { motion } from 'framer-motion';
import { type ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  isHoverable?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}

const PADDING_STYLES = {
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export default function Card({
  children,
  className = '',
  isHoverable = false,
  padding = 'md',
}: CardProps) {
  return (
    <motion.div
      whileHover={isHoverable ? { y: -2, boxShadow: 'var(--shadow-lg)' } : undefined}
      className={`
        bg-bg-secondary border border-border
        rounded-[var(--radius-md)]
        shadow-[var(--shadow-sm)]
        transition-shadow duration-[var(--transition-normal)]
        ${PADDING_STYLES[padding]}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}
