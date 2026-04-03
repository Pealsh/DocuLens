// 要約用・チャット用のプロンプトテンプレート

export function buildSummarizePrompt(documentText: string): string {
  return `以下のドキュメントを要約してください。

出力フォーマット（必ずこの構造で出力してください）:

## 概要
3行以内の全体要約を書いてください。

## キーポイント
重要なポイントを箇条書きで書いてください。

## 詳細
セクションごとの詳細要約を書いてください。

---

ドキュメント:
${documentText}`;
}

export function buildChatPrompt(
  documentText: string,
  chatHistory: Array<{ role: string; content: string }>,
  userQuestion: string
): string {
  const formattedHistory = chatHistory
    .map((message) => `${message.role === 'user' ? 'ユーザー' : 'アシスタント'}: ${message.content}`)
    .join('\n');

  return `あなたは以下のドキュメントの内容に基づいて質問に回答するAIアシスタントです。

ルール:
- ドキュメントの内容に基づいて正確に回答してください
- ドキュメントに記載がない情報については「この資料には記載がありません」と回答してください
- 回答の根拠となる箇所がある場合は【参照】として引用してください
- 日本語で回答してください

ドキュメント:
${documentText}

${formattedHistory ? `会話履歴:\n${formattedHistory}\n` : ''}
ユーザーの質問: ${userQuestion}`;
}
