import { useAuth } from '@/auth/AuthContext'
import { Star, Trophy, Target, TrendingUp, Clock, Flame, Zap, Users, BookOpen, Play, FileText, Award, LucideIcon } from 'lucide-react'
import { useEffect, useState, useCallback } from 'react'
import { useTranslation } from '@/i18n/useTranslation'
import { getTodayGoals, saveDailyGoals, getGoalText, DailyGoal } from '@/utils/dailyGoals'
import { getTodayWeakSpots, getTodayTip, getWeakSpotText, getTipText } from '@/utils/weakSpots'
import { calculateStreak, getLast7DaysStats, logGoalComplete } from '@/utils/activity'
import { useActivityTracker } from '@/hooks/useActivityTracker'
import QuizHistory from '@/components/QuizHistory'

function ProgressBar({value}:{value:number}){
  const v = Math.max(0, Math.min(100, Math.round(value)))
  return (
    <div className="progress-bar">
      <div className="progress-fill" style={{width:`${v}%`}}/>
    </div>
  )
}

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: number | string
  sub?: string
}

function StatCard({ icon: Icon, label, value, sub }: StatCardProps) {
  return (
    <div className="card group hover:scale-105">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 transition-transform group-hover:scale-110">
          <Icon size={20} className="text-white"/>
        </div>
        <div>
          <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400">{label}</div>
          <div className="text-xl font-display font-bold text-neutral-900 dark:text-white">{value}</div>
          {sub && <div className="text-xs text-neutral-400">{sub}</div>}
        </div>
      </div>
    </div>
  )
}

function CourseCard({ name, step, progress }: { name: string; step: string; progress: number }) {
  return (
    <div className="card hover:shadow-neo-lg">
      <div className="space-y-3">
        <div>
          <h4 className="font-display font-semibold text-neutral-900 dark:text-white">{name}</h4>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">{step}</p>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400">
            <span>Progress</span>
            <span className="font-semibold">{progress}%</span>
          </div>
          <ProgressBar value={progress} />
        </div>

        <div className="flex gap-2">
          <button className="btn flex-1">
            <Play size={16} className="inline mr-1"/>Продовжити
          </button>
          <button className="btn-outline">
            <FileText size={16} className="inline mr-1"/>Матеріали
          </button>
        </div>
      </div>
    </div>
  )
}

function WeakSpotItem({ topic, advice }: { topic: string; advice: string }) {
  return (
    <li className="flex items-start gap-3 p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-600 to-accent-700 flex items-center justify-center flex-shrink-0">
        <Target size={16} className="text-white"/>
      </div>
      <div className="flex-1">
        <div className="font-semibold text-sm text-neutral-900 dark:text-white">{topic}</div>
        <div className="text-xs text-neutral-600 dark:text-neutral-400">{advice}</div>
      </div>
    </li>
  )
}

function StreakDay({ active, day }: { active: boolean; day: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`w-8 h-8 rounded-lg transition-all ${
        active 
          ? 'bg-gradient-to-br from-primary-600 to-primary-700 shadow-neo' 
          : 'bg-neutral-200 dark:bg-neutral-800'
      }`}/>
      <span className="text-xs text-neutral-500 dark:text-neutral-400">{day}</span>
    </div>
  )
}

export default function Dashboard(){
  const { user } = useAuth()
  const { t, lang } = useTranslation()
  useActivityTracker() // Трекінг активності
  
  const xp = user?.xp ?? 0
  const level = Math.floor(xp / 100) + 1
  const nextLevelAt = level * 100
  const progressToNext = Math.min(100, Math.round(((xp % 100) / 100) * 100))

  // Mock data
  const streak = 7
  const attemptsLast7Days = 12
  const studyTimeLast7Days = 4.5

  // Mock data with translations
  const courses = [
    { id: 1, name: t('dashboard.course.algorithms'), step: t('dashboard.lesson.quicksort'), progress: 65 },
    { id: 2, name: t('dashboard.course.sql'), step: t('dashboard.lesson.joins'), progress: 42 },
  ]

  const streakDays = [
    t('dashboard.weekday.mon'),
    t('dashboard.weekday.tue'),
    t('dashboard.weekday.wed'),
    t('dashboard.weekday.thu'),
    t('dashboard.weekday.fri'),
    t('dashboard.weekday.sat'),
    t('dashboard.weekday.sun'),
  ]
  const activeStreak = [true, true, true, true, true, true, true]

  const achievements = [
    { id: 1, name: t('dashboard.achievement.firstQuiz'), earned: true },
    { id: 2, name: t('dashboard.achievement.weekStreak'), earned: true },
    { id: 3, name: t('dashboard.achievement.fastAnswer'), earned: false },
    { id: 4, name: t('dashboard.achievement.sqlMaster'), earned: false },
  ]

  const [goals, setGoals] = useState<DailyGoal[]>([])
  const [weakSpots, setWeakSpots] = useState<{ topic: string; advice: string }[]>([])
  const [dailyTip, setDailyTip] = useState<string>('')
  const [streakData, setStreakData] = useState({ current: 0, weekDays: [false, false, false, false, false, false, false] })
  const [last7DaysStats, setLast7DaysStats] = useState({ timeHours: '0.0', attempts: 0 })

  // Ініціалізація goals один раз
  useEffect(() => {
    const todayGoals = getTodayGoals()
    setGoals(todayGoals)
    
    // Статистика стріку та 7 днів
    const streak = calculateStreak()
    setStreakData(streak)
    const stats = getLast7DaysStats()
    setLast7DaysStats(stats)
  }, [])

  // Зберігання goals при зміні
  useEffect(() => {
    if (goals.length > 0) {
      // Перевіряємо чи щось змінилося на "done"
      const previousGoalsStr = localStorage.getItem('daily_goals')
      const previousGoals: DailyGoal[] = previousGoalsStr ? JSON.parse(previousGoalsStr) : []
      goals.forEach(g => {
        const prev = previousGoals.find((p) => p.id === g.id)
        if (g.done && (!prev || !prev.done)) {
          logGoalComplete()
        }
      })
      
      saveDailyGoals(goals)
    }
  }, [goals])

  // Оновлення weakSpots та tips при зміні мови
  useEffect(() => {
    const spots = getTodayWeakSpots()
    setWeakSpots(spots.map(s => getWeakSpotText(s, lang)))
    
    const tip = getTodayTip()
    setDailyTip(getTipText(tip, lang))
  }, [lang])

  return (
    <div className="space-y-6">
      {/* Hero Panel */}
      <div className="card">
        <div className="grid md:grid-cols-[1fr_auto] gap-6">
          {/* Left: Avatar + Greeting + Level */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-display font-bold text-white">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-display font-bold text-neutral-900 dark:text-white">
                {t('dashboard.welcome')}, {user?.name || 'Student'}!
              </h1>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                {t('dashboard.level')} {level} • {xp} XP
              </p>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-500 dark:text-neutral-400">{t('dashboard.nextLevel')}</span>
                  <span className="font-semibold text-primary-600 dark:text-primary-400">{progressToNext}%</span>
                </div>
                <ProgressBar value={progressToNext} />
              </div>
            </div>
          </div>

          {/* Right: Stats */}
          <div className="grid grid-cols-3 gap-3">
            <StatCard icon={Flame} label={t('dashboard.streak')} value={streakData.current} sub={t('dashboard.days')}/>
            <StatCard icon={Target} label={t('dashboard.attempts')} value={last7DaysStats.attempts} sub={t('dashboard.last7days')}/>
            <StatCard icon={Clock} label={t('dashboard.time')} value={`${last7DaysStats.timeHours}h`} sub={t('dashboard.last7days')}/>
          </div>
        </div>
      </div>

      {/* 3-Column Layout */}
      <div className="grid lg:grid-cols-[1fr_400px] gap-6">
        {/* Left: Main Content */}
        <div className="space-y-6">
          {/* Continue Learning */}
          <div className="card">
            <h2 className="text-xl font-display font-bold text-neutral-900 dark:text-white mb-4">
              {t('dashboard.continueLearning')}
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {courses.map(course => (
                <div key={course.id} className="card hover:shadow-neo-lg">
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-display font-semibold text-neutral-900 dark:text-white">{course.name}</h4>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">{course.step}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400">
                        <span>{t('materials.progress')}</span>
                        <span className="font-semibold">{course.progress}%</span>
                      </div>
                      <ProgressBar value={course.progress} />
                    </div>

                    <div className="flex gap-2">
                      <button className="btn flex-1">
                        <Play size={16} className="inline mr-1"/>{t('common.continue')}
                      </button>
                      <button className="btn-outline">
                        <FileText size={16} className="inline mr-1"/>{t('nav.materials')}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weak Spots */}
          <div className="card">
            <h2 className="text-xl font-display font-bold text-neutral-900 dark:text-white mb-4">
              {t('dashboard.recommended')}
            </h2>
            <ul className="space-y-2 mb-4">
              {weakSpots.map((spot, idx) => (
                <WeakSpotItem key={idx} {...spot} />
              ))}
            </ul>

            {/* Motivational Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-accent-50 to-primary-50 dark:from-accent-950 dark:to-primary-950 border border-accent-200 dark:border-accent-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-600 to-accent-700 flex items-center justify-center">
                  <Zap size={20} className="text-white"/>
                </div>
                <div>
                  <div className="font-semibold text-sm text-neutral-900 dark:text-white">
                    💡 {t('dashboard.tipOfDay')}
                  </div>
                  <div className="text-xs text-neutral-600 dark:text-neutral-400">
                    {dailyTip}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Daily Goals */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Target size={20} className="text-primary-600 dark:text-primary-400"/>
              <h3 className="text-lg font-display font-semibold text-neutral-900 dark:text-white">
                {t('dashboard.dailyGoals')}
              </h3>
            </div>
            <ul className="space-y-2">
              {goals.map(g=> (
                <li key={g.id} className="flex items-center justify-between p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                  <label className="flex items-center gap-3 cursor-pointer flex-1">
                    <input 
                      type="checkbox" 
                      checked={g.done} 
                      onChange={()=> setGoals(s=> s.map(x=> x.id===g.id ? {...x, done:!x.done} : x))}
                      className="rounded-lg"
                    />
                    <span className={`font-medium ${g.done ? 'line-through text-neutral-400 dark:text-neutral-600' : 'text-neutral-700 dark:text-neutral-300'}`}>
                      {getGoalText(g.templateId, lang)}
                    </span>
                  </label>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    g.done 
                      ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300' 
                      : 'bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                  }`}>
                    {g.done ? t('dashboard.done') : t('dashboard.pending')}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right: Sidebar */}
        <div className="space-y-6">
          {/* Achievements */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Award size={20} className="text-primary-600 dark:text-primary-400"/>
              <h3 className="text-lg font-display font-semibold text-neutral-900 dark:text-white">
                {t('dashboard.achievements')}
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {achievements.map(ach => (
                <span 
                  key={ach.id} 
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    ach.earned
                      ? 'bg-primary-100 text-primary-700 border border-primary-200 dark:bg-primary-950 dark:text-primary-300 dark:border-primary-800'
                      : 'bg-neutral-100 text-neutral-400 border border-neutral-200 dark:bg-neutral-900 dark:text-neutral-600 dark:border-neutral-800 opacity-50'
                  }`}
                >
                  {ach.earned ? '🏆' : '🔒'} {ach.name}
                </span>
              ))}
            </div>
          </div>

          {/* Streak Calendar */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Flame size={20} className="text-primary-600 dark:text-primary-400"/>
              <h3 className="text-lg font-display font-semibold text-neutral-900 dark:text-white">
                {t('dashboard.streak')} — {streakData.current} {t('dashboard.days')}
              </h3>
            </div>
            <div className="flex justify-between">
              {streakDays.map((day, idx) => (
                <StreakDay key={idx} day={day} active={streakData.weekDays[idx]} />
              ))}
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-3 text-center">
              {t('dashboard.keepStreak')}
            </p>
          </div>

          {/* Quiz History */}
          <QuizHistory />

          {/* Community */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Users size={20} className="text-primary-600 dark:text-primary-400"/>
              <h3 className="text-lg font-display font-semibold text-neutral-900 dark:text-white">
                {t('dashboard.community')}
              </h3>
            </div>
            <a 
              href="/community" 
              className="flex items-center justify-between p-3 rounded-2xl bg-primary-50 hover:bg-primary-100 dark:bg-primary-950 dark:hover:bg-primary-900 text-primary-700 dark:text-primary-300 font-medium transition-colors group"
            >
              <span>{t('dashboard.goToCourseChat')}</span>
              <div className="w-8 h-8 rounded-lg bg-primary-600 dark:bg-primary-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users size={16} className="text-white"/>
              </div>
            </a>
          </div>

          {/* Quick Links */}
          <div className="card">
            <h3 className="text-lg font-display font-semibold text-neutral-900 dark:text-white mb-4">
              {t('dashboard.quickLinks')}
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="/materials" className="flex items-center gap-3 p-3 rounded-2xl bg-primary-50 hover:bg-primary-100 dark:bg-primary-950 dark:hover:bg-primary-900 text-primary-700 dark:text-primary-300 font-medium transition-colors">
                  <BookOpen size={20}/> {t('nav.materials')}
                </a>
              </li>
              <li>
                <a href="/quiz" className="flex items-center gap-3 p-3 rounded-2xl bg-accent-50 hover:bg-accent-100 dark:bg-accent-950 dark:hover:bg-accent-900 text-accent-700 dark:text-accent-300 font-medium transition-colors">
                  <Trophy size={20}/> {t('nav.quiz')}
                </a>
              </li>
              <li>
                <a href="/leaderboard" className="flex items-center gap-3 p-3 rounded-2xl bg-green-50 hover:bg-green-100 dark:bg-green-950 dark:hover:bg-green-900 text-green-700 dark:text-green-300 font-medium transition-colors">
                  <TrendingUp size={20}/> {t('nav.leaderboard')}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
