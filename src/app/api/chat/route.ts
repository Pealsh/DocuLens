// FAQチャット応答API（Gemini呼び出し・ストリーミング対応）
import { NextRequest } from 'next/server';
import { geminiModel } from '@/lib/gemini';
import { buildChatPrompt } from '@/lib/prompts';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { documentText, chatHistory, userQuestion } = body;

    if (!documentText || typeof documentText !== 'string') {
      return new Response(
        JSON.stringify({ success: false, error: 'ドキュメントテキストが指定されていません' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!userQuestion || typeof userQuestion !== 'string') {
      return new Response(
        JSON.stringify({ success: false, error: '質問が指定されていません' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const prompt = buildChatPrompt(
      documentText,
      Array.isArray(chatHistory) ? chatHistory : [],
      userQuestion
    );
    const result = await geminiModel.generateContentStream(prompt);

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              controller.enqueue(new TextEncoder().encode(text));
            }
          }
          controller.close();
        } catch (error) {
          console.error('Chat streaming error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error('Chat error:', error);

    const statusCode = (error as { status?: number })?.status === 429 ? 429 : 500;
    const message =
      statusCode === 429
        ? 'APIレート制限に達しました。しばらく待ってから再試行してください。'
        : 'チャット応答の生成中にエラーが発生しました';

    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: statusCode, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
