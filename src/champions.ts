export function championSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
}

export function primaryChampionName(raw: string): string {
  return raw
    .split('/')[0]
    .trim()
    .replace(/\s*\(.*\)$/, '')
    .trim()
}
