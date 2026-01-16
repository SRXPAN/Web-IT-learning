import { useState, useEffect } from 'react'
import { X, Cookie } from 'lucide-react'
import { useTranslation } from '@/i18n/useTranslation'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)
  const { t } = useTranslation()

  useEffect(() => {
    // Перевіряємо чи користувач вже погодився
    const agreed = localStorage.getItem('cookiesAccepted')
    if (!agreed) {
      // Показуємо banner через невелику затримку для кращого UX
      setTimeout(() => setVisible(true), 1000)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('cookiesAccepted', 'true')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 animate-slide-up">
      <div className="max-w-4xl mx-auto">
        <div className="card shadow-2xl border-2 border-primary-200 dark:border-primary-800 bg-white dark:bg-neutral-900">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
              <Cookie className="text-primary-600 dark:text-primary-400" size={20} />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-display font-semibold text-neutral-900 dark:text-white mb-2">
                {t('cookies.title')}
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                {t('cookies.message')}{' '}
                <a 
                  href="/privacy" 
                  target="_blank" 
                  className="text-primary-600 hover:text-primary-700 dark:text-primary-400 underline"
                >
                  {t('cookies.learnMore')}
                </a>
              </p>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={handleAccept}
                  className="btn-sm bg-gradient-to-r from-primary-600 to-accent-500 text-white"
                >
                  {t('cookies.accept')}
                </button>
                <button
                  onClick={handleAccept}
                  className="btn-sm bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                >
                  {t('common.close')}
                </button>
              </div>
            </div>
            
            <button
              onClick={handleAccept}
              className="flex-shrink-0 p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              aria-label={t('common.close')}
            >
              <X size={20} className="text-neutral-500" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
