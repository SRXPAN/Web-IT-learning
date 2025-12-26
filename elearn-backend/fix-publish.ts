// fix-publish.ts - Опублікувати всі Draft дані
import { prisma } from './src/db.js'

async function main() {
  console.log('🚀 Publishing all Draft content...\n')

  // Публікуємо Topics
  const topics = await prisma.topic.updateMany({
    where: { status: 'Draft' },
    data: { status: 'Published', publishedAt: new Date() }
  })
  console.log(`✅ Published ${topics.count} topics`)

  // Публікуємо Materials
  const materials = await prisma.material.updateMany({
    where: { status: 'Draft' },
    data: { status: 'Published', publishedAt: new Date() }
  })
  console.log(`✅ Published ${materials.count} materials`)

  // Публікуємо Quizzes
  const quizzes = await prisma.quiz.updateMany({
    where: { status: 'Draft' },
    data: { status: 'Published', publishedAt: new Date() }
  })
  console.log(`✅ Published ${quizzes.count} quizzes`)

  console.log('\n🎉 Done! All content is now visible to students.')
  
  await prisma.$disconnect()
}

main().catch(console.error)
