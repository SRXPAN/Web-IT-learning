/**
 * Reusable Confirmation Dialog
 * Used for delete confirmations across admin pages
 */
import { useTranslation } from '@/i18n/useTranslation'
import { AlertCircle } from 'lucide-react'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void | Promise<void>
  onCancel: () => void
  variant?: 'danger' | 'warning' | 'info'
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  variant = 'danger',
}: ConfirmDialogProps) {
  const { t } = useTranslation()

  if (!isOpen) return null

  const variantStyles = {
    danger: 'bg-red-600 hover:bg-red-700',
    warning: 'bg-yellow-600 hover:bg-yellow-700',
    info: 'bg-blue-600 hover:bg-blue-700',
  }

  const handleConfirm = async () => {
    await onConfirm()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-xl">
        <div className="flex items-start gap-4">
          <div
            className={`p-2 rounded-lg ${
              variant === 'danger'
                ? 'bg-red-100 dark:bg-red-900/30'
                : variant === 'warning'
                ? 'bg-yellow-100 dark:bg-yellow-900/30'
                : 'bg-blue-100 dark:bg-blue-900/30'
            }`}
          >
            <AlertCircle
              className={`w-6 h-6 ${
                variant === 'danger'
                  ? 'text-red-600 dark:text-red-400'
                  : variant === 'warning'
                  ? 'text-yellow-600 dark:text-yellow-400'
                  : 'text-blue-600 dark:text-blue-400'
              }`}
            />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
            <div className="flex gap-3 justify-end">
              <button onClick={onCancel} className="btn-outline">
                {cancelText || t('common.cancel')}
              </button>
              <button onClick={handleConfirm} className={`btn-primary ${variantStyles[variant]}`}>
                {confirmText || t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
