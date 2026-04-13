// アプリケーション全体の定数定義

export const MAX_FILE_SIZE_MB = 10;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export const SUPPORTED_FILE_TYPES = ['.pdf', '.txt'] as const;
export const SUPPORTED_MIME_TYPES = [
  'application/pdf',
  'text/plain',
] as const;

export const APP_NAME = 'DocuLens';
export const APP_DESCRIPTION = 'AI ドキュメントアシスタント - 要約 & FAQ チャット';


export const MAX_DOCUMENT_TEXT_LENGTH = 100_000;

export const STREAMING_CHUNK_DELAY_MS = 10;

export const MODE_SUMMARY = 'summary' as const;
export const MODE_CHAT = 'chat' as const;
export const MODE_QUIZ = 'quiz' as const;

export type AppMode = typeof MODE_SUMMARY | typeof MODE_CHAT | typeof MODE_QUIZ;
