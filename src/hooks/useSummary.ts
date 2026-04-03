// 要約APIの呼び出し・状態管理フック
'use client';

import { useState, useCallback } from 'react';

export function useSummary() {
  const [summaryText, setSummaryText] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const hasSummary = summaryText.length > 0;

  const generateSummary = useCallback(async (documentText: string) => {
    setIsSummarizing(true);
    setSummaryError(null);
    setSummaryText('');

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentText }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 429) {
          throw new Error('APIレート制限に達しました。しばらく待ってから再試行してください。');
        }
        throw new Error(errorData.error || '要約の生成に失敗しました');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('ストリーミングレスポンスの読み取りに失敗しました');
      }

      const decoder = new TextDecoder();
      let accumulatedText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;
        setSummaryText(accumulatedText);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '要約の生成中にエラーが発生しました';
      setSummaryError(message);
    } finally {
      setIsSummarizing(false);
    }
  }, []);

  const clearSummary = useCallback(() => {
    setSummaryText('');
    setSummaryError(null);
  }, []);

  return {
    summaryText,
    isSummarizing,
    summaryError,
    hasSummary,
    generateSummary,
    clearSummary,
  };
}
