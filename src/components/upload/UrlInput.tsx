// URL入力フォーム（通常URL・YouTube対応）
'use client';

import { useState, useCallback } from 'react';
import Button from '@/components/ui/Button';
import type { FetchUrlResponse } from '@/types/api';
import type { DocumentSource } from '@/types/document';

interface UrlInputProps {
  onUrlFetched: (title: string, content: string, url: string, source: DocumentSource) => void;
}

function isYouTubeUrl(url: string): boolean {
  return /youtube\.com|youtu\.be/.test(url);
}

export default function UrlInput({ onUrlFetched }: UrlInputProps) {
  const [inputUrl, setInputUrl] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const isValidUrl = useCallback((url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }, []);

  const canSubmit = inputUrl.trim().length > 0 && !isFetching;
  const isCurrentlyYouTube = isYouTubeUrl(inputUrl.trim());

  const handleFetchUrl = useCallback(async () => {
    const trimmedUrl = inputUrl.trim();
    if (!isValidUrl(trimmedUrl)) {
      setFetchError('有効なURLを入力してください。');
      return;
    }

    setIsFetching(true);
    setFetchError(null);

    try {
      const response = await fetch('/api/fetch-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: trimmedUrl }),
      });

      const data: FetchUrlResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'URLの取得に失敗しました');
      }

      const source: DocumentSource = data.isYouTube ? 'youtube' : 'url';
      onUrlFetched(data.title, data.content, trimmedUrl, source);
      setInputUrl('');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'URLの取得中にエラーが発生しました';
      setFetchError(message);
    } finally {
      setIsFetching(false);
    }
  }, [inputUrl, isValidUrl, onUrlFetched]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' && canSubmit) {
        handleFetchUrl();
      }
    },
    [canSubmit, handleFetchUrl]
  );

  return (
    <div className="space-y-3">
      {/* YouTube URL のときにヒントバナーを表示 */}
      {isCurrentlyYouTube && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-[var(--radius-sm)] bg-accent-light border border-accent/30">
          <YouTubeIcon />
          <p className="text-xs text-accent font-medium">
            YouTube動画の字幕を取得して要約・チャットに使用します
          </p>
        </div>
      )}

      <div className="flex gap-2">
        <div className="relative flex-1">
          {isCurrentlyYouTube && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <YouTubeIcon />
            </div>
          )}
          <input
            type="url"
            value={inputUrl}
            onChange={(event) => {
              setInputUrl(event.target.value);
              if (fetchError) setFetchError(null);
            }}
            onKeyDown={handleKeyDown}
            placeholder="https://example.com  または  https://youtube.com/watch?v=..."
            className={`
              w-full py-2.5 pr-4
              bg-bg-primary text-text-primary
              border border-border rounded-[var(--radius-sm)]
              placeholder:text-text-muted
              focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent
              transition-colors duration-[var(--transition-fast)]
              ${isCurrentlyYouTube ? 'pl-9' : 'pl-4'}
            `}
          />
        </div>
        <Button onClick={handleFetchUrl} isLoading={isFetching} disabled={!canSubmit} size="md">
          取得
        </Button>
      </div>

      {fetchError && (
        <p className="text-sm text-error">{fetchError}</p>
      )}
    </div>
  );
}

function YouTubeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--color-accent)">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}
