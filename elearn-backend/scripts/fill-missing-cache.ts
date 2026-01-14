// scripts/fill-missing-cache.ts
// Backfills titleCache and urlCache for existing Topics and Materials

import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Starting cache backfill...\n')

  // ============================================
  // TASK 1: Backfill Topic titleCache
  // ============================================
  console.log('📝 Finding Topics with empty titleCache...')
  
  const allTopics = await prisma.topic.findMany({
    select: { id: true, name: true, titleCache: true }
  })

  const topicsWithEmptyCache = allTopics.filter(
    topic => !topic.titleCache || 
             (typeof topic.titleCache === 'object' && Object.keys(topic.titleCache).length === 0)
  )

  console.log(`Found ${topicsWithEmptyCache.length} topics to update`)

  let topicsUpdated = 0
  for (const topic of topicsWithEmptyCache) {
    if (!topic.name) {
      console.warn(`⚠️  Topic ${topic.id} has no name, skipping...`)
      continue
    }

    await prisma.topic.update({
      where: { id: topic.id },
      data: {
        titleCache: { EN: topic.name }
      }
    })
    topicsUpdated++
  }

  console.log(`✅ Updated ${topicsUpdated} topics with titleCache\n`)

  // ============================================
  // TASK 2: Backfill Material titleCache & urlCache
  // ============================================
  console.log('📚 Finding Materials with empty titleCache or urlCache...')
  
  const allMaterials = await prisma.material.findMany({
    select: { 
      id: true, 
      title: true, 
      url: true, 
      content: true,
      titleCache: true, 
      urlCache: true,
      contentCache: true,
    }
  })

  const materialsWithEmptyCache = allMaterials.filter(
    material => 
      !material.titleCache || 
      (typeof material.titleCache === 'object' && Object.keys(material.titleCache).length === 0) ||
      !material.urlCache ||
      (typeof material.urlCache === 'object' && Object.keys(material.urlCache).length === 0) ||
      !material.contentCache ||
      (typeof material.contentCache === 'object' && Object.keys(material.contentCache).length === 0)
  )

  console.log(`Found ${materialsWithEmptyCache.length} materials to update`)

  let materialsUpdated = 0
  for (const material of materialsWithEmptyCache) {
    const updates: Prisma.MaterialUpdateInput = {}

    // Backfill titleCache if missing
    if (!material.titleCache || 
        (typeof material.titleCache === 'object' && Object.keys(material.titleCache).length === 0)) {
      updates.titleCache = { EN: material.title || 'Untitled' }
    }

    // Backfill urlCache if missing
    if (!material.urlCache || 
        (typeof material.urlCache === 'object' && Object.keys(material.urlCache).length === 0)) {
      updates.urlCache = material.url ? { EN: material.url } : {}
    }

    // Backfill contentCache if missing
    if (!material.contentCache || 
        (typeof material.contentCache === 'object' && Object.keys(material.contentCache).length === 0)) {
      updates.contentCache = material.content ? { EN: material.content } : {}
    }

    // Only update if there's something to update
    if (Object.keys(updates).length > 0) {
      await prisma.material.update({
        where: { id: material.id },
        data: updates
      })
      materialsUpdated++
    }
  }

  console.log(`✅ Updated ${materialsUpdated} materials with titleCache/urlCache/contentCache\n`)

  // ============================================
  // SUMMARY
  // ============================================
  console.log('📊 SUMMARY:')
  console.log(`   Topics updated: ${topicsUpdated}`)
  console.log(`   Materials updated: ${materialsUpdated}`)
  console.log('\n✨ Cache backfill complete!')
}

main()
  .catch((e) => {
    console.error('❌ Error during backfill:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
