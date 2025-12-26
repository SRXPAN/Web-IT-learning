// src/utils/localize.ts
// Утиліта для локалізації контенту з бази даних
import type { LocalizedString, Lang } from '@elearn/shared'

// Re-export Lang type
export type { Lang }

/**
 * Отримує локалізований текст з об'єкта перекладів
 * @param json - об'єкт з перекладами {UA: "...", PL: "...", EN: "..."}
 * @param fallback - значення за замовчуванням (зазвичай англійське)
 * @param lang - поточна мова
 * @returns локалізований текст
 */
export function localize(
  json: LocalizedString | null | undefined,
  fallback: string,
  lang: Lang = 'EN'
): string {
  if (!json) return fallback
  
  // Спробувати поточну мову
  if (json[lang]) return json[lang]
  
  // Fallback на англійську
  if (json.EN) return json.EN
  
  // Fallback на будь-яку доступну мову
  return json.UA || json.PL || fallback
}

/**
 * Хук для отримання функції локалізації з поточною мовою
 */
export function createLocalizer(lang: Lang) {
  return (json: LocalizedString | null | undefined, fallback: string): string => {
    return localize(json, fallback, lang)
  }
}

/**
 * Локалізація назви категорії
 */
export const CATEGORY_LABELS: Record<string, LocalizedString> = {
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

export function localizeCategory(category: string, lang: Lang = 'EN'): string {
  const labels = CATEGORY_LABELS[category]
  if (!labels) return category
  return labels[lang] || labels.EN || category
}
