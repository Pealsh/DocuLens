export interface QuizQuestion {
  id: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
}

export interface Quiz {
  questions: QuizQuestion[];
}

export type QuizStatus = 'idle' | 'generating' | 'answering' | 'completed';

export interface UserAnswer {
  questionId: string;
  selectedIndex: number;
  isCorrect: boolean;
}
