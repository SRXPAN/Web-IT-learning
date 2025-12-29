/**
 * Admin Audit Logs Page
 * View system activity logs
 */
import { useState } from 'react'
import { useAdminAuditLogs } from '@/hooks/useAdmin'
import { useTranslation } from '@/i18n/useTranslation'
import {
  Activity,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  User,
  FileText,
  Trash2,
  Edit,
  Plus,
  Eye,
  Download,
} from 'lucide-react'
import { Loading } from '@/components/Loading'

const actionIcons: Record<string, any> = {
  CREATE: Plus,
  UPDATE: Edit,
  DELETE: Trash2,
  VIEW: Eye,
  DOWNLOAD: Download,
  LOGIN: User,
  LOGOUT: User,
}

const actionColors: Record<string, string> = {
  CREATE: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
  UPDATE: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30',
  DELETE: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30',
  VIEW: 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700',
  DOWNLOAD: 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30',
  LOGIN: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
  LOGOUT: 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30',
}

export default function AdminAuditLogs() {
  const { t } = useTranslation()
  const { logs, pagination, loading, error, fetchLogs } = useAdminAuditLogs()

  const [filters, setFilters] = useState({
    action: '',
    resource: '',
    startDate: '',
    endDate: '',
  })
  const [showFilters, setShowFilters] = useState(false)

  const handleFilter = () => {
    fetchLogs({
      page: 1,
      action: filters.action || undefined,
      resource: filters.resource || undefined,
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined,
    })
  }

  const clearFilters = () => {
    setFilters({ action: '', resource: '', startDate: '', endDate: '' })
    fetchLogs({ page: 1 })
  }

  if (loading && logs.length === 0) {
    return <Loading />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <Activity className="w-7 h-7 mr-3" />
            {t('admin.auditLogs')}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t('admin.auditLogsDescription')} ({pagination.total} {t('common.total')})
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-2 border rounded-lg flex items-center ${
            showFilters
              ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300'
              : 'bg-white border-gray-200 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300'
          }`}
        >
          <Filter className="w-4 h-4 mr-2" />
          {t('common.filters')}
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('admin.action')}
              </label>
              <select
                value={filters.action}
                onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900"
              >
                <option value="">{t('common.all')}</option>
                <option value="CREATE">CREATE</option>
                <option value="UPDATE">UPDATE</option>
                <option value="DELETE">DELETE</option>
                <option value="VIEW">VIEW</option>
                <option value="LOGIN">LOGIN</option>
                <option value="LOGOUT">LOGOUT</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('admin.resource')}
              </label>
              <input
                type="text"
                value={filters.resource}
                onChange={(e) => setFilters({ ...filters, resource: e.target.value })}
                placeholder="user, topic, material..."
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('admin.startDate')}
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('admin.endDate')}
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              {t('common.clear')}
            </button>
            <button
              onClick={handleFilter}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {t('common.apply')}
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Logs List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {logs.map((log) => {
            const Icon = actionIcons[log.action] || FileText
            const colorClass = actionColors[log.action] || actionColors.VIEW

            return (
              <div
                key={log.id}
                className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${colorClass}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {log.action}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        {log.resource}
                      </span>
                      {log.resourceId && (
                        <code className="text-xs bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                          {log.resourceId.slice(0, 8)}...
                        </code>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      {log.user ? (
                        <span className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {log.user.name}
                        </span>
                      ) : (
                        <span className="text-gray-400">{t('admin.systemAction')}</span>
                      )}
                      <span>
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                      {log.ip && (
                        <span className="font-mono text-xs">{log.ip}</span>
                      )}
                    </div>
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <details className="mt-2">
                        <summary className="text-sm text-blue-600 dark:text-blue-400 cursor-pointer">
                          {t('admin.viewDetails')}
                        </summary>
                        <pre className="mt-2 text-xs bg-gray-50 dark:bg-gray-900 p-2 rounded overflow-x-auto">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {logs.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            {t('admin.noLogsFound')}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('common.page')} {pagination.page} {t('common.of')} {pagination.pages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => fetchLogs({ page: pagination.page - 1 })}
              disabled={pagination.page <= 1}
              className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => fetchLogs({ page: pagination.page + 1 })}
              disabled={pagination.page >= pagination.pages}
              className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
