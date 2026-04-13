// Main page
'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import UploadArea from '@/components/upload/UploadArea';
import UnifiedInput from '@/components/upload/UnifiedInput';
import DocumentList from '@/components/upload/DocumentList';
import ModeSwitcher from '@/components/mode/ModeSwitcher';
import SummaryView from '@/components/summary/SummaryView';
import ChatWindow from '@/components/chat/ChatWindow';
import QuizView from '@/components/quiz/QuizView';
import Card from '@/components/ui/Card';
import { useDocuments } from '@/hooks/useDocuments';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useSummary } from '@/hooks/useSummary';
import { useChat } from '@/hooks/useChat';
import { MODE_SUMMARY, MODE_CHAT, MODE_QUIZ, type AppMode } from '@/lib/constants';

type InputMethod = 'file' | 'unified';

const MODE_ORDER: AppMode[] = [MODE_SUMMARY, MODE_CHAT, MODE_QUIZ];

function getSlideDirection(from: AppMode, to: AppMode): number {
  const fi = MODE_ORDER.indexOf(from);
  const ti = MODE_ORDER.indexOf(to);
  if (fi < ti) return 1;
  if (fi > ti) return -1;
  return 0;
}

const SLIDE_OFFSET = 48;

const CONTENT_TRANSITION = {
  type: 'tween',
  duration: 0.28,
  ease: 'easeInOut',
} as const;

// セクション入場アニメーション（ease は cubicBezier 文字列で指定）
const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: 'easeOut' as const, delay: i * 0.1 },
  }),
};

export default function HomePage() {
  const [currentMode, setCurrentMode] = useState<AppMode>(MODE_SUMMARY);
  const [activeInputMethod, setActiveInputMethod] = useState<InputMethod>('file');
  const previousModeRef = useRef<AppMode>(MODE_SUMMARY);
  const slideDirection = getSlideDirection(previousModeRef.current, currentMode);

  const {
    documentList,
    hasDocuments,
    combinedDocumentText,
    addDocument,
    removeDocument,
    clearAllDocuments,
  } = useDocuments();

  const handleUploadSuccess = useCallback(
    (fileName: string, content: string, fileType: string, pageCount?: number) => {
      addDocument(fileName, content, 'file', { fileType, pageCount });
    },
    [addDocument]
  );

  const { isUploading, uploadError, uploadMultipleFiles, clearUploadError } = useFileUpload({
    onUploadSuccess: handleUploadSuccess,
  });

  const { summaryText, isSummarizing, summaryError, hasSummary, generateSummary, clearSummary } = useSummary();
  const { messageList, isSendingMessage, sendMessage, clearMessages } = useChat();

  const handleTextSubmit = useCallback(
    (text: string) => {
      const name = `テキスト入力 ${new Date().toLocaleTimeString('ja-JP')}`;
      addDocument(name, text, 'text');
    },
    [addDocument]
  );

  const handleUrlFetched = useCallback(
    (title: string, content: string, url: string, source: import('@/types/document').DocumentSource) => {
      addDocument(title, content, source, { url });
    },
    [addDocument]
  );

  const handleGenerateSummary = useCallback(() => {
    if (hasDocuments) generateSummary(combinedDocumentText);
  }, [hasDocuments, combinedDocumentText, generateSummary]);

  const handleRegenerateSummary = useCallback(() => {
    clearSummary();
    if (hasDocuments) generateSummary(combinedDocumentText);
  }, [hasDocuments, combinedDocumentText, generateSummary, clearSummary]);

  const handleSendChatMessage = useCallback(
    (message: string) => sendMessage(message, combinedDocumentText),
    [sendMessage, combinedDocumentText]
  );

  const handleModeSwitch = useCallback((mode: AppMode) => {
    setCurrentMode((prev) => {
      previousModeRef.current = prev;
      return mode;
    });
  }, []);

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-[960px] px-4 py-10 space-y-10">

          {/* ドキュメント入力セクション */}
          <motion.section
            custom={0}
            initial="hidden"
            animate="visible"
            variants={sectionVariants}
            className="space-y-4"
          >
            <div>
              <h2 className="text-lg font-bold text-text-primary tracking-tight">
                ドキュメントを追加
              </h2>
              <p className="text-sm text-text-secondary mt-0.5">
                ファイル・テキスト・URL・YouTube に対応
              </p>
            </div>

            {/* 2タブ: ファイル / テキスト・URL */}
            <div className="relative flex gap-0.5 bg-bg-tertiary rounded-[var(--radius-sm)] p-1 w-fit">
              {INPUT_TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveInputMethod(tab.key)}
                  className={`
                    relative z-10 px-4 py-1.5 text-sm font-medium rounded-[6px]
                    transition-colors duration-150 cursor-pointer
                    ${activeInputMethod === tab.key ? 'text-text-primary' : 'text-text-muted hover:text-text-secondary'}
                  `}
                >
                  {activeInputMethod === tab.key && (
                    <motion.span
                      layoutId="input-tab-indicator"
                      className="absolute inset-0 bg-bg-primary rounded-[6px] shadow-[var(--shadow-sm)]"
                      style={{ zIndex: -1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  {tab.label}
                </button>
              ))}
            </div>

            <Card>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={activeInputMethod}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.22, ease: [0.32, 0, 0.14, 1] }}
                >
                  {activeInputMethod === 'file' ? (
                    <UploadArea
                      onFilesSelected={uploadMultipleFiles}
                      isUploading={isUploading}
                      uploadError={uploadError}
                      onClearError={clearUploadError}
                    />
                  ) : (
                    <UnifiedInput
                      onTextSubmit={handleTextSubmit}
                      onUrlFetched={handleUrlFetched}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </Card>

            <DocumentList
              documentList={documentList}
              onRemoveDocument={removeDocument}
              onClearAllDocuments={clearAllDocuments}
            />
          </motion.section>

          {/* モード切り替え + コンテンツ */}
          <motion.section
            custom={1}
            initial="hidden"
            animate="visible"
            variants={sectionVariants}
            className="space-y-4"
          >
            <ModeSwitcher currentMode={currentMode} onModeSwitch={handleModeSwitch} />

            <div className="overflow-hidden">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={currentMode}
                  initial={{ opacity: 0, x: slideDirection * SLIDE_OFFSET }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: slideDirection * -SLIDE_OFFSET }}
                  transition={CONTENT_TRANSITION}
                >
                  {currentMode === MODE_SUMMARY && (
                    <SummaryView
                      summaryText={summaryText}
                      isSummarizing={isSummarizing}
                      summaryError={summaryError}
                      hasSummary={hasSummary}
                      hasDocuments={hasDocuments}
                      onGenerateSummary={handleGenerateSummary}
                      onRegenerate={handleRegenerateSummary}
                    />
                  )}
                  {currentMode === MODE_CHAT && (
                    <ChatWindow
                      messageList={messageList}
                      isSendingMessage={isSendingMessage}
                      hasDocuments={hasDocuments}
                      onSendMessage={handleSendChatMessage}
                      onClearMessages={clearMessages}
                    />
                  )}
                  {currentMode === MODE_QUIZ && (
                    <QuizView
                      hasDocuments={hasDocuments}
                      combinedDocumentText={combinedDocumentText}
                      documentCount={documentList.length}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.section>

        </div>
      </main>
      <Footer />
    </>
  );
}

const INPUT_TABS: Array<{ key: InputMethod; label: string }> = [
  { key: 'file', label: 'ファイル' },
  { key: 'unified', label: 'テキスト・URL' },
];
