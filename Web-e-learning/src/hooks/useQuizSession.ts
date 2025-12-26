import { useEffect, useMemo, useState } from 'react'
import { useInterval } from '@/utils/useInterval'
import { type Quiz, type SubmitResult } from '@/services/quiz'
import { safeGetJSON, safeSetJSON, safeRemove, STORAGE_KEYS } from '@/utils/storage'

type Params = {
  quiz?: Quiz
  mode: 'practice' | 'exam'
  onSubmit: (answers: { questionId: string; optionId: string }[]) => Promise<SubmitResult | void>
}

type Attempt = { quizId: string; score: number; total: number; ts: number }
type QuizProgress = { selectedMap: Record<string, string>; idx: number; left: number }

export function useQuizSession({ quiz, mode, onSubmit }: Params) {
  const [idx, setIdx] = useState(0)
  const [score, setScore] = useState(0)
  const [left, setLeft] = useState(0)
  const [finished, setFinished] = useState(false)
  const [selectedMap, setSelectedMap] = useState<Record<string, string>>({})
  const [correctMap, setCorrectMap] = useState<Record<string, string>>({})
  const [explanationMap, setExplanationMap] = useState<Record<string, string>>({})
  const [showExplanation, setShowExplanation] = useState(false)
  const [attemptHistory, setAttemptHistory] = useState<Attempt[]>([])

  // Load quiz progress / history
  useEffect(() => {
    if (!quiz) return
    
    const defaultProgress: QuizProgress = { selectedMap: {}, idx: 0, left: quiz.durationSec }
    const saved = safeGetJSON<QuizProgress>(STORAGE_KEYS.QUIZ_PROGRESS(quiz.id), defaultProgress)
    
    setSelectedMap(saved.selectedMap || {})
    setIdx(saved.idx || 0)
    setLeft(saved.left || quiz.durationSec)
    
    const history = safeGetJSON<Attempt[]>(STORAGE_KEYS.QUIZ_HISTORY, [])
    setAttemptHistory(history)
    
    setFinished(false)
    setScore(0)
    setCorrectMap({})
    setExplanationMap({})
    setShowExplanation(false)
  }, [quiz])

  // Autosave progress
  useEffect(() => {
    if (!quiz) return
    safeSetJSON(STORAGE_KEYS.QUIZ_PROGRESS(quiz.id), { selectedMap, idx, left })
  }, [quiz, selectedMap, idx, left])

  // Timer
  useInterval(() => {
    if (!quiz || finished || mode === 'practice') return
    setLeft((s) => {
      if (s <= 1) {
        finish(true)
        return 0
      }
      return s - 1
    })
  }, 1000)

  const unansweredCount = useMemo(
    () => (quiz ? quiz.questions.filter((q) => !selectedMap[q.id]).length : 0),
    [quiz, selectedMap]
  )
  const lowTime = mode === 'exam' && left <= 15

  const selectOption = (questionId: string, optionId: string) =>
    setSelectedMap((s) => ({ ...s, [questionId]: optionId }))

  const next = async () => {
    if (!quiz) return
    setShowExplanation(false)
    if (idx === quiz.questions.length - 1) {
      await finish(true)
    } else {
      setIdx((i) => i + 1)
    }
  }

  const skip = () => {
    setShowExplanation(false)
    if (!quiz) return
    if (idx < quiz.questions.length - 1) setIdx((i) => i + 1)
  }

  const finish = async (submit: boolean) => {
    if (!quiz || finished) return
    setFinished(true)
    if (submit) {
      const answers = quiz.questions
        .map((q) => ({ questionId: q.id, optionId: selectedMap[q.id] ?? '' }))
        .filter((a) => a.optionId)
      const res = await onSubmit(answers)
      if (res) {
        if (typeof res.correct === 'number') setScore(res.correct)
        const m = res.correctMap || res.correctIds
        const ex = res.solutions
        if (m && typeof m === 'object') setCorrectMap(m)
        if (ex && typeof ex === 'object') setExplanationMap(ex)
        
        const history = safeGetJSON<Attempt[]>(STORAGE_KEYS.QUIZ_HISTORY, [])
        const nextHistory = [
          { quizId: quiz.id, score: res.correct ?? 0, total: quiz.questions.length, ts: Date.now() },
          ...history,
        ].slice(0, 10)
        safeSetJSON(STORAGE_KEYS.QUIZ_HISTORY, nextHistory)
        setAttemptHistory(nextHistory)
      }
    }
    safeRemove(STORAGE_KEYS.QUIZ_PROGRESS(quiz.id))
  }

  const handleAnswer = async () => {
    if (!quiz) return
    const q = quiz.questions[idx]
    if (!selectedMap[q.id]) return
    if (mode === 'practice') {
      setShowExplanation(true)
    } else {
      await next()
    }
  }

  const reset = () => {
    if (!quiz) return
    setIdx(0)
    setScore(0)
    setFinished(false)
    setLeft(quiz.durationSec)
    setSelectedMap({})
    setCorrectMap({})
    setExplanationMap({})
    setShowExplanation(false)
    safeRemove(STORAGE_KEYS.QUIZ_PROGRESS(quiz.id))
  }

  return {
    idx,
    score,
    left,
    finished,
    selectedMap,
    correctMap,
    explanationMap,
    showExplanation,
    attemptHistory,
    unansweredCount,
    lowTime,
    selectOption,
    handleAnswer,
    next,
    skip,
    finish,
    reset,
    setShowExplanation,
  }
}
