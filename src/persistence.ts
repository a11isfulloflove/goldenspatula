import { championUniverse, items } from './data'
import { MAX_PER_COMPONENT } from './constants'

const STORAGE_KEY = 'golden-spatula-input-v1'

export interface PersistedInput {
  counts: Record<string, number>
  champions: string[]
}

export function loadPersistedInput(): PersistedInput {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { counts: {}, champions: [] }
    const parsed = JSON.parse(raw) as Partial<PersistedInput>
    const validIds = new Set(items.components.map((c) => c.id))
    const counts: Record<string, number> = {}
    if (parsed.counts && typeof parsed.counts === 'object') {
      for (const [id, count] of Object.entries(parsed.counts)) {
        if (validIds.has(id) && typeof count === 'number') {
          const clamped = Math.floor(Math.min(Math.max(count, 0), MAX_PER_COMPONENT))
          if (clamped > 0) counts[id] = clamped
        }
      }
    }
    const champions = Array.isArray(parsed.champions)
      ? parsed.champions.filter(
          (name): name is string => typeof name === 'string' && championUniverse.includes(name),
        )
      : []
    return { counts, champions }
  } catch {
    return { counts: {}, champions: [] }
  }
}

export function savePersistedInput(input: PersistedInput): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(input))
  } catch {
    return
  }
}

export function clearPersistedInput(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    return
  }
}
