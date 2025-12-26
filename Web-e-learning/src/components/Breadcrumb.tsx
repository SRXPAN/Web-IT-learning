import { memo } from 'react'
import { ChevronRight } from 'lucide-react'

type Crumb = { label: string; onClick?: () => void; current?: boolean }

interface BreadcrumbProps {
  items: Crumb[]
}

function Breadcrumb({ items }: BreadcrumbProps) {
    return (
        <nav aria-label="Breadcrumb" className="text-sm text-gray-500 dark:text-gray-400 flex flex-wrap items-center gap-1">
            {items.map((c,i)=> (
                <span key={i} className="flex items-center gap-1">
          {i>0 && <ChevronRight size={14}/>}
                    {c.current
                        ? <span className="font-medium">{c.label}</span>
                        : c.onClick
                            ? <button onClick={c.onClick} className="hover:underline">{c.label}</button>
                            : <span>{c.label}</span>
                    }
        </span>
            ))}
        </nav>
    )
}

export default memo(Breadcrumb)
