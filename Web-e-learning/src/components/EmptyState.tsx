// src/components/EmptyState.tsx
import React from 'react'
import { useTranslation } from '@/i18n/useTranslation'
import { 
  BookOpen, 
  Trophy, 
  ClipboardList, 
  Search, 
  Inbox,
  TrendingUp,
  FileText,
  Lightbulb,
  LucideIcon 
} from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

/**
 * Компонент для відображення порожнього стану
 */
export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className = '',
  size = 'md',
}: EmptyStateProps) {
  const sizeClasses = {
    sm: {
      container: 'py-6',
      icon: 40,
      title: 'text-base',
      description: 'text-sm',
      button: 'px-4 py-2 text-sm',
    },
    md: {
      container: 'py-12',
      icon: 56,
      title: 'text-lg',
      description: 'text-base',
      button: 'px-6 py-2.5',
    },
    lg: {
      container: 'py-16',
      icon: 72,
      title: 'text-xl',
      description: 'text-lg',
      button: 'px-8 py-3',
    },
  }

  const styles = sizeClasses[size]

  return (
    <div className={`flex flex-col items-center justify-center text-center ${styles.container} ${className}`}>
      <div className="rounded-full bg-neutral-100 dark:bg-neutral-800 p-4 mb-4">
        <Icon 
          size={styles.icon} 
          className="text-neutral-400 dark:text-neutral-500"
          strokeWidth={1.5}
        />
      </div>
      
      <h3 className={`font-semibold text-neutral-900 dark:text-neutral-100 mb-2 ${styles.title}`}>
        {title}
      </h3>
      
      {description && (
        <p className={`text-neutral-500 dark:text-neutral-400 max-w-sm ${styles.description}`}>
          {description}
        </p>
      )}
      
      {action && (
        <button
          onClick={action.onClick}
          className={`mt-6 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-colors ${styles.button}`}
        >
          {action.label}
        </button>
      )}
    </div>
  )
}

// Пресети для типових сценаріїв

/**
 * Порожній стан для матеріалів
 */
export function EmptyMaterials({ 
  onAction,
  className = '' 
}: { 
  onAction?: () => void
  className?: string 
}) {
  const { t } = useTranslation()
  return (
    <EmptyState
      icon={BookOpen}
      title={t('empty.materials.title')}
      description={t('empty.materials.description')}
      action={onAction ? { label: t('empty.materials.action'), onClick: onAction } : undefined}
      className={className}
    />
  )
}

/**
 * Порожній стан для результатів пошуку
 */
export function EmptySearch({ 
  query,
  onClear,
  className = '' 
}: { 
  query?: string
  onClear?: () => void
  className?: string 
}) {
  const { t } = useTranslation()
  return (
    <EmptyState
      icon={Search}
      title={t('empty.search.title')}
      description={query 
        ? `${query} ${t('empty.search.descriptionWithQuery')}`
        : t('empty.search.descriptionNoQuery')
      }
      action={onClear ? { label: t('empty.search.action'), onClick: onClear } : undefined}
      className={className}
    />
  )
}

/**
 * Порожній стан для рейтингу
 */
export function EmptyLeaderboard({ className = '' }: { className?: string }) {
  const { t } = useTranslation()
  return (
    <EmptyState
      icon={Trophy}
      title={t('empty.leaderboard.title')}
      description={t('empty.leaderboard.description')}
      className={className}
    />
  )
}

/**
 * Порожній стан для історії квізів
 */
export function EmptyQuizHistory({ 
  onStartQuiz,
  className = '' 
}: { 
  onStartQuiz?: () => void
  className?: string 
}) {
  const { t } = useTranslation()
  return (
    <EmptyState
      icon={ClipboardList}
      title={t('empty.quizHistory.title')}
      description={t('empty.quizHistory.description')}
      action={onStartQuiz ? { label: t('empty.quizHistory.action'), onClick: onStartQuiz } : undefined}
      className={className}
    />
  )
}

/**
 * Порожній стан для прогресу
 */
export function EmptyProgress({ 
  onStartLearning,
  className = '' 
}: { 
  onStartLearning?: () => void
  className?: string 
}) {
  const { t } = useTranslation()
  return (
    <EmptyState
      icon={TrendingUp}
      title={t('empty.progress.title')}
      description={t('empty.progress.description')}
      action={onStartLearning ? { label: t('empty.progress.action'), onClick: onStartLearning } : undefined}
      className={className}
    />
  )
}

/**
 * Порожній стан для топіків
 */
export function EmptyTopics({ 
  onCreateTopic,
  className = '' 
}: { 
  onCreateTopic?: () => void
  className?: string 
}) {
  const { t } = useTranslation()
  return (
    <EmptyState
      icon={FileText}
      title={t('empty.topics.title')}
      description={t('empty.topics.description')}
      action={onCreateTopic ? { label: t('empty.topics.action'), onClick: onCreateTopic } : undefined}
      className={className}
    />
  )
}

/**
 * Порожній стан для підказок/рекомендацій
 */
export function EmptyRecommendations({ className = '' }: { className?: string }) {
  const { t } = useTranslation()
  return (
    <EmptyState
      icon={Lightbulb}
      title={t('empty.recommendations.title')}
      description={t('empty.recommendations.description')}
      className={className}
      size="sm"
    />
  )
}

export default EmptyState
