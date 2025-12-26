import { memo, useCallback, useMemo } from 'react'
import {
  Search,
  BookOpen,
  FolderTree,
  PlayCircle,
  FileText,
  Link as LinkIcon,
  CheckCircle2,
  Circle,
  Sparkles,
  ArrowRight,
  Filter,
} from 'lucide-react'
import { isMaterialSeen, countSeen } from '@/utils/progress'
import { ProgressBar } from './ProgressBar'
import { TopicQuizSection } from './TopicQuizSection'
import type { TopicNode, Material, Tab } from './types'
import { useTranslation } from '@/i18n/useTranslation'
import { localize } from '@/utils/localize'
import type { Lang, LocalizedString } from '@elearn/shared'

interface TopicViewNewProps {
  activeTopic: TopicNode | null
  activeSub: TopicNode | null
  tab: Tab
  setTab: (t: Tab) => void
  query: string
  setQuery: (v: string) => void
  filteredMaterials: (list: Material[]) => Material[]
  openMaterial: (m: Material) => void
  progressVersion: number
}

export function TopicViewNew({
  activeTopic,
  activeSub,
  tab,
  setTab,
  query,
  setQuery,
  filteredMaterials,
  openMaterial,
  progressVersion,
}: TopicViewNewProps) {
  const { t, lang } = useTranslation()

  if (!activeTopic) return null

  const filterTabs: { value: Tab; label: string; icon: React.ReactNode }[] = [
    { value: 'ALL', label: t('materials.all'), icon: <Filter size={14} /> },
    { value: 'video', label: t('materials.video'), icon: <PlayCircle size={14} /> },
    { value: 'pdf', label: 'PDF', icon: <BookOpen size={14} /> },
    { value: 'text', label: t('materials.text'), icon: <FileText size={14} /> },
    { value: 'link', label: t('materials.link'), icon: <LinkIcon size={14} /> },
  ]

  return (
    <div className="space-y-5">
      {/* Filters & Search */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {filterTabs.map(({ value, label, icon }) => (
              <button
                key={value}
                onClick={() => setTab(value)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  tab === value
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t('materials.searchPlaceholder')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full sm:w-64 pl-9 pr-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Content Sections */}
      {activeSub ? (
        <TopicSection
          topic={activeSub}
          filteredMats={filteredMaterials(activeSub.materials)}
          onOpen={openMaterial}
          lang={lang as Lang}
          isMain
          progressVersion={progressVersion}
        />
      ) : (
        <>
          <TopicSection
            topic={activeTopic}
            filteredMats={filteredMaterials(activeTopic.materials)}
            onOpen={openMaterial}
            lang={lang as Lang}
            isMain
            progressVersion={progressVersion}
          />
          {activeTopic.children?.map((child) => (
            <TopicSection
              key={child.id}
              topic={child}
              filteredMats={filteredMaterials(child.materials)}
              onOpen={openMaterial}
              lang={lang as Lang}
              progressVersion={progressVersion}
            />
          ))}
        </>
      )}
    </div>
  )
}

interface TopicSectionProps {
  topic: TopicNode
  filteredMats: Material[]
  onOpen: (m: Material) => void
  lang: Lang
  isMain?: boolean
  progressVersion: number
}

function TopicSection({
  topic,
  filteredMats,
  onOpen,
  lang,
  isMain,
  progressVersion,
}: TopicSectionProps) {
  const { t } = useTranslation()

  const { done, total, next, progress } = useMemo(() => {
    const total = filteredMats.length
    const done = filteredMats.filter((m) => isMaterialSeen(m.id)).length
    const next = filteredMats.find((m) => !isMaterialSeen(m.id))
    const progress = total > 0 ? Math.round((done / total) * 100) : 0
    return { done, total, next, progress }
  }, [filteredMats, progressVersion])

  const topicName = localize(topic.nameJson as LocalizedString, topic.name, lang)
  const topicDesc = localize(topic.descJson as LocalizedString, topic.description || '', lang)

  const isComplete = done === total && total > 0

  return (
    <section className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
      {/* Section Header */}
      <div className={`px-5 py-4 border-b border-gray-100 dark:border-gray-800 ${
        isComplete ? 'bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/10 dark:to-green-900/10' : 'bg-gray-50/50 dark:bg-gray-900/50'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`p-2.5 rounded-xl ${
              isComplete 
                ? 'bg-emerald-100 dark:bg-emerald-900/30' 
                : isMain 
                  ? 'bg-blue-100 dark:bg-blue-900/30' 
                  : 'bg-gray-100 dark:bg-gray-800'
            }`}>
              {isComplete ? (
                <CheckCircle2 size={20} className="text-emerald-600 dark:text-emerald-400" />
              ) : isMain ? (
                <BookOpen size={20} className="text-blue-600 dark:text-blue-400" />
              ) : (
                <FolderTree size={20} className="text-gray-500 dark:text-gray-400" />
              )}
            </div>
            <div>
              <span className={`text-[10px] font-semibold uppercase tracking-wider ${
                isComplete ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'
              }`}>
                {isComplete 
                  ? (t('materials.completed') || 'Завершено') 
                  : isMain 
                    ? (t('materials.mainSection') || 'Основний розділ') 
                    : (t('materials.subSection') || 'Підрозділ')
                }
              </span>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">
                {topicName}
              </h2>
              {topicDesc && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 max-w-lg">
                  {topicDesc}
                </p>
              )}
            </div>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {progress}%
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {done}/{total} {t('materials.materialsCount') || 'матеріалів'}
              </div>
            </div>
            <div className="w-24 h-24 relative">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="15.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="text-gray-200 dark:text-gray-700"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray={`${progress} 100`}
                  strokeLinecap="round"
                  className={isComplete ? 'text-emerald-500' : 'text-blue-500'}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                {isComplete ? (
                  <CheckCircle2 size={20} className="text-emerald-500" />
                ) : (
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    {done}/{total}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Continue Learning Banner */}
      {next && !isComplete && (
        <div className="mx-5 my-4 rounded-xl bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 p-4 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/20">
                <Sparkles size={18} />
              </div>
              <div>
                <div className="text-[10px] font-medium uppercase tracking-wider text-blue-100">
                  {t('dashboard.continueLearning')}
                </div>
                <div className="text-sm font-semibold mt-0.5">
                  {localize((next as any).titleJson, next.title, lang)}
                </div>
              </div>
            </div>
            <button
              onClick={() => onOpen(next)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-blue-700 text-sm font-semibold hover:bg-blue-50 transition-colors"
            >
              {t('common.continue')}
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Materials Grid */}
      <div className="p-5">
        {filteredMats.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {filteredMats.map((m, index) => (
              <MaterialCardNew
                key={m.id}
                material={m}
                index={index}
                lang={lang}
                onOpen={onOpen}
                progressVersion={progressVersion}
              />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
              <FileText size={24} className="text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('materials.noMaterials') || 'Матеріали відсутні'}
            </p>
          </div>
        )}

        {/* Quiz Section - показується коли є квізи */}
        {topic.quizzes && topic.quizzes.length > 0 && (
          <TopicQuizSection
            quizzes={topic.quizzes}
            topicName={topicName}
            allMaterialsViewed={isComplete}
            materialsCount={total}
            viewedCount={done}
            lang={lang}
          />
        )}
      </div>
    </section>
  )
}

interface MaterialCardNewProps {
  material: Material
  index: number
  lang: Lang
  onOpen: (m: Material) => void
  progressVersion: number
}

const MaterialCardNew = memo(function MaterialCardNew({
  material: m,
  index,
  lang,
  onOpen,
  progressVersion,
}: MaterialCardNewProps) {
  const { t } = useTranslation()
  const isSeen = useMemo(() => isMaterialSeen(m.id), [m.id, progressVersion])
  const handleOpen = useCallback(() => onOpen(m), [onOpen, m])

  const materialTitle = localize((m as any).titleJson, m.title, lang)

  const getTypeConfig = () => {
    switch (m.type) {
      case 'video':
        return {
          Icon: PlayCircle,
          color: 'text-pink-500',
          bg: 'bg-pink-50 dark:bg-pink-900/20',
          border: 'border-pink-200 dark:border-pink-800',
          label: t('materials.video'),
        }
      case 'pdf':
        return {
          Icon: BookOpen,
          color: 'text-amber-500',
          bg: 'bg-amber-50 dark:bg-amber-900/20',
          border: 'border-amber-200 dark:border-amber-800',
          label: 'PDF',
        }
      case 'link':
        return {
          Icon: LinkIcon,
          color: 'text-emerald-500',
          bg: 'bg-emerald-50 dark:bg-emerald-900/20',
          border: 'border-emerald-200 dark:border-emerald-800',
          label: t('materials.link'),
        }
      default:
        return {
          Icon: FileText,
          color: 'text-blue-500',
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          border: 'border-blue-200 dark:border-blue-800',
          label: t('materials.text'),
        }
    }
  }

  const config = getTypeConfig()
  const TypeIcon = config.Icon

  return (
    <button
      onClick={handleOpen}
      className={`group relative flex items-start gap-4 p-4 rounded-xl border-2 transition-all text-left hover:shadow-md ${
        isSeen
          ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800'
          : `bg-white dark:bg-gray-900 ${config.border} hover:border-blue-400 dark:hover:border-blue-500`
      }`}
    >
      {/* Status indicator */}
      <div className="absolute top-3 right-3">
        {isSeen ? (
          <CheckCircle2 size={18} className="text-emerald-500" />
        ) : (
          <Circle size={18} className="text-gray-300 dark:text-gray-600 group-hover:text-blue-400" />
        )}
      </div>

      {/* Icon */}
      <div className={`flex-shrink-0 p-3 rounded-xl ${config.bg}`}>
        <TypeIcon size={22} className={config.color} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-6">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-[10px] font-bold uppercase tracking-wider ${config.color}`}>
            {config.label}
          </span>
          <span className="text-[10px] text-gray-400 dark:text-gray-500">
            #{index + 1}
          </span>
        </div>
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {materialTitle}
        </h4>
        {m.tags && m.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {m.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[9px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </button>
  )
})
