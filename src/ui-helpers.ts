export function needStatusClass(have: number, need: number): string {
  if (have >= need) return 'ok'
  if (have > 0) return 'partial'
  return 'none'
}
