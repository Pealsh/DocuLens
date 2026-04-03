// ファイルアップロード・テキスト抽出API
import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromFile } from '@/lib/fileParser';
import { MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB, SUPPORTED_MIME_TYPES } from '@/lib/constants';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'ファイルが見つかりません' },
        { status: 400 }
      );
    }

    if (!SUPPORTED_MIME_TYPES.includes(file.type as (typeof SUPPORTED_MIME_TYPES)[number])) {
      return NextResponse.json(
        { success: false, error: '対応していないファイル形式です。PDF (.pdf) または テキスト (.txt) をアップロードしてください。' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, error: `${MAX_FILE_SIZE_MB}MB以下のファイルをアップロードしてください。` },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const result = await extractTextFromFile(buffer, file.type);

    return NextResponse.json({
      success: true,
      fileName: file.name,
      content: result.text,
      characterCount: result.text.length,
      ...(result.pageCount != null && { pageCount: result.pageCount }),
    });
  } catch (error) {
    console.error('Upload error:', error);
    const message = error instanceof Error ? error.message : 'ファイルの処理中にエラーが発生しました';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
