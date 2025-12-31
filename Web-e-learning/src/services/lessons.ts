import { http } from '@/lib/http'
import type { Lang } from '@/utils/localize'

export type MaterialType = 'pdf' | 'video' | 'link' | 'text'

export interface Lesson {
  id: string
  title: string
  type: MaterialType
  url?: string | null
  content?: string | null
  lang: Lang
  views: number
  status: 'Draft' | 'Published'
  topicId: string
  topic?: {
    id: string
    name: string
    slug: string
  }
  file?: {
    id: string
    url: string
    mimeType: string
    size: number
  } | null
  createdAt: string
  updatedAt: string
}

export interface LessonsResponse {
  data: Lesson[]
}

/**
 * Fetch single lesson/material by ID with optional localization
 */
export async function fetchLesson(id: string, lang?: Lang): Promise<Lesson> {
  const params = lang ? `?lang=${lang}` : ''
  const res = await http.get<Lesson>(`/lessons/${id}${params}`)
  return res
}

/**
 * Fetch all lessons with optional localization
 */
export async function fetchLessons(lang?: Lang): Promise<Lesson[]> {
  const params = lang ? `?lang=${lang}` : ''
  const res = await http.get<LessonsResponse>(`/lessons${params}`)
  return res.data
}

/**
 * Fetch lessons by topic ID with optional localization
 */
export async function fetchLessonsByTopic(topicId: string, lang?: Lang): Promise<Lesson[]> {
  const params = lang ? `?lang=${lang}` : ''
  const res = await http.get<LessonsResponse>(`/lessons/by-topic/${topicId}${params}`)
  return res.data
}
