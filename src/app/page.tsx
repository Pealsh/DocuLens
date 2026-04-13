// Main page (mode switching)
'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import UploadArea from '@/components/upload/UploadArea';
import TextInput from '@/components/upload/TextInput';
import UrlInput from '@/components/upload/UrlInput';
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

type InputMethod = 'file' | 'text' | 'url';

const MODE_ORDER: AppMode[] = [MODE_SUMMARY, MODE_CHAT, MODE_QUIZ];

/**
 * スライド方向を決定する（モードの並び順に基づく）
 */
function getSlideDirection(from: AppMode, to: AppMode): number {
  const fromIndex = MODE_ORDER.indexOf(from);
  const toIndex = MODE_ORDER.indexOf(to);
  if (fromIndex < toIndex) return 1;
  if (fromIndex > toIndex) return -1;
  return 0;
}

const SLIDE_OFFSET = 60;

// tween + easeInOut でバウンスなし・スッと滑らかに切り替わる
const CONTENT_TRANSITION = {
  type: 'tween',
  duration: 0.25,
  ease: [0.4, 0, 0.2, 1],
} as const;

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

  const {
    summaryText,
    isSummarizing,
    summaryError,
    hasSummary,
    generateSummary,
    clearSummary,
  } = useSummary();

  const {
    messageList,
    isSendingMessage,
    sendMessage,
    clearMessages,
  } = useChat();

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
    if (hasDocuments) {
      generateSummary(combinedDocumentText);
    }
  }, [hasDocuments, combinedDocumentText, generateSummary]);

  const handleRegenerateSummary = useCallback(() => {
    clearSummary();
    if (hasDocuments) {
      generateSummary(combinedDocumentText);
    }
  }, [hasDocuments, combinedDocumentText, generateSummary, clearSummary]);

  const handleSendChatMessage = useCallback(
    (message: string) => {
      sendMessage(message, combinedDocumentText);
    },
    [sendMessage, combinedDocumentText]
  );

  const handleModeSwitch = useCallback((mode: AppMode) => {
    setCurrentMode((previous) => {
      previousModeRef.current = previous;
      return mode;
    });
  }, []);

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-[960px] px-4 py-8 space-y-8">
          {/* Document input section */}
          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-text-primary">
                ドキュメントを追加
              </h2>
              <p className="text-sm text-text-secondary mt-1">
                テキスト・ファイル・URLからドキュメントを追加できます
              </p>
            </div>

            {/* Input method tabs */}
            <div className="flex gap-1 bg-bg-tertiary rounded-[var(--radius-sm)] p-1 w-fit">
              {INPUT_METHOD_OPTIONS.map((option) => (
                <button
                  key={option.key}
                  onClick={() => setActiveInputMethod(option.key)}
                  className={`
                    px-3 py-1.5 text-sm font-medium rounded-[6px]
                    transition-all duration-[var(--transition-fast)]
                    cursor-pointer
                    ${
                      activeInputMethod === option.key
                        ? 'bg-bg-primary text-text-primary shadow-[var(--shadow-sm)]'
                        : 'text-text-muted hover:text-text-secondary'
                    }
                  `}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {/* 入力エリア */}
            <Card>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeInputMethod}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeInputMethod === 'file' && (
                    <UploadArea
                      onFilesSelected={uploadMultipleFiles}
                      isUploading={isUploading}
                      uploadError={uploadError}
                      onClearError={clearUploadError}
                    />
                  )}
                  {activeInputMethod === 'text' && (
                    <TextInput onTextSubmit={handleTextSubmit} />
                  )}
                  {activeInputMethod === 'url' && (
                    <UrlInput onUrlFetched={handleUrlFetched} />
                  )}
                </motion.div>
              </AnimatePresence>
            </Card>

            {/* ドキュメント一覧 */}
            <DocumentList
              documentList={documentList}
              onRemoveDocument={removeDocument}
              onClearAllDocuments={clearAllDocuments}
            />
          </section>

          {/* Mode switcher */}
          <section className="space-y-4">
            <ModeSwitcher currentMode={currentMode} onModeSwitch={handleModeSwitch} />

            {/* Mode content - horizontal slide animation */}
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
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}

const INPUT_METHOD_OPTIONS: Array<{ key: InputMethod; label: string }> = [
  { key: 'file', label: 'ファイル' },
  { key: 'text', label: 'テキスト' },
  { key: 'url', label: 'URL' },
];
