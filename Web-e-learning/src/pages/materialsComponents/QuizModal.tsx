import { memo, useState } from 'react'
import { X, Plus, Trash2, CheckCircle2, Circle, Clock, Save } from 'lucide-react'
import { http as api } from '@/lib/http'

interface QuizModalProps {
  topicId: string
  onClose: () => void
  onSave?: () => void
}

interface Option {
  text: string
  correct: boolean
}

interface Question {
  text: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  options: Option[]
}

export const QuizModal = memo(function QuizModal({
  topicId,
  onClose,
  onSave,
}: QuizModalProps) {
  const [title, setTitle] = useState('')
  const [durationSec, setDurationSec] = useState(300)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addQuestion = () => {
    setQuestions(prev => [...prev, {
      text: '',
      difficulty: 'MEDIUM',
      options: [
        { text: '', correct: true },
        { text: '', correct: false },
      ]
    }])
  }

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    setQuestions(prev => prev.map((q, i) => i === index ? { ...q, [field]: value } : q))
  }

  const removeQuestion = (index: number) => {
    setQuestions(prev => prev.filter((_, i) => i !== index))
  }

  const addOption = (qIndex: number) => {
    setQuestions(prev => prev.map((q, i) => 
      i === qIndex 
        ? { ...q, options: [...q.options, { text: '', correct: false }] }
        : q
    ))
  }

  const updateOption = (qIndex: number, oIndex: number, field: keyof Option, value: any) => {
    setQuestions(prev => prev.map((q, qi) => 
      qi === qIndex 
        ? {
            ...q,
            options: q.options.map((o, oi) => 
              oi === oIndex ? { ...o, [field]: value } : o
            )
          }
        : q
    ))
  }

  const removeOption = (qIndex: number, oIndex: number) => {
    setQuestions(prev => prev.map((q, qi) => 
      qi === qIndex 
        ? { ...q, options: q.options.filter((_, oi) => oi !== oIndex) }
        : q
    ))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Validation
    if (!title.trim()) {
      setError('Quiz title is required')
      return
    }

    if (questions.length === 0) {
      setError('At least one question is required')
      return
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      if (!q.text.trim()) {
        setError(`Question ${i + 1} text is required`)
        return
      }
      if (q.options.length < 2) {
        setError(`Question ${i + 1} must have at least 2 options`)
        return
      }
      if (!q.options.some(o => o.correct)) {
        setError(`Question ${i + 1} must have at least one correct answer`)
        return
      }
      if (q.options.some(o => !o.text.trim())) {
        setError(`All options in Question ${i + 1} must have text`)
        return
      }
    }

    setLoading(true)
    setError(null)

    try {
      // Create quiz
      const newQuiz = await api.post<{ id: string }>(`/admin/content/topics/${topicId}/quizzes`, {
        title,
        durationSec,
      })

      // Add questions to the quiz
      if (newQuiz?.id) {
        for (const q of questions) {
          await api.post(`/admin/content/quizzes/${newQuiz.id}/questions`, {
            text: q.text,
            difficulty: q.difficulty,
            options: q.options,
          })
        }
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
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Add Quiz
          </h2>
          <button
            onClick={onClose}
            type="button"
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Quiz Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Quiz Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Python Basics Quiz"
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                required
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
                value={durationSec}
                onChange={(e) => setDurationSec(parseInt(e.target.value) || 300)}
                min="30"
                max="3600"
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                required
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
                type="button"
                onClick={addQuestion}
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
                  key={qIdx}
                  className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3"
                >
                  {/* Question Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Question {qIdx + 1} *
                      </label>
                      <input
                        type="text"
                        value={question.text}
                        onChange={(e) => updateQuestion(qIdx, 'text', e.target.value)}
                        placeholder="Enter question text..."
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                        required
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeQuestion(qIdx)}
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
                      onChange={(e) => updateQuestion(qIdx, 'difficulty', e.target.value)}
                      className="w-32 px-2 py-1 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100"
                    >
                      <option value="EASY">Easy</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HARD">Hard</option>
                    </select>
                  </div>

                  {/* Options */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">
                        Options (click circle to mark as correct) *
                      </label>
                      <button
                        type="button"
                        onClick={() => addOption(qIdx)}
                        className="text-xs px-2 py-1 rounded text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-medium transition-colors"
                      >
                        + Option
                      </button>
                    </div>

                    <div className="space-y-2">
                      {question.options.map((option, oIdx) => (
                        <div key={oIdx} className="flex items-center gap-2 group">
                          <button
                            type="button"
                            onClick={() => updateOption(qIdx, oIdx, 'correct', !option.correct)}
                            className="flex-shrink-0"
                            title={option.correct ? 'Mark as incorrect' : 'Mark as correct'}
                          >
                            {option.correct ? (
                              <CheckCircle2 size={20} className="text-green-500" />
                            ) : (
                              <Circle size={20} className="text-gray-300 dark:text-gray-600 group-hover:text-gray-400" />
                            )}
                          </button>

                          <input
                            type="text"
                            value={option.text}
                            onChange={(e) => updateOption(qIdx, oIdx, 'text', e.target.value)}
                            placeholder={`Option ${oIdx + 1}`}
                            className="flex-1 px-2 py-1.5 border border-gray-200 dark:border-gray-700 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                            required
                          />

                          {question.options.length > 2 && (
                            <button
                              type="button"
                              onClick={() => removeOption(qIdx, oIdx)}
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

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 font-medium transition-colors flex items-center gap-2"
            >
              <Save size={16} />
              {loading ? 'Saving...' : 'Save Quiz'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
})
