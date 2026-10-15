import type { ComponentType } from 'react'
import { CrossIcon, ShieldIcon, SwordsIcon } from './roleIcons'

export const ROLE_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  carry: SwordsIcon,
  tank: ShieldIcon,
  support: CrossIcon,
}

export const COMPONENT_COLORS: Record<string, string> = {
  sword: '#64748b',
  rod: '#e05b3a',
  bow: '#c99a0c',
  tear: '#3b82f6',
  vest: '#a16a38',
  belt: '#d2554f',
  cloak: '#3e9b6b',
  gloves: '#7c8aa5',
  spatula: '#d9a62e',
}
