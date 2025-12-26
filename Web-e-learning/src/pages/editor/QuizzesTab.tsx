import { useEffect, useState, useCallback } from 'react'
import {
  createQuiz,
  listQuizzes,
  updateQuiz,
  deleteQuiz,
  listQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  QuizLite,
  QuestionWithOptions,
  CreateQuestionRequest,
} from '@/lib/editorApi'
import { useToast } from '@/components/Toast'
import {
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  Check,
  X,
  Clock,
  Save,
  ListChecks,
  AlertCircle,
} from 'lucide-react'
import type { Difficulty } from '@elearn/shared'

interface QuizWithQuestions extends QuizLite {
  questions?: QuestionWithOptions[]
  expanded?: boolean
  loadingQuestions?: boolean
}

export default function QuizzesTab({ topicId }: { topicId?: string }) {
  const [quizzes, setQuizzes] = useState<QuizWithQuestions[]>([])
  const [loading, setLoading] = useState(false)
  
  // Quiz form state
  const [quizTitle, setQuizTitle] = useState('')
  const [quizDuration, setQuizDuration] = useState(120)
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null)

  // Question form state
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null)
  const [questionText, setQuestionText] = useState('')
  const [questionExplanation, setQuestionExplanation] = useState('')
  const [questionDifficulty, setQuestionDifficulty] = useState<Difficulty>('Easy')
  const [options, setOptions] = useState<{ text: string; correct: boolean }[]>([
    { text: '', correct: true },
    { text: '', correct: false },
    { text: '', correct: false },
  ])
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null)

  const { push } = useToast()

  // Load quizzes
  const loadQuizzes = useCallback(async () => {
    if (!topicId) {
      setQuizzes([])
      return
    }
    setLoading(true)
    try {
      const data = await listQuizzes(topicId)
      setQuizzes(data.map((q) => ({ ...q, expanded: false })))
    } catch (e: any) {
      push({ type: 'error', msg: e.message })
    } finally {
      setLoading(false)
    }
  }, [topicId, push])

  useEffect(() => {
    loadQuizzes()
  }, [loadQuizzes])

  // Load questions for a quiz
  const loadQuestions = useCallback(async (quizId: string) => {
    setQuizzes((prev) =>
      prev.map((q) =>
        q.id === quizId ? { ...q, loadingQuestions: true } : q
      )
    )
    try {
      const questions = await listQuestions(quizId)
      setQuizzes((prev) =>
        prev.map((q) =>
          q.id === quizId
            ? { ...q, questions, loadingQuestions: false, expanded: true }
            : q
        )
      )
    } catch (e: any) {
      push({ type: 'error', msg: e.message })
      setQuizzes((prev) =>
        prev.map((q) =>
          q.id === quizId ? { ...q, loadingQuestions: false } : q
        )
      )
    }
  }, [push])

  // Toggle quiz expansion
  const toggleQuiz = useCallback((quizId: string) => {
    const quiz = quizzes.find((q) => q.id === quizId)
    if (quiz?.expanded) {
      setQuizzes((prev) =>
        prev.map((q) => (q.id === quizId ? { ...q, expanded: false } : q))
      )
    } else if (!quiz?.questions) {
      loadQuestions(quizId)
    } else {
      setQuizzes((prev) =>
        prev.map((q) => (q.id === quizId ? { ...q, expanded: true } : q))
      )
    }
  }, [quizzes, loadQuestions])

  // Save quiz
  const saveQuiz = useCallback(async () => {
    if (!topicId) {
      push({ type: 'error', msg: 'Select a topic first' })
      return
    }
    if (!quizTitle.trim()) {
      push({ type: 'error', msg: 'Title required' })
      return
    }

    try {
      if (editingQuizId) {
        const updated = await updateQuiz(topicId, editingQuizId, {
          title: quizTitle,
          durationSec: quizDuration,
        })
        setQuizzes((prev) =>
          prev.map((q) => (q.id === editingQuizId ? { ...q, ...updated } : q))
        )
        push({ type: 'success', msg: 'Quiz updated' })
      } else {
        const created = await createQuiz(topicId, {
          title: quizTitle,
          durationSec: quizDuration,
        })
        setQuizzes((prev) => [{ ...created, expanded: false }, ...prev])
        push({ type: 'success', msg: 'Quiz created' })
      }
      resetQuizForm()
    } catch (e: any) {
      push({ type: 'error', msg: e.message })
    }
  }, [topicId, quizTitle, quizDuration, editingQuizId, push])

  // Delete quiz
  const removeQuiz = useCallback(async (id: string) => {
    if (!topicId) return
    if (!confirm('Delete quiz and all questions?')) return

    try {
      await deleteQuiz(topicId, id)
      setQuizzes((prev) => prev.filter((q) => q.id !== id))
      push({ type: 'success', msg: 'Quiz deleted' })
    } catch (e: any) {
      push({ type: 'error', msg: e.message })
    }
  }, [topicId, push])

  // Reset quiz form
  const resetQuizForm = useCallback(() => {
    setQuizTitle('')
    setQuizDuration(120)
    setEditingQuizId(null)
  }, [])

  // Edit quiz
  const startEditQuiz = useCallback((quiz: QuizLite) => {
    setQuizTitle(quiz.title)
    setQuizDuration(quiz.durationSec)
    setEditingQuizId(quiz.id)
  }, [])

  // Save question
  const saveQuestion = useCallback(async () => {
    if (!activeQuizId) {
      push({ type: 'error', msg: 'Select a quiz first' })
      return
    }
    if (!questionText.trim()) {
      push({ type: 'error', msg: 'Question text required' })
      return
    }
    if (options.filter((o) => o.text.trim()).length < 2) {
      push({ type: 'error', msg: 'At least 2 options required' })
      return
    }
    if (!options.some((o) => o.correct)) {
      push({ type: 'error', msg: 'At least one correct answer required' })
      return
    }

    const questionData: CreateQuestionRequest = {
      text: questionText,
      explanation: questionExplanation || undefined,
      difficulty: questionDifficulty,
      tags: [],
      options: options
        .filter((o) => o.text.trim())
        .map((o) => ({ text: o.text, correct: o.correct })),
    }

    try {
      if (editingQuestionId) {
        const updated = await updateQuestion(activeQuizId, editingQuestionId, questionData)
        setQuizzes((prev) =>
          prev.map((q) =>
            q.id === activeQuizId
              ? {
                  ...q,
                  questions: q.questions?.map((qst) =>
                    qst.id === editingQuestionId ? updated : qst
                  ),
                }
              : q
          )
        )
        push({ type: 'success', msg: 'Question updated' })
      } else {
        const created = await createQuestion(activeQuizId, questionData)
        setQuizzes((prev) =>
          prev.map((q) =>
            q.id === activeQuizId
              ? { ...q, questions: [...(q.questions || []), created] }
              : q
          )
        )
        push({ type: 'success', msg: 'Question created' })
      }
      resetQuestionForm()
    } catch (e: any) {
      push({ type: 'error', msg: e.message })
    }
  }, [activeQuizId, questionText, questionExplanation, questionDifficulty, options, editingQuestionId, push])

  // Delete question
  const removeQuestion = useCallback(async (quizId: string, questionId: string) => {
    if (!confirm('Delete this question?')) return

    try {
      await deleteQuestion(quizId, questionId)
      setQuizzes((prev) =>
        prev.map((q) =>
          q.id === quizId
            ? { ...q, questions: q.questions?.filter((qst) => qst.id !== questionId) }
            : q
        )
      )
      push({ type: 'success', msg: 'Question deleted' })
    } catch (e: any) {
      push({ type: 'error', msg: e.message })
    }
  }, [push])

  // Reset question form
  const resetQuestionForm = useCallback(() => {
    setQuestionText('')
    setQuestionExplanation('')
    setQuestionDifficulty('Easy')
    setOptions([
      { text: '', correct: true },
      { text: '', correct: false },
      { text: '', correct: false },
    ])
    setEditingQuestionId(null)
    setActiveQuizId(null)
  }, [])

  // Edit question
  const startEditQuestion = useCallback((quizId: string, question: QuestionWithOptions) => {
    setActiveQuizId(quizId)
    setQuestionText(question.text)
    setQuestionExplanation(question.explanation || '')
    setQuestionDifficulty(question.difficulty)
    setOptions(
      question.options.map((o) => ({ text: o.text, correct: o.correct || false }))
    )
    setEditingQuestionId(question.id)
  }, [])

  // Add new question to a quiz
  const startAddQuestion = useCallback((quizId: string) => {
    resetQuestionForm()
    setActiveQuizId(quizId)
  }, [resetQuestionForm])

  // Update option
  const updateOption = useCallback((index: number, field: 'text' | 'correct', value: string | boolean) => {
    setOptions((prev) =>
      prev.map((o, i) => {
        if (i === index) {
          if (field === 'correct' && value === true) {
            return { ...o, correct: true }
          }
          return { ...o, [field]: value }
        }
        if (field === 'correct' && value === true) {
          return { ...o, correct: false }
        }
        return o
      })
    )
  }, [])

  // Add option
  const addOption = useCallback(() => {
    if (options.length < 6) {
      setOptions((prev) => [...prev, { text: '', correct: false }])
    }
  }, [options.length])

  // Remove option
  const removeOption = useCallback((index: number) => {
    if (options.length > 2) {
      setOptions((prev) => prev.filter((_, i) => i !== index))
    }
  }, [options.length])

  const getDifficultyColor = (difficulty: Difficulty) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'Medium':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'Hard':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    }
  }

  if (!topicId) {
    return (
      <div className="card">
        <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
          <AlertCircle className="w-5 h-5" />
          <p>Select a topic in the left sidebar to manage quizzes.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Quiz Form */}
      <div className="card">
        <h2 className="text-xl font-display font-bold mb-4 gradient-text flex items-center gap-2">
          <ListChecks className="w-5 h-5" />
          {editingQuizId ? 'Edit Quiz' : 'Create Quiz'}
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Quiz Title</label>
            <input
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g., Sorting Algorithms Quiz"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Duration (seconds)</label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                value={quizDuration}
                onChange={(e) => setQuizDuration(Number(e.target.value) || 60)}
                className="w-full pl-10 pr-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                min={10}
                max={3600}
              />
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={saveQuiz} className="btn flex items-center gap-2">
            <Save className="w-4 h-4" />
            {editingQuizId ? 'Update' : 'Create'}
          </button>
          {editingQuizId && (
            <button onClick={resetQuizForm} className="btn-outline">
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Quizzes List */}
      <div className="card">
        <h2 className="text-xl font-display font-bold mb-4 gradient-text">
          Quizzes ({quizzes.length})
        </h2>

        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : quizzes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No quizzes yet. Create one above.
          </div>
        ) : (
          <div className="space-y-3">
            {quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden"
              >
                {/* Quiz Header */}
                <div
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => toggleQuiz(quiz.id)}
                >
                  <div className="flex items-center gap-3">
                    {quiz.expanded ? (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {quiz.title}
                      </h3>
                      <p className="text-xs text-gray-500 flex items-center gap-2">
                        <Clock className="w-3 h-3" /> {quiz.durationSec}s
                        {quiz.questions && (
                          <span className="ml-2">
                            • {quiz.questions.length} questions
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => startAddQuestion(quiz.id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                      title="Add question"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => startEditQuiz(quiz)}
                      className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title="Edit quiz"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeQuiz(quiz.id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      title="Delete quiz"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Questions List */}
                {quiz.expanded && (
                  <div className="border-t border-gray-200 dark:border-gray-700">
                    {quiz.loadingQuestions ? (
                      <div className="p-4 text-center text-gray-500">
                        Loading questions...
                      </div>
                    ) : quiz.questions && quiz.questions.length > 0 ? (
                      <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {quiz.questions.map((question, idx) => (
                          <div
                            key={question.id}
                            className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/30"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-medium text-gray-400">
                                    #{idx + 1}
                                  </span>
                                  <span
                                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getDifficultyColor(
                                      question.difficulty
                                    )}`}
                                  >
                                    {question.difficulty}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-900 dark:text-white">
                                  {question.text}
                                </p>
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {question.options.map((opt) => (
                                    <span
                                      key={opt.id}
                                      className={`text-xs px-2 py-1 rounded-lg ${
                                        opt.correct
                                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                      }`}
                                    >
                                      {opt.correct && '✓ '}
                                      {opt.text}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => startEditQuestion(quiz.id, question)}
                                  className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => removeQuestion(quiz.id, question.id)}
                                  className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        No questions yet. Click + to add one.
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Question Form Modal */}
      {activeQuizId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-blue-500" />
                {editingQuestionId ? 'Edit Question' : 'Add Question'}
              </h3>
              <button
                onClick={resetQuestionForm}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Question Text */}
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Question Text *
                </label>
                <textarea
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none min-h-[80px]"
                  placeholder="Enter your question..."
                />
              </div>

              {/* Explanation */}
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Explanation (shown after answer)
                </label>
                <textarea
                  value={questionExplanation}
                  onChange={(e) => setQuestionExplanation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none min-h-[60px]"
                  placeholder="Explain the correct answer..."
                />
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-sm font-medium mb-1.5">Difficulty</label>
                <div className="flex gap-2">
                  {(['Easy', 'Medium', 'Hard'] as Difficulty[]).map((d) => (
                    <button
                      key={d}
                      onClick={() => setQuestionDifficulty(d)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        questionDifficulty === d
                          ? getDifficultyColor(d)
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Options */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium">
                    Answer Options *
                  </label>
                  <button
                    onClick={addOption}
                    disabled={options.length >= 6}
                    className="text-xs text-blue-600 hover:text-blue-700 disabled:text-gray-400 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add option
                  </button>
                </div>
                <div className="space-y-2">
                  {options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <button
                        onClick={() => updateOption(idx, 'correct', !opt.correct)}
                        className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                          opt.correct
                            ? 'border-green-500 bg-green-500 text-white'
                            : 'border-gray-300 dark:border-gray-600 hover:border-green-400'
                        }`}
                        title={opt.correct ? 'Correct answer' : 'Mark as correct'}
                      >
                        {opt.correct && <Check className="w-3.5 h-3.5" />}
                      </button>
                      <input
                        value={opt.text}
                        onChange={(e) => updateOption(idx, 'text', e.target.value)}
                        className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        placeholder={`Option ${idx + 1}`}
                      />
                      {options.length > 2 && (
                        <button
                          onClick={() => removeOption(idx)}
                          className="shrink-0 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Click the circle to mark the correct answer. At least 2 options required.
                </p>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4 flex justify-end gap-2">
              <button onClick={resetQuestionForm} className="btn-outline">
                Cancel
              </button>
              <button onClick={saveQuestion} className="btn flex items-center gap-2">
                <Save className="w-4 h-4" />
                {editingQuestionId ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
