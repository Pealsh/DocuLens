// チャットメッセージ一覧
'use client';

import { useRef, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Card from '@/components/ui/Card';
import ChatBubble from '@/components/chat/ChatBubble';
import ChatInput from '@/components/chat/ChatInput';
import type { ChatMessage } from '@/types/chat';

interface ChatWindowProps {
  messageList: ChatMessage[];
  isSendingMessage: boolean;
  hasDocuments: boolean;
  onSendMessage: (message: string) => void;
  onClearMessages: () => void;
}

export default function ChatWindow({
  messageList,
  isSendingMessage,
  hasDocuments,
  onSendMessage,
  onClearMessages,
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 新しいメッセージが追加されたら自動スクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messageList]);

  return (
    <Card padding="sm" className="flex flex-col h-[500px]">
      {/* ヘッダー */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <span className="text-sm font-medium text-text-secondary">
          FAQ チャット
        </span>
        {messageList.length > 0 && (
          <button
            onClick={onClearMessages}
            className="text-xs text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
          >
            履歴をクリア
          </button>
        )}
      </div>

      {/* メッセージ一覧 */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3">
        {messageList.length === 0 ? (
          <ChatEmptyState hasDocuments={hasDocuments} />
        ) : (
          <AnimatePresence>
            {messageList.map((message) => (
              <ChatBubble key={message.id} message={message} />
            ))}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 入力欄 */}
      <ChatInput
        onSendMessage={onSendMessage}
        isSendingMessage={isSendingMessage}
        isDisabled={!hasDocuments}
      />
    </Card>
  );
}

function ChatEmptyState({ hasDocuments }: { hasDocuments: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center gap-3">
      <div className="w-14 h-14 rounded-full bg-accent-light flex items-center justify-center">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
        </svg>
      </div>
      <div>
        <p className="text-text-primary font-medium text-sm">
          {hasDocuments
            ? 'ドキュメントについて質問してみましょう'
            : 'まずドキュメントを追加してください'}
        </p>
        <p className="text-text-muted text-xs mt-1">
          {hasDocuments
            ? 'AIがドキュメントの内容に基づいて回答します'
            : 'テキスト・ファイル・URLからドキュメントを追加できます'}
        </p>
      </div>
    </div>
  );
}
