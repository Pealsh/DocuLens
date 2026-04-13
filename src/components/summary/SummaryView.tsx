// 要約結果の表示コンポーネント
'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Card from '@/components/ui/Card';
import { SkeletonText } from '@/components/ui/Skeleton';
import SummaryActions from '@/components/summary/SummaryActions';

interface SummaryViewProps {
  summaryText: string;
  isSummarizing: boolean;
  summaryError: string | null;
  hasSummary: boolean;
  hasDocuments: boolean;
  onGenerateSummary: () => void;
  onRegenerate: () => void;
}

export default function SummaryView({
  summaryText,
  isSummarizing,
  summaryError,
  hasSummary,
  hasDocuments,
  onGenerateSummary,
  onRegenerate,
}: SummaryViewProps) {
  if (!hasDocuments) {
    return (
      <EmptyState message="ドキュメントを追加すると、ここに要約が表示されます。" />
    );
  }

  if (summaryError) {
    return (
      <Card>
        <div className="text-center py-6 space-y-3">
          <p className="text-error text-sm">{summaryError}</p>
          <button
            onClick={onGenerateSummary}
            className="text-sm text-accent hover:underline cursor-pointer"
          >
            再試行する
          </button>
        </div>
      </Card>
    );
  }

  if (!hasSummary && !isSummarizing) {
    return (
      <Card>
        <div className="text-center py-8 space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-accent-light flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="16" y2="12" />
              <line x1="4" y1="18" x2="12" y2="18" />
            </svg>
          </div>
          <div>
            <p className="text-text-primary font-medium">要約を生成</p>
            <p className="text-text-muted text-sm mt-1">
              登録済みドキュメントの要約をAIが作成します
            </p>
          </div>
          <button
            onClick={onGenerateSummary}
            className="
              inline-flex items-center gap-2
              px-6 py-2.5 bg-accent text-bg-primary
              rounded-[var(--radius-sm)] font-medium text-sm
              hover:bg-accent-hover transition-colors cursor-pointer
            "
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            要約を生成する
          </button>
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {hasSummary && (
        <SummaryActions summaryText={summaryText} onRegenerate={onRegenerate} />
      )}

      <Card padding="lg">
        {isSummarizing && !summaryText ? (
          <SkeletonText lines={8} />
        ) : (
          <div className="prose-custom relative group">
            <SummaryContent text={summaryText} />
            {isSummarizing && <TypingCursor />}

            {/* 要約テキスト上のインラインコピーボタン */}
            {!isSummarizing && summaryText.length > 0 && (
              <InlineCopyButton text={summaryText} />
            )}
          </div>
        )}
      </Card>
    </motion.div>
  );
}

function InlineCopyButton({ text }: { text: string }) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1500);
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className="
        absolute top-0 right-0
        opacity-0 group-hover:opacity-100
        flex items-center gap-1.5 px-2.5 py-1.5
        rounded-[var(--radius-sm)]
        bg-bg-tertiary text-text-muted hover:text-text-primary
        border border-border
        text-xs font-medium
        transition-all duration-[var(--transition-fast)]
        cursor-pointer
      "
      aria-label="要約をコピー"
    >
      {isCopied ? (
        <>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          コピー済み
        </>
      ) : (
        <>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
          </svg>
          コピー
        </>
      )}
    </button>
  );
}

/**
 * インラインMarkdown（**太字**、*斜体*、`コード`）をReact要素に変換する
 * ネストしたパターンには対応せず、要約出力で頻出する書式に特化
 */
function renderInlineMarkdown(text: string): React.ReactNode[] {
  const pattern = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      elements.push(text.slice(lastIndex, match.index));
    }

    if (match[2]) {
      elements.push(
        <strong key={match.index} className="font-bold text-text-primary">
          {match[2]}
        </strong>
      );
    } else if (match[3]) {
      elements.push(
        <em key={match.index} className="italic">
          {match[3]}
        </em>
      );
    } else if (match[4]) {
      elements.push(
        <code key={match.index} className="px-1.5 py-0.5 rounded bg-bg-tertiary font-mono text-xs">
          {match[4]}
        </code>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    elements.push(text.slice(lastIndex));
  }

  return elements.length > 0 ? elements : [text];
}

function SummaryContent({ text }: { text: string }) {
  const lines = text.split('\n');

  // 連続する箇条書き行をグループ化してまとめて <ul> で出力する
  type Block =
    | { type: 'h2'; content: string; key: number }
    | { type: 'h3'; content: string; key: number }
    | { type: 'hr'; key: number }
    | { type: 'p'; content: string; key: number }
    | { type: 'ul'; items: { content: string; key: number }[] };

  const blocks: Block[] = [];
  let ulBuffer: { content: string; key: number }[] = [];

  const flushUl = () => {
    if (ulBuffer.length > 0) {
      blocks.push({ type: 'ul', items: [...ulBuffer] });
      ulBuffer = [];
    }
  };

  lines.forEach((line, index) => {
    const t = line.trim();
    if (!t) { flushUl(); return; }

    if (t.startsWith('## ')) {
      flushUl();
      blocks.push({ type: 'h2', content: t.slice(3), key: index });
    } else if (t.startsWith('### ')) {
      flushUl();
      blocks.push({ type: 'h3', content: t.slice(4), key: index });
    } else if (t === '---') {
      flushUl();
      blocks.push({ type: 'hr', key: index });
    } else if (t.startsWith('- ') || t.startsWith('* ')) {
      ulBuffer.push({ content: t.slice(2), key: index });
    } else {
      flushUl();
      blocks.push({ type: 'p', content: t, key: index });
    }
  });
  flushUl();

  return (
    <div className="space-y-1">
      {blocks.map((block, bi) => {
        if (block.type === 'h2') {
          return (
            <div key={block.key} className={`${bi > 0 ? 'pt-5' : ''}`}>
              <h3 className="
                flex items-center gap-2.5
                text-base font-bold text-text-primary
                pb-2 mb-1
                border-b border-border
              ">
                <span className="inline-block w-1 h-5 rounded-full bg-accent flex-shrink-0" />
                {renderInlineMarkdown(block.content)}
              </h3>
            </div>
          );
        }

        if (block.type === 'h3') {
          return (
            <h4 key={block.key} className="text-sm font-semibold text-text-secondary mt-3 mb-0.5 pl-3">
              {renderInlineMarkdown(block.content)}
            </h4>
          );
        }

        if (block.type === 'hr') {
          return <hr key={block.key} className="border-border my-3" />;
        }

        if (block.type === 'ul') {
          return (
            <ul key={`ul-${bi}`} className="space-y-1.5 pl-3 mt-1">
              {block.items.map((item) => (
                <li key={item.key} className="flex items-baseline gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0 mt-[0.4em]" />
                  <span className="text-text-primary text-sm leading-relaxed">
                    {renderInlineMarkdown(item.content)}
                  </span>
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p key={block.key} className="text-text-secondary text-sm leading-relaxed pl-3">
            {renderInlineMarkdown(block.content)}
          </p>
        );
      })}
    </div>
  );
}

function TypingCursor() {
  return (
    <motion.span
      animate={{ opacity: [1, 0] }}
      transition={{ duration: 0.8, repeat: Infinity }}
      className="inline-block w-2 h-5 bg-accent ml-0.5 align-text-bottom"
    />
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <Card>
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto rounded-full bg-bg-tertiary flex items-center justify-center mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        </div>
        <p className="text-text-muted text-sm">{message}</p>
      </div>
    </Card>
  );
}
