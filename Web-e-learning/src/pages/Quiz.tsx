import { useEffect, useState, useCallback, useMemo } from 'react'
import confetti from 'canvas-confetti'
import { fetchTopicsTree, type TopicLite } from '@/services/topics'
import { fetchQuiz, submitQuizAttempt, type Quiz } from '@/services/quiz'
import { useAuth } from '@/auth/AuthContext'
import { Check, Clock, CheckCircle2, XCircle, Timer, Lightbulb, HelpCircle, Award, Target, Keyboard } from 'lucide-react'
import { logQuizAttempt } from '@/utils/activity'
import { formatTime } from '@/utils/quizHelpers'
import { useTranslation } from '@/i18n/useTranslation'
import useCatalogStore from '@/store/catalog'
import { useQuizSession } from '@/hooks/useQuizSession'
import { GRADIENT_COLORS, getGradientColor } from '@/utils/colors'
import type { Lang } from '@elearn/shared'

type Mode = 'practice' | 'exam'

export default function QuizPage() {
  const { t, lang } = useTranslation()
  const { refresh } = useAuth() // Переміщено ПЕРЕД useQuizSession
  const { topics, loadTopics, loadQuiz } = useCatalogStore()
  const [quizList, setQuizList] = useState<{ id: string; title: string; durationSec: number }[]>([])
  const [quizId, setQuizId] = useState<string | undefined>()
  const [quiz, setQuiz] = useState<Quiz | undefined>()
  const [mode, setMode] = useState<Mode>('practice')
  const [loadingQuiz, setLoadingQuiz] = useState(false)
  const [quizSearch, setQuizSearch] = useState('')
  const [showShortcuts, setShowShortcuts] = useState(false)
  
  // Мемоізований callback для submit
  const handleQuizSubmit = useCallback(async (answers: { questionId: string; optionId: string }[]) => {
    if (!quiz) return
    const res = await submitQuizAttempt(quiz.id, { answers, lang: lang as Lang })
    await refresh()
    logQuizAttempt()
    return res
  }, [quiz, refresh, lang])

  const {
    idx, score, left, finished, selectedMap, correctMap, explanationMap, showExplanation,
    attemptHistory, unansweredCount, lowTime,
    selectOption, handleAnswer, next, skip, finish, reset, setShowExplanation,
  } = useQuizSession({
    quiz,
    mode,
    onSubmit: handleQuizSubmit,
  })
  const q = quiz?.questions[idx]

  // Keyboard shortcuts
  useEffect(() => {
    if (!quiz || finished) return
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      
      const currentQuestion = quiz.questions[idx]
      if (!currentQuestion) return

      // Number keys 1-4 to select options
      if (['1', '2', '3', '4'].includes(e.key)) {
        const optionIndex = parseInt(e.key) - 1
        const option = currentQuestion.options[optionIndex]
        if (option) {
          e.preventDefault()
          selectOption(currentQuestion.id, option.id)
        }
      }

      // Enter to confirm answer
      if (e.key === 'Enter' && selectedMap[currentQuestion.id]) {
        e.preventDefault()
        handleAnswer()
      }

      // N for next question (in practice mode after showing explanation)
      if (e.key === 'n' || e.key === 'N') {
        if (mode === 'practice' && showExplanation) {
          e.preventDefault()
          next()
        }
      }

      // S for skip (in practice mode)
      if ((e.key === 's' || e.key === 'S') && mode === 'practice' && !showExplanation) {
        e.preventDefault()
        skip()
      }

      // ? to toggle shortcuts help
      if (e.key === '?') {
        e.preventDefault()
        setShowShortcuts(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [quiz, idx, finished, selectedMap, mode, showExplanation, selectOption, handleAnswer, next, skip])

  // Load topics - тільки один раз
  useEffect(() => { 
    loadTopics(lang as Lang).catch(console.error) 
  }, [loadTopics, lang])
  
  // Celebrate quiz completion
  useEffect(() => {
    if (finished && quiz) {
      // Trigger confetti when quiz is completed
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })
      // Additional celebratory burst
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        })
      }, 250)
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        })
      }, 400)
    }
  }, [finished, quiz])
  
  // Мемоізована функція вибору квізу
  const chooseQuiz = useCallback(async (id: string, skipIfSameId = false) => {
    // Якщо ID той самий і skipIfSameId=true, не перезавантажуємо
    if (skipIfSameId && id === quizId) return
    
    setQuiz(undefined)
    setLoadingQuiz(true)
    try {
      const loadedQuiz = await loadQuiz(id, lang as Lang)
      setQuiz(loadedQuiz)
      setQuizId(id)
    } catch (e) {
      console.error(e)
      setQuiz(undefined)
    } finally {
      setLoadingQuiz(false)
    }
  }, [loadQuiz, lang, quizId])

  // Оновлення списку квізів при зміні topics
  useEffect(() => {
    const list = topics.flatMap((x) => x.quizzes)
    setQuizList(list)
    // Вибрати перший квіз тільки якщо ще не вибрано
    if (!quizId && list.length > 0) {
      chooseQuiz(list[0].id, false)
    }
  }, [topics, quizId, chooseQuiz])

  // Мемоізований фільтрований список
  const filteredQuizzes = useMemo(() => {
    const searchTerm = quizSearch.trim().toLowerCase()
    if (!searchTerm) return quizList
    return quizList.filter(qz => qz.title.toLowerCase().includes(searchTerm))
  }, [quizList, quizSearch])

  return (
    <div className="space-y-6">
      {/* Header with mode toggle */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-3xl font-display font-bold text-neutral-900 dark:text-white">
          {t('quiz.title')}
        </h1>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">{t('quiz.mode')}:</span>
          <div className="flex gap-2">
            <button
              onClick={() => setMode('practice')}
              className={`px-4 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                mode === 'practice'
                  ? 'bg-primary-600 text-white shadow-neo'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700'
              }`}
            >
              <Lightbulb size={16} />
              {t('quiz.practice')}
            </button>
            <button
              onClick={() => setMode('exam')}
              className={`px-4 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                mode === 'exam'
                  ? 'bg-accent-600 text-white shadow-neo'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700'
              }`}
            >
              <Timer size={16} />
              {t('quiz.exam')}
            </button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[320px_1fr_320px] gap-6">
        {/* Left Sidebar: Quiz List */}
        <aside className="card h-max sticky top-24 space-y-6">
          <div>
            <h3 className="font-display font-semibold mb-4 text-neutral-900 dark:text-white">
              {t('quiz.selectQuiz')}
            </h3>
            <input
              value={quizSearch}
              onChange={e=>setQuizSearch(e.target.value)}
              placeholder={t('materials.searchPlaceholder')}
              className="w-full mb-3 px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
              aria-label={t('materials.searchPlaceholder')}
            />
            <ul className="space-y-2 max-h-[60vh] overflow-auto pr-1">
              {filteredQuizzes.map((qz, index) => {
                const colorClass = getGradientColor(index)

                return (
                  <li key={qz.id}>
                    <button
                      onClick={() => chooseQuiz(qz.id)}
                      aria-label={`${t('quiz.selectQuiz')} ${qz.title}`}
                      className={
                        qz.id === quizId
                          ? `w-full text-left px-4 py-3 rounded-2xl font-semibold transition-all duration-300 bg-gradient-to-r ${colorClass.from} ${colorClass.to} text-white shadow-neo hover:shadow-neo-lg hover:scale-105`
                          : 'w-full text-left px-4 py-3 rounded-2xl transition-all duration-300 bg-white hover:bg-neutral-50 border-2 border-neutral-200 hover:border-primary-400 dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:border-neutral-700 dark:hover:border-primary-600'
                      }
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span>{qz.title}</span>
                        <span className="text-xs opacity-80">{qz.durationSec}s</span>
                      </div>
                    </button>
                  </li>
                )
              })}
              {!filteredQuizzes.length && (
                <li className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 text-sm text-neutral-600 dark:text-neutral-400">
                  {quizList.length ? t('quiz.noQuizzes') : t('quiz.loading')}
                </li>
              )}
            </ul>
          </div>

          {/* Stats */}
          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-950 dark:to-accent-950 border border-primary-200 dark:border-primary-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
                  {mode === 'exam' ? <Timer size={16} /> : <Lightbulb size={16} />}
                  {mode === 'exam' ? t('quiz.time') : t('quiz.mode')}
                </span>
                <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                  {mode === 'exam' ? formatTime(left) : t('quiz.mode.practice')}
                </span>
              </div>
              {mode === 'exam' && lowTime && <span className="text-xs text-red-600 dark:text-red-400 font-semibold">{t('quiz.time')} ↓</span>}
            </div>

            {quiz && (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-green-50 to-accent-50 dark:from-green-950 dark:to-accent-950 border border-green-200 dark:border-green-800">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
                    <Target size={16} />
                    {t('quiz.result')}
                  </span>
                  <span className="text-lg font-bold text-green-600 dark:text-green-400">
                    {score}/{quiz.questions.length}
                  </span>
                </div>
              </div>
            )}

            {/* Keyboard shortcuts hint */}
            <button 
              onClick={() => setShowShortcuts(!showShortcuts)}
              className="w-full p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors flex items-center justify-center gap-2"
            >
              <Keyboard size={14} />
              {showShortcuts ? t('quiz.shortcuts.hide') : t('quiz.shortcuts.show')}
            </button>
            
            {showShortcuts && (
              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-neutral-500">1-4</span>
                  <span className="text-neutral-700 dark:text-neutral-300">{t('quiz.shortcuts.selectAnswer')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Enter</span>
                  <span className="text-neutral-700 dark:text-neutral-300">{t('quiz.shortcuts.confirm')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">N</span>
                  <span className="text-neutral-700 dark:text-neutral-300">{t('quiz.shortcuts.nextQuestion')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">S</span>
                  <span className="text-neutral-700 dark:text-neutral-300">{t('quiz.shortcuts.skip')}</span>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Center: Quiz Content */}
        <section className="card space-y-6">
          {(!quiz || loadingQuiz) ? (
            <div className="flex items-center justify-center py-20" role="status" aria-live="polite">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary-600 to-accent-500 mb-4 animate-spin">
                  <Clock className="text-white" size={32} />
                </div>
                <p className="text-neutral-600 dark:text-neutral-400 font-semibold">
                  {loadingQuiz ? t('quiz.loadingQuestion') : t('quiz.loading')}
                </p>
              </div>
            </div>
          ) : !finished ? (
            q ? (
              <div className="space-y-6">
                {/* Progress Bar */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-950 dark:to-accent-950 border border-primary-200 dark:border-primary-800">
                  <div className="flex justify-between text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">
                    <span>📝 {t('quiz.question')} {idx + 1} {t('quiz.of')} {quiz.questions.length}</span>
                    {mode === 'exam' ? (
                      <span className="text-accent-600 dark:text-accent-400 flex items-center gap-1">
                        <Timer size={16} /> {formatTime(left)}
                      </span>
                    ) : (
                      <span className="text-primary-600 dark:text-primary-400 flex items-center gap-1">
                        <HelpCircle size={16} /> {t('quiz.explanationImmediate')}
                      </span>
                    )}
                  </div>
                  <div className="progress-bar">
                    <div
                      className="h-full bg-gradient-to-r from-primary-600 via-accent-500 to-green-500 rounded-full transition-all duration-500"
                      style={{ width: `${((idx + 1) / quiz.questions.length) * 100}%` }}
                    />
                  </div>
                  <div className="mt-2 text-xs text-neutral-500 dark:text-neutral-500 text-center">
                    {Math.round(((idx + 1) / quiz.questions.length) * 100)}% {t('common.completed') ?? ' '}
                    {unansweredCount > 0 && <span className="ml-2 text-red-500">({unansweredCount} ⚠)</span>}
                  </div>
                </div>

                {/* Question */}
                <div>
                  <h5 className="text-2xl font-display font-bold text-neutral-900 dark:text-white mb-6">
                    {q.text}
                  </h5>

                  {/* Tags */}
                  {q.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {q.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="badge text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                      <span className={`badge text-xs ${
                        q.difficulty === 'Easy' ? 'badge-success' :
                        q.difficulty === 'Medium' ? 'badge-accent' :
                        'bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800'
                      }`}>
                        {q.difficulty}
                      </span>
                    </div>
                  )}

                  {/* Options */}
                  <div className="grid md:grid-cols-2 gap-3">
                    {q.options.map((opt, i) => {
                      const selectedId = selectedMap[q.id]
                      const correctId = correctMap[q.id]
                      const isSelected = selectedId === opt.id
                      const isCorrect = !!correctId && correctId === opt.id && finished
                      const isWrongSelected = !!correctId && finished && isSelected && correctId !== opt.id

                      return (
                        <button
                          key={opt.id}
                          aria-pressed={isSelected}
                          aria-label={`${t('quiz.question')} ${idx + 1} ${opt.text}`}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              selectOption(q.id, opt.id)
                            }
                          }}
                          className={`p-4 rounded-2xl border-2 text-left transition-all duration-300 hover:scale-[1.02] ${
                            isCorrect
                              ? 'border-green-500 bg-gradient-to-r from-green-50 to-green-100 dark:border-green-500 dark:from-green-950 dark:to-green-900'
                              : isWrongSelected
                              ? 'border-red-500 bg-gradient-to-r from-red-50 to-red-100 dark:border-red-500 dark:from-red-950 dark:to-red-900'
                              : isSelected
                              ? 'border-primary-600 bg-gradient-to-r from-primary-50 to-accent-50 dark:border-primary-500 dark:from-primary-950 dark:to-accent-950'
                              : 'border-neutral-200 hover:border-primary-400 dark:border-neutral-700 dark:hover:border-primary-600'
                          }`}
                          onClick={() => selectOption(q.id, opt.id)}
                          disabled={finished}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold transition-all ${
                                isCorrect
                                  ? 'bg-green-600 text-white'
                                  : isWrongSelected
                                  ? 'bg-red-600 text-white'
                                  : isSelected
                                  ? 'bg-primary-600 text-white'
                                  : 'bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400'
                              }`}
                            >
                              {String.fromCharCode(65 + i)}
                            </div>
                            <span className="font-medium flex-1">{opt.text}</span>
                            {isCorrect && <CheckCircle2 className="text-green-600 dark:text-green-400" size={24} />}
                            {isWrongSelected && <XCircle className="text-red-600 dark:text-red-400" size={24} />}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Explanation (Practice mode) */}
                {mode === 'practice' && showExplanation && (
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-green-50 to-accent-50 border-2 border-green-200 dark:from-green-950 dark:to-accent-950">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-green-600 dark:bg-green-700 flex items-center justify-center flex-shrink-0">
                        <Lightbulb size={20} className="text-white" />
                      </div>
                      <div>
                        <h6 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                          💡 {t('quiz.explanation')}
                        </h6>
                        <p className="text-sm text-green-800 dark:text-green-300">
                          {explanationMap[q.id] || t('quiz.explanation')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 flex-wrap">
                  <button
                    className="btn flex-1 min-w-[200px]"
                    onClick={handleAnswer}
                    disabled={!selectedMap[q.id]}
                    aria-label={t('quiz.answer')}
                  >
                    {mode === 'practice' ? (
                      showExplanation ? (
                        <>{t('quiz.nextQuestion')}</>
                      ) : (
                        <>✓ {t('quiz.showAnswer')}</>
                      )
                    ) : (
                      idx === quiz.questions.length - 1 ? t('quiz.finish') : t('quiz.nextQuestion')
                     )}
                   </button>
                  {mode === 'practice' && !showExplanation && (
                    <button className="btn-outline px-8" onClick={skip} aria-label={t('quiz.skip')}>
                      {t('quiz.skip')}
                    </button>
                  )}
                  {mode === 'practice' && showExplanation && (
                    <button className="btn-outline px-8" onClick={() => next()} aria-label={t('quiz.next')}>
                      {t('quiz.next')}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-950 mb-4">
                  <XCircle className="text-red-600 dark:text-red-400" size={32} />
                </div>
                <p className="text-neutral-600 dark:text-neutral-400 font-semibold">
                  {t('quiz.questionUnavailable')}
                </p>
                <p className="text-xs text-neutral-500 mt-2">{t('quiz.error')}</p>
              </div>
            )
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-accent-500 mb-6 shadow-neo-lg">
                <Check className="text-white" size={48} />
              </div>
              <h2 className="text-4xl font-display font-bold mb-3 bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent dark:text-white">
                {t('quiz.completed')} 🎉
              </h2>
              <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-6">
                {t('quiz.congratulations')}
              </p>
              <div className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-br from-green-50 to-accent-50 dark:from-green-950 dark:to-accent-950 border-2 border-green-200 dark:border-green-800 mb-8">
                <Award size={32} className="text-green-600 dark:text-green-400" />
                <div className="text-left">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {score}/{quiz.questions.length}
                  </div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">
                    {t('quiz.correctAnswers')}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <button className="btn" onClick={reset}>
                  🔄 {t('quiz.tryAgain')}
                </button>
                <a href="/materials" className="btn-outline">
                  📚 {t('quiz.backToMaterials')}
                </a>
              </div>
            </div>
          )}
        </section>

        {/* Right Sidebar: Help */}
        <aside className="space-y-6">
          {/* Attempt history */}
          <div className="card">
            <h3 className="font-display font-semibold text-neutral-900 dark:text-white mb-3">{t('quiz.history') || 'History'}</h3>
            <ul className="space-y-2 text-sm">
              {attemptHistory.length === 0 && <li className="text-neutral-500 dark:text-neutral-400">{t('quiz.noHistory') || 'No attempts yet'}</li>}
              {attemptHistory.map((a) => (
                <li key={a.ts} className="flex items-center justify-between p-2 rounded-xl bg-neutral-50 dark:bg-neutral-900">
                  <span className="font-medium">{new Date(a.ts).toLocaleDateString()}</span>
                  <span className="text-xs">{a.score}/{a.total}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Hints */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center">
                <Lightbulb size={16} className="text-white" />
              </div>
              <h3 className="font-display font-semibold text-neutral-900 dark:text-white">
                {t('quiz.hints')}
              </h3>
            </div>
            <ul className="space-y-2">
              {[
                t('quiz.hint.practice'),
                t('quiz.hint.exam'),
                t('quiz.hint.reviewMaterials'),
              ].map((hint, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 text-sm text-neutral-600 dark:text-neutral-400"
                >
                  <span className="text-primary-600 dark:text-primary-400 font-bold">•</span>
                  <span>{hint}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Achievements */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-600 to-accent-700 flex items-center justify-center">
                <Award size={16} className="text-white" />
              </div>
              <h3 className="font-display font-semibold text-neutral-900 dark:text-white">
                {t('dashboard.achievements')}
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {[t('quiz.achievement.firstQuiz'), t('quiz.achievement.perfectScore'), t('quiz.achievement.accuracy90')].map((ach, idx) => (
                <span key={idx} className="badge">
                  {ach}
                </span>
              ))}
            </div>
          </div>

          {/* Progress Checklist */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center">
                <Target size={16} className="text-white" />
              </div>
              <h3 className="font-display font-semibold text-neutral-900 dark:text-white">
                {t('quiz.checklist')}
              </h3>
            </div>
            <ol className="space-y-2 text-sm">
              {[
                { done: true, label: t('quiz.checklist.reviewMaterials') },
                { done: true, label: t('quiz.checklist.pickMode') },
                { done: false, label: t('quiz.checklist.answerAll') },
                { done: false, label: t('quiz.checklist.score75') },
              ].map((step, idx) => (
                <li key={idx} className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                      step.done
                        ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
                        : 'bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-600'
                    }`}
                  >
                    {step.done ? '✓' : idx + 1}
                  </div>
                  <span
                    className={
                      step.done
                        ? 'line-through text-neutral-400 dark:text-neutral-600'
                        : 'text-neutral-700 dark:text-neutral-300'
                    }
                  >
                    {step.label}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </div>
    </div>
  )
}
