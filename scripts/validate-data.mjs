import { readFileSync, readdirSync } from 'node:fs'

function load(path) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

function slug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
}

const warnings = []

function warn(check, message) {
  warnings.push(`  [${check}] ${message}`)
}

function report(check, ok, okMessage, failMessages) {
  if (failMessages.length === 0) {
    console.log(`  ok    ${check} (${okMessage})`)
  } else {
    console.log(`  WARN  ${check} (${failMessages.length} issue${failMessages.length > 1 ? 's' : ''})`)
    for (const message of failMessages) warn(check, message)
  }
}

const config = load('data/config.json')
const setId = config.activeSet

const items = load('data/items.json')
const roles = load(`data/sets/${setId}/champions.json`)
const costs = load(`data/sets/${setId}/championCosts.json`)
const comps = load(`data/sets/${setId}/comps.json`)
const openers = load(`data/sets/${setId}/openers.json`)

const champFiles = new Set(readdirSync('public/champs'))
const itemFiles = new Set(readdirSync('public/items'))
const emblemFiles = new Set(readdirSync('public/emblems'))

const roster = new Set(Object.keys(roles))
const componentIds = new Set(items.components.map((c) => c.id))
const needKeys = new Set([...componentIds, ...Object.keys(items.groups)])
const compIds = new Set(comps.map((comp) => comp.id))
const tiers = new Set(['S', 'A', 'B', 'C'])
const validRoles = new Set(['carry', 'tank', 'support', 'flex'])

console.log(`\nValidating ${setId} data...\n`)

{
  const fails = []
  for (const comp of comps) {
    for (const field of ['roster', 'earlyChampions', 'itemHolders']) {
      for (const name of comp[field]) {
        if (!roster.has(name)) fails.push(`${comp.id}: ${field} has "${name}"`)
      }
    }
    for (const carry of comp.carryItems) {
      const primary = carry.champion
        .split('/')[0]
        .trim()
        .replace(/\s*\(.*\)$/, '')
        .trim()
      if (!roster.has(primary)) fails.push(`${comp.id}: carry "${carry.champion}" not in roster`)
    }
    if (!tiers.has(comp.tier)) fails.push(`${comp.id}: tier "${comp.tier}"`)
    for (const key of Object.keys(comp.itemNeeds)) {
      if (!needKeys.has(key)) fails.push(`${comp.id}: itemNeeds key "${key}"`)
    }
  }
  if (new Set(comps.map((c) => c.id)).size !== comps.length) fails.push('duplicate comp ids')
  report('comps: champion refs', comps.length === 0, `${comps.length} comps`, fails)
}

{
  const fails = []
  for (const opener of openers.openers) {
    for (const unit of opener.units) {
      if (!roster.has(unit)) fails.push(`${opener.id}: unit "${unit}" not in roster`)
    }
    for (const hold of opener.itemHolds) {
      if (!roster.has(hold.champion)) fails.push(`${opener.id}: hold "${hold.champion}" not in roster`)
    }
    for (const compId of opener.leadsTo) {
      if (!compIds.has(compId)) fails.push(`${opener.id}: leadsTo "${compId}" not a comp`)
    }
    for (const key of Object.keys(opener.itemNeeds)) {
      if (!needKeys.has(key)) fails.push(`${opener.id}: itemNeeds key "${key}"`)
    }
  }
  if (new Set(openers.openers.map((o) => o.id)).size !== openers.openers.length) {
    fails.push('duplicate opener ids')
  }
  report('openers: refs', openers.openers.length, `${openers.openers.length} openers`, fails)
}

{
  const fails = []
  for (const start of openers.specialStarts) {
    for (const compId of start.compIds) {
      if (!compIds.has(compId)) fails.push(`"${start.condition}" -> "${compId}" not a comp`)
    }
  }
  report('special starts: refs', openers.specialStarts.length, `${openers.specialStarts.length} entries`, fails)
}

{
  const fails = []
  for (const [name, role] of Object.entries(roles)) {
    if (!validRoles.has(role)) fails.push(`${name}: role "${role}"`)
    if (!costs[name]) fails.push(`${name}: no cost in championCosts.json`)
    const file = `${slug(name)}.png`
    if (!champFiles.has(file)) fails.push(`${name}: missing portrait public/champs/${file}`)
  }
  report('champions: roles/costs/portraits', Object.keys(roles).length, `${Object.keys(roles).length} champions`, fails)
}

{
  const fails = []
  for (const [name, file] of Object.entries(items.itemIcons)) {
    if (!itemFiles.has(file)) fails.push(`${name}: missing file public/items/${file}`)
  }
  report('item icons: files', Object.keys(items.itemIcons).length, `${Object.keys(items.itemIcons).length} icons`, fails)
}

{
  const fails = []
  for (const recipe of items.recipes) {
    for (const id of recipe.components) {
      if (!componentIds.has(id)) fails.push(`${recipe.name}: component "${id}"`)
    }
  }
  report('recipes: components', items.recipes.length, `${items.recipes.length} recipes`, fails)
}

{
  const fails = []
  for (const emblem of items.emblemRecipes) {
    if (emblem.component !== null && !componentIds.has(emblem.component)) {
      fails.push(`${emblem.name}: component "${emblem.component}"`)
    }
    if (!emblemFiles.has(emblem.icon)) fails.push(`${emblem.name}: missing file public/emblems/${emblem.icon}`)
  }
  report('emblem recipes: refs', items.emblemRecipes.length, `${items.emblemRecipes.length} emblems`, fails)
}

console.log()
if (warnings.length === 0) {
  console.log('All checks passed. Data is clean.\n')
} else {
  console.log(`${warnings.length} warning${warnings.length > 1 ? 's' : ''}:\n`)
  for (const warning of warnings) console.log(warning)
  console.log()
}
