import { memo, useMemo, useCallback } from 'react'
import { ChevronRight, Layout, Pencil, Trash2, Plus } from 'lucide-react'
import { countSeen } from '@/utils/progress'
import type { TopicNode } from './types'
import { useTranslation } from '@/i18n/useTranslation'
import { localize } from '@/utils/localize'
import type { Lang, LocalizedString } from '@elearn/shared'

interface SidebarTopicItemProps {
  topic: TopicNode
  index: number
  isActive: boolean
  activeSubId: string | null
  lang: Lang
  isEditable?: boolean
  onSelectTopic: (topicId: string) => void
  onSelectSub: (topicId: string, subId: string) => void
  onEditTopic?: (topic: TopicNode) => void
  onDeleteTopic?: (topic: TopicNode) => void
}

const SidebarTopicItem = memo(function SidebarTopicItem({
  topic,
  index,
  isActive,
  activeSubId,
  lang,
  isEditable,
  onSelectTopic,
  onSelectSub,
  onEditTopic,
  onDeleteTopic,
}: SidebarTopicItemProps) {
  const { percent } = useMemo(() => {
    const allIds = topic.materials
      .concat(topic.children?.flatMap((c) => c.materials) || [])
      .map((m) => m.id)
    const seen = countSeen(allIds)
    const total = allIds.length
    return { percent: total ? Math.round((seen / total) * 100) : 0 }
  }, [topic])

  const handleClick = useCallback(() => onSelectTopic(topic.id), [onSelectTopic, topic.id])
  
  // Локалізована назва теми
  const topicName = localize(topic.nameJson as LocalizedString, topic.name, lang)

  return (
    <div className="group">
      <div className="relative">
        <button
          onClick={handleClick}
          className={`w-full text-left rounded-2xl px-3 py-2.5 flex flex-col gap-1 transition-all border ${
            isActive
              ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-500'
              : 'bg-gray-50 dark:bg-gray-900/40 border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                {index + 1}.
              </span>
              <span className="text-xs font-medium text-gray-900 dark:text-gray-100 line-clamp-1">
                {topicName}
              </span>
            </div>
            <span className="text-[10px] text-gray-500 dark:text-gray-400">
              {percent || 0}%
            </span>
          </div>
        </button>

        {isEditable && (
          <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 flex items-center gap-1 rounded-lg bg-white/95 px-1 py-0.5 text-gray-600 shadow-lg ring-1 ring-gray-200 transition-opacity dark:bg-gray-900/95 dark:text-gray-300 dark:ring-gray-700">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEditTopic?.(topic)
              }}
              className="p-1 hover:text-blue-600 transition-colors"
              title="Edit topic"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDeleteTopic?.(topic)
              }}
              className="p-1 text-red-500 hover:text-red-600 transition-colors"
              title="Delete topic"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>

      {topic.children && topic.children.length > 0 && (
        <div className="mt-2 space-y-1 pl-5 border-l border-gray-200 dark:border-gray-800">
          {topic.children.map((sub) => {
            const subActive = activeSubId === sub.id
            const subName = localize(sub.nameJson as LocalizedString, sub.name, lang)
            return (
              <div key={sub.id} className="group/sub relative">
                <button
                  onClick={() => onSelectSub(topic.id, sub.id)}
                  className={`w-full text-left text-[12px] rounded-lg px-2 py-1.5 flex items-center justify-between gap-2 transition-colors ${
                    subActive
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-200'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-900/60'
                  }`}
                >
                  <span className="line-clamp-1">{subName}</span>
                  {subActive && <ChevronRight size={14} className="opacity-70" />}
                </button>

                {isEditable && (
                  <div className="absolute right-1 top-1 opacity-0 group-hover/sub:opacity-100 flex items-center gap-1 rounded-lg bg-white/95 px-1 py-0.5 text-gray-600 shadow-lg ring-1 ring-gray-200 transition-opacity dark:bg-gray-900/95 dark:text-gray-300 dark:ring-gray-700">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onEditTopic?.(sub)
                      }}
                      className="p-1 hover:text-blue-600 transition-colors"
                      title="Edit lesson"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteTopic?.(sub)
                      }}
                      className="p-1 text-red-500 hover:text-red-600 transition-colors"
                      title="Delete lesson"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
})

interface TopicSidebarProps {
  catTopics: TopicNode[]
  activeTopicId: string | null
  activeSubId: string | null
  loading: boolean
  isEditable?: boolean
  onSelectTopic: (topicId: string) => void
  onSelectSub: (topicId: string, subId: string) => void
  onAddTopic?: () => void
  onEditTopic?: (topic: TopicNode) => void
  onDeleteTopic?: (topic: TopicNode) => void
}

export const TopicSidebar = memo(function TopicSidebar({
  catTopics,
  activeTopicId,
  activeSubId,
  loading,
  isEditable,
  onSelectTopic,
  onSelectSub,
  onAddTopic,
  onEditTopic,
  onDeleteTopic,
}: TopicSidebarProps) {
  const { t, lang } = useTranslation()
  
  return (
    <aside className="hidden lg:block sticky top-24">
      <div className="rounded-2xl md:rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 md:p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
            <Layout size={16} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              {t('materials.sections')}
            </p>
          </div>
        </div>

        <nav className="space-y-3 max-h-[calc(100vh-220px)] overflow-y-auto pr-1 custom-scrollbar">
          {catTopics.map((topic, idx) => (
            <SidebarTopicItem
              key={topic.id}
              topic={topic}
              index={idx}
              isActive={activeTopicId === topic.id}
              activeSubId={activeSubId}
              lang={lang as Lang}
              isEditable={isEditable}
              onSelectTopic={onSelectTopic}
              onSelectSub={onSelectSub}
              onEditTopic={onEditTopic}
              onDeleteTopic={onDeleteTopic}
            />
          ))}

          {catTopics.length === 0 && !loading && (
            <div className="py-6 text-center text-xs text-gray-500 dark:text-gray-400">
              {t('materials.noSections') || 'Розділи ще не додані'}
            </div>
          )}

          {isEditable && (
            <button
              onClick={onAddTopic}
              className="w-full mt-3 inline-flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 text-gray-600 hover:border-blue-500 hover:text-blue-600 dark:border-gray-700 dark:text-gray-300 dark:hover:border-blue-400 dark:hover:text-blue-200 py-2"
            >
              <Plus size={16} />
              <span className="text-sm font-semibold">{t('admin.createTopic') || '+ Create Topic'}</span>
            </button>
          )}
        </nav>
      </div>
    </aside>
  )
})
