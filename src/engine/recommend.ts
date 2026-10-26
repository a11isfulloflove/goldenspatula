import type { Augment, Comp, ItemNeeds, ItemsData, Opener } from '../types'

export interface NeedStatus {
  label: string
  have: number
  need: number
}

export interface MatchedChampion {
  name: string
  role: string
  copies: number
}

export interface MatchedAugment {
  name: string
  icon?: string
}

export interface Recommendation {
  comp: Comp
  score: number
  needs: NeedStatus[]
  matchedChampions: MatchedChampion[]
  matchedAugments: MatchedAugment[]
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

const COPY_BONUS_STEPS = [1, 1.1, 1.25, 1.3, 1.4, 1.5]

function copyMultiplier(copies: number): number {
  return COPY_BONUS_STEPS[Math.min(copies, COPY_BONUS_STEPS.length) - 1]
}

function collectChampionMatches(
  early: string[],
  holders: string[],
  roster: string[],
  championCounts: Record<string, number>,
): { matches: MatchedChampion[]; bonus: number } {
  const matches: MatchedChampion[] = []
  let bonus = 0
  for (const [name, copies] of Object.entries(championCounts)) {
    if (early.includes(name)) {
      matches.push({ name, role: 'early', copies })
      bonus += 0.3 * copyMultiplier(copies)
    } else if (holders.includes(name)) {
      matches.push({ name, role: 'item holder', copies })
      bonus += 0.15 * copyMultiplier(copies)
    } else if (roster.includes(name)) {
      matches.push({ name, role: 'roster', copies })
      bonus += 0.08 * copyMultiplier(copies)
    }
  }
  return { matches, bonus: Math.min(bonus, 0.6) }
}

const AUGMENT_BONUS = 0.25
const AUGMENT_BONUS_CAP = 0.5

function collectAugmentMatches(
  comp: Comp,
  augments: Augment[],
): { matches: MatchedAugment[]; bonus: number } {
  const matches: MatchedAugment[] = []
  let bonus = 0
  for (const augment of augments) {
    const matchesTrait = augment.trait !== undefined && comp.traits.includes(augment.trait)
    const matchesChampion =
      augment.champion !== undefined &&
      [...comp.earlyChampions, ...comp.itemHolders, ...comp.roster].includes(augment.champion)
    if (matchesTrait || matchesChampion) {
      matches.push({ name: augment.name, icon: augment.icon })
      bonus += AUGMENT_BONUS
    }
  }
  return { matches, bonus: Math.min(bonus, AUGMENT_BONUS_CAP) }
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
  championCounts: Record<string, number>,
  augments: Augment[] = [],
): Recommendation[] {
  const usableInventory = stripSpatula(inventory)
  const inventorySize = Object.values(usableInventory).reduce((sum, n) => sum + n, 0)

  return comps
    .map((comp) => {
      const fit = computeFit(comp.itemNeeds, items, usableInventory)
      const wasteRatio = inventorySize > 0 ? fit.unusedCount / inventorySize : 0
      const { matches, bonus } = collectChampionMatches(
        comp.earlyChampions,
        comp.itemHolders,
        comp.roster,
        championCounts,
      )
      const { matches: augmentMatches, bonus: augmentBonus } = collectAugmentMatches(comp, augments)
      const score = clamp01(
        fit.ratio * 0.6 +
          bonus +
          augmentBonus +
          (TIER_BIAS[comp.tier] ?? 0) -
          wasteRatio * 0.25,
      )
      return {
        comp,
        score,
        needs: buildNeeds(comp.itemNeeds, items, usableInventory),
        matchedChampions: matches,
        matchedAugments: augmentMatches,
        unusedCount: fit.unusedCount,
      }
    })
    .sort((a, b) => b.score - a.score)
}

export function recommendOpeners(
  openers: Opener[],
  items: ItemsData,
  inventory: Record<string, number>,
  championCounts: Record<string, number>,
): OpenerRecommendation[] {
  const usableInventory = stripSpatula(inventory)
  const inventorySize = Object.values(usableInventory).reduce((sum, n) => sum + n, 0)

  return openers
    .map((opener) => {
      const fit = computeFit(opener.itemNeeds, items, usableInventory)
      const wasteRatio = inventorySize > 0 ? fit.unusedCount / inventorySize : 0
      const { matches, bonus } = collectChampionMatches(opener.units, [], [], championCounts)
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
