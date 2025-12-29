
import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useTranslation } from '@/i18n/useTranslation'

export default function RequireAuth({
  roles,
  children,
}: {
  roles?: Array<'ADMIN' | 'EDITOR' | 'STUDENT'>
  children: React.ReactNode
}) {
  const { t } = useTranslation()
  const { user, loading } = useAuth()
  if (loading) return <div className="card">{t('common.loading')}</div>
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) {
    return (
      <div className="card text-center py-8">
        <h2 className="text-2xl font-bold mb-2">{t('error.accessDenied')}</h2>
        <p className="text-gray-600 dark:text-gray-400">
          {t('error.noPermission')}
        </p>
      </div>
    )
  }
  return <>{children}</>
}