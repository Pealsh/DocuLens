// チャットメッセージの型定義

export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export interface SourceReference {
  text: string;
  startIndex: number;
  endIndex: number;
}
