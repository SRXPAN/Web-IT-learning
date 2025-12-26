import { memo, useCallback } from 'react'
import {
  ExternalLink,
  BookOpen,
  FolderTree,
  PlayCircle,
  FileText,
  Link as LinkIcon,
  CheckCircle2,
  Circle,
} from 'lucide-react'
import { isMaterialSeen } from '@/utils/progress'
import { ProgressBar } from './ProgressBar'
import type { TopicNode, Material, Tab } from './types'
import { useTranslation } from '@/i18n/useTranslation'
import { localize } from '@/utils/localize'
import type { Lang, LocalizedString } from '@elearn/shared'

interface TopicViewProps {
  activeTopic: TopicNode | null
  activeSub: TopicNode | null
  tab: Tab
  setTab: (t: Tab) => void
  query: string
  setQuery: (v: string) => void
  filteredMaterials: (list: Material[]) => Material[]
  openMaterial: (m: Material) => void
}

export function TopicView({
  activeTopic,
  activeSub,
  tab,
  setTab,
  query,
  setQuery,
  filteredMaterials,
  openMaterial,
}: TopicViewProps) {
  const { t, lang } = useTranslation()
  
  if (!activeTopic) return null

  // Локалізовані назви фільтрів
  const filterLabels: Record<Tab, string> = {
    ALL: t('materials.all'),
    pdf: 'PDF',
    video: t('materials.video'),
    text: t('materials.text'),
    link: t('materials.link'),
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* фільтри + пошук */}
      <div className="rounded-2xl md:rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 md:px-5 py-3.5 md:py-4 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center shadow-sm">
        <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          {(['ALL', 'pdf', 'video', 'text', 'link'] as Tab[]).map((tVal) => (
            <button
              key={tVal}
              onClick={() => setTab(tVal)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                tab === tVal
                  ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
              }`}
            >
              {filterLabels[tVal]}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder={t('materials.searchPlaceholder')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full sm:w-72 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-4 py-2 text-xs text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      {/* один розділ або підрозділ */}
      {activeSub ? (
        <TopicContent
          topic={activeSub}
          filteredMats={filteredMaterials(activeSub.materials)}
          onOpen={openMaterial}
          lang={lang as Lang}
          isMain
        />
      ) : (
        <>
          <TopicContent
            topic={activeTopic}
            filteredMats={filteredMaterials(activeTopic.materials)}
            onOpen={openMaterial}
            lang={lang as Lang}
            isMain
          />
          {activeTopic.children?.map((child) => (
            <TopicContent
              key={child.id}
              topic={child}
              filteredMats={filteredMaterials(child.materials)}
              onOpen={openMaterial}
              lang={lang as Lang}
            />
          ))}
        </>
      )}
    </div>
  )
}

interface TopicContentProps {
  topic: TopicNode
  filteredMats: Material[]
  onOpen: (m: Material) => void
  lang: Lang
  isMain?: boolean
}

function TopicContent({
  topic,
  filteredMats,
  onOpen,
  lang,
  isMain,
}: TopicContentProps) {
  const { t } = useTranslation()
  const total = filteredMats.length
  const done = filteredMats.filter((m) => isMaterialSeen(m.id)).length
  const next = filteredMats.find((m) => !isMaterialSeen(m.id))
  
  // Локалізація назви та опису теми
  const topicName = localize(topic.nameJson as LocalizedString, topic.name, lang)
  const topicDesc = localize(topic.descJson as LocalizedString, topic.description || '', lang)

  return (
    <section className="rounded-2xl md:rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 sm:px-5 md:px-6 py-4 sm:py-5 md:py-6 shadow-sm space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="inline-flex items-center gap-2 text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {isMain ? (
              <BookOpen size={14} className="text-blue-500" />
            ) : (
              <FolderTree size={14} className="text-gray-400" />
            )}
            <span>{isMain ? t('materials.mainSection') || 'Основний розділ' : t('materials.subSection') || 'Підрозділ'}</span>
          </p>
          <h2 className="mt-1 text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">
            {topicName}
          </h2>
          {topicDesc && (
            <p className="mt-1 text-xs md:text-[13px] text-gray-600 dark:text-gray-400 max-w-xl">
              {topicDesc}
            </p>
          )}
        </div>
        <div className="w-full md:w-56">
          <ProgressBar current={done} total={total} />
        </div>
      </div>

      {/* блок "продовжити навчання" */}
      {next && (
        <div className="rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 sm:px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-sm">
            <div className="uppercase text-[10px] tracking-[0.16em] text-blue-100/90">
              {t('dashboard.continueLearning')}
            </div>
            <div className="mt-1 text-[13px] font-semibold">
              {t('materials.suggestedNext')}: {localize((next as any).titleJson, next.title, lang)}
            </div>
          </div>
          <button
            onClick={() => onOpen(next)}
            className="inline-flex items-center gap-2 rounded-lg bg-white text-blue-700 px-4 py-2 text-xs font-semibold shadow-sm hover:bg-blue-50 active:scale-95 transition-transform"
          >
            {t('materials.open')} <ExternalLink size={14} />
          </button>
        </div>
      )}

      {/* список матеріалів */}
      <div className="space-y-3">
        {filteredMats.map((m, index) => (
          <MaterialCard
            key={m.id}
            material={m}
            index={index}
            lang={lang}
            onOpen={onOpen}
          />
        ))}

        {filteredMats.length === 0 && (
          <div className="mt-2 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 py-6 text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400 italic">
            {t('materials.noMaterials') || 'Матеріали для цього розділу поки що відсутні або не підходять під фільтр.'}
          </div>
        )}
      </div>
    </section>
  )
}

interface MaterialCardProps {
  material: Material
  index: number
  lang: Lang
  onOpen: (m: Material) => void
}

const MaterialCard = memo(function MaterialCard({ material: m, index, lang, onOpen }: MaterialCardProps) {
  const { t } = useTranslation()
  const isSeen = isMaterialSeen(m.id)
  
  const handleOpen = useCallback(() => onOpen(m), [onOpen, m])
  
  // Локалізована назва матеріалу
  const materialTitle = localize((m as any).titleJson, m.title, lang)

  let Icon = FileText
  let iconColor = 'text-blue-500 bg-blue-50'
  if (m.type === 'video') {
    Icon = PlayCircle
    iconColor = 'text-pink-500 bg-pink-50'
  }
  if (m.type === 'link') {
    Icon = LinkIcon
    iconColor = 'text-emerald-500 bg-emerald-50'
  }
  if (m.type === 'pdf') {
    Icon = BookOpen
    iconColor = 'text-amber-500 bg-amber-50'
  }

  return (
    <div
      className="flex items-center justify-between gap-3 sm:gap-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60 px-3.5 sm:px-4 py-3 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-sm transition-all"
    >
      <div className="flex items-center gap-4 flex-1">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconColor} dark:bg-gray-800`}
        >
          <Icon size={20} />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
              {t('lesson.step') || 'Крок'} {index + 1}
            </span>
            {isSeen && (
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={12} />
                {t('materials.viewed')}
              </span>
            )}
          </div>
          <h4 className="text-sm md:text-[15px] font-medium text-gray-900 dark:text-gray-100">
            {materialTitle}
          </h4>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400 rounded-full border border-gray-200 dark:border-gray-700 px-2 py-0.5">
              {m.type}
            </span>
            {m.tags?.map((tag) => (
              <span
                key={tag}
                className="text-[10px] text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-full px-2 py-0.5"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {!isSeen && (
          <Circle
            size={16}
            className="hidden sm:block text-gray-300 dark:text-gray-600"
          />
        )}
        <button
          onClick={handleOpen}
          className="inline-flex items-center gap-2 rounded-lg bg-gray-900 text-white px-4 py-2 text-xs md:text-[13px] font-semibold hover:bg-black dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 active:scale-95 transition-transform"
        >
          {t('materials.open')} <ExternalLink size={14} />
        </button>
      </div>
    </div>
  )
})
