export interface ItemComponent {
  id: string
  name: string
  short: string
  stat: string
  category: string
  icon?: string
}

export interface Recipe {
  name: string
  components: string[]
  role: string
}

export interface ItemsData {
  components: ItemComponent[]
  groups: Record<string, string[]>
  recipes: Recipe[]
  itemIcons?: Record<string, string>
}

export type ItemNeeds = Record<string, number>

export interface CarryItems {
  champion: string
  bis: string[]
  alternatives?: string[]
  note?: string
}

export type Tier = 'S' | 'A' | 'B' | 'C'

export interface Comp {
  id: string
  name: string
  tier: Tier
  playstyle: string
  difficulty: 'easy' | 'medium' | 'hard'
  traits: string[]
  conditions: string[]
  itemNeeds: ItemNeeds
  earlyChampions: string[]
  itemHolders: string[]
  roster: string[]
  carryItems: CarryItems[]
  tips: string[]
}

export interface SetMeta {
  setNumber: number
  patch: string
}

export type ChampionRole = 'carry' | 'tank' | 'support' | 'flex'

export interface SetData {
  meta: SetMeta
  comps: Comp[]
  championRoles?: Record<string, ChampionRole>
  championCosts?: Record<string, number>
}
