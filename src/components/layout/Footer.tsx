// フッター
import { APP_NAME } from '@/lib/constants';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-bg-secondary mt-auto">
      <div className="mx-auto max-w-[960px] px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="text-sm text-text-muted">
          &copy; {new Date().getFullYear()} {APP_NAME}. Powered by Google Gemini.
        </p>
        <p className="text-xs text-text-muted">
          ドキュメントはブラウザ内で処理され、サーバーに保存されません。
        </p>
      </div>
    </footer>
  );
}
