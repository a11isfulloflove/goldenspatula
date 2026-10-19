import type { ChampionRole, Comp, ItemsData, SetData, SetMeta } from './types'
import configJson from '../data/config.json'
import itemsJson from '../data/items.json'

const metaModules = import.meta.glob<{ default: unknown }>('../data/sets/*/meta.json', {
  eager: true,
})
const compModules = import.meta.glob<{ default: unknown }>('../data/sets/*/comps.json', {
  eager: true,
})
const championModules = import.meta.glob<{ default: unknown }>('../data/sets/*/champions.json', {
  eager: true,
})
const championCostModules = import.meta.glob<{ default: unknown }>(
  '../data/sets/*/championCosts.json',
  {
    eager: true,
  },
)

function setIdFromPath(path: string): string {
  const match = path.match(/\/sets\/([^/]+)\//)
  return match ? match[1] : ''
}

function pickModule(
  modules: Record<string, { default: unknown }>,
  setId: string,
  fallback: unknown,
): unknown {
  const entry = Object.entries(modules).find(([path]) => setIdFromPath(path) === setId)
  if (entry) return entry[1].default
  const first = Object.values(modules)[0]
  return first ? first.default : fallback
}

export const items = itemsJson as unknown as ItemsData

export const activeSet: SetData = {
  meta: pickModule(metaModules, configJson.activeSet, {}) as SetMeta,
  comps: pickModule(compModules, configJson.activeSet, []) as Comp[],
  championRoles: pickModule(championModules, configJson.activeSet, {}) as Record<
    string,
    ChampionRole
  >,
  championCosts: pickModule(championCostModules, configJson.activeSet, {}) as Record<
    string,
    number
  >,
}

export function roleOf(name: string): string {
  return activeSet.championRoles?.[name] ?? 'flex'
}

export function championCostOf(name: string): number {
  return activeSet.championCosts?.[name] ?? 0
}

function championSortCost(name: string): number {
  return activeSet.championCosts?.[name] ?? 99
}

export const championUniverse = Array.from(
  new Set([
    ...Object.keys(activeSet.championRoles ?? {}),
    ...activeSet.comps.flatMap((comp) => [
      ...comp.earlyChampions,
      ...comp.itemHolders,
      ...comp.roster,
    ]),
  ]),
).sort((a, b) => championSortCost(a) - championSortCost(b) || a.localeCompare(b))
