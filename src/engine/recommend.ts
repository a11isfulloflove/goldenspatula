import type { Comp, ItemsData } from '../types'

export interface NeedStatus {
  label: string
  have: number
  need: number
}

export interface MatchedChampion {
  name: string
  role: string
}

export interface Recommendation {
  comp: Comp
  score: number
  needs: NeedStatus[]
  matchedChampions: MatchedChampion[]
  unusedCount: number
}

const TIER_BIAS: Record<string, number> = { S: 0.06, A: 0.03, B: 0, C: 0 }

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value))
}

function needLabel(key: string, items: ItemsData): string {
  if (key === 'tank') return 'Tank item'
  if (key === 'damage') return 'Damage item'
  if (key === 'mana') return 'Mana item'
  const component = items.components.find((c) => c.id === key)
  return component ? component.short : key
}

function scoreComp(
  comp: Comp,
  items: ItemsData,
  inventory: Record<string, number>,
  champions: string[],
): Recommendation {
  const slots: { sources: string[] }[] = []
  for (const [key, count] of Object.entries(comp.itemNeeds)) {
    const sources = items.groups[key] ?? [key]
    for (let i = 0; i < count; i++) slots.push({ sources })
  }
  slots.sort((a, b) => a.sources.length - b.sources.length)

  const remaining = { ...inventory }
  let matched = 0
  for (const slot of slots) {
    const pick = slot.sources.find((id) => (remaining[id] ?? 0) > 0)
    if (pick) {
      remaining[pick] -= 1
      matched++
    }
  }

  const needsTotal = slots.length
  const fit = needsTotal > 0 ? matched / needsTotal : 0.5

  const inventorySize = Object.values(inventory).reduce((sum, n) => sum + n, 0)
  const unusedCount = Object.values(remaining).reduce((sum, n) => sum + n, 0)
  const wasteRatio = inventorySize > 0 ? unusedCount / inventorySize : 0

  const matchedChampions: MatchedChampion[] = []
  let championBonus = 0
  for (const name of champions) {
    if (comp.earlyChampions.includes(name)) {
      matchedChampions.push({ name, role: 'early' })
      championBonus += 0.3
    } else if (comp.itemHolders.includes(name)) {
      matchedChampions.push({ name, role: 'item holder' })
      championBonus += 0.15
    } else if (comp.roster.includes(name)) {
      matchedChampions.push({ name, role: 'roster' })
      championBonus += 0.08
    }
  }
  championBonus = Math.min(championBonus, 0.5)

  const needs: NeedStatus[] = Object.entries(comp.itemNeeds).map(([key, need]) => {
    const sources = items.groups[key] ?? [key]
    const have = Math.min(need, sources.reduce((sum, id) => sum + (inventory[id] ?? 0), 0))
    return { label: needLabel(key, items), have, need }
  })

  const score = clamp01(
    fit * 0.6 + championBonus + (TIER_BIAS[comp.tier] ?? 0) - wasteRatio * 0.25,
  )

  return { comp, score, needs, matchedChampions, unusedCount }
}

export function recommend(
  comps: Comp[],
  items: ItemsData,
  inventory: Record<string, number>,
  champions: string[],
): Recommendation[] {
  const usableInventory: Record<string, number> = {}
  for (const [id, count] of Object.entries(inventory)) {
    if (id === 'spatula') continue
    if (count > 0) usableInventory[id] = count
  }

  return comps
    .map((comp) => scoreComp(comp, items, usableInventory, champions))
    .sort((a, b) => b.score - a.score)
}
