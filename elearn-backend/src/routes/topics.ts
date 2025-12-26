// src/routes/topics.ts
import { Router } from 'express'
import { prisma } from '../db'
import { requireAuth } from '../middleware/auth'
import { z } from 'zod'

const router = Router()

// Схема для пагінації
const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  category: z.enum(['Programming', 'Mathematics', 'Databases', 'Networks']).optional(),
})

// Повертаємо дерево тем з оптимізацією
router.get('/', requireAuth, async (req, res) => {
  const isStaff = req.user?.role === 'ADMIN' || req.user?.role === 'EDITOR'
  
  // Парсимо query параметри
  const parsed = paginationSchema.safeParse(req.query)
  const { page, limit, category } = parsed.success ? parsed.data : { page: 1, limit: 20, category: undefined }
  
  // Базовий where clause
  const baseWhere = {
    parentId: null,
    ...(isStaff ? {} : { status: 'Published' as const }),
    ...(category ? { category } : {}),
  }
  
  // Отримуємо загальну кількість для пагінації
  const total = await prisma.topic.count({ where: baseWhere })
  
  const topics = await prisma.topic.findMany({
    where: baseWhere,
    orderBy: { name: 'asc' },
    skip: (page - 1) * limit,
    take: limit,
    select: {
      id: true,
      slug: true,
      name: true,
      nameJson: true,
      description: true,
      descJson: true,
      category: true,
      status: true,
      materials: {
        where: isStaff ? {} : { status: 'Published' },
        select: { id: true, title: true, type: true, url: true, content: true, lang: true, status: true },
      },
      quizzes: {
        where: isStaff ? {} : { status: 'Published' },
        select: { id: true, title: true, durationSec: true, status: true },
      },
      children: {
        where: isStaff ? {} : { status: 'Published' },
        orderBy: { name: 'asc' },
        select: {
          id: true,
          slug: true,
          name: true,
          nameJson: true,
          description: true,
          descJson: true,
          category: true,
          status: true,
          materials: {
            where: isStaff ? {} : { status: 'Published' },
            select: { id: true, title: true, type: true, url: true, content: true, lang: true, status: true },
          },
          quizzes: {
            where: isStaff ? {} : { status: 'Published' },
            select: { id: true, title: true, durationSec: true, status: true },
          },
        },
      },
      _count: {
        select: { materials: true, quizzes: true, children: true },
      },
    },
  })
  
  res.json({
    data: topics,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  })
})

router.get('/:slug', requireAuth, async (req,res)=>{
  const isStaff = req.user?.role === 'ADMIN' || req.user?.role === 'EDITOR'
  const topic = await prisma.topic.findUnique({
    where: isStaff ? { slug: req.params.slug } : { slug: req.params.slug, status: 'Published' },
    include: {
      materials: isStaff ? true : { where: { status: 'Published' } },
      quizzes:   isStaff ? true : { where: { status: 'Published' } },
      children:  isStaff ? true : { where: { status: 'Published' } },
      parent:    true
    }
  })
  if(!topic) return res.status(404).json({ error:'Not found' })
  res.json(topic)
})

export default router
