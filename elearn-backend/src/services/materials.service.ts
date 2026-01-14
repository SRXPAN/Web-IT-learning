// src/services/materials.service.ts
import { prisma } from '../db.js'
import type { Prisma } from '@prisma/client'

export interface MaterialLocalizationDTO {
  type?: string
  titleEN?: string
  titleUA?: string
  titlePL?: string
  linkEN?: string
  linkUA?: string
  linkPL?: string
  contentEN?: string
  contentUA?: string
  contentPL?: string
}

/**
 * Updates a material with localized content
 * Handles fallbacks and JSON cache construction
 */
export async function updateMaterialWithLocalization(
  id: string,
  dto: MaterialLocalizationDTO
) {
  const updateData: Prisma.MaterialUpdateInput = {}

  // Type update if provided
  if (dto.type) {
    updateData.type = dto.type as any
  }

  // Legacy fields (Fallback to EN for backward compatibility)
  updateData.title = dto.titleEN || 'Untitled'
  updateData.url = dto.linkEN || null
  updateData.content = dto.contentEN || null

  // JSON Cache fields (The real localization)
  updateData.titleCache = {
    EN: dto.titleEN || '',
    UA: dto.titleUA || '',
    PL: dto.titlePL || ''
  }

  updateData.urlCache = {
    EN: dto.linkEN || '',
    UA: dto.linkUA || '',
    PL: dto.linkPL || ''
  }

  updateData.contentCache = {
    EN: dto.contentEN || '',
    UA: dto.contentUA || '',
    PL: dto.contentPL || ''
  }

  const updated = await prisma.material.update({
    where: { id },
    data: updateData
  })

  return updated
}
