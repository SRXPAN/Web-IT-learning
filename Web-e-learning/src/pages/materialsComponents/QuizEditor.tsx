import { memo, useState, useCallback } from 'react'
import {
  X,
  Plus,
  Trash2,
  Copy,
  CheckCircle2,
  Circle,
  Clock,
} from 'lucide-react'
import { http as api } from '@/lib/http'
import { useTranslation } from '@/i18n/useTranslation'

interface Option {
  id: string
  text: string
  correct: boolean
}

interface Question {
  id: string
  text: string
  difficulty: string
  options: Option[]
}

interface QuizEditorProps {
  quizId: string
  topicId: string
  onClose: () => void
  onSave?: () => void
}

export const QuizEditor = memo(function QuizEditor({
  quizId,
  topicId,
  onClose,
  onSave,
}: QuizEditorProps) {
  const { t } = useTranslation()
  const [quizData, setQuizData] = useState({
    title: '',
    durationSec: 300,
  })
  const [questions, setQuestions] = useState<Question[]>([])
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load existing quiz if editing
  const loadQuiz = useCallback(async () => {
    if (!quizId || quizId === 'new') return
    
    setLoading(true)
    try {
      const quiz = await api.get<any>(`/admin/content/quizzes/${quizId}`)
      if (quiz) {
        setQuizData({
          title: quiz.title || '',
          durationSec: quiz.durationSec || 300,
        })
        setQuestions(quiz.questions || [])
      }
    } catch (err) {
      setError('Failed to load quiz')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [quizId])

  // Add new question
  const handleAddQuestion = useCallback(() => {
    const newQuestion: Question = {
      id: `temp-${Date.now()}`,
      text: '',
      difficulty: 'MEDIUM',
      options: [
        { id: `opt-1`, text: '', correct: true },
        { id: `opt-2`, text: '', correct: false },
      ],
    }
    setQuestions(prev => [...prev, newQuestion])
    setEditingQuestionId(newQuestion.id)
  }, [])

  // Update question
  const handleUpdateQuestion = (id: string, field: string, value: any) => {
    setQuestions(prev =>
      prev.map(q =>
        q.id === id ? { ...q, [field]: value } : q
      )
    )
  }

  // Update option
  const handleUpdateOption = (questionId: string, optionId: string, field: string, value: any) => {
    setQuestions(prev =>
      prev.map(q =>
        q.id === questionId
          ? {
              ...q,
              options: q.options.map(o =>
                o.id === optionId ? { ...o, [field]: value } : o
              ),
            }
          : q
      )
    )
  }

  // Add option to question
  const handleAddOption = (questionId: string) => {
    setQuestions(prev =>
      prev.map(q =>
        q.id === questionId
          ? {
              ...q,
              options: [
                ...q.options,
                { id: `opt-${Date.now()}`, text: '', correct: false },
              ],
            }
          : q
      )
    )
  }

  // Remove option
  const handleRemoveOption = (questionId: string, optionId: string) => {
    setQuestions(prev =>
      prev.map(q =>
        q.id === questionId
          ? {
              ...q,
              options: q.options.filter(o => o.id !== optionId),
            }
          : q
      )
    )
  }

  // Remove question
  const handleRemoveQuestion = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id))
  }

  // Save quiz
  const handleSaveQuiz = async () => {
    if (!quizData.title.trim()) {
      setError('Quiz title is required')
      return
    }

    if (questions.length === 0) {
      setError('At least one question is required')
      return
    }

    const invalidQuestion = questions.find(q => {
      if (!q.text.trim()) return true
      if (q.options.length < 2) return true
      if (!q.options.some(o => o.correct)) return true
      if (q.options.some(o => !o.text.trim())) return true
      return false
    })

    if (invalidQuestion) {
      setError('All questions must have text and at least 2 options with one marked correct')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Create or update quiz
      if (quizId === 'new') {
        const newQuiz = await api.post<any>(`/admin/content/topics/${topicId}/quizzes`, {
          title: quizData.title,
          durationSec: quizData.durationSec,
        })

        // Add questions
        for (const q of questions) {
          await api.post(`/admin/content/quizzes/${newQuiz?.id}/questions`, {
            text: q.text,
            difficulty: q.difficulty,
            options: q.options.map(o => ({
              text: o.text,
              correct: o.correct,
            })),
          })
        }
      } else {
        // Update existing quiz
        await api.put(`/admin/content/quizzes/${quizId}`, {
          title: quizData.title,
          durationSec: quizData.durationSec,
        })

        // TODO: Handle updating questions (add/edit/delete)
      }

      onSave?.()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to save quiz')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {quizId === 'new' ? 'Create New Quiz' : 'Edit Quiz'}
            </h2>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">Topic: {topicId}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Quiz Settings */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Quiz Settings</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Quiz Title *
              </label>
              <input
                type="text"
                value={quizData.title}
                onChange={(e) => setQuizData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Python Basics Quiz"
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <span className="flex items-center gap-2">
                  <Clock size={16} />
                  Duration (seconds) *
                </span>
              </label>
              <input
                type="number"
                value={quizData.durationSec}
                onChange={(e) => setQuizData(prev => ({ ...prev, durationSec: parseInt(e.target.value) }))}
                min="30"
                max="3600"
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Questions ({questions.length})
              </h3>
              <button
                onClick={handleAddQuestion}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-600 text-white hover:bg-purple-700 text-sm font-medium transition-colors"
              >
                <Plus size={16} />
                Add Question
              </button>
            </div>

            {questions.length === 0 ? (
              <div className="p-6 text-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-gray-500 dark:text-gray-400">
                No questions yet. Click "Add Question" to create one.
              </div>
            ) : (
              questions.map((question, qIdx) => (
                <div
                  key={question.id}
                  className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4"
                >
                  {/* Question Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Question {qIdx + 1} *
                      </label>
                      <textarea
                        value={question.text}
                        onChange={(e) => handleUpdateQuestion(question.id, 'text', e.target.value)}
                        placeholder="Enter question text..."
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                      />
                    </div>
                    <button
                      onClick={() => handleRemoveQuestion(question.id)}
                      className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      title="Delete question"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  {/* Difficulty */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Difficulty
                    </label>
                    <select
                      value={question.difficulty}
                      onChange={(e) => handleUpdateQuestion(question.id, 'difficulty', e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100"
                    >
                      <option value="EASY">Easy</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HARD">Hard</option>
                    </select>
                  </div>

                  {/* Options */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">
                        Options *
                      </label>
                      <button
                        onClick={() => handleAddOption(question.id)}
                        className="text-xs px-2 py-1 rounded text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-medium transition-colors"
                      >
                        + Add Option
                      </button>
                    </div>

                    <div className="space-y-1.5 pl-2 border-l-2 border-gray-200 dark:border-gray-700">
                      {question.options.map((option, oIdx) => (
                        <div key={option.id} className="flex items-center gap-2 group">
                          <button
                            onClick={() => handleUpdateOption(question.id, option.id, 'correct', !option.correct)}
                            className="flex-shrink-0 p-1 rounded transition-colors"
                            title={option.correct ? 'Mark as incorrect' : 'Mark as correct'}
                          >
                            {option.correct ? (
                              <CheckCircle2 size={18} className="text-green-500" />
                            ) : (
                              <Circle size={18} className="text-gray-300 dark:text-gray-600 group-hover:text-gray-400" />
                            )}
                          </button>

                          <input
                            type="text"
                            value={option.text}
                            onChange={(e) => handleUpdateOption(question.id, option.id, 'text', e.target.value)}
                            placeholder={`Option ${oIdx + 1}`}
                            className="flex-1 px-2 py-1 border border-gray-200 dark:border-gray-700 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                          />

                          {question.options.length > 2 && (
                            <button
                              onClick={() => handleRemoveOption(question.id, option.id)}
                              className="flex-shrink-0 p-1 rounded text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 dark:hover:bg-red-900/20"
                              title="Delete option"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveQuiz}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 font-medium transition-colors flex items-center gap-2"
          >
            {loading ? 'Saving...' : 'Save Quiz'}
          </button>
        </div>
      </div>
    </div>
  )
})
