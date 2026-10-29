import { activeSet, championUniverse, items } from './data'
import { MAX_AUGMENTS, MAX_CHAMPION_COPIES, MAX_CRAFTED_ITEMS, MAX_PER_COMPONENT } from './constants'

const STORAGE_KEY = 'golden-spatula-input-v1'

export interface PersistedInput {
  counts: Record<string, number>
  championCounts: Record<string, number>
  augments: string[]
  emblems: string[]
  crafted: string[]
}

export function loadPersistedInput(): PersistedInput {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { counts: {}, championCounts: {}, augments: [], emblems: [], crafted: [] }
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
    const validAugmentIds = new Set((activeSet.augments ?? []).map((augment) => augment.id))
    const augments = Array.isArray(parsed.augments)
      ? [
          ...new Set(
            parsed.augments.filter((id): id is string => typeof id === 'string'),
          ),
        ]
          .filter((id) => validAugmentIds.has(id))
          .slice(0, MAX_AUGMENTS)
      : []
    const validEmblemNames = new Set(
      (items.emblemRecipes ?? []).map((emblem) => emblem.name),
    )
    const emblems = Array.isArray(parsed.emblems)
      ? [
          ...new Set(
            parsed.emblems.filter((name): name is string => typeof name === 'string'),
          ),
        ].filter((name) => validEmblemNames.has(name))
      : []
    const validRecipeNames = new Set(items.recipes.map((recipe) => recipe.name))
    const crafted = Array.isArray(parsed.crafted)
      ? [
          ...new Set(
            parsed.crafted.filter((name): name is string => typeof name === 'string'),
          ),
        ]
          .filter((name) => validRecipeNames.has(name))
          .slice(0, MAX_CRAFTED_ITEMS)
      : []
    return { counts, championCounts, augments, emblems, crafted }
  } catch {
    return { counts: {}, championCounts: {}, augments: [], emblems: [], crafted: [] }
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
