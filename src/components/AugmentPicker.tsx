import { useState } from 'react'
import { activeSet } from '../data'
import { MAX_AUGMENTS } from '../constants'
import SparkleMark from './SparkleMark'
import AugmentIcon from './AugmentIcon'
import { ChevronUp } from '../ui'
import './AugmentPicker.css'

const TIER_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'silver', label: 'Silver' },
  { id: 'gold', label: 'Gold' },
  { id: 'prismatic', label: 'Prismatic' },
] as const

type TierFilter = (typeof TIER_FILTERS)[number]['id']

export default function AugmentPicker({
  selected,
  onToggle,
  startExpanded,
}: {
  selected: string[]
  onToggle: (id: string) => void
  startExpanded: boolean
}) {
  const [query, setQuery] = useState('')
  const [tierFilter, setTierFilter] = useState<TierFilter>('all')
  const [expanded, setExpanded] = useState(startExpanded)
  const augments = activeSet.augments ?? []
  const atLimit = selected.length >= MAX_AUGMENTS

  const normalizedQuery = query.trim().toLowerCase()
  const visibleAugments = augments.filter((augment) => {
    if (tierFilter !== 'all' && augment.tier !== tierFilter) return false
    if (
      normalizedQuery &&
      !augment.name.toLowerCase().includes(normalizedQuery) &&
      (augment.trait ?? '').toLowerCase().includes(normalizedQuery) === false
    ) {
      return false
    }
    return true
  })

  function toggle(id: string) {
    if (!selected.includes(id) && atLimit) return
    onToggle(id)
  }

  return (
    <section className="panel">
      <button
        type="button"
        className="panel-head panel-toggle"
        aria-expanded={expanded}
        onClick={() => setExpanded((value) => !value)}
      >
        <div className="panel-head-text">
          <h2>3 · Augments you&apos;ve been offered</h2>
          {expanded ? (
            <span className="panel-hint">
              Pick up to {MAX_AUGMENTS} <SparkleMark /> crests and trait augments pick your comp
              for you
            </span>
          ) : selected.length > 0 ? (
            <span className="panel-summary">
              {selected.map((id) => {
                const augment = augments.find((a) => a.id === id)
                if (!augment) return null
                return (
                  <AugmentIcon
                    key={id}
                    icon={augment.icon}
                    tier={augment.tier}
                    size={20}
                    fallbackChar={augment.name.charAt(0)}
                    title={augment.name}
                  />
                )
              })}
            </span>
          ) : (
            <span className="panel-summary-empty">tap to add</span>
          )}
        </div>
        <ChevronUp className={`panel-chevron ${expanded ? 'open' : ''}`} />
      </button>
      {augments.length === 0 ? null : (
        expanded && (
          <>
          <div className="champ-controls">
            <input
              className="champ-filter augment-filter"
              type="search"
              placeholder="Filter augments..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="role-filter" role="group" aria-label="Filter augments by tier">
              {TIER_FILTERS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={tierFilter === option.id ? 'active' : ''}
                  onClick={() => setTierFilter(option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <div className="augment-cards">
            {visibleAugments.map((augment) => {
              const isSelected = selected.includes(augment.id)
              const disabled = !isSelected && atLimit
              return (
                <button
                  key={augment.id}
                  type="button"
                  className={`augment-card tier-${augment.tier} ${isSelected ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
                  aria-pressed={isSelected}
                  title={`${augment.name} (${augment.tier})${augment.description ? ` — ${augment.description}` : ''}`}
                  onClick={() => toggle(augment.id)}
                >
                  <AugmentIcon
                    icon={augment.icon}
                    tier={augment.tier}
                    size={26}
                    fallbackChar={augment.trait?.charAt(0) ?? augment.name.charAt(0)}
                  />
                  <span className="augment-name">{augment.name}</span>
                </button>
              )
            })}
            {visibleAugments.length === 0 && (
              <span className="champ-empty">No matches</span>
            )}
          </div>
        </>
          )
      )}
    </section>
  )
}
