// src/components/Skeleton.tsx
import React from 'react'

interface SkeletonProps {
  className?: string
  width?: string | number
  height?: string | number
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded'
  animation?: 'pulse' | 'wave' | 'none'
}

/**
 * Skeleton компонент для показу placeholder під час завантаження
 */
export function Skeleton({
  className = '',
  width,
  height,
  variant = 'rectangular',
  animation = 'pulse',
}: SkeletonProps) {
  const baseClasses = 'bg-gray-200 dark:bg-gray-700'
  
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: '',
    rounded: 'rounded-lg',
  }
  
  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%]',
    none: '',
  }
  
  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
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

// Пресети для типових елементів

/**
 * Skeleton для тексту (один рядок)
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
 * Skeleton для картки контенту
 */
export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 ${className}`}>
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
 * Skeleton для списку топіків/матеріалів
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
          className="flex items-center gap-4 bg-white dark:bg-gray-800 rounded-lg p-4"
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
          className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center"
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
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
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
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
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
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
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
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8">
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
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
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

export default Skeleton
