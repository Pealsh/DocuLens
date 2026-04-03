// ドキュメント管理フック（追加・削除・一覧）
'use client';

import { useState, useCallback, useMemo } from 'react';
import type { Document, DocumentSource } from '@/types/document';

export function useDocuments() {
  const [documentList, setDocumentList] = useState<Document[]>([]);

  const hasDocuments = documentList.length > 0;

  const combinedDocumentText = useMemo(
    () => documentList.map((document) => document.content).join('\n\n---\n\n'),
    [documentList]
  );

  const addDocument = useCallback(
    (name: string, content: string, source: DocumentSource, options?: { fileType?: string; url?: string; pageCount?: number }) => {
      const newDocument: Document = {
        id: crypto.randomUUID(),
        name,
        content,
        source,
        characterCount: content.length,
        createdAt: new Date(),
        ...options,
      };
      setDocumentList((previous) => [...previous, newDocument]);
      return newDocument;
    },
    []
  );

  const removeDocument = useCallback((documentId: string) => {
    setDocumentList((previous) => previous.filter((document) => document.id !== documentId));
  }, []);

  const clearAllDocuments = useCallback(() => {
    setDocumentList([]);
  }, []);

  return {
    documentList,
    hasDocuments,
    combinedDocumentText,
    addDocument,
    removeDocument,
    clearAllDocuments,
  };
}
