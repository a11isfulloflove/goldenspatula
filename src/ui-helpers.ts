export function needStatusClass(have: number, need: number): string {
  if (have >= need) return 'ok'
  if (have > 0) return 'partial'
  return 'none'
}

export function asset(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`
}
