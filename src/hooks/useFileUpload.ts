// ファイルアップロード処理フック
'use client';

import { useState, useCallback } from 'react';
import { MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB, SUPPORTED_MIME_TYPES } from '@/lib/constants';
import type { UploadResponse } from '@/types/api';

interface UseFileUploadOptions {
  onUploadSuccess: (fileName: string, content: string, fileType: string, pageCount?: number) => void;
}

export function useFileUpload({ onUploadSuccess }: UseFileUploadOptions) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const validateFile = useCallback((file: File): string | null => {
    if (!SUPPORTED_MIME_TYPES.includes(file.type as (typeof SUPPORTED_MIME_TYPES)[number])) {
      return '対応していないファイル形式です。PDF (.pdf) または テキスト (.txt) をアップロードしてください。';
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return `${MAX_FILE_SIZE_MB}MB以下のファイルをアップロードしてください。`;
    }
    return null;
  }, []);

  const uploadFile = useCallback(
    async (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setUploadError(validationError);
        return;
      }

      setIsUploading(true);
      setUploadError(null);

      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data: UploadResponse = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'アップロードに失敗しました');
        }

        onUploadSuccess(data.fileName, data.content, file.type, data.pageCount);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'アップロード中にエラーが発生しました';
        setUploadError(message);
      } finally {
        setIsUploading(false);
      }
    },
    [validateFile, onUploadSuccess]
  );

  const uploadMultipleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      for (const file of fileArray) {
        await uploadFile(file);
      }
    },
    [uploadFile]
  );

  const clearUploadError = useCallback(() => {
    setUploadError(null);
  }, []);

  return {
    isUploading,
    uploadError,
    uploadFile,
    uploadMultipleFiles,
    clearUploadError,
  };
}
