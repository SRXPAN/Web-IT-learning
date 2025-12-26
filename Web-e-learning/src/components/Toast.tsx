import { create } from 'zustand'
import { memo, useEffect, useCallback } from 'react'

type Toast = { id: string; type: 'success' | 'error' | 'info'; msg: string }
type Store = {
  toasts: Toast[]
  push: (t: Omit<Toast, 'id'>) => void
  remove: (id: string) => void
}

export const useToast = create<Store>((set) => ({
  toasts: [],
  push: (t) => set((s) => ({ toasts: [...s.toasts, { ...t, id: crypto.randomUUID() }] })),
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
}))

interface ToastItemProps {
  toast: Toast
  onRemove: () => void
}

const ToastItem = memo(function ToastItem({ toast, onRemove }: ToastItemProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove()
    }, 5000)
    return () => clearTimeout(timer)
  }, [onRemove])

  const bgClass = toast.type === 'success' 
    ? 'bg-gradient-success text-white' 
    : toast.type === 'error' 
    ? 'bg-gradient-warm text-white' 
    : 'bg-gradient-primary text-white'

  return (
    <div
      className={`px-4 py-3 rounded-xl text-sm shadow-flat-lg cursor-pointer hover:scale-105 transition-transform duration-200 ${bgClass}`}
      onClick={onRemove}
    >
      <div className="flex items-center gap-2">
        {toast.type === 'success' && <span>✅</span>}
        {toast.type === 'error' && <span>❌</span>}
        {toast.type === 'info' && <span>ℹ️</span>}
        <span>{toast.msg}</span>
      </div>
    </div>
  )
})

export default function Toasts() {
  const { toasts, remove } = useToast()
  
  const handleRemove = useCallback((id: string) => () => remove(id), [remove])
  
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={handleRemove(t.id)} />
      ))}
    </div>
  )
}
