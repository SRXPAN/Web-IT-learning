import { apiGet, apiPost } from './http'
import type { 
  Category, 
  Lang, 
  Material, 
  QuizLite,
  Question,
  Option,
  Difficulty,
  LocalizedString,
  CreateTopicRequest,
  UpdateTopicRequest,
  CreateMaterialRequest,
  UpdateMaterialRequest,
  CreateQuizRequest
} from '@elearn/shared'

// Editor-specific Topic type (extends shared Topic)
export type Topic = { 
  id: string
  slug: string
  name: string
  description?: string
  category: Category
  parentId?: string | null 
}

// Question with options for editor
export interface QuestionWithOptions extends Question {
  options: Option[]
}

// Create question request
export interface CreateQuestionRequest {
  text: string
  textJson?: LocalizedString
  explanation?: string
  explanationJson?: LocalizedString
  difficulty: Difficulty
  tags: string[]
  options: {
    text: string
    textJson?: LocalizedString
    correct: boolean
  }[]
}

// Re-export types for backward compatibility
export type { Category, Lang, Material, QuizLite, Question, Option }

async function soft<T>(p: Promise<T>): Promise<T> {
  try { return await p } catch (e: unknown) {
    // Якщо бек ще не готовий → кидаємо читабельну помилку
    const msg = e instanceof Error ? e.message : 'Editor API error'
    throw new Error(msg.includes('Not Found') ? 'Endpoint is not ready yet' : msg)
  }
}

// TOPICS
export const listRootTopics = () => soft(apiGet<Topic[]>('/editor/topics'))
export const createTopic = (data: Partial<Topic>) => soft(apiPost<Topic, Partial<Topic>>('/editor/topics/create', data))
export const updateTopic = (id:string, data: Partial<Topic>) => soft(apiPost<Topic, Partial<Topic>>(`/editor/topics/${id}/update`, data))
export const deleteTopic = (id:string) => soft(apiPost<{ok:true}, {}>(`/editor/topics/${id}/delete`, {}))
// MATERIALS
export const listMaterials = (topicId:string) => soft(apiGet<Material[]>(`/editor/topics/${topicId}/materials`))
export const createMaterial = (topicId:string, data: Partial<Material>) =>
  soft(apiPost<Material, Partial<Material>>(`/editor/topics/${topicId}/materials/create`, data))
export const updateMaterial = (topicId:string, id:string, data: Partial<Material>) =>
  soft(apiPost<Material, Partial<Material>>(`/editor/topics/${topicId}/materials/${id}/update`, data))
export const deleteMaterial = (topicId:string, id:string) =>
  soft(apiPost<{ok:true}, {}>(`/editor/topics/${topicId}/materials/${id}/delete`, {}))
// QUIZZES
export const listQuizzes = (topicId:string) => soft(apiGet<QuizLite[]>(`/editor/topics/${topicId}/quizzes`))
export const createQuiz = (topicId:string, data: Partial<QuizLite>) =>
  soft(apiPost<QuizLite, Partial<QuizLite>>(`/editor/topics/${topicId}/quizzes/create`, data))
export const updateQuiz = (topicId:string, id:string, data: Partial<QuizLite>) =>
  soft(apiPost<QuizLite, Partial<QuizLite>>(`/editor/topics/${topicId}/quizzes/${id}/update`, data))
export const deleteQuiz = (topicId:string, id:string) =>
  soft(apiPost<{ok:true}, {}>(`/editor/topics/${topicId}/quizzes/${id}/delete`, {}))

// QUESTIONS
export const listQuestions = (quizId: string) =>
  soft(apiGet<QuestionWithOptions[]>(`/editor/quizzes/${quizId}/questions`))
export const createQuestion = (quizId: string, data: CreateQuestionRequest) =>
  soft(apiPost<QuestionWithOptions, CreateQuestionRequest>(`/editor/quizzes/${quizId}/questions/create`, data))
export const updateQuestion = (quizId: string, id: string, data: Partial<CreateQuestionRequest>) =>
  soft(apiPost<QuestionWithOptions, Partial<CreateQuestionRequest>>(`/editor/quizzes/${quizId}/questions/${id}/update`, data))
export const deleteQuestion = (quizId: string, id: string) =>
  soft(apiPost<{ok:true}, {}>(`/editor/quizzes/${quizId}/questions/${id}/delete`, {}))