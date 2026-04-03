// メッセージ入力欄
'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isSendingMessage: boolean;
  isDisabled: boolean;
}

export default function ChatInput({ onSendMessage, isSendingMessage, isDisabled }: ChatInputProps) {
  const [inputMessage, setInputMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const canSend = inputMessage.trim().length > 0 && !isSendingMessage && !isDisabled;

  // テキストエリアの高さを内容に合わせて自動調整
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [inputMessage]);

  const handleSendMessage = useCallback(() => {
    const trimmedMessage = inputMessage.trim();
    if (!trimmedMessage || !canSend) return;

    onSendMessage(trimmedMessage);
    setInputMessage('');
  }, [inputMessage, canSend, onSendMessage]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  return (
    <div className="flex items-end gap-2 p-3 border-t border-border bg-bg-primary">
      <textarea
        ref={textareaRef}
        value={inputMessage}
        onChange={(event) => setInputMessage(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={isDisabled ? 'ドキュメントを追加してください...' : 'メッセージを入力... (Shift+Enter で改行)'}
        disabled={isDisabled}
        rows={1}
        className="
          flex-1 px-4 py-2.5
          bg-bg-secondary text-text-primary
          border border-border rounded-[var(--radius-md)]
          placeholder:text-text-muted
          focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent
          resize-none transition-colors duration-[var(--transition-fast)]
          disabled:opacity-50
        "
      />
      <button
        onClick={handleSendMessage}
        disabled={!canSend}
        className={`
          flex-shrink-0 p-2.5
          rounded-[var(--radius-sm)]
          transition-all duration-[var(--transition-fast)]
          cursor-pointer
          ${
            canSend
              ? 'bg-accent text-bg-primary hover:bg-accent-hover'
              : 'bg-bg-tertiary text-text-muted cursor-not-allowed'
          }
        `}
        aria-label="送信"
      >
        {isSendingMessage ? (
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
            <path d="M4 12a8 8 0 018-8" strokeOpacity="0.75" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        )}
      </button>
    </div>
  );
}
