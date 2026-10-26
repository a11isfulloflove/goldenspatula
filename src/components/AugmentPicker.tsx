import { useState } from 'react'
import { activeSet } from '../data'
import { MAX_AUGMENTS } from '../constants'
import SparkleMark from './SparkleMark'
import { asset } from '../ui-helpers'
import './AugmentPicker.css'

export default function AugmentPicker({
  selected,
  onToggle,
}: {
  selected: string[]
  onToggle: (id: string) => void
}) {
  const [query, setQuery] = useState('')
  const augments = activeSet.augments ?? []
  const atLimit = selected.length >= MAX_AUGMENTS

  const normalizedQuery = query.trim().toLowerCase()
  const visibleAugments = augments.filter(
    (augment) =>
      !normalizedQuery ||
      augment.name.toLowerCase().includes(normalizedQuery) ||
      (augment.trait ?? '').toLowerCase().includes(normalizedQuery),
  )

  function toggle(id: string) {
    if (!selected.includes(id) && atLimit) return
    onToggle(id)
  }

  return (
    <section className="panel">
      <div className="panel-head">
        <div className="panel-head-text">
          <h2>2 · Augments you&apos;ve been offered</h2>
          <span className="panel-hint">
            Pick up to {MAX_AUGMENTS} <SparkleMark /> crests and trait augments pick your comp
            for you
          </span>
        </div>
      </div>
      {augments.length === 0 ? null : (
        <>
          <div className="champ-controls">
            <input
              className="champ-filter augment-filter"
              type="search"
              placeholder="Filter augments..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="augment-cards">
            {visibleAugments.map((augment) => {
              const isSelected = selected.includes(augment.id)
              const disabled = !isSelected && atLimit
              return (
                <button
                  key={augment.id}
                  type="button"
                  className={`augment-card ${isSelected ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
                  aria-pressed={isSelected}
                  onClick={() => toggle(augment.id)}
                >
                  <span className="augment-icon">
                    {augment.icon ? (
                      <img
                        src={asset(`emblems/${augment.icon}`)}
                        alt=""
                        draggable={false}
                        decoding="async"
                      />
                    ) : (
                      <span className="augment-initial" aria-hidden="true">
                        {augment.trait?.charAt(0) ?? 'A'}
                      </span>
                    )}
                  </span>
                  <span className="augment-name">{augment.name}</span>
                </button>
              )
            })}
            {visibleAugments.length === 0 && (
              <span className="champ-empty">No matches</span>
            )}
          </div>
        </>
      )}
    </section>
  )
}
