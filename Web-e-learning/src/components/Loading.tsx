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
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
}

/**
 * Skeleton loading placeholder
 * Shows animated placeholder while content is loading
 */
export function Skeleton({ 
  className = '', 
  variant = 'text',
  width,
  height 
}: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-neutral-200 dark:bg-neutral-700'
  
  const variantClasses = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-xl'
  }

  const style = {
    width: width ? (typeof width === 'number' ? `${width}px` : width) : undefined,
    height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined
  }

  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
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

/** Full page loading spinner */
export function PageLoader({ text = 'Завантаження...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <Loader2 size={48} className="animate-spin text-primary-500" />
      <p className="text-neutral-600 dark:text-neutral-400 font-medium">{text}</p>
    </div>
  )
}
