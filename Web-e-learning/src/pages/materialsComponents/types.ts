import type { TopicTree, Lang } from '@/services/topics'
import type { LocalizedString } from '@elearn/shared'

export type TopicNode = TopicTree
export type Material = TopicTree['materials'][number]
export type Tab = 'ALL' | 'pdf' | 'video' | 'text' | 'link'
export type Category = NonNullable<TopicNode['category']>

// Локалізовані назви категорій
export const CAT_LABELS: Record<Category, LocalizedString> = {
  Programming: { UA: 'Програмування', PL: 'Programowanie', EN: 'Programming' },
  Mathematics: { UA: 'Математика', PL: 'Matematyka', EN: 'Mathematics' },
  Databases: { UA: 'Бази даних', PL: 'Bazy danych', EN: 'Databases' },
  Networks: { UA: 'Мережі', PL: 'Sieci', EN: 'Networks' },
  WebDevelopment: { UA: 'Веб-розробка', PL: 'Tworzenie stron', EN: 'Web Development' },
  MobileDevelopment: { UA: 'Мобільна розробка', PL: 'Rozwój mobilny', EN: 'Mobile Development' },
  MachineLearning: { UA: 'Машинне навчання', PL: 'Uczenie maszynowe', EN: 'Machine Learning' },
  Security: { UA: 'Кібербезпека', PL: 'Cyberbezpieczeństwo', EN: 'Cybersecurity' },
  DevOps: { UA: 'DevOps', PL: 'DevOps', EN: 'DevOps' },
  OperatingSystems: { UA: 'Операційні системи', PL: 'Systemy operacyjne', EN: 'Operating Systems' },
}

// Функція для отримання локалізованої назви категорії
export function getCategoryLabel(category: Category, lang: Lang = 'EN'): string {
  const labels = CAT_LABELS[category]
  return labels?.[lang] || labels?.EN || category
}

// Legacy export для зворотної сумісності
export const CAT_LABEL: Record<Category, string> = {
  Programming: 'Програмування',
  Mathematics: 'Математика',
  Databases: 'Бази даних',
  Networks: 'Мережі',
  WebDevelopment: 'Веб-розробка',
  MobileDevelopment: 'Мобільна розробка',
  MachineLearning: 'Машинне навчання',
  Security: 'Кібербезпека',
  DevOps: 'DevOps',
  OperatingSystems: 'Операційні системи',
}

export const DEFAULT_CAT: Category = 'Programming'
