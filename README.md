# DocuLens

AI を使ってドキュメントを要約・質問応答できる Web アプリケーション。
PDF、テキスト、URL、YouTube 動画を入力として受け付け、Google Gemini による要約生成と FAQ チャットを提供する。

---

## 機能

- PDF / テキストファイルのアップロードとテキスト抽出
- URL 指定による Web ページのスクレイピング
- YouTube 動画 URL から字幕を取得して要約
- テキスト / URL 入力の統合（自動判定）
- Google Gemini 2.5 Flash によるストリーミング要約生成
- ドキュメントを文脈にした FAQ チャット（ストリーミング）
- ドキュメント内容から4択クイズを自動生成して復習
- ダーク / ライトモード切り替え（システム設定に自動追従）
- 要約・チャット回答のコピー機能

---

## 使用言語 / 技術スタック

| カテゴリ | 技術 |
|---|---|
| 言語 | TypeScript |
| フレームワーク | Next.js 16 (App Router) |
| UI ライブラリ | React 19 |
| スタイリング | Tailwind CSS v4 |
| アニメーション | Framer Motion |
| AI | Google Gemini 2.5 Flash (`@google/generative-ai`) |
| PDF 解析 | pdf-parse |
| Web スクレイピング | cheerio |
| YouTube | youtube-transcript |
| 言語 | TypeScript 5 |

---

## 必要な環境

- Node.js 18 以上
- Google Gemini API キー

---

## セットアップ

```bash
# 依存パッケージをインストール
npm install

# 環境変数ファイルを作成
cp .env.example .env.local
```

`.env.local` を編集して API キーを設定する。

```env
GEMINI_API_KEY=your_api_key_here
```

---

## 起動方法

```bash
# 開発サーバー起動
npm run dev
```

ブラウザで `http://localhost:3000` にアクセスする。

```bash
# 本番ビルド
npm run build
npm run start
```

---

## ディレクトリ構成

```
src/
├── app/
│   ├── api/
│   │   ├── chat/          # FAQ チャット API
│   │   ├── quiz/          # クイズ生成 API
│   │   ├── documents/     # ドキュメント削除 API
│   │   ├── fetch-url/     # URL / YouTube 取得 API
│   │   ├── summarize/     # 要約生成 API
│   │   └── upload/        # ファイルアップロード API
│   ├── globals.css        # カラートークン・グローバルスタイル
│   ├── layout.tsx         # ルートレイアウト
│   └── page.tsx           # メインページ
├── components/
│   ├── chat/              # チャット UI コンポーネント
│   ├── layout/            # Header / Footer
│   ├── mode/              # モード切り替えタブ
│   ├── quiz/              # クイズ UI コンポーネント
│   ├── summary/           # 要約表示コンポーネント
│   ├── ui/                # 共通 UI（Button / Card / Modal 等）
│   └── upload/            # ファイル入力・ドキュメント一覧
├── contexts/
│   └── ThemeContext.tsx   # ダークモード Context
├── hooks/                 # カスタムフック
├── lib/                   # ユーティリティ（Gemini / パーサー / プロンプト）
└── types/                 # TypeScript 型定義
```

---

## 環境変数

| 変数名 | 説明 |
|---|---|
| `GEMINI_API_KEY` | Google AI Studio で発行した API キー |
