'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { FetchUrlResponse } from '@/types/api';
import type { DocumentSource } from '@/types/document';

interface UnifiedInputProps {
  onTextSubmit: (text: string) => void;
  onUrlFetched: (title: string, content: string, url: string, source: DocumentSource) => void;
}

function detectInputType(value: string): 'url' | 'youtube' | 'text' {
  const trimmed = value.trim();
  if (/youtube\.com|youtu\.be/.test(trimmed)) return 'youtube';
  try {
    const u = new URL(trimmed);
    if (u.protocol === 'http:' || u.protocol === 'https:') return 'url';
  } catch {}
  return 'text';
}

export default function UnifiedInput({ onTextSubmit, onUrlFetched }: UnifiedInputProps) {
  const [value, setValue] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const inputType = detectInputType(value);
  const isUrl = inputType === 'url' || inputType === 'youtube';
  const isYouTube = inputType === 'youtube';
  const canSubmit = value.trim().length > 0 && !isFetching;

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [value]);

  const handleSubmit = useCallback(async () => {
    const trimmed = value.trim();
    if (!trimmed) return;

    if (isUrl) {
      setIsFetching(true);
      setError(null);
      try {
        const res = await fetch('/api/fetch-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: trimmed }),
        });
        const data: FetchUrlResponse = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || 'URLの取得に失敗しました');
        const source: DocumentSource = data.isYouTube ? 'youtube' : 'url';
        onUrlFetched(data.title, data.content, trimmed, source);
        setValue('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'URLの取得中にエラーが発生しました');
      } finally {
        setIsFetching(false);
      }
    } else {
      onTextSubmit(trimmed);
      setValue('');
      setError(null);
    }
  }, [value, isUrl, onTextSubmit, onUrlFetched]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      if (isUrl && !e.shiftKey) {
        e.preventDefault();
        if (canSubmit) handleSubmit();
      } else if (!isUrl && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (canSubmit) handleSubmit();
      }
    }
  }, [isUrl, canSubmit, handleSubmit]);

  return (
    <div className="space-y-2">
      {/* URL/YouTube 検出バッジ */}
      <AnimatePresence>
        {isUrl && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.16 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-sm)] bg-accent-light border border-accent/20 w-fit"
          >
            {isYouTube ? <YouTubeIcon /> : <LinkIcon />}
            <span className="text-xs text-accent font-medium">
              {isYouTube ? 'YouTube動画の字幕を取得します' : 'Webページを取得します'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ChatInput と同じ構造: 角丸ボックス内にテキストエリア + 送信ボタン */}
      <div className="
        flex flex-col gap-2
        rounded-[var(--radius-lg)] border border-border
        bg-bg-primary px-4 pt-3 pb-2
        focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20
        transition-[border-color,box-shadow] duration-150
      ">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => { setValue(e.target.value); setError(null); }}
          onKeyDown={handleKeyDown}
          placeholder="テキストを貼り付け、または URL を入力…"
          rows={1}
          className="
            w-full bg-transparent text-text-primary text-sm
            placeholder:text-text-muted
            focus:outline-none resize-none
            leading-relaxed
          "
        />

        {/* ツールバー行: ヒント + 送信ボタン */}
        <div className="flex items-center justify-between">
          <AnimatePresence mode="wait">
            {error ? (
              <motion.span
                key="error"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-xs text-error"
              >
                {error}
              </motion.span>
            ) : (
              <motion.span
                key="hint"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-xs text-text-muted"
              >
                {isUrl
                  ? 'Enter で取得'
                  : value.length > 0
                  ? `${value.length} 文字 · ⌘Enter で追加`
                  : 'テキストまたは URL を入力'}
              </motion.span>
            )}
          </AnimatePresence>

          <motion.button
            onClick={handleSubmit}
            disabled={!canSubmit}
            whileHover={canSubmit ? { scale: 1.06 } : {}}
            whileTap={canSubmit ? { scale: 0.92 } : {}}
            className={`
              w-8 h-8 flex items-center justify-center
              rounded-full transition-colors duration-150
              ${canSubmit
                ? 'bg-accent text-white cursor-pointer hover:bg-accent-hover'
                : 'bg-bg-tertiary text-text-muted cursor-not-allowed'}
            `}
            aria-label="送信"
          >
            {isFetching ? (
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                <path d="M4 12a8 8 0 018-8" strokeLinecap="round" />
              </svg>
            ) : isUrl ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="19" x2="12" y2="5" />
                <polyline points="5 12 12 5 19 12" />
              </svg>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}

function LinkIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="var(--color-accent)">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}
