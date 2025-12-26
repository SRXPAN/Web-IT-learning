import { apiGet, apiPost } from '@/lib/http'
import type { Option, Question, Quiz, QuizSubmitResult, QuizAnswer } from '@elearn/shared'

// Re-export types for backward compatibility
export type { Option, Question, Quiz }

// Extended result type for frontend (includes legacy fields)
export type SubmitResult = QuizSubmitResult & {
  correctIds?: Record<string, string>
}

export const fetchQuiz = (id: string) => apiGet<Quiz>(`/quiz/${id}`)
export const submitQuizAttempt = (id: string, body: { answers: QuizAnswer[] }) =>
  apiPost<SubmitResult>(`/quiz/${id}/submit`, body)
