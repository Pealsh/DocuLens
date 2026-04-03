// YouTube動画の字幕テキスト取得ロジック
import { YoutubeTranscript } from 'youtube-transcript';

export interface YouTubeResult {
  videoId: string;
  title: string;
  content: string;
}

/**
 * YouTube URL から動画IDを抽出する
 * 対応形式:
 *   - https://www.youtube.com/watch?v=XXXX
 *   - https://youtu.be/XXXX
 *   - https://www.youtube.com/shorts/XXXX
 */
export function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /[?&]v=([^&#]+)/,
    /youtu\.be\/([^?&#]+)/,
    /\/shorts\/([^?&#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

export function isYouTubeUrl(url: string): boolean {
  return /youtube\.com|youtu\.be/.test(url);
}

/**
 * 動画タイトルをoEmbed APIで取得する（APIキー不要）
 */
async function fetchYouTubeTitle(videoId: string): Promise<string> {
  try {
    const response = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
    );
    if (!response.ok) return `YouTube動画 (${videoId})`;
    const data = await response.json();
    return data.title ?? `YouTube動画 (${videoId})`;
  } catch {
    return `YouTube動画 (${videoId})`;
  }
}

/**
 * YouTube動画の字幕を取得してテキストに変換する
 * 字幕が存在しない場合はエラーをスロー
 */
export async function fetchYouTubeTranscript(url: string): Promise<YouTubeResult> {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) {
    throw new Error('YouTubeのURLから動画IDを取得できませんでした');
  }

  let transcriptItems;
  try {
    transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);
  } catch {
    throw new Error(
      'この動画の字幕を取得できませんでした。字幕が無効になっているか、非公開動画の可能性があります。'
    );
  }

  if (!transcriptItems || transcriptItems.length === 0) {
    throw new Error('この動画には字幕が設定されていません。');
  }

  // 字幕テキストを結合して読みやすいテキストに整形
  const content = transcriptItems
    .map((item) => item.text.trim())
    .filter((text) => text.length > 0)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

  const title = await fetchYouTubeTitle(videoId);

  return { videoId, title, content };
}
