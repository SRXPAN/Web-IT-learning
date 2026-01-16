import { useState, useRef } from 'react'
import { useAuth } from '@/auth/AuthContext'
import { useTheme } from '@/store/theme'
import { useTranslation } from '@/i18n/useTranslation'
import type { Lang } from '@/store/i18n'
import { Award, Settings, Globe, Palette, Sun, Moon, Lock, Loader2, CheckCircle, Camera, Mail, Trash2, AlertTriangle } from 'lucide-react'
import { LANG_GRADIENT_COLORS, getGradientColor } from '@/utils/colors'
import PasswordInput from '@/components/PasswordInput'
import { http } from '@/lib/http'
import ConfirmDialog from '@/components/ConfirmDialog'
import { useNavigate } from 'react-router-dom'

/** Language display names - constant outside component */
const LANG_NAMES: Record<Lang, string> = {
  UA: 'Українська',
  PL: 'Polski',
  EN: 'English',
}

export default function Profile(){
  const { user, refresh, logout } = useAuth()
  const { theme, toggle } = useTheme()
  const { t, lang, setLang } = useTranslation()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  
  // Avatar upload state
  const [avatarLoading, setAvatarLoading] = useState(false)
  const [avatarError, setAvatarError] = useState<string | null>(null)
  
  // Email change state
  const [newEmail, setNewEmail] = useState('')
  const [emailPassword, setEmailPassword] = useState('')
  const [emailLoading, setEmailLoading] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [emailSuccess, setEmailSuccess] = useState(false)
  
  // Delete account state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  
  if(!user) return <div className="card">{t('common.loading')}</div>

  const badges = [
    { id:'b1', title: t('profile.badges'), cond: user.xp >= 10 },
    { id:'b2', title: t('profile.badge.risingStar'), cond: user.xp >= 50 },
    { id:'b3', title: t('profile.badge.algorithmMaster'), cond: user.xp >= 100 },
  ]

  // Avatar upload handler
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setAvatarError(t('profile.error.selectImage'))
      return
    }
    
    // Validate file size (max 300KB for base64 storage)
    if (file.size > 300 * 1024) {
      setAvatarError(t('profile.error.imageTooLarge'))
      return
    }
    
    setAvatarLoading(true)
    setAvatarError(null)
    
    try {
      // Convert file to base64
      const reader = new FileReader()
      reader.onload = async () => {
        try {
          const base64 = reader.result as string
          await http.post('/auth/avatar', { avatar: base64 })
          await refresh()
        } catch (err: any) {
          setAvatarError(err.message || t('profile.error.avatarUploadFailed'))
        } finally {
          setAvatarLoading(false)
        }
      }
      reader.onerror = () => {
        setAvatarError(t('profile.error.fileReadFailed'))
        setAvatarLoading(false)
      }
      reader.readAsDataURL(file)
    } catch (err: any) {
      setAvatarError(err.message || t('profile.error.avatarUploadFailed'))
      setAvatarLoading(false)
    }
  }
  
  // Remove avatar handler
  const handleRemoveAvatar = async () => {
    setAvatarLoading(true)
    setAvatarError(null)
    
    try {
      await http.delete('/auth/avatar')
      await refresh()
    } catch (err: any) {
      setAvatarError(err.message || t('profile.error.avatarDeleteFailed'))
    } finally {
      setAvatarLoading(false)
    }
  }
  
  // Email change handler
  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailError(null)
    setEmailSuccess(false)
    
    if (!newEmail.includes('@')) {
      setEmailError(t('profile.error.invalidEmail'))
      return
    }
    
    setEmailLoading(true)
    try {
      await http.put('/auth/email', { newEmail, password: emailPassword })
      setEmailSuccess(true)
      setNewEmail('')
      setEmailPassword('')
      await refresh()
      setTimeout(() => setEmailSuccess(false), 3000)
    } catch (err: any) {
      setEmailError(err.message || t('profile.error.emailChangeFailed'))
    } finally {
      setEmailLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError(null)
    setPasswordSuccess(false)
    
    if (newPassword !== confirmPassword) {
      setPasswordError(t('profile.error.passwordsNotMatch'))
      return
    }
    
    if (newPassword.length < 8) {
      setPasswordError(t('profile.error.passwordTooShort'))
      return
    }
    
    setPasswordLoading(true)
    try {
      await http.put('/auth/password', { currentPassword, newPassword })
      setPasswordSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setPasswordSuccess(false), 3000)
    } catch (err: any) {
      setPasswordError(err.message || t('profile.error.passwordChangeFailed'))
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    setDeleteLoading(true)
    try {
      await http.delete('/auth/account')
      logout()
      navigate('/')
    } catch (err: any) {
      alert(err.message || t('profile.error.accountDeleteFailed'))
    } finally {
      setDeleteLoading(false)
      setShowDeleteDialog(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Profile Info */}
      <section className="card">
        <h2 className="text-2xl font-display font-bold text-neutral-900 dark:text-white mb-6">
          {t('profile.title')}
        </h2>
        
        <div className="flex items-center gap-6 mb-6">
          {/* Avatar with upload */}
          <div className="relative group">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center overflow-hidden">
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl font-display font-bold text-white">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              )}
            </div>
            
            {/* Upload overlay */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarLoading}
              className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
            >
              {avatarLoading ? (
                <Loader2 size={24} className="text-white animate-spin" />
              ) : (
                <Camera size={24} className="text-white" />
              )}
            </button>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
            
            {/* Remove avatar button */}
            {user.avatar && (
              <button
                onClick={handleRemoveAvatar}
                disabled={avatarLoading}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors shadow-lg"
                title={t('profile.action.removeAvatar')}
              >
                <Trash2 size={12} className="text-white" />
              </button>
            )}
          </div>
          
          <div>
            <div className="text-sm text-neutral-500 dark:text-neutral-400">{t('profile.name')}</div>
            <div className="text-xl font-semibold text-neutral-900 dark:text-white">{user.name}</div>
            <div className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{user.email}</div>
          </div>
        </div>
        
        {avatarError && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
            <p className="text-red-600 dark:text-red-400 text-sm">{avatarError}</p>
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-950 dark:to-accent-950 border border-primary-200 dark:border-primary-800">
            <div className="text-sm text-neutral-600 dark:text-neutral-400">{t('profile.xp')}</div>
            <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">{user.xp}</div>
          </div>
          <div className="p-4 rounded-2xl bg-gradient-to-br from-accent-50 to-green-50 dark:from-accent-950 dark:to-green-950 border border-accent-200 dark:border-accent-800">
            <div className="text-sm text-neutral-600 dark:text-neutral-400">{t('dashboard.level')}</div>
            <div className="text-3xl font-bold text-accent-600 dark:text-accent-400">{Math.floor(user.xp / 100) + 1}</div>
          </div>
        </div>
      </section>

      {/* Badges */}
      <section className="card">
        <div className="flex items-center gap-2 mb-4">
          <Award size={20} className="text-primary-600 dark:text-primary-400"/>
          <h3 className="text-lg font-display font-semibold text-neutral-900 dark:text-white">
            {t('profile.badges')}
          </h3>
        </div>
        <div className="flex gap-3 flex-wrap">
          {badges.map(b => (
            <span 
              key={b.id} 
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                b.cond
                  ? 'bg-primary-100 text-primary-700 border-2 border-primary-200 dark:bg-primary-950 dark:text-primary-300 dark:border-primary-800'
                  : 'bg-neutral-100 text-neutral-400 border-2 border-neutral-200 dark:bg-neutral-900 dark:text-neutral-600 dark:border-neutral-800 opacity-50'
              }`}
            >
              {b.cond ? '🏆' : '🔒'} {b.title}
            </span>
          ))}
        </div>
      </section>

      {/* Settings */}
      <section className="card">
        <div className="flex items-center gap-2 mb-6">
          <Settings size={20} className="text-primary-600 dark:text-primary-400"/>
          <h3 className="text-lg font-display font-semibold text-neutral-900 dark:text-white">
            {t('profile.settings')}
          </h3>
        </div>

        <div className="space-y-6">
          {/* Language Selection */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Globe size={18} className="text-neutral-600 dark:text-neutral-400"/>
              <label className="font-semibold text-neutral-900 dark:text-white">
                {t('profile.language')}
              </label>
            </div>
            <div className="flex gap-2 flex-wrap">
              {(['UA', 'PL', 'EN'] as Lang[]).map((l, idx) => {
                const colorClass = getGradientColor(idx, LANG_GRADIENT_COLORS)
                
                return (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    className={
                      lang === l
                        ? `px-6 py-3 rounded-xl font-semibold transition-all duration-300 bg-gradient-to-r ${colorClass.from} ${colorClass.to} text-white shadow-neo hover:shadow-neo-lg hover:scale-105`
                        : 'px-6 py-3 rounded-xl font-medium transition-all duration-300 bg-white hover:bg-neutral-50 border-2 border-neutral-200 hover:border-primary-400 dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:border-neutral-700 dark:hover:border-primary-600 text-neutral-700 dark:text-neutral-300'
                    }
                  >
                    {LANG_NAMES[l]}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Theme Selection */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Palette size={18} className="text-neutral-600 dark:text-neutral-400"/>
              <label className="font-semibold text-neutral-900 dark:text-white">
                {t('profile.theme')}
              </label>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => theme === 'dark' && toggle()}
                className={
                  theme === 'light'
                    ? 'px-6 py-3 rounded-xl font-semibold transition-all duration-300 bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-neo hover:shadow-neo-lg hover:scale-105 flex items-center gap-2'
                    : 'px-6 py-3 rounded-xl font-medium transition-all duration-300 bg-white hover:bg-neutral-50 border-2 border-neutral-200 hover:border-primary-400 dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 flex items-center gap-2'
                }
              >
                <Sun size={18} /> {t('profile.light')}
              </button>
              <button
                onClick={() => theme === 'light' && toggle()}
                className={
                  theme === 'dark'
                    ? 'px-6 py-3 rounded-xl font-semibold transition-all duration-300 bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-neo hover:shadow-neo-lg hover:scale-105 flex items-center gap-2'
                    : 'px-6 py-3 rounded-xl font-medium transition-all duration-300 bg-white hover:bg-neutral-50 border-2 border-neutral-200 hover:border-primary-400 dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 flex items-center gap-2'
                }
              >
                <Moon size={18} /> {t('profile.dark')}
              </button>
            </div>
          </div>

          {/* Change Email */}
          <div className="pt-6 border-t border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center gap-2 mb-4">
              <Mail size={18} className="text-neutral-600 dark:text-neutral-400"/>
              <label className="font-semibold text-neutral-900 dark:text-white">
                {t('profile.action.changeEmail')}
              </label>
            </div>
            
            <form onSubmit={handleEmailChange} className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium mb-2">{t('profile.label.newEmail')}</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  placeholder={t('profile.placeholder.newEmail')}
                  required
                  disabled={emailLoading}
                  className="input w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">{t('profile.label.currentPassword')}</label>
                <PasswordInput
                  value={emailPassword}
                  onChange={e => setEmailPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={emailLoading}
                />
              </div>
              
              {emailError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
                  <p className="text-red-600 dark:text-red-400 text-sm">{emailError}</p>
                </div>
              )}
              
              {emailSuccess && (
                <div className="p-3 rounded-xl bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 flex items-center gap-2">
                  <CheckCircle size={18} className="text-green-600 dark:text-green-400" />
                  <p className="text-green-600 dark:text-green-400 text-sm">{t('profile.success.emailChanged')}</p>
                </div>
              )}
              
              <button
                type="submit"
                className="btn flex items-center gap-2"
                disabled={emailLoading || !newEmail || !emailPassword}
              >
                {emailLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    {t('common.saving')}
                  </>
                ) : (
                  <>
                    <Mail size={18} />
                    {t('profile.action.changeEmail')}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Change Password */}
          <div className="pt-6 border-t border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center gap-2 mb-4">
              <Lock size={18} className="text-neutral-600 dark:text-neutral-400"/>
              <label className="font-semibold text-neutral-900 dark:text-white">
                {t('profile.action.changePassword')}
              </label>
            </div>
            
            <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium mb-2">{t('profile.label.currentPassword')}</label>
                <PasswordInput
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={passwordLoading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">{t('profile.label.newPassword')}</label>
                <PasswordInput
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  showStrength
                  required
                  disabled={passwordLoading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">{t('profile.label.confirmNewPassword')}</label>
                <PasswordInput
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={passwordLoading}
                />
              </div>
              
              {passwordError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
                  <p className="text-red-600 dark:text-red-400 text-sm">{passwordError}</p>
                </div>
              )}
              
              {passwordSuccess && (
                <div className="p-3 rounded-xl bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 flex items-center gap-2">
                  <CheckCircle size={18} className="text-green-600 dark:text-green-400" />
                  <p className="text-green-600 dark:text-green-400 text-sm">{t('profile.success.passwordChanged')}</p>
                </div>
              )}
              
              <button
                type="submit"
                className="btn flex items-center gap-2"
                disabled={passwordLoading || !currentPassword || !newPassword || !confirmPassword}
              >
                {passwordLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    {t('common.saving')}
                  </>
                ) : (
                  <>
                    <Lock size={18} />
                    {t('profile.action.changePassword')}
                  </>
                )}
              </button>
            </form>
          </div>
          
          {/* Delete Account */}
          <div className="pt-6 border-t border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={18} className="text-red-600 dark:text-red-400"/>
              <label className="font-semibold text-neutral-900 dark:text-white">
                {t('profile.dangerZone')}
              </label>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
              {t('profile.deleteAccountWarning')}
            </p>
            <button
              type="button"
              onClick={() => setShowDeleteDialog(true)}
              className="px-6 py-3 rounded-xl font-semibold bg-red-500 hover:bg-red-600 text-white transition-all duration-300 shadow-neo hover:shadow-neo-lg flex items-center gap-2"
            >
              <Trash2 size={18} />
              {t('profile.action.deleteAccount')}
            </button>
          </div>
        </div>
      </section>
      
      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteAccount}
        title={t('profile.deleteConfirm.title')}
        message={t('profile.deleteConfirm.message')}
        confirmText={t('profile.deleteConfirm.confirm')}
        cancelText={t('common.cancel')}
        variant="danger"
        loading={deleteLoading}
      />
    </div>
  )
}
