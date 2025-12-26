import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'
import PasswordInput from '@/components/PasswordInput'
import { Loader2, UserPlus } from 'lucide-react'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()
  const { register } = useAuth()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    
    // Validation
    if (password !== confirmPassword) {
      setErr('Паролі не співпадають')
      return
    }
    
    if (password.length < 8) {
      setErr('Пароль повинен містити мінімум 8 символів')
      return
    }
    
    setLoading(true)
    try {
      await register(name, email, password)
      nav('/')
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Registration failed'
      setErr(message)
    } finally {
      setLoading(false)
    }
  }

  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0

  return (
    <form onSubmit={submit} className="card max-w-md mx-auto">
      <h2 className="text-2xl font-display font-bold mb-6 text-center">Реєстрація</h2>
      
      <label className="block mb-2 text-sm font-medium">Ім'я</label>
      <input 
        value={name} 
        onChange={e => setName(e.target.value)} 
        className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 px-3 py-2 bg-white dark:bg-gray-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
        placeholder="Ваше ім'я"
        required
        disabled={loading}
      />
      
      <label className="block mt-4 mb-2 text-sm font-medium">Email</label>
      <input 
        value={email} 
        onChange={e => setEmail(e.target.value)} 
        type="email"
        className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 px-3 py-2 bg-white dark:bg-gray-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
        placeholder="your@email.com"
        required
        disabled={loading}
      />
      
      <label className="block mt-4 mb-2 text-sm font-medium">Пароль</label>
      <PasswordInput 
        value={password} 
        onChange={e => setPassword(e.target.value)} 
        placeholder="••••••••"
        showStrength
        required
        disabled={loading}
      />
      
      <label className="block mt-4 mb-2 text-sm font-medium">Підтвердіть пароль</label>
      <div className="relative">
        <PasswordInput 
          value={confirmPassword} 
          onChange={e => setConfirmPassword(e.target.value)} 
          placeholder="••••••••"
          required
          disabled={loading}
        />
        {confirmPassword.length > 0 && (
          <span className={`absolute right-10 top-1/2 -translate-y-1/2 text-xs font-medium ${
            passwordsMatch ? 'text-green-500' : 'text-red-500'
          }`}>
            {passwordsMatch ? '✓' : '✗'}
          </span>
        )}
      </div>
      
      <button 
        type="submit" 
        className="btn mt-6 w-full flex items-center justify-center gap-2"
        disabled={loading || (password.length > 0 && !passwordsMatch)}
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Реєстрація...
          </>
        ) : (
          <>
            <UserPlus size={18} />
            Створити акаунт
          </>
        )}
      </button>
      
      {err && (
        <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
          <p className="text-red-600 dark:text-red-400 text-sm">{err}</p>
        </div>
      )}
      
      <p className="mt-6 text-center text-sm text-neutral-600 dark:text-neutral-400">
        Вже маєте акаунт?{' '}
        <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
          Увійти
        </Link>
      </p>
    </form>
  )
}
