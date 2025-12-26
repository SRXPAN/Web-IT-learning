import { memo, useMemo } from 'react'
import { FolderTree } from 'lucide-react'
import { countSeen } from '@/utils/progress'
import { useTranslation } from '@/i18n/useTranslation'
import { localize, Lang } from '@/utils/localize'
import { ProgressBar } from './ProgressBar'
import type { TopicNode } from './types'

interface TopicCardProps {
  topic: TopicNode
  lang: Lang
}

const TopicCard = memo(function TopicCard({ topic, lang }: TopicCardProps) {
  const { t } = useTranslation()
  const { seen, total } = useMemo(() => {
    const allIds = topic.materials
      .concat(topic.children?.flatMap((c) => c.materials) || [])
      .map((m) => m.id)
    return { seen: countSeen(allIds), total: allIds.length }
  }, [topic])

  const topicName = localize((topic as any).nameJson, topic.name, lang)

  return (
    <div className="group rounded-2xl md:rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-500 transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 rounded-2xl bg-gray-100 dark:bg-gray-800 text-blue-600 dark:text-blue-300 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-colors">
          <FolderTree size={22} />
        </div>
        <span className="rounded-full border border-gray-200 dark:border-gray-700 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
          {t('materials.section')}
        </span>
      </div>
      <h3 className="font-semibold text-[15px] text-gray-900 dark:text-gray-100 mb-2 group-hover:text-blue-700 dark:group-hover:text-blue-200">
        {topicName}
      </h3>
      <p className="text-[12px] text-gray-500 dark:text-gray-400 mb-3">
        {t('materials.materialsCount')}: {total || 0} · {t('materials.completedCount')}: {seen}
      </p>
      <ProgressBar current={seen} total={total} />
    </div>
  )
})

interface DashboardViewProps {
  catTopics: TopicNode[]
}

export const DashboardView = memo(function DashboardView({ catTopics }: DashboardViewProps) {
  const { t, lang } = useTranslation()

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="rounded-2xl md:rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-5 md:px-6 py-5 md:py-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          {t('materials.chooseSectionTitle')}
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 max-w-xl">
          {t('materials.chooseSectionDesc')}
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
        {catTopics.map((topic) => (
          <TopicCard key={topic.id} topic={topic} lang={lang as Lang} />
        ))}
      </div>
    </div>
  )
})
