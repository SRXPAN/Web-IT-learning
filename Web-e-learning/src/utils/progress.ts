const SEEN_KEY = 'elearn_seen_materials'

export function countSeen(materialIds: string[]): number {
  if (!materialIds.length) return 0
  const seen = new Set(JSON.parse(localStorage.getItem(SEEN_KEY) || '[]'))
  return materialIds.filter(id => seen.has(id)).length
}

export function isMaterialSeen(materialId: string): boolean {
  const seen = new Set(JSON.parse(localStorage.getItem(SEEN_KEY) || '[]'))
  return seen.has(materialId)
}

export function markMaterialSeen(materialId: string): void {
  const seen = new Set(JSON.parse(localStorage.getItem(SEEN_KEY) || '[]'))
  seen.add(materialId)
  localStorage.setItem(SEEN_KEY, JSON.stringify(Array.from(seen)))
}
