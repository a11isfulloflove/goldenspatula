import { useEffect, useMemo, useState } from 'react'
import type { Recommendation } from '../engine/recommend'
import CompCard from './CompCard'
import TierList from './TierList'
import './ResultsPanel.css'

const DIFFICULTY_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'easy', label: 'Easy' },
  { id: 'medium', label: 'Medium' },
  { id: 'hard', label: 'Hard' },
] as const

type DifficultyFilter = (typeof DIFFICULTY_FILTERS)[number]['id']

const TOP_COUNT = 5

interface ExpandedState {
  id: string | null
  epoch: number
}

export default function ResultsPanel({
  recs,
  hasInput,
  onReset,
  resetSignal,
  focusComp,
  onFocusCompHandled,
}: {
  recs: Recommendation[]
  hasInput: boolean
  onReset: () => void
  resetSignal: number
  focusComp: { id: string; nonce: number } | null
  onFocusCompHandled: () => void
}) {
  const [viewMode, setViewMode] = useState<'ranked' | 'tiers'>('ranked')
  const [difficulty, setDifficulty] = useState<DifficultyFilter>('all')
  const [expanded, setExpanded] = useState<ExpandedState>({ id: null, epoch: 0 })
  const [showAll, setShowAll] = useState(false)

  const expandedId = expanded.epoch === resetSignal ? expanded.id : null
  const focusNonce = focusComp?.nonce ?? 0

  useEffect(() => {
    if (!focusComp) return
    if (viewMode !== 'ranked') {
      setViewMode('ranked')
      return
    }
    const target = recs.find((r) => r.comp.id === focusComp.id)
    if (target && difficulty !== 'all' && target.comp.difficulty !== difficulty) {
      setDifficulty('all')
      return
    }
    const element = document.getElementById(`comp-${focusComp.id}`)
    if (!element) {
      onFocusCompHandled()
      return
    }
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    element.classList.add('comp-pulse')
    const timeout = setTimeout(() => {
      element.classList.remove('comp-pulse')
      onFocusCompHandled()
    }, 1700)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusNonce, viewMode, difficulty])

  const visibleRecs = useMemo(
    () =>
      difficulty === 'all' ? recs : recs.filter((r) => r.comp.difficulty === difficulty),
    [recs, difficulty],
  )

  return (
    <section className="panel" id="results">
      <div className="panel-head">
        <h2>3 · Recommended comps</h2>
        <div className="head-actions">
          <div className="view-toggle">
            <button
              type="button"
              className={viewMode === 'ranked' ? 'active' : ''}
              onClick={() => setViewMode('ranked')}
            >
              Your ranking
            </button>
            <button
              type="button"
              className={viewMode === 'tiers' ? 'active' : ''}
              onClick={() => setViewMode('tiers')}
            >
              Tier list
            </button>
          </div>
          <span className="filter-label">Difficulty</span>
          <div className="view-toggle" role="group" aria-label="Filter by difficulty">
            {DIFFICULTY_FILTERS.map((option) => (
              <button
                key={option.id}
                type="button"
                className={difficulty === option.id ? 'active' : ''}
                onClick={() => setDifficulty(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
          {hasInput && (
            <button type="button" className="reset" onClick={onReset}>
              Reset
            </button>
          )}
        </div>
      </div>

      {viewMode === 'ranked' &&
        (!hasInput ? (
          <div className="empty-state">
            <span>
              Pick a few components or champions from your opening shops and carousel to see
              which comps fit your start. Or browse the tier list view.
            </span>
          </div>
        ) : visibleRecs.length === 0 ? (
          <div className="empty-state">
            <span>No comps match this difficulty filter.</span>
          </div>
        ) : (
          <div className="results">
            {(showAll ? visibleRecs : visibleRecs.slice(0, TOP_COUNT)).map((rec, index) => (
              <CompCard
                key={rec.comp.id}
                rec={rec}
                rank={index}
                delay={Math.min(index * 60, 480)}
              />
            ))}
            {!showAll && visibleRecs.length > TOP_COUNT && (
              <div className="results-peek" aria-hidden="true">
                <CompCard
                  rec={visibleRecs[TOP_COUNT]}
                  rank={TOP_COUNT}
                  delay={Math.min(TOP_COUNT * 60, 480)}
                />
              </div>
            )}
            {visibleRecs.length > TOP_COUNT && (
              <button
                type="button"
                className="show-all-toggle"
                aria-expanded={showAll}
                onClick={() => setShowAll((value) => !value)}
              >
                {showAll ? 'Show top 5 only' : `Show all ${visibleRecs.length} comps`}
              </button>
            )}
          </div>
        ))}

      {viewMode === 'tiers' && visibleRecs.length > 0 && (
        <TierList
          recs={visibleRecs}
          hasInput={hasInput}
          expandedId={expandedId}
          onToggle={(id) =>
            setExpanded({ id: expandedId === id ? null : id, epoch: resetSignal })
          }
        />
      )}
      {viewMode === 'tiers' && visibleRecs.length === 0 && (
        <div className="empty-state">
          <span>No comps match this difficulty filter.</span>
        </div>
      )}
    </section>
  )
}
