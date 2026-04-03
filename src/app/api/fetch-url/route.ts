// URLからページコンテンツ取得API（通常URL・YouTube両対応）
import { NextRequest, NextResponse } from 'next/server';
import { scrapeTextFromUrl } from '@/lib/urlScraper';
import { isYouTubeUrl, fetchYouTubeTranscript } from '@/lib/youtubeFetcher';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { success: false, error: 'URLが指定されていません' },
        { status: 400 }
      );
    }

    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { success: false, error: '有効なURLを指定してください' },
        { status: 400 }
      );
    }

    // YouTube URLは字幕取得、それ以外はHTMLスクレイピング
    if (isYouTubeUrl(url)) {
      const { title, content } = await fetchYouTubeTranscript(url);

      return NextResponse.json({
        success: true,
        title,
        content,
        characterCount: content.length,
        isYouTube: true,
      });
    }

    const { title, content } = await scrapeTextFromUrl(url);

    if (!content || content.length === 0) {
      return NextResponse.json(
        { success: false, error: 'ページからテキストを取得できませんでした' },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      title,
      content,
      characterCount: content.length,
      isYouTube: false,
    });
  } catch (error) {
    console.error('Fetch URL error:', error);
    const message = error instanceof Error ? error.message : 'URLの取得中にエラーが発生しました';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
