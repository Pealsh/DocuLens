// チャットAPIの呼び出し・会話履歴管理フック
'use client';

import { useState, useCallback } from 'react';
import type { ChatMessage } from '@/types/chat';

export function useChat() {
  const [messageList, setMessageList] = useState<ChatMessage[]>([]);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const hasMessages = messageList.length > 0;

  const sendMessage = useCallback(
    async (userQuestion: string, documentText: string) => {
      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: userQuestion,
        timestamp: new Date(),
      };

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isStreaming: true,
      };

      setMessageList((previous) => [...previous, userMessage, assistantMessage]);
      setIsSendingMessage(true);
      setChatError(null);

      try {
        const chatHistory = [...messageList, userMessage].map((message) => ({
          role: message.role,
          content: message.content,
        }));

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documentText, chatHistory, userQuestion }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          if (response.status === 429) {
            throw new Error('APIレート制限に達しました。しばらく待ってから再試行してください。');
          }
          throw new Error(errorData.error || 'チャット応答の取得に失敗しました');
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('ストリーミングレスポンスの読み取りに失敗しました');
        }

        const decoder = new TextDecoder();
        let accumulatedContent = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          accumulatedContent += chunk;

          setMessageList((previous) =>
            previous.map((message) =>
              message.id === assistantMessage.id
                ? { ...message, content: accumulatedContent }
                : message
            )
          );
        }

        // ストリーミング完了
        setMessageList((previous) =>
          previous.map((message) =>
            message.id === assistantMessage.id
              ? { ...message, isStreaming: false }
              : message
          )
        );
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'エラーが発生しました';
        setChatError(errorMessage);

        setMessageList((previous) =>
          previous.map((message) =>
            message.id === assistantMessage.id
              ? { ...message, content: errorMessage, isStreaming: false }
              : message
          )
        );
      } finally {
        setIsSendingMessage(false);
      }
    },
    [messageList]
  );

  const clearMessages = useCallback(() => {
    setMessageList([]);
    setChatError(null);
  }, []);

  return {
    messageList,
    isSendingMessage,
    chatError,
    hasMessages,
    sendMessage,
    clearMessages,
  };
}
