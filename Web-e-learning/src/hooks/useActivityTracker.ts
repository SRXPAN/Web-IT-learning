import { useEffect } from 'react'
import { initSession, updateActivity } from '@/utils/activity'

export function useActivityTracker() {
  useEffect(() => {
    // Ініціалізуємо сесію
    initSession()
    
    // Оновлюємо активність кожні 30 секунд
    const interval = setInterval(() => {
      updateActivity()
    }, 30000)
    
    // Оновлюємо при закритті/перезавантаженні
    const handleBeforeUnload = () => {
      updateActivity()
    }
    
    // Оновлюємо при виході з фокусу
    const handleVisibilityChange = () => {
      if (document.hidden) {
        updateActivity()
      }
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      updateActivity()
      clearInterval(interval)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])
}
