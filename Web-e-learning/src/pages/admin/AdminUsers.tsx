/**
 * Admin Users Management Page
 * CRUD operations for users, role management
 */
import { useState } from 'react'
import { useAdminUsers } from '@/hooks/useAdmin'
import { useTranslation } from '@/i18n/useTranslation'
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  Shield,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  AlertTriangle,
} from 'lucide-react'
import { Loading } from '@/components/Loading'
import ConfirmDialog, { ConfirmDialog as BaseConfirmDialog } from '@/components/ConfirmDialog'
import { Pagination } from '@/components/admin/Pagination'
import { PageHeader } from '@/components/admin/PageHeader'

const ROLES = ['STUDENT', 'EDITOR', 'ADMIN'] as const
type Role = (typeof ROLES)[number]

const roleColors: Record<Role, string> = {
  STUDENT: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  EDITOR: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
  ADMIN: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
}

export default function AdminUsers() {
  const { t } = useTranslation()
  const {
    users,
    pagination,
    loading,
    error,
    fetchUsers,
    updateRole,
    createUser,
    deleteUser,
  } = useAdminUsers()

  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null)

  // New user form
  const [newUser, setNewUser] = useState({
    email: '',
    name: '',
    password: '',
    role: 'STUDENT' as Role,
  })

  const handleSearch = () => {
    fetchUsers({ page: 1, limit: pagination?.limit || 20, search, role: roleFilter })
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    const success = await updateRole(userId, newRole)
    if (success) {
      setEditingRoleId(null)
    }
  }

  const handleCreate = async () => {
    const success = await createUser(newUser)
    if (success) {
      setShowCreateModal(false)
      setNewUser({ email: '', name: '', password: '', role: 'STUDENT' })
    }
  }

  const handleDelete = async () => {
    if (deleteConfirm) {
      await deleteUser(deleteConfirm.id)
      setDeleteConfirm(null)
    }
  }

  if (loading && (!users || users.length === 0)) {
    return <Loading />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        icon={Users}
        title={t('admin.users')}
        description={t('admin.usersDescription')}
        stats={`${pagination?.total || 0} ${t('common.total')}`}
        actions={
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {t('admin.createUser')}
          </button>
        }
      />

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={t('admin.searchUsers')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value)
            fetchUsers({ page: 1, role: e.target.value, search })
          }}
          className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="">{t('admin.allRoles')}</option>
          {ROLES.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          {t('common.search')}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('common.user')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('common.role')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                XP
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('common.status')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('common.created')}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('common.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {(users || []).map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                      {user.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {editingRoleId === user.id ? (
                    <div className="flex items-center gap-2">
                      <select
                        defaultValue={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800"
                        autoFocus
                      >
                        {ROLES.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => setEditingRoleId(null)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        roleColors[user.role as Role]
                      }`}
                    >
                      <Shield className="w-3 h-3 mr-1" />
                      {user.role}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                  {user.xp.toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  {user.emailVerified ? (
                    <span className="inline-flex items-center text-green-600 dark:text-green-400 text-sm">
                      <Check className="w-4 h-4 mr-1" />
                      {t('admin.verified')}
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-yellow-600 dark:text-yellow-400 text-sm">
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      {t('admin.unverified')}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setEditingRoleId(user.id)}
                      className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                      title={t('admin.changeRole')}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm({ id: user.id, name: user.name })}
                      className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                      title={t('common.delete')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {(!users || users.length === 0) && !loading && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            {t('admin.noUsersFound')}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.pages}
          totalItems={pagination.total}
          onPageChange={(page) => fetchUsers({ page, search, role: roleFilter })}
          disabled={loading}
        />
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('admin.createUser')}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('common.name')}
                </label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('common.email')}
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('common.password')}
                </label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('common.role')}
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as Role })}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                >
                  {ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleCreate}
                disabled={!newUser.email || !newUser.name || !newUser.password}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {t('common.create')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <ConfirmDialog
          isOpen={!!deleteConfirm}
          title={t('admin.deleteUser')}
          description={`${t('admin.deleteUserConfirm').replace('{name}', deleteConfirm.name)}`}
          confirmText={t('common.delete')}
          cancelText={t('common.cancel')}
          onConfirm={handleDelete}
          onClose={() => setDeleteConfirm(null)}
          variant="danger"
        />
      )}
    </div>
  )
}
