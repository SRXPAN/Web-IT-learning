import { memo } from 'react'

interface ProgressPillProps {
  seen: number
  total: number
}

function ProgressPill({ seen, total }: ProgressPillProps) {
  const pct = total ? Math.round((seen / total) * 100) : 0
  return (
    <span className="text-xs px-3 py-1.5 rounded-full font-semibold bg-gradient-primary text-white shadow-flat dark:bg-gradient-to-r dark:from-accentFrom dark:to-accentTo dark:shadow-neumorph">
      {seen}/{total} • {pct}%
    </span>
  )
}

export default memo(ProgressPill)
