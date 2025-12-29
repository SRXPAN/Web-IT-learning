import { useEffect, useState } from 'react'
import { useAuth } from '@/auth/AuthContext'
import { http } from '@/lib/http'
import { useTranslation } from '@/i18n/useTranslation'
import { Trophy, Medal, Award, Crown, Star, Flame, Loader2 } from 'lucide-react'

interface LeaderboardUser {
  id: string
  name: string
  xp: number
  rank: number
  level: number
  badges: string[]
  createdAt: string
}

const BADGE_INFO: Record<string, { icon: typeof Trophy, labelKey: 'badge.firstSteps' | 'badge.risingStar' | 'badge.dedicatedLearner' | 'badge.quizMaster' | 'badge.expert' | 'badge.legend', color: string }> = {
  first_steps: { icon: Star, labelKey: 'badge.firstSteps', color: 'text-yellow-500' },
  rising_star: { icon: Flame, labelKey: 'badge.risingStar', color: 'text-orange-500' },
  dedicated_learner: { icon: Medal, labelKey: 'badge.dedicatedLearner', color: 'text-blue-500' },
  quiz_master: { icon: Award, labelKey: 'badge.quizMaster', color: 'text-purple-500' },
  expert: { icon: Trophy, labelKey: 'badge.expert', color: 'text-green-500' },
  legend: { icon: Crown, labelKey: 'badge.legend', color: 'text-amber-500' },
}

export default function Leaderboard() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        setLoading(true)
        const data = await http.get<LeaderboardUser[]>('/auth/leaderboard?limit=50')
        setLeaderboard(data)
      } catch (e) {
        setError(t('leaderboard.error.loadFailed'))
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchLeaderboard()
  }, [])

  const getRankStyle = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white'
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800'
    if (rank === 3) return 'bg-gradient-to-r from-amber-600 to-amber-700 text-white'
    return 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
  }

  if (loading) {
    return (
      <div className="card flex flex-col items-center justify-center py-16">
        <Loader2 size={48} className="animate-spin text-primary-500 mb-4" />
        <p className="text-neutral-500">{t('leaderboard.loading')}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card text-center py-12">
        <Trophy size={48} className="mx-auto mb-4 text-neutral-300" />
        <p className="text-neutral-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-bold text-neutral-900 dark:text-white">
          {t('leaderboard.title')}
        </h1>
        <span className="text-sm text-neutral-500">
          {leaderboard.length} {t('leaderboard.participants')}
        </span>
      </div>

      {/* Top 3 Podium */}
      {leaderboard.length >= 3 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {/* Second place */}
          <div className="card text-center pt-8 order-1">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center mb-3">
              <span className="text-2xl font-bold text-gray-700">2</span>
            </div>
            <h3 className="font-semibold text-neutral-900 dark:text-white truncate">
              {leaderboard[1].name}
            </h3>
            <p className="text-sm text-neutral-500">{leaderboard[1].xp} XP</p>
            <p className="text-xs text-neutral-400 mt-1">{t('leaderboard.level')} {leaderboard[1].level}</p>
          </div>
          
          {/* First place */}
          <div className="card text-center pt-4 order-0 ring-2 ring-yellow-400 dark:ring-yellow-500">
            <Crown size={24} className="mx-auto text-yellow-500 mb-2" />
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center mb-3">
              <span className="text-3xl font-bold text-white">1</span>
            </div>
            <h3 className="font-bold text-lg text-neutral-900 dark:text-white truncate">
              {leaderboard[0].name}
            </h3>
            <p className="text-primary-600 dark:text-primary-400 font-semibold">{leaderboard[0].xp} XP</p>
            <p className="text-xs text-neutral-400 mt-1">{t('leaderboard.level')} {leaderboard[0].level}</p>
          </div>
          
          {/* Third place */}
          <div className="card text-center pt-12 order-2">
            <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center mb-3">
              <span className="text-xl font-bold text-white">3</span>
            </div>
            <h3 className="font-semibold text-neutral-900 dark:text-white truncate">
              {leaderboard[2].name}
            </h3>
            <p className="text-sm text-neutral-500">{leaderboard[2].xp} XP</p>
            <p className="text-xs text-neutral-400 mt-1">{t('leaderboard.level')} {leaderboard[2].level}</p>
          </div>
        </div>
      )}

      {/* Full leaderboard */}
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
              <th className="py-3 px-4 font-semibold text-neutral-600 dark:text-neutral-400">#</th>
              <th className="py-3 px-4 font-semibold text-neutral-600 dark:text-neutral-400">{t('leaderboard.user')}</th>
              <th className="py-3 px-4 font-semibold text-neutral-600 dark:text-neutral-400 text-center">{t('leaderboard.level')}</th>
              <th className="py-3 px-4 font-semibold text-neutral-600 dark:text-neutral-400 text-right">XP</th>
              <th className="py-3 px-4 font-semibold text-neutral-600 dark:text-neutral-400 hidden md:table-cell">{t('leaderboard.badges')}</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((u) => {
              const isCurrentUser = user && u.id === user.id
              return (
                <tr 
                  key={u.id} 
                  className={`border-b border-neutral-100 dark:border-neutral-800 transition-colors ${
                    isCurrentUser ? 'bg-primary-50 dark:bg-primary-950' : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                  }`}
                >
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm ${getRankStyle(u.rank)}`}>
                      {u.rank}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${isCurrentUser ? 'text-primary-600 dark:text-primary-400' : 'text-neutral-900 dark:text-white'}`}>
                        {u.name}
                      </span>
                      {isCurrentUser && (
                        <span className="px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 text-xs font-medium">
                          {t('leaderboard.you')}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-sm font-medium">
                      ⭐ {u.level}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-neutral-900 dark:text-white">
                    {u.xp.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 hidden md:table-cell">
                    <div className="flex gap-1">
                      {u.badges.slice(0, 3).map(badge => {
                        const info = BADGE_INFO[badge]
                        if (!info) return null
                        const Icon = info.icon
                        return (
                          <span 
                            key={badge} 
                            className={`${info.color}`}
                            title={t(info.labelKey)}
                          >
                            <Icon size={18} />
                          </span>
                        )
                      })}
                      {u.badges.length > 3 && (
                        <span className="text-xs text-neutral-400">+{u.badges.length - 3}</span>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
