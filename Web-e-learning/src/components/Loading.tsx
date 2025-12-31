import { Loader2 } from 'lucide-react'
import { ButtonHTMLAttributes, ReactNode } from 'react'

interface LoadingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  loadingText?: string
  icon?: ReactNode
  children: ReactNode
  variant?: 'primary' | 'outline' | 'ghost'
}

/**
 * Button with loading state
 * Shows spinner and optional loading text when loading
 */
export function LoadingButton({
  loading = false,
  loadingText,
  icon,
  children,
  variant = 'primary',
  className = '',
  disabled,
  ...props
}: LoadingButtonProps) {
  const baseClasses = 'flex items-center justify-center gap-2 transition-all duration-200'
  
  const variantClasses = {
    primary: 'btn',
    outline: 'btn-outline',
    ghost: 'px-4 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800'
  }

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      disabled={loading || disabled}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 size={18} className="animate-spin" />
          {loadingText || children}
        </>
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
    </button>
  )
}

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded'
  width?: string | number
  height?: string | number
  animation?: 'pulse' | 'wave' | 'none'
}

/**
 * Skeleton loading placeholder
 * Shows animated placeholder while content is loading
 */
export function Skeleton({ 
  className = '', 
  variant = 'text',
  width,
  height,
  animation = 'pulse'
}: SkeletonProps) {
  const baseClasses = 'bg-neutral-200 dark:bg-neutral-700'
  
  const variantClasses = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
    rounded: 'rounded-lg'
  }

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-200 dark:from-neutral-700 dark:via-neutral-600 dark:to-neutral-700 bg-[length:200%_100%]',
    none: ''
  }

  const style = {
    width: width ? (typeof width === 'number' ? `${width}px` : width) : undefined,
    height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined
  }

  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
      role="presentation"
      aria-hidden="true"
    />
  )
}

/** Card skeleton for loading states */
export function CardSkeleton() {
  return (
    <div className="card space-y-4">
      <Skeleton variant="rectangular" height={24} width="60%" />
      <Skeleton variant="text" />
      <Skeleton variant="text" />
      <Skeleton variant="text" width="80%" />
    </div>
  )
}

/** Quiz card skeleton */
export function QuizCardSkeleton() {
  return (
    <div className="p-4 rounded-2xl border-2 border-neutral-200 dark:border-neutral-700 space-y-3">
      <div className="flex justify-between items-center">
        <Skeleton variant="text" width="70%" />
        <Skeleton variant="text" width={40} />
      </div>
    </div>
  )
}

/** List skeleton for multiple items */
export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} variant="rectangular" height={48} />
      ))}
    </div>
  )
}

/** Dashboard card skeleton */
export function DashboardCardSkeleton() {
  return (
    <div className="card">
      <div className="flex items-center gap-4 mb-4">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" />
        </div>
      </div>
      <Skeleton variant="rectangular" height={8} className="rounded-full" />
    </div>
  )
}

// ========================================
// Extended Skeleton Presets
// ========================================

/**
 * Skeleton для тексту (кілька рядків)
 */
export function SkeletonText({ 
  lines = 1, 
  className = '' 
}: { 
  lines?: number
  className?: string 
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          height={16}
          width={i === lines - 1 ? '70%' : '100%'}
        />
      ))}
    </div>
  )
}

/**
 * Skeleton для картки контенту (розширена версія)
 */
export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white dark:bg-neutral-800 rounded-xl shadow-sm p-6 ${className}`}>
      <Skeleton variant="rounded" height={160} className="mb-4" />
      <Skeleton variant="text" height={24} width="80%" className="mb-2" />
      <Skeleton variant="text" height={16} width="60%" className="mb-4" />
      <div className="flex gap-2">
        <Skeleton variant="rounded" height={28} width={80} />
        <Skeleton variant="rounded" height={28} width={60} />
      </div>
    </div>
  )
}

/**
 * Skeleton для списку топіків/матеріалів (розширена версія)
 */
export function SkeletonList({ 
  count = 5, 
  className = '' 
}: { 
  count?: number
  className?: string 
}) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div 
          key={i} 
          className="flex items-center gap-4 bg-white dark:bg-neutral-800 rounded-lg p-4"
        >
          <Skeleton variant="circular" width={40} height={40} />
          <div className="flex-1">
            <Skeleton variant="text" height={18} width="60%" className="mb-1" />
            <Skeleton variant="text" height={14} width="40%" />
          </div>
          <Skeleton variant="rounded" height={32} width={80} />
        </div>
      ))}
    </div>
  )
}

/**
 * Skeleton для статистики (числа з підписом)
 */
export function SkeletonStats({ 
  count = 4, 
  className = '' 
}: { 
  count?: number
  className?: string 
}) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div 
          key={i} 
          className="bg-white dark:bg-neutral-800 rounded-lg p-4 text-center"
        >
          <Skeleton variant="text" height={32} width="50%" className="mx-auto mb-2" />
          <Skeleton variant="text" height={14} width="70%" className="mx-auto" />
        </div>
      ))}
    </div>
  )
}

/**
 * Skeleton для аватара з ім'ям
 */
export function SkeletonAvatar({ 
  size = 40,
  showName = true,
  className = '' 
}: { 
  size?: number
  showName?: boolean
  className?: string 
}) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Skeleton variant="circular" width={size} height={size} />
      {showName && (
        <div>
          <Skeleton variant="text" height={16} width={120} className="mb-1" />
          <Skeleton variant="text" height={12} width={80} />
        </div>
      )}
    </div>
  )
}

/**
 * Skeleton для сторінки Dashboard
 */
export function SkeletonDashboard() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton variant="text" height={32} width={200} className="mb-2" />
          <Skeleton variant="text" height={18} width={300} />
        </div>
        <Skeleton variant="circular" width={48} height={48} />
      </div>

      {/* Stats */}
      <SkeletonStats count={4} />

      {/* Content sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress section */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl p-6">
          <Skeleton variant="text" height={24} width={150} className="mb-4" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i}>
                <div className="flex justify-between mb-1">
                  <Skeleton variant="text" height={14} width={100} />
                  <Skeleton variant="text" height={14} width={40} />
                </div>
                <Skeleton variant="rounded" height={8} />
              </div>
            ))}
          </div>
        </div>

        {/* Activity section */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl p-6">
          <Skeleton variant="text" height={24} width={150} className="mb-4" />
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 35 }).map((_, i) => (
              <Skeleton 
                key={i} 
                variant="rounded" 
                height={16} 
                className="aspect-square"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Recent topics */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl p-6">
        <Skeleton variant="text" height={24} width={180} className="mb-4" />
        <SkeletonList count={3} />
      </div>
    </div>
  )
}

/**
 * Skeleton для сторінки матеріалу
 */
export function SkeletonMaterial() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex gap-2">
        <Skeleton variant="text" height={14} width={60} />
        <Skeleton variant="text" height={14} width={8} />
        <Skeleton variant="text" height={14} width={100} />
        <Skeleton variant="text" height={14} width={8} />
        <Skeleton variant="text" height={14} width={120} />
      </div>

      {/* Title */}
      <Skeleton variant="text" height={36} width="70%" />

      {/* Meta */}
      <div className="flex gap-4">
        <Skeleton variant="rounded" height={24} width={100} />
        <Skeleton variant="rounded" height={24} width={80} />
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl p-8">
        <SkeletonText lines={3} className="mb-6" />
        <Skeleton variant="rounded" height={200} className="mb-6" />
        <SkeletonText lines={5} className="mb-6" />
        <SkeletonText lines={4} />
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Skeleton variant="rounded" height={40} width={150} />
        <Skeleton variant="rounded" height={40} width={150} />
      </div>
    </div>
  )
}

/**
 * Skeleton для квізу
 */
export function SkeletonQuiz() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress bar */}
      <div className="flex items-center gap-4">
        <Skeleton variant="rounded" height={8} className="flex-1" />
        <Skeleton variant="text" height={14} width={60} />
      </div>

      {/* Question card */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl p-6">
        <Skeleton variant="text" height={24} width="90%" className="mb-2" />
        <Skeleton variant="text" height={24} width="60%" className="mb-6" />

        {/* Options */}
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton 
              key={i} 
              variant="rounded" 
              height={56} 
              className="w-full"
            />
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Skeleton variant="rounded" height={44} width={120} />
        <Skeleton variant="rounded" height={44} width={120} />
      </div>
    </div>
  )
}

/** Full page loading spinner */
export function PageLoader({ text = 'Завантаження...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <Loader2 size={48} className="animate-spin text-primary-500" />
      <p className="text-neutral-600 dark:text-neutral-400 font-medium">{text}</p>
    </div>
  )
}

/** Default Loading component */
export function Loading({ text }: { text?: string }) {
  return <PageLoader text={text} />
}
