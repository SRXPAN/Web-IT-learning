import { useI18n } from '@/store/i18n'
import { type TranslationKey } from './translations'
import { create } from 'zustand'
import { useEffect } from 'react'
import { apiGet } from '@/lib/http'

// API response type
type BundleResponse = {
  lang: string
  version: string
  count: number
  namespaces: string[]
  bundle: Record<string, string>
}

// Fallback translations for when API is not available
const fallbackTranslations: Partial<Record<TranslationKey, string>> = {
  // Admin Panel
  'admin.panel': 'Admin Panel',
  'admin.dashboard': 'Dashboard',
  'admin.dashboardDescription': 'System overview and statistics',
  'admin.users': 'Users',
  'admin.usersDescription': 'Manage system users',
  'admin.files': 'Files',
  'admin.filesDescription': 'Manage uploaded files',
  'admin.translations': 'Translations',
  'admin.auditLogs': 'Audit Logs',
  'admin.auditLogsDescription': 'View system activity logs',
  'admin.settings': 'Settings',
  'admin.totalUsers': 'Total Users',
  'admin.totalTopics': 'Topics',
  'admin.totalMaterials': 'Materials',
  'admin.totalFiles': 'Files',
  'admin.usersByRole': 'Users by Role',
  'admin.recentActivity': 'Recent Activity',
  'admin.timeSpent': 'Time Spent',
  'admin.quizAttempts': 'Quiz Attempts',
  'admin.materialsViewed': 'Materials Viewed',
  'admin.noActivityData': 'No activity data',
  'admin.searchUsers': 'Search users...',
  'admin.createUser': 'Create User',
  'admin.allRoles': 'All Roles',
  'admin.changeRole': 'Change Role',
  'admin.deleteUser': 'Delete User',
  'admin.deleteUserConfirm': 'Are you sure you want to delete user {name}?',
  'admin.noUsersFound': 'No users found',
  'admin.verified': 'Verified',
  'admin.unverified': 'Unverified',
  'admin.action': 'Action',
  'admin.resource': 'Resource',
  'admin.startDate': 'Start Date',
  'admin.endDate': 'End Date',
  'admin.systemAction': 'System',
  'admin.viewDetails': 'View Details',
  'admin.noLogsFound': 'No logs found',
  'admin.allCategories': 'All Categories',
  'admin.avatars': 'Avatars',
  'admin.materials': 'Materials',
  'admin.attachments': 'Attachments',
  'admin.uploadedBy': 'Uploaded by',
  'admin.deleteFile': 'Delete File',
  'admin.deleteFileConfirm': 'Are you sure you want to delete {name}?',
  'admin.noFilesFound': 'No files found',
  // Common additions
  'common.total': 'total',
  'common.search': 'Search',
  'common.page': 'Page',
  'common.of': 'of',
  'common.name': 'Name',
  'common.email': 'Email',
  'common.password': 'Password',
  'common.role': 'Role',
  'common.user': 'User',
  'common.status': 'Status',
  'common.created': 'Created',
  'common.actions': 'Actions',
  'common.filters': 'Filters',
  'common.all': 'All',
  'common.clear': 'Clear',
  'common.apply': 'Apply',
  'common.date': 'Date',
  'common.minutes': 'min',
  'common.download': 'Download',
  'common.refresh': 'Refresh',
  'common.retry': 'Retry',
  // Nav
  'nav.admin': 'Admin',
}

// Store for API translations
type TranslationsState = {
  bundles: Record<string, Record<string, string>> // lang -> key -> value
  versions: Record<string, string> // lang -> version
  loading: boolean
  initialized: boolean
  error: string | null
  fetchTranslations: (lang: string) => Promise<void>
}

export const useTranslationsStore = create<TranslationsState>((set, get) => ({
  bundles: {},
  versions: {},
  loading: false,
  initialized: false,
  error: null,
  fetchTranslations: async (lang: string) => {
    const state = get()
    
    // Skip if already loaded for this language
    if (state.bundles[lang]) return
    
    set({ loading: true, error: null })
    try {
      const response = await apiGet<BundleResponse>(`/i18n/bundle?lang=${lang}`)
      
      set(s => ({
        bundles: { ...s.bundles, [lang]: response.bundle },
        versions: { ...s.versions, [lang]: response.version },
        loading: false,
        initialized: true
      }))
    } catch (err) {
      console.error('Failed to load translations from API:', err)
      set({ loading: false, initialized: true, error: 'Failed to load translations' })
    }
  }
}))

export function useTranslation() {
  const { lang } = useI18n()
  const { bundles, loading, initialized, fetchTranslations } = useTranslationsStore()
  
  // Load translations on mount and when lang changes
  useEffect(() => {
    fetchTranslations(lang)
  }, [lang, fetchTranslations])
  
  const t = (key: TranslationKey): string => {
    // 1. Try API bundle
    const apiBundle = bundles[lang]
    if (apiBundle?.[key]) {
      return apiBundle[key]
    }
    
    // 2. Try fallback translations
    if (fallbackTranslations[key]) {
      return fallbackTranslations[key]!
    }
    
    // 3. Return key as last resort (for debugging - shows missing keys)
    return key
  }
  
  return { t, lang, loading, initialized }
}

// Hook to preload all translations
export function usePreloadTranslations() {
  const { fetchTranslations } = useTranslationsStore()
  
  useEffect(() => {
    // Preload all languages
    fetchTranslations('UA')
    fetchTranslations('PL')
    fetchTranslations('EN')
  }, [fetchTranslations])
}
