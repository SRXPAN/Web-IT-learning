import { useEffect, useRef } from 'react'

/**
 * Хук для створення інтервалу, який правильно працює з React
 * Зберігає останню версію callback без пересоздання інтервалу
 */
export function useInterval(callback: () => void, delay: number | null): void {
  const savedCallback = useRef(callback)

  // Зберігаємо останню версію callback
  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  // Налаштовуємо інтервал
  useEffect(() => {
    if (delay === null) return

    const tick = () => {
      savedCallback.current()
    }

    const id = setInterval(tick, delay)
    return () => clearInterval(id)
  }, [delay])
}
