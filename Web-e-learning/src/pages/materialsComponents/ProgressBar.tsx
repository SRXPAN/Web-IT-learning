import { memo } from 'react'

interface ProgressBarProps {
  current: number
  total: number
}

export const ProgressBar = memo(function ProgressBar({ current, total }: ProgressBarProps) {
  const percent = total > 0 ? Math.round((current / total) * 100) : 0
  return (
    <div className="w-full">
      <div className="flex justify-between text-[11px] mb-1 font-medium text-gray-500 dark:text-gray-400">
        <span>Прогрес</span>
        <span>
          {percent}% ({current}/{total})
        </span>
      </div>
      <div className="h-1.5 w-full bg-gray-200/80 dark:bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
})
