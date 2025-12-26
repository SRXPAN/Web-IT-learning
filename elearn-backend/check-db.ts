import { prisma } from './src/db.js'

async function main() {
  const topics = await prisma.topic.count()
  const materials = await prisma.material.count()
  const quizzes = await prisma.quiz.count()
  const users = await prisma.user.count()
  const answers = await prisma.answer.count()
  
  console.log('=== DATABASE STATUS ===')
  console.log('Topics:', topics)
  console.log('Materials:', materials)
  console.log('Quizzes:', quizzes)
  console.log('Users:', users)
  console.log('Answers:', answers)
  
  // Translation tables
  const uiTrans = await prisma.uiTranslation.count()
  const dailyGoals = await prisma.dailyGoalTemplate.count()
  const weakSpots = await prisma.weakSpotTemplate.count()
  const achievements = await prisma.achievementTemplate.count()
  const categories = await prisma.categoryTranslation.count()
  
  console.log('\n=== TRANSLATION TABLES ===')
  console.log('UI Translations:', uiTrans)
  console.log('Daily Goals:', dailyGoals)
  console.log('Weak Spots:', weakSpots)
  console.log('Achievements:', achievements)
  console.log('Categories:', categories)
  
  // Показати останні матеріали
  const recentMaterials = await prisma.material.findMany({
    take: 5,
    orderBy: { updatedAt: 'desc' },
    select: { id: true, title: true, createdAt: true, updatedAt: true }
  })
  console.log('\n=== Recent Materials ===')
  console.log(recentMaterials)
  
  await prisma.$disconnect()
}

main()
