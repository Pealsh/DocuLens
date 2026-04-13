'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isSendingMessage: boolean;
  isDisabled: boolean;
}

export default function ChatInput({ onSendMessage, isSendingMessage, isDisabled }: ChatInputProps) {
  const [inputMessage, setInputMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const canSend = inputMessage.trim().length > 0 && !isSendingMessage && !isDisabled;

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [inputMessage]);

  const handleSend = useCallback(() => {
    const msg = inputMessage.trim();
    if (!msg || !canSend) return;
    onSendMessage(msg);
    setInputMessage('');
  }, [inputMessage, canSend, onSendMessage]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  return (
    <div className="p-3 border-t border-border bg-bg-primary">
      {/* Claude / Gemini 風: 角丸ボックス内にテキストエリア + 送信ボタン */}
      <div className={`
        flex flex-col gap-2
        rounded-[var(--radius-lg)] border
        bg-bg-secondary px-4 pt-3 pb-2
        transition-[border-color,box-shadow] duration-150
        ${isDisabled ? 'opacity-60' : 'border-border focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20'}
      `}>
        <textarea
          ref={textareaRef}
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isDisabled ? 'ドキュメントを追加してください' : 'メッセージを入力…'}
          disabled={isDisabled}
          rows={1}
          className="
            w-full bg-transparent text-text-primary text-sm
            placeholder:text-text-muted
            focus:outline-none resize-none
            leading-relaxed
            disabled:cursor-not-allowed
          "
        />

        {/* ツールバー行: ヒント + 送信ボタン */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-muted select-none">
            {inputMessage.length > 0 ? `${inputMessage.length} 文字 · Shift+Enter で改行` : 'Enter で送信'}
          </span>

          <motion.button
            onClick={handleSend}
            disabled={!canSend}
            whileHover={canSend ? { scale: 1.06 } : {}}
            whileTap={canSend ? { scale: 0.92 } : {}}
            className={`
              w-8 h-8 flex items-center justify-center
              rounded-full transition-colors duration-150
              ${canSend
                ? 'bg-accent text-white cursor-pointer hover:bg-accent-hover'
                : 'bg-bg-tertiary text-text-muted cursor-not-allowed'}
            `}
            aria-label="送信"
          >
            {isSendingMessage ? (
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                <path d="M4 12a8 8 0 018-8" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
