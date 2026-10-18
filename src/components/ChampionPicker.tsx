import { useState } from 'react'
import { championUniverse, roleOf } from '../data'
import { ROLE_ICONS } from '../componentMeta'
import ChampionPortrait from './ChampionPortrait'
import SparkleMark from './SparkleMark'
import './ChampionPicker.css'

const ROLE_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'carry', label: 'Carries' },
  { id: 'tank', label: 'Tanks' },
  { id: 'support', label: 'Supports' },
] as const

export type RoleFilter = (typeof ROLE_FILTERS)[number]['id']

const ROLE_CLASS: Record<string, string> = {
  carry: 'role-carry',
  tank: 'role-tank',
  support: 'role-support',
  flex: 'role-flex',
}

export default function ChampionPicker({
  selected,
  onToggle,
  query,
  onQueryChange,
}: {
  selected: string[]
  onToggle: (name: string) => void
  query: string
  onQueryChange: (query: string) => void
}) {
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')

  const normalizedQuery = query.trim().toLowerCase()
  const visibleChampions = championUniverse.filter((name) => {
    if (normalizedQuery && !name.toLowerCase().includes(normalizedQuery)) return false
    if (roleFilter !== 'all' && roleOf(name) !== roleFilter) return false
    return true
  })

  return (
    <section className="panel">
      <div className="panel-head">
        <div className="panel-head-text">
          <h2>2 · Champions you&apos;ve been offered</h2>
          <span className="panel-hint">
            Pick 1-3 champions <SparkleMark /> early copies signal which line to play
          </span>
        </div>
      </div>
      <div className="champ-controls">
        <input
          className="champ-filter"
          type="search"
          placeholder="Filter champions..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
        />
        <div className="role-filter" role="group" aria-label="Filter champions by role">
          {ROLE_FILTERS.map((option) => (
            <button
              key={option.id}
              type="button"
              className={roleFilter === option.id ? 'active' : ''}
              onClick={() => setRoleFilter(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      <div className="champ-cards">
        {visibleChampions.map((name) => {
          const role = roleOf(name)
          const RoleIcon = ROLE_ICONS[role]
          return (
            <button
              key={name}
              type="button"
              className={`champ-card ${selected.includes(name) ? 'active' : ''} ${ROLE_CLASS[role]}`}
              title={role}
              onClick={() => onToggle(name)}
            >
              <ChampionPortrait name={name} size="lg" />
              {roleFilter === 'all' &&
                (RoleIcon ? (
                  <RoleIcon className="champ-role-icon" />
                ) : (
                  <span className="champ-role-dot" aria-hidden="true" />
                ))}
              <span className="champ-card-name">{name}</span>
            </button>
          )
        })}
        {visibleChampions.length === 0 && <span className="champ-empty">No matches</span>}
      </div>
    </section>
  )
}
