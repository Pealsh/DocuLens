// ドラッグ&ドロップ対応のファイルアップロードエリア
'use client';

import { useState, useRef, useCallback, type DragEvent, type ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/ui/Button';
import { SUPPORTED_FILE_TYPES, MAX_FILE_SIZE_MB } from '@/lib/constants';

interface UploadAreaProps {
  onFilesSelected: (files: FileList | File[]) => void;
  isUploading: boolean;
  uploadError: string | null;
  onClearError: () => void;
}

export default function UploadArea({
  onFilesSelected,
  isUploading,
  uploadError,
  onClearError,
}: UploadAreaProps) {
  const [isUploadAreaDragging, setIsUploadAreaDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsUploadAreaDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsUploadAreaDragging(false);
  }, []);

  const handleDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      setIsUploadAreaDragging(false);
      onClearError();

      const { files } = event.dataTransfer;
      if (files.length > 0) {
        onFilesSelected(files);
      }
    },
    [onFilesSelected, onClearError]
  );

  const handleFileSelect = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onClearError();
      const { files } = event.target;
      if (files && files.length > 0) {
        onFilesSelected(files);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [onFilesSelected, onClearError]
  );

  const handleClickUploadArea = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className="space-y-3">
      <motion.div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClickUploadArea}
        className={`
          relative cursor-pointer
          border-2 border-dashed rounded-[var(--radius-md)]
          p-8 text-center
          transition-all duration-[var(--transition-fast)]
          ${
            isUploadAreaDragging
              ? 'border-accent bg-accent-light/50 scale-[1.01]'
              : 'border-border hover:border-accent-hover hover:bg-bg-tertiary/50'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={SUPPORTED_FILE_TYPES.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-3">
          <div className={`
            w-12 h-12 rounded-full flex items-center justify-center
            transition-colors duration-[var(--transition-fast)]
            ${isUploadAreaDragging ? 'bg-accent text-bg-primary' : 'bg-bg-tertiary text-text-muted'}
          `}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-text-primary">
              ファイルをドラッグ&ドロップ、またはクリックして選択
            </p>
            <p className="text-xs text-text-muted mt-1">
              対応形式: PDF, TXT / 最大 {MAX_FILE_SIZE_MB}MB / 複数ファイル対応
            </p>
          </div>
        </div>

        {isUploading && (
          <div className="absolute inset-0 bg-bg-primary/60 rounded-[var(--radius-md)] flex items-center justify-center">
            <div className="flex items-center gap-2 text-accent">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                <path d="M4 12a8 8 0 018-8" strokeOpacity="0.75" strokeLinecap="round" />
              </svg>
              <span className="text-sm font-medium">アップロード中...</span>
            </div>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {uploadError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-2 p-3 rounded-[var(--radius-sm)] bg-error/10 border border-error/30"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-error)" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            <p className="text-sm text-error flex-1">{uploadError}</p>
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onClearError(); }}>
              閉じる
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
