// ドキュメントの型定義

export type DocumentSource = 'file' | 'text' | 'url' | 'youtube';

export interface Document {
  id: string;
  name: string;
  content: string;
  source: DocumentSource;
  characterCount: number;
  createdAt: Date;
  fileType?: string;
  url?: string;
  pageCount?: number;
}
