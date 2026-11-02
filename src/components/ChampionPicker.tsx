import { useState } from 'react'
import { championCostOf, championUniverse, roleOf } from '../data'
import { ROLE_ICONS } from '../componentMeta'
import ChampionPortrait from './ChampionPortrait'
import SparkleMark from './SparkleMark'
import { ChevronUp } from '../ui'
import './ChampionPicker.css'

const SORT_ORDERS = [
  { id: 'cost-asc', label: '1★–5★' },
  { id: 'cost-desc', label: '5★–1★' },
  { id: 'name', label: 'A–Z' },
] as const

export type SortOrder = (typeof SORT_ORDERS)[number]['id']

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
  const [sortOrder, setSortOrder] = useState<SortOrder>('cost-asc')
  const [expanded, setExpanded] = useState(startExpanded)
  const pickedChampions = Object.entries(counts)

  const normalizedQuery = query.trim().toLowerCase()
  const sortedChampions = championUniverse
    .filter(
      (name) => !normalizedQuery || name.toLowerCase().includes(normalizedQuery),
    )
    .sort((a, b) => {
      if (sortOrder === 'name') return a.localeCompare(b)
      const diff = championCostOf(a) - championCostOf(b) || a.localeCompare(b)
      return sortOrder === 'cost-asc' ? diff : -diff
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
        <div className="role-filter" role="group" aria-label="Sort champions">
          {SORT_ORDERS.map((option) => (
            <button
              key={option.id}
              type="button"
              className={sortOrder === option.id ? 'active' : ''}
              onClick={() => setSortOrder(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      <div className="champ-cards">
        {sortedChampions.map((name) => {
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
                  <span className="champ-role-badge">
                    {RoleIcon ? (
                      <RoleIcon className="champ-role-icon" />
                    ) : (
                      <span className="champ-role-dot" aria-hidden="true" />
                    )}
                  </span>
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
        {sortedChampions.length === 0 && <span className="champ-empty">No matches</span>}
      </div>
        </>
      )}
    </section>
  )
}
