'use client';

import { useState, useCallback } from 'react';
import type { Quiz, QuizStatus, UserAnswer } from '@/types/quiz';

export function useQuiz() {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [status, setStatus] = useState<QuizStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);

  const generateQuiz = useCallback(async (documentText: string, questionCount = 5) => {
    setStatus('generating');
    setError(null);
    setQuiz(null);
    setCurrentIndex(0);
    setAnswers([]);

    try {
      const response = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentText, questionCount }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'クイズの生成に失敗しました');
      }

      setQuiz(data.quiz);
      setStatus('answering');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'クイズの生成中にエラーが発生しました';
      setError(message);
      setStatus('idle');
    }
  }, []);

  const selectAnswer = useCallback((index: number) => {
    if (!quiz) return;
    const question = quiz.questions[currentIndex];
    // すでに回答済みなら何もしない
    if (answers.some((a) => a.questionId === question.id)) return;

    setAnswers((prev) => [
      ...prev,
      {
        questionId: question.id,
        selectedIndex: index,
        isCorrect: index === question.correctIndex,
      },
    ]);
  }, [quiz, currentIndex, answers]);

  const goNext = useCallback(() => {
    if (!quiz) return;
    if (currentIndex + 1 >= quiz.questions.length) {
      setStatus('completed');
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }, [quiz, currentIndex]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  }, [currentIndex]);

  const goToIndex = useCallback((index: number) => {
    if (!quiz) return;
    if (index < 0 || index >= quiz.questions.length) return;
    setCurrentIndex(index);
  }, [quiz]);

  const resetQuiz = useCallback(() => {
    setQuiz(null);
    setStatus('idle');
    setError(null);
    setCurrentIndex(0);
    setAnswers([]);
  }, []);

  const currentQuestion = quiz?.questions[currentIndex] ?? null;

  // 現在の問題への回答を answers 配列から導出（戻り操作でも正しく表示される）
  const currentAnswer = quiz
    ? answers.find((a) => a.questionId === quiz.questions[currentIndex]?.id)
    : undefined;
  const isAnswered = !!currentAnswer;
  const selectedIndex = currentAnswer?.selectedIndex ?? null;

  const correctCount = answers.filter((a) => a.isCorrect).length;
  const totalCount = quiz?.questions.length ?? 0;
  const allAnswered = totalCount > 0 && answers.length === totalCount;
  const canGoPrev = currentIndex > 0;
  const canGoNext = isAnswered && currentIndex < totalCount - 1;

  return {
    quiz,
    status,
    error,
    currentIndex,
    currentQuestion,
    answers,
    selectedIndex,
    isAnswered,
    correctCount,
    totalCount,
    allAnswered,
    canGoPrev,
    canGoNext,
    generateQuiz,
    selectAnswer,
    goNext,
    goPrev,
    goToIndex,
    resetQuiz,
  };
}
