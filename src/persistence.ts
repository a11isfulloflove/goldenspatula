import { championUniverse, items } from './data'
import { MAX_CHAMPION_COPIES, MAX_PER_COMPONENT } from './constants'

const STORAGE_KEY = 'golden-spatula-input-v1'

export interface PersistedInput {
  counts: Record<string, number>
  championCounts: Record<string, number>
}

export function loadPersistedInput(): PersistedInput {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { counts: {}, championCounts: {} }
    const parsed = JSON.parse(raw) as Partial<
      PersistedInput & { champions: unknown }
    >
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
    const championCounts: Record<string, number> = {}
    if (parsed.championCounts && typeof parsed.championCounts === 'object') {
      for (const [name, copies] of Object.entries(parsed.championCounts)) {
        if (championUniverse.includes(name) && typeof copies === 'number') {
          const clamped = Math.floor(Math.min(Math.max(copies, 0), MAX_CHAMPION_COPIES))
          if (clamped > 0) championCounts[name] = clamped
        }
      }
    }
    if (Object.keys(championCounts).length === 0 && Array.isArray(parsed.champions)) {
      for (const name of parsed.champions) {
        if (typeof name === 'string' && championUniverse.includes(name)) {
          championCounts[name] = 1
        }
      }
    }
    return { counts, championCounts }
  } catch {
    return { counts: {}, championCounts: {} }
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
