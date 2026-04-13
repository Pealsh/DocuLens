// アップロード済みドキュメント一覧
'use client';

import { type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import type { Document } from '@/types/document';

interface DocumentListProps {
  documentList: Document[];
  onRemoveDocument: (documentId: string) => void;
  onClearAllDocuments: () => void;
}

const SOURCE_LABELS: Record<string, string> = {
  file: 'ファイル',
  text: 'テキスト',
  url: 'URL',
  youtube: 'YouTube',
};

function SourceIcon({ source }: { source: string }): ReactNode {
  const commonProps = {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'var(--color-accent)',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  switch (source) {
    case 'file':
      return (
        <svg {...commonProps}>
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      );
    case 'text':
      return (
        <svg {...commonProps}>
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
      );
    case 'url':
      return (
        <svg {...commonProps}>
          <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
        </svg>
      );
    case 'youtube':
      return (
        <svg width={commonProps.width} height={commonProps.height} viewBox="0 0 24 24" fill="var(--color-accent)">
          <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      );
    default:
      return (
        <svg {...commonProps}>
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      );
  }
}

export default function DocumentList({
  documentList,
  onRemoveDocument,
  onClearAllDocuments,
}: DocumentListProps) {
  if (documentList.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-text-secondary">
          登録済みドキュメント ({documentList.length})
        </h3>
        {documentList.length > 1 && (
          <Button variant="ghost" size="sm" onClick={onClearAllDocuments}>
            すべて削除
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {documentList.map((document, index) => (
            <motion.div
              key={document.id}
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: -16, scale: 0.96, transition: { duration: 0.18 } }}
              transition={{
                duration: 0.32,
                ease: [0.22, 1, 0.36, 1],
                delay: index === documentList.length - 1 ? 0 : 0,
              }}
            >
              <Card padding="sm" className="flex items-center gap-3">
                <div className="w-8 h-8 flex-shrink-0 rounded-[var(--radius-sm)] bg-accent-light flex items-center justify-center">
                  <SourceIcon source={document.source} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {document.name}
                  </p>
                  <p className="text-xs text-text-muted">
                    {SOURCE_LABELS[document.source]}
                    {document.pageCount != null && ` · ${document.pageCount}ページ`}
                    {` · ${document.characterCount.toLocaleString()} 文字`}
                  </p>
                </div>
                <button
                  onClick={() => onRemoveDocument(document.id)}
                  className="
                    flex-shrink-0 p-1.5
                    text-text-muted hover:text-error
                    transition-colors duration-[var(--transition-fast)]
                    cursor-pointer
                  "
                  aria-label={`${document.name} を削除`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                  </svg>
                </button>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
