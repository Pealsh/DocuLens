// APIリクエスト・レスポンスの型定義

export interface UploadResponse {
  success: boolean;
  fileName: string;
  content: string;
  characterCount: number;
  pageCount?: number;
  error?: string;
}

export interface FetchUrlRequest {
  url: string;
}

export interface FetchUrlResponse {
  success: boolean;
  title: string;
  content: string;
  characterCount: number;
  isYouTube?: boolean;
  error?: string;
}

export interface SummarizeRequest {
  documentText: string;
}

export interface ChatRequest {
  documentText: string;
  chatHistory: Array<{ role: string; content: string }>;
  userQuestion: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  code?: number;
}
