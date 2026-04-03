// コピー・再生成ボタン
'use client';

import { useState, useCallback } from 'react';
import Button from '@/components/ui/Button';

interface SummaryActionsProps {
  summaryText: string;
  onRegenerate: () => void;
}

export default function SummaryActions({ summaryText, onRegenerate }: SummaryActionsProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(summaryText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // フォールバック: テキストエリアを使ったコピー
      const textArea = document.createElement('textarea');
      textArea.value = summaryText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  }, [summaryText]);

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="secondary"
        size="sm"
        onClick={handleCopyToClipboard}
        icon={
          isCopied ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
          )
        }
      >
        {isCopied ? 'コピーしました' : 'コピー'}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onRegenerate}
        icon={
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
          </svg>
        }
      >
        再生成
      </Button>
    </div>
  );
}
