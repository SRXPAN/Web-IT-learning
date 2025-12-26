import { Code2, Sigma, Database as DatabaseIcon, Network } from 'lucide-react'
import type { Category } from './types'

export const CategoryIcon = ({ category }: { category: Category }) => {
  const icons: Record<Category, JSX.Element> = {
    Programming: <Code2 size={18} />,
    Mathematics: <Sigma size={18} />,
    Databases: <DatabaseIcon size={18} />,
    Networks: <Network size={18} />,
  }
  return icons[category]
}
