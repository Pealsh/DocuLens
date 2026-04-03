// URLからテキスト取得ロジック（cheerioによるHTML解析）
import * as cheerio from 'cheerio';

/**
 * 不要なHTML要素（ナビゲーション、フッター等）を除外し、
 * 本文テキストのみを抽出する
 */
export async function scrapeTextFromUrl(
  url: string
): Promise<{ title: string; content: string }> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; DocuLens/1.0)',
    },
  });

  if (!response.ok) {
    throw new Error(`URLの取得に失敗しました (HTTP ${response.status})`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  // 不要な要素を除去
  $('script, style, nav, header, footer, aside, iframe, noscript, svg').remove();
  $('[role="navigation"], [role="banner"], [role="contentinfo"]').remove();

  const title = $('title').text().trim() || $('h1').first().text().trim() || 'Untitled';

  // 本文テキストを抽出（article > main > body の優先順位）
  let content = '';
  const articleElement = $('article');
  const mainElement = $('main');

  if (articleElement.length > 0) {
    content = articleElement.text();
  } else if (mainElement.length > 0) {
    content = mainElement.text();
  } else {
    content = $('body').text();
  }

  // 連続する空白・改行を整理
  content = content
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .trim();

  return { title, content };
}
