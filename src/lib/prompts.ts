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

export function buildQuizPrompt(documentText: string, questionCount: number = 5): string {
  return `以下のドキュメントの内容を理解しているか確認するための4択クイズを${questionCount}問作成してください。

必ず以下のJSON形式のみで回答してください。JSON以外のテキスト（説明文・マークダウンのコードブロック等）は一切含めないでください。

{
  "questions": [
    {
      "id": "q1",
      "question": "問題文をここに書く",
      "options": ["選択肢A", "選択肢B", "選択肢C", "選択肢D"],
      "correctIndex": 0,
      "explanation": "正解の解説をここに書く"
    }
  ]
}

ルール:
- 問題はドキュメントの内容に基づいた具体的な内容にすること
- 正解以外の選択肢も紛らわしい内容にすること（明らかに間違いとわかるものは避ける）
- correctIndex は 0〜3 の整数（options 配列の正解インデックス）
- explanation には正解の根拠をドキュメントの内容から説明すること
- 日本語で出力すること

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
