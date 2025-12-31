/**
 * Admin Materials Management (Placeholder)
 * Will be fully implemented later
 */
import { BookOpen } from 'lucide-react'
import { useTranslation } from '@/i18n/useTranslation'

export default function AdminMaterials() {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <BookOpen className="w-7 h-7 text-blue-600" />
            {t('editor.tab.materials')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Управління навчальними матеріалами
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-12">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">Materials Management</h3>
          <p className="text-sm">
            Використовуйте стару вкладку Editor для управління матеріалами.<br/>
            Або цей функціонал буде реалізований тут пізніше.
          </p>
        </div>
      </div>
    </div>
  )
}
