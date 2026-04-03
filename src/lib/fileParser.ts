// PDF・txtファイルのテキスト抽出ロジック
import pdf from 'pdf-parse/lib/pdf-parse.js';

export interface ParseResult {
  text: string;
  pageCount?: number;
}

export async function extractTextFromPdf(buffer: Buffer): Promise<ParseResult> {
  const data = await pdf(buffer);
  return {
    text: data.text.trim(),
    pageCount: data.numpages,
  };
}

export function extractTextFromTxt(buffer: Buffer): ParseResult {
  return {
    text: buffer.toString('utf-8').trim(),
  };
}

/**
 * ファイルのMIMEタイプに応じてテキストを抽出する
 * 対応形式: PDF, テキスト
 */
export async function extractTextFromFile(
  buffer: Buffer,
  mimeType: string
): Promise<ParseResult> {
  switch (mimeType) {
    case 'application/pdf':
      return extractTextFromPdf(buffer);
    case 'text/plain':
      return extractTextFromTxt(buffer);
    default:
      throw new Error(`対応していないファイル形式です: ${mimeType}`);
  }
}
