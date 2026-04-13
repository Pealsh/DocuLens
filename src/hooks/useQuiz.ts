'use client';

import { useState, useCallback } from 'react';
import type { Quiz, QuizQuestion, QuizStatus, UserAnswer } from '@/types/quiz';

export function useQuiz() {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [status, setStatus] = useState<QuizStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const generateQuiz = useCallback(async (documentText: string, questionCount = 5) => {
    setStatus('generating');
    setError(null);
    setQuiz(null);
    setCurrentIndex(0);
    setAnswers([]);
    setSelectedIndex(null);
    setIsAnswered(false);

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
    if (isAnswered || !quiz) return;
    setSelectedIndex(index);
    setIsAnswered(true);

    const question: QuizQuestion = quiz.questions[currentIndex];
    setAnswers((prev) => [
      ...prev,
      {
        questionId: question.id,
        selectedIndex: index,
        isCorrect: index === question.correctIndex,
      },
    ]);
  }, [isAnswered, quiz, currentIndex]);

  const nextQuestion = useCallback(() => {
    if (!quiz) return;

    if (currentIndex + 1 >= quiz.questions.length) {
      setStatus('completed');
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedIndex(null);
      setIsAnswered(false);
    }
  }, [quiz, currentIndex]);

  const resetQuiz = useCallback(() => {
    setQuiz(null);
    setStatus('idle');
    setError(null);
    setCurrentIndex(0);
    setAnswers([]);
    setSelectedIndex(null);
    setIsAnswered(false);
  }, []);

  const currentQuestion = quiz?.questions[currentIndex] ?? null;
  const correctCount = answers.filter((a) => a.isCorrect).length;
  const totalCount = quiz?.questions.length ?? 0;

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
    generateQuiz,
    selectAnswer,
    nextQuestion,
    resetQuiz,
  };
}
