// src/components/ConfirmDialog.tsx
import React, { useEffect, useRef, useCallback } from 'react'
import { AlertTriangle, Info, AlertCircle, CheckCircle, X, LucideIcon } from 'lucide-react'
import { useTranslation } from '@/i18n/useTranslation'

type DialogVariant = 'danger' | 'warning' | 'info' | 'success'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: DialogVariant
  isLoading?: boolean
}

const variantConfig: Record<DialogVariant, {
  icon: LucideIcon
  iconBg: string
  iconColor: string
  buttonBg: string
  buttonHover: string
}> = {
  danger: {
    icon: AlertTriangle,
    iconBg: 'bg-red-100 dark:bg-red-900/30',
    iconColor: 'text-red-600 dark:text-red-400',
    buttonBg: 'bg-red-600',
    buttonHover: 'hover:bg-red-700',
  },
  warning: {
    icon: AlertCircle,
    iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
    iconColor: 'text-yellow-600 dark:text-yellow-400',
    buttonBg: 'bg-yellow-600',
    buttonHover: 'hover:bg-yellow-700',
  },
  info: {
    icon: Info,
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    iconColor: 'text-blue-600 dark:text-blue-400',
    buttonBg: 'bg-blue-600',
    buttonHover: 'hover:bg-blue-700',
  },
  success: {
    icon: CheckCircle,
    iconBg: 'bg-green-100 dark:bg-green-900/30',
    iconColor: 'text-green-600 dark:text-green-400',
    buttonBg: 'bg-green-600',
    buttonHover: 'hover:bg-green-700',
  },
}

/**
 * Діалог підтвердження дій
 */
export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText,
  cancelText,
  variant = 'danger',
  isLoading = false,
}: ConfirmDialogProps) {
  const { t } = useTranslation()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const confirmButtonRef = useRef<HTMLButtonElement>(null)
  
  const resolvedConfirmText = confirmText ?? t('dialog.confirm')
  const resolvedCancelText = cancelText ?? t('dialog.cancel')
  
  const config = variantConfig[variant]
  const Icon = config.icon

  // Відкриваємо/закриваємо діалог
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen) {
      dialog.showModal()
      // Фокус на кнопку скасування для безпеки
      confirmButtonRef.current?.focus()
    } else {
      dialog.close()
    }
  }, [isOpen])

  // Закриваємо по Escape
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && !isLoading) {
      onClose()
    }
  }, [onClose, isLoading])

  // Закриваємо при кліку на backdrop
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === dialogRef.current && !isLoading) {
      onClose()
    }
  }, [onClose, isLoading])

  const handleConfirm = useCallback(async () => {
    await onConfirm()
    onClose()
  }, [onConfirm, onClose])

  if (!isOpen) return null

  return (
    <dialog
      ref={dialogRef}
      onKeyDown={handleKeyDown}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[100] bg-transparent p-0 m-0 max-w-none max-h-none w-full h-full backdrop:bg-black/50 backdrop:backdrop-blur-sm"
    >
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div 
          className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl max-w-md w-full animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start gap-4 p-6 pb-4">
            <div className={`p-3 rounded-full ${config.iconBg}`}>
              <Icon className={config.iconColor} size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                {title}
              </h2>
              {description && (
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                  {description}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 dark:hover:text-neutral-300 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
              aria-label={t('dialog.close')}
            >
              <X size={20} />
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-3 p-6 pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-xl font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors disabled:opacity-50"
            >
              {resolvedCancelText}
            </button>
            <button
              ref={confirmButtonRef}
              onClick={handleConfirm}
              disabled={isLoading}
              className={`flex-1 px-4 py-2.5 rounded-xl font-medium text-white ${config.buttonBg} ${config.buttonHover} transition-colors disabled:opacity-50 flex items-center justify-center gap-2`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {t('common.processing')}
                </>
              ) : (
                resolvedConfirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </dialog>
  )
}

// Hook для зручного використання

interface UseConfirmDialogOptions {
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: DialogVariant
}

export function useConfirmDialog(options: UseConfirmDialogOptions) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const resolveRef = useRef<((value: boolean) => void) | null>(null)

  const confirm = useCallback(() => {
    setIsOpen(true)
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve
    })
  }, [])

  const handleClose = useCallback(() => {
    setIsOpen(false)
    resolveRef.current?.(false)
    resolveRef.current = null
  }, [])

  const handleConfirm = useCallback(async () => {
    resolveRef.current?.(true)
    resolveRef.current = null
  }, [])

  const DialogComponent = useCallback(() => (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={handleClose}
      onConfirm={handleConfirm}
      isLoading={isLoading}
      {...options}
    />
  ), [isOpen, handleClose, handleConfirm, isLoading, options])

  return {
    confirm,
    setIsLoading,
    Dialog: DialogComponent,
  }
}

// Пресети для типових сценаріїв

/**
 * Діалог підтвердження видалення
 */
export function DeleteConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  isLoading,
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  itemName: string
  isLoading?: boolean
}) {
  const { t } = useTranslation()
  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={`${t('dialog.delete')} ${itemName}?`}
      description={t('dialog.deleteConfirmation')}
      confirmText={t('dialog.delete')}
      cancelText={t('dialog.cancel')}
      variant="danger"
      isLoading={isLoading}
    />
  )
}

/**
 * Діалог підтвердження виходу
 */
export function LogoutConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  isLoading?: boolean
}) {
  const { t } = useTranslation()
  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={t('dialog.logoutTitle')}
      description={t('dialog.logoutDescription')}
      confirmText={t('dialog.logout')}
      cancelText={t('dialog.stay')}
      variant="warning"
      isLoading={isLoading}
    />
  )
}

/**
 * Діалог підтвердження збереження
 */
export function SaveConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  isLoading?: boolean
}) {
  const { t } = useTranslation()
  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={t('dialog.saveChangesTitle')}
      description={t('dialog.saveChangesDescription')}
      confirmText={t('dialog.save')}
      cancelText={t('dialog.dontSave')}
      variant="info"
      isLoading={isLoading}
    />
  )
}

export default ConfirmDialog
