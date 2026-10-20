import type { Comp, ItemNeeds, ItemsData, Opener } from '../types'

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

export interface OpenerRecommendation {
  opener: Opener
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

interface FitResult {
  ratio: number
  unusedCount: number
}

function computeFit(
  itemNeeds: ItemNeeds,
  items: ItemsData,
  inventory: Record<string, number>,
): FitResult {
  const slots: { sources: string[] }[] = []
  for (const [key, count] of Object.entries(itemNeeds)) {
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
  const ratio = needsTotal > 0 ? matched / needsTotal : 0.5
  const unusedCount = Object.values(remaining).reduce((sum, n) => sum + n, 0)
  return { ratio, unusedCount }
}

function collectChampionMatches(
  early: string[],
  holders: string[],
  roster: string[],
  champions: string[],
): { matches: MatchedChampion[]; bonus: number } {
  const matches: MatchedChampion[] = []
  let bonus = 0
  for (const name of champions) {
    if (early.includes(name)) {
      matches.push({ name, role: 'early' })
      bonus += 0.3
    } else if (holders.includes(name)) {
      matches.push({ name, role: 'item holder' })
      bonus += 0.15
    } else if (roster.includes(name)) {
      matches.push({ name, role: 'roster' })
      bonus += 0.08
    }
  }
  return { matches, bonus: Math.min(bonus, 0.5) }
}

function buildNeeds(
  itemNeeds: ItemNeeds,
  items: ItemsData,
  inventory: Record<string, number>,
): NeedStatus[] {
  return Object.entries(itemNeeds).map(([key, need]) => {
    const sources = items.groups[key] ?? [key]
    const have = Math.min(need, sources.reduce((sum, id) => sum + (inventory[id] ?? 0), 0))
    return { label: needLabel(key, items), have, need }
  })
}

function stripSpatula(inventory: Record<string, number>): Record<string, number> {
  const usable: Record<string, number> = {}
  for (const [id, count] of Object.entries(inventory)) {
    if (id === 'spatula') continue
    if (count > 0) usable[id] = count
  }
  return usable
}

export function recommend(
  comps: Comp[],
  items: ItemsData,
  inventory: Record<string, number>,
  champions: string[],
): Recommendation[] {
  const usableInventory = stripSpatula(inventory)

  return comps
    .map((comp) => {
      const fit = computeFit(comp.itemNeeds, items, usableInventory)
      const inventorySize = Object.values(usableInventory).reduce((sum, n) => sum + n, 0)
      const wasteRatio = inventorySize > 0 ? fit.unusedCount / inventorySize : 0
      const { matches, bonus } = collectChampionMatches(
        comp.earlyChampions,
        comp.itemHolders,
        comp.roster,
        champions,
      )
      const score = clamp01(
        fit.ratio * 0.6 + bonus + (TIER_BIAS[comp.tier] ?? 0) - wasteRatio * 0.25,
      )
      return {
        comp,
        score,
        needs: buildNeeds(comp.itemNeeds, items, usableInventory),
        matchedChampions: matches,
        unusedCount: fit.unusedCount,
      }
    })
    .sort((a, b) => b.score - a.score)
}

export function recommendOpeners(
  openers: Opener[],
  items: ItemsData,
  inventory: Record<string, number>,
  champions: string[],
): OpenerRecommendation[] {
  const usableInventory = stripSpatula(inventory)

  return openers
    .map((opener) => {
      const fit = computeFit(opener.itemNeeds, items, usableInventory)
      const inventorySize = Object.values(usableInventory).reduce((sum, n) => sum + n, 0)
      const wasteRatio = inventorySize > 0 ? fit.unusedCount / inventorySize : 0
      const { matches, bonus } = collectChampionMatches(opener.units, [], [], champions)
      const score = clamp01(fit.ratio * 0.6 + bonus - wasteRatio * 0.25)
      return {
        opener,
        score,
        needs: buildNeeds(opener.itemNeeds, items, usableInventory),
        matchedChampions: matches,
        unusedCount: fit.unusedCount,
      }
    })
    .sort((a, b) => b.score - a.score)
}
