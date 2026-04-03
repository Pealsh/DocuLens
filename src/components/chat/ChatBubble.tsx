// 個別メッセージバブル
'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { ChatMessage } from '@/types/chat';
import SourceHighlight from '@/components/chat/SourceHighlight';

interface ChatBubbleProps {
  message: ChatMessage;
}

export default function ChatBubble({ message }: ChatBubbleProps) {
  const isUserMessage = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex ${isUserMessage ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`
          group relative max-w-[80%] px-4 py-3
          rounded-[var(--radius-md)]
          ${
            isUserMessage
              ? 'bg-accent text-bg-primary rounded-br-sm'
              : 'bg-bg-tertiary text-text-primary rounded-bl-sm'
          }
        `}
      >
        {isUserMessage ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        ) : (
          <AssistantMessageContent content={message.content} isStreaming={message.isStreaming} />
        )}

        {/* コピーボタン: ストリーミング完了後かつ内容がある場合に表示 */}
        {!message.isStreaming && message.content.length > 0 && (
          <CopyButton text={message.content} isUserMessage={isUserMessage} />
        )}
      </div>
    </motion.div>
  );
}

function CopyButton({ text, isUserMessage }: { text: string; isUserMessage: boolean }) {
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
      className={`
        absolute -bottom-3 right-2
        opacity-0 group-hover:opacity-100
        p-1 rounded-[6px]
        transition-all duration-[var(--transition-fast)]
        cursor-pointer
        ${
          isUserMessage
            ? 'bg-accent-hover/80 text-bg-primary hover:bg-accent-hover'
            : 'bg-bg-secondary text-text-muted hover:text-text-primary border border-border'
        }
      `}
      aria-label="コピー"
    >
      {isCopied ? (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
        </svg>
      )}
    </button>
  );
}

function AssistantMessageContent({
  content,
  isStreaming,
}: {
  content: string;
  isStreaming?: boolean;
}) {
  if (!content && isStreaming) {
    return <TypingIndicator />;
  }

  const { segments } = parseAssistantMessage(content);

  return (
    <div className="text-sm leading-relaxed space-y-1">
      {segments.map((segment, index) => {
        if (segment.type === 'reference') {
          return <SourceHighlight key={index} text={segment.text} />;
        }
        return (
          <span key={index} className="whitespace-pre-wrap">
            {segment.text}
          </span>
        );
      })}
      {isStreaming && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          className="inline-block w-1.5 h-4 bg-accent ml-0.5 align-text-bottom"
        />
      )}
    </div>
  );
}

/**
 * AI回答内の【参照】部分を識別してセグメントに分割する
 */
function parseAssistantMessage(content: string): {
  segments: Array<{ type: 'text' | 'reference'; text: string }>;
} {
  const referencePattern = /【参照】([\s\S]*?)(?=【参照】|$)/g;
  const segments: Array<{ type: 'text' | 'reference'; text: string }> = [];

  let lastIndex = 0;
  let match;

  while ((match = referencePattern.exec(content)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', text: content.slice(lastIndex, match.index) });
    }
    segments.push({ type: 'reference', text: match[1].trim() });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    segments.push({ type: 'text', text: content.slice(lastIndex) });
  }

  if (segments.length === 0) {
    segments.push({ type: 'text', text: content });
  }

  return { segments };
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 py-1">
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          animate={{ y: [0, -4, 0] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: index * 0.15,
          }}
          className="w-2 h-2 rounded-full bg-text-muted"
        />
      ))}
    </div>
  );
}
