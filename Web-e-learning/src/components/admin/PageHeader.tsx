/**
 * Reusable Page Header Component
 * Consistent header for all admin pages
 */
import { LucideIcon } from 'lucide-react'
import { ReactNode } from 'react'

interface PageHeaderProps {
  icon?: LucideIcon
  title: string
  description?: string
  actions?: ReactNode
  stats?: string
}

export function PageHeader({ icon: Icon, title, description, actions, stats }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          {Icon && <Icon className="w-7 h-7 text-blue-600" />}
          {title}
        </h1>
        {(description || stats) && (
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {description}
            {stats && ` (${stats})`}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  )
}
