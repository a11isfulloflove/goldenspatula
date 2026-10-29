import { useState } from 'react'
import { championCostOf, championUniverse, roleOf } from '../data'
import { ROLE_ICONS } from '../componentMeta'
import ChampionPortrait from './ChampionPortrait'
import SparkleMark from './SparkleMark'
import { ChevronUp } from '../ui'
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
  counts,
  onAdd,
  onRemove,
  query,
  onQueryChange,
  startExpanded,
}: {
  counts: Record<string, number>
  onAdd: (name: string) => void
  onRemove: (name: string) => void
  query: string
  onQueryChange: (query: string) => void
  startExpanded: boolean
}) {
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')
  const [expanded, setExpanded] = useState(startExpanded)
  const pickedChampions = Object.entries(counts)

  const normalizedQuery = query.trim().toLowerCase()
  const visibleChampions = championUniverse.filter((name) => {
    if (normalizedQuery && !name.toLowerCase().includes(normalizedQuery)) return false
    if (roleFilter !== 'all' && roleOf(name) !== roleFilter) return false
    return true
  })

  return (
    <section className="panel">
      <button
        type="button"
        className="panel-head panel-toggle"
        aria-expanded={expanded}
        onClick={() => setExpanded((value) => !value)}
      >
        <div className="panel-head-text">
          <h2>3 · Champions you&apos;ve been offered</h2>
          {expanded ? (
            <span className="panel-hint">
              Tap once per copy <SparkleMark /> stacked duplicates signal a reroll start
            </span>
          ) : pickedChampions.length > 0 ? (
            <span className="panel-summary">
              {pickedChampions.map(([name, copies]) => (
                <span key={name} className="panel-summary-champ" title={`${name} ×${copies}`}>
                  <ChampionPortrait name={name} />
                  {copies > 1 && <span className="panel-summary-copies">×{copies}</span>}
                </span>
              ))}
            </span>
          ) : (
            <span className="panel-summary-empty">tap to add</span>
          )}
        </div>
        <ChevronUp className={`panel-chevron ${expanded ? 'open' : ''}`} />
      </button>
      {expanded && (
        <>
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
          const copies = counts[name] ?? 0
          return (
            <div key={name} className={`champ-cell ${ROLE_CLASS[role]}`}>
              <button
                type="button"
                className={`champ-card ${copies > 0 ? 'active' : ''}`}
                title={
                  copies > 0
                    ? `${name} ×${copies} — tap to add a copy`
                    : `${role} — tap to add a copy`
                }
                onClick={() => onAdd(name)}
              >
                <span className="champ-portrait-wrap">
                  <ChampionPortrait name={name} size="lg" />
                  {roleFilter === 'all' && (
                    <span className="champ-role-badge">
                      {RoleIcon ? (
                        <RoleIcon className="champ-role-icon" />
                      ) : (
                        <span className="champ-role-dot" aria-hidden="true" />
                      )}
                    </span>
                  )}
                </span>
                <span
                  className="champ-cost-stars"
                  aria-label={`${championCostOf(name)} cost champion`}
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`cost-star ${star <= championCostOf(name) ? 'filled' : ''}`}
                    />
                  ))}
                </span>
                <span className="champ-card-name">{name}</span>
                {copies > 1 && <span className="champ-copies">×{copies}</span>}
              </button>
              {copies > 0 && (
                <button
                  type="button"
                  className="champ-remove"
                  aria-label={`Remove a copy of ${name}`}
                  onClick={() => onRemove(name)}
                >
                  −
                </button>
              )}
            </div>
          )
        })}
        {visibleChampions.length === 0 && <span className="champ-empty">No matches</span>}
      </div>
        </>
      )}
    </section>
  )
}
