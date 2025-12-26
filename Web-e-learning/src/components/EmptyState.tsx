// src/components/EmptyState.tsx
import React from 'react'
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
  return (
    <EmptyState
      icon={BookOpen}
      title="Матеріалів поки немає"
      description="Тут з'являться навчальні матеріали, коли вони будуть додані"
      action={onAction ? { label: 'Переглянути категорії', onClick: onAction } : undefined}
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
  return (
    <EmptyState
      icon={Search}
      title="Нічого не знайдено"
      description={query 
        ? `За запитом "${query}" нічого не знайдено. Спробуйте інший пошуковий запит.`
        : 'Спробуйте змінити параметри пошуку'
      }
      action={onClear ? { label: 'Очистити пошук', onClick: onClear } : undefined}
      className={className}
    />
  )
}

/**
 * Порожній стан для рейтингу
 */
export function EmptyLeaderboard({ className = '' }: { className?: string }) {
  return (
    <EmptyState
      icon={Trophy}
      title="Рейтинг порожній"
      description="Поки що ніхто не набрав балів. Станьте першим!"
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
  return (
    <EmptyState
      icon={ClipboardList}
      title="Історія порожня"
      description="Ви ще не проходили жодного квізу. Почніть навчання зараз!"
      action={onStartQuiz ? { label: 'Пройти квіз', onClick: onStartQuiz } : undefined}
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
  return (
    <EmptyState
      icon={TrendingUp}
      title="Прогресу поки немає"
      description="Почніть вивчати матеріали, щоб відстежувати свій прогрес"
      action={onStartLearning ? { label: 'Почати навчання', onClick: onStartLearning } : undefined}
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
  return (
    <EmptyState
      icon={FileText}
      title="Топіків поки немає"
      description="Створіть перший топік для початку роботи"
      action={onCreateTopic ? { label: 'Створити топік', onClick: onCreateTopic } : undefined}
      className={className}
    />
  )
}

/**
 * Порожній стан для підказок/рекомендацій
 */
export function EmptyRecommendations({ className = '' }: { className?: string }) {
  return (
    <EmptyState
      icon={Lightbulb}
      title="Рекомендацій поки немає"
      description="Продовжуйте навчання, і система почне пропонувати персоналізовані рекомендації"
      className={className}
      size="sm"
    />
  )
}

export default EmptyState
