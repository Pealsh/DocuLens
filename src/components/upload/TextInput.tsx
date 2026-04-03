// テキスト貼り付けエリア
'use client';

import { useState, useCallback } from 'react';
import Button from '@/components/ui/Button';

interface TextInputProps {
  onTextSubmit: (text: string) => void;
}

export default function TextInput({ onTextSubmit }: TextInputProps) {
  const [inputText, setInputText] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const canSubmit = inputText.trim().length > 0;

  const handleSubmitText = useCallback(() => {
    const trimmedText = inputText.trim();
    if (trimmedText.length === 0) {
      setValidationError('テキストを入力してください。');
      return;
    }
    onTextSubmit(trimmedText);
    setInputText('');
    setValidationError(null);
  }, [inputText, onTextSubmit]);

  const handleTextChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(event.target.value);
    if (validationError) {
      setValidationError(null);
    }
  }, [validationError]);

  return (
    <div className="space-y-3">
      <textarea
        value={inputText}
        onChange={handleTextChange}
        placeholder="ここにテキストを貼り付けてください..."
        rows={5}
        className="
          w-full px-4 py-3
          bg-bg-primary text-text-primary
          border border-border rounded-[var(--radius-sm)]
          placeholder:text-text-muted
          focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent
          resize-y transition-colors duration-[var(--transition-fast)]
        "
      />
      {validationError && (
        <p className="text-sm text-error">{validationError}</p>
      )}
      <div className="flex items-center justify-between">
        <span className="text-xs text-text-muted">
          {inputText.length > 0 ? `${inputText.length} 文字` : ''}
        </span>
        <Button onClick={handleSubmitText} disabled={!canSubmit} size="sm">
          追加
        </Button>
      </div>
    </div>
  );
}
