// check-system.ts - Повна діагностика системи
import { prisma } from './src/db.js'

async function main() {
  console.log('╔════════════════════════════════════════════════╗')
  console.log('║       E-LEARN SYSTEM DIAGNOSTIC REPORT        ║')
  console.log('╚════════════════════════════════════════════════╝\n')

  // 1. DATABASE CONNECTION
  console.log('1️⃣  DATABASE CONNECTION')
  try {
    await prisma.$queryRaw`SELECT 1`
    console.log('   ✅ PostgreSQL connected')
  } catch (e) {
    console.log('   ❌ DATABASE NOT CONNECTED:', e)
    return
  }

  // 2. TABLES CHECK
  console.log('\n2️⃣  TABLES DATA')
  const counts = {
    users: await prisma.user.count(),
    topics: await prisma.topic.count(),
    materials: await prisma.material.count(),
    quizzes: await prisma.quiz.count(),
    questions: await prisma.question.count(),
    options: await prisma.option.count(),
    answers: await prisma.answer.count(),
    uiTranslations: await prisma.uiTranslation.count(),
    dailyGoals: await prisma.dailyGoalTemplate.count(),
    weakSpots: await prisma.weakSpotTemplate.count(),
    achievements: await prisma.achievementTemplate.count(),
    categories: await prisma.categoryTranslation.count(),
  }
  
  console.log('   Content Tables:')
  console.log(`     Users:     ${counts.users} ${counts.users === 0 ? '⚠️' : '✅'}`)
  console.log(`     Topics:    ${counts.topics} ${counts.topics === 0 ? '⚠️' : '✅'}`)
  console.log(`     Materials: ${counts.materials} ${counts.materials === 0 ? '⚠️' : '✅'}`)
  console.log(`     Quizzes:   ${counts.quizzes} ${counts.quizzes === 0 ? '⚠️' : '✅'}`)
  console.log(`     Questions: ${counts.questions} ${counts.questions === 0 ? '⚠️' : '✅'}`)
  console.log(`     Options:   ${counts.options} ${counts.options === 0 ? '⚠️' : '✅'}`)
  console.log(`     Answers:   ${counts.answers}`)
  
  console.log('   Translation Tables:')
  console.log(`     UI Keys:      ${counts.uiTranslations} ${counts.uiTranslations === 0 ? '⚠️ RUN: npm run seed' : '✅'}`)
  console.log(`     Daily Goals:  ${counts.dailyGoals} ${counts.dailyGoals === 0 ? '⚠️' : '✅'}`)
  console.log(`     Weak Spots:   ${counts.weakSpots} ${counts.weakSpots === 0 ? '⚠️' : '✅'}`)
  console.log(`     Achievements: ${counts.achievements} ${counts.achievements === 0 ? '⚠️' : '✅'}`)
  console.log(`     Categories:   ${counts.categories} ${counts.categories === 0 ? '⚠️' : '✅'}`)

  // 3. DATA INTEGRITY
  console.log('\n3️⃣  DATA INTEGRITY')
  
  // Check orphaned materials (where topicId doesn't exist)
  const orphanedMaterials = await prisma.material.count({
    where: { topicId: '' }
  }).catch(() => 0)
  console.log(`   Orphaned materials: ${orphanedMaterials} ${orphanedMaterials > 0 ? '⚠️' : '✅'}`)
  
  // Check orphaned quizzes
  const orphanedQuizzes = await prisma.quiz.count({
    where: { topicId: '' }
  }).catch(() => 0)
  console.log(`   Orphaned quizzes: ${orphanedQuizzes} ${orphanedQuizzes > 0 ? '⚠️' : '✅'}`)
  
  // Check questions without correct answer
  const questions = await prisma.question.findMany({
    include: { options: true }
  })
  const noCorrectAnswer = questions.filter(q => !q.options.some(o => o.correct))
  console.log(`   Questions without correct answer: ${noCorrectAnswer.length} ${noCorrectAnswer.length > 0 ? '⚠️' : '✅'}`)
  if (noCorrectAnswer.length > 0) {
    console.log('     IDs:', noCorrectAnswer.slice(0, 5).map(q => q.id).join(', '))
  }

  // 4. USERS CHECK
  console.log('\n4️⃣  USERS')
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, xp: true }
  })
  if (users.length === 0) {
    console.log('   ⚠️ No users found! Run: npm run seed')
  } else {
    users.forEach(u => {
      console.log(`   - ${u.email} (${u.role}) XP: ${u.xp}`)
    })
  }

  // 5. PUBLISHED CONTENT
  console.log('\n5️⃣  PUBLISHED CONTENT')
  const publishedTopics = await prisma.topic.count({ where: { status: 'Published' } })
  const publishedMaterials = await prisma.material.count({ where: { status: 'Published' } })
  const publishedQuizzes = await prisma.quiz.count({ where: { status: 'Published' } })
  console.log(`   Published topics:    ${publishedTopics}/${counts.topics}`)
  console.log(`   Published materials: ${publishedMaterials}/${counts.materials}`)
  console.log(`   Published quizzes:   ${publishedQuizzes}/${counts.quizzes}`)
  
  if (publishedTopics === 0) {
    console.log('   ⚠️ No published topics! Students won\'t see any content.')
  }

  // 6. RECENT ACTIVITY
  console.log('\n6️⃣  RECENT ACTIVITY (last 5 items)')
  const recentMaterials = await prisma.material.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: { title: true, createdAt: true, createdById: true }
  })
  if (recentMaterials.length === 0) {
    console.log('   No materials found')
  } else {
    recentMaterials.forEach(m => {
      const date = m.createdAt.toISOString().slice(0, 16).replace('T', ' ')
      console.log(`   - [${date}] "${m.title}"`)
    })
  }

  // 7. ENVIRONMENT CHECK
  console.log('\n7️⃣  ENVIRONMENT')
  console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'development'}`)
  console.log(`   DATABASE_URL: ${process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':***@') || '❌ NOT SET'}`)

  // SUMMARY
  console.log('\n' + '═'.repeat(50))
  const issues: string[] = []
  if (counts.users === 0) issues.push('No users')
  if (counts.uiTranslations === 0) issues.push('No UI translations')
  if (publishedTopics === 0) issues.push('No published topics')
  if (noCorrectAnswer.length > 0) issues.push(`${noCorrectAnswer.length} questions without correct answer`)
  
  if (issues.length === 0) {
    console.log('✅ SYSTEM HEALTHY - All checks passed!')
  } else {
    console.log('⚠️  ISSUES FOUND:')
    issues.forEach(i => console.log(`   - ${i}`))
    console.log('\n   Fix with: npm run seed')
  }

  await prisma.$disconnect()
}

main().catch(console.error)
