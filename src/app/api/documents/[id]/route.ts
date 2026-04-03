// ドキュメント削除API
import { NextRequest, NextResponse } from 'next/server';

/**
 * クライアントサイドでのドキュメント管理のため、
 * このエンドポイントは将来的なサーバーサイド永続化に備えた
 * プレースホルダーとして機能する
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { success: false, error: 'ドキュメントIDが指定されていません' },
      { status: 400 }
    );
  }

  return NextResponse.json({
    success: true,
    deletedId: id,
  });
}
