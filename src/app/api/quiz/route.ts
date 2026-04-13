import { NextRequest } from 'next/server';
import { geminiModel } from '@/lib/gemini';
import { buildQuizPrompt } from '@/lib/prompts';
import type { Quiz } from '@/types/quiz';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { documentText, questionCount = 5 } = body;

    if (!documentText || typeof documentText !== 'string') {
      return new Response(
        JSON.stringify({ success: false, error: 'ドキュメントテキストが指定されていません' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const prompt = buildQuizPrompt(documentText, questionCount);
    const result = await geminiModel.generateContent(prompt);
    const rawText = result.response.text().trim();

    // Gemini が ```json ... ``` で囲んで返すケースに対応
    const jsonText = rawText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/, '')
      .trim();

    let quiz: Quiz;
    try {
      quiz = JSON.parse(jsonText);
    } catch {
      console.error('Quiz JSON parse error. Raw response:', rawText);
      return new Response(
        JSON.stringify({ success: false, error: 'クイズの生成に失敗しました。もう一度お試しください。' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!quiz.questions || !Array.isArray(quiz.questions) || quiz.questions.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'クイズの形式が正しくありません。もう一度お試しください。' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, quiz }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Quiz generation error:', error);

    const statusCode = (error as { status?: number })?.status === 429 ? 429 : 500;
    const message =
      statusCode === 429
        ? 'APIレート制限に達しました。しばらく待ってから再試行してください。'
        : 'クイズの生成中にエラーが発生しました';

    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: statusCode, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
