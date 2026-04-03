// ヘッダー（ロゴ・ダークモード切替）
'use client';

import ThemeToggle from '@/components/ui/ThemeToggle';
import { APP_NAME } from '@/lib/constants';

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg-primary/80 backdrop-blur-md">
      <div className="mx-auto max-w-[960px] px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/logo.svg"
            alt={APP_NAME}
            width={32}
            height={32}
            className="rounded-[var(--radius-sm)]"
          />
          <h1 className="text-xl font-bold text-text-primary tracking-tight">
            {APP_NAME}
          </h1>
          <span className="hidden sm:inline text-xs text-text-muted bg-bg-tertiary px-2 py-0.5 rounded-full">
            AI ドキュメントアシスタント
          </span>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
