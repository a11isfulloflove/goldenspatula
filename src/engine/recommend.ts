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
  matchedCrafted: string[]
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
    if (id === 'spatula' || id === 'fryingpan') continue
    if (count > 0) usable[id] = count
  }
  return usable
}

function lockCraftedComponents(
  craftedItems: string[],
  items: ItemsData,
): Record<string, number> {
  const locked: Record<string, number> = {}
  for (const name of craftedItems) {
    const recipe = items.recipes.find((r) => r.name === name)
    if (!recipe) continue
    for (const id of recipe.components) locked[id] = (locked[id] ?? 0) + 1
  }
  return locked
}

function applyLocks(
  inventory: Record<string, number>,
  locked: Record<string, number>,
): Record<string, number> {
  const available: Record<string, number> = {}
  for (const [id, count] of Object.entries(inventory)) {
    const free = count - (locked[id] ?? 0)
    if (free > 0) available[id] = free
  }
  return available
}

const CRAFTED_BONUS = 0.2
const CRAFTED_BONUS_CAP = 0.4

function collectCraftedMatches(
  comp: Comp,
  craftedItems: string[],
): { matches: string[]; bonus: number } {
  const wanted = new Set<string>()
  for (const carry of comp.carryItems) {
    for (const name of [...carry.bis, ...(carry.alternatives ?? [])]) wanted.add(name)
  }
  const matches = craftedItems.filter((name) => wanted.has(name))
  return { matches, bonus: Math.min(matches.length * CRAFTED_BONUS, CRAFTED_BONUS_CAP) }
}

export function recommend(
  comps: Comp[],
  items: ItemsData,
  inventory: Record<string, number>,
  championCounts: Record<string, number>,
  augments: Augment[] = [],
  craftedItems: string[] = [],
): Recommendation[] {
  const usableInventory = stripSpatula(inventory)
  const locked = lockCraftedComponents(craftedItems, items)
  const freeInventory = applyLocks(usableInventory, locked)
  const inventorySize = Object.values(usableInventory).reduce((sum, n) => sum + n, 0)

  return comps
    .map((comp) => {
      const fit = computeFit(comp.itemNeeds, items, freeInventory)
      const wasteRatio = inventorySize > 0 ? fit.unusedCount / inventorySize : 0
      const { matches, bonus } = collectChampionMatches(
        comp.earlyChampions,
        comp.itemHolders,
        comp.roster,
        championCounts,
      )
      const { matches: augmentMatches, bonus: augmentBonus } = collectAugmentMatches(comp, augments)
      const { matches: craftedMatches, bonus: craftedBonus } = collectCraftedMatches(
        comp,
        craftedItems,
      )
      const score = clamp01(
        fit.ratio * 0.6 +
          bonus +
          augmentBonus +
          craftedBonus +
          (TIER_BIAS[comp.tier] ?? 0) -
          wasteRatio * 0.25,
      )
      return {
        comp,
        score,
        needs: buildNeeds(comp.itemNeeds, items, freeInventory),
        matchedChampions: matches,
        matchedAugments: augmentMatches,
        matchedCrafted: craftedMatches,
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
  craftedItems: string[] = [],
): OpenerRecommendation[] {
  const usableInventory = stripSpatula(inventory)
  const locked = lockCraftedComponents(craftedItems, items)
  const freeInventory = applyLocks(usableInventory, locked)
  const inventorySize = Object.values(usableInventory).reduce((sum, n) => sum + n, 0)

  return openers
    .map((opener) => {
      const fit = computeFit(opener.itemNeeds, items, freeInventory)
      const wasteRatio = inventorySize > 0 ? fit.unusedCount / inventorySize : 0
      const { matches, bonus } = collectChampionMatches(opener.units, [], [], championCounts)
      const score = clamp01(fit.ratio * 0.6 + bonus - wasteRatio * 0.25)
      return {
        opener,
        score,
        needs: buildNeeds(opener.itemNeeds, items, freeInventory),
        matchedChampions: matches,
        unusedCount: fit.unusedCount,
      }
    })
    .sort((a, b) => b.score - a.score)
}
