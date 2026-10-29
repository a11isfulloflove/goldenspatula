import { useEffect, useState } from 'react'
import type { OpenerRecommendation, Recommendation } from '../engine/recommend'
import type { Comp, SpecialStart } from '../types'
import { TIER_CLASS } from '../constants'
import CompCard from './CompCard'
import EmptyState from './EmptyState'
import OpenerCard from './OpenerCard'
import TierList from './TierList'
import './ResultsPanel.css'

const TOP_COUNT = 5

interface ExpandedState {
  id: string | null
  epoch: number
}

export default function ResultsPanel({
  recs,
  openerRecs,
  specialStarts,
  comps,
  hasInput,
  onReset,
  resetSignal,
  focusComp,
  onFocusCompHandled,
  onSelectComp,
}: {
  recs: Recommendation[]
  openerRecs: OpenerRecommendation[]
  specialStarts: SpecialStart[]
  comps: Comp[]
  hasInput: boolean
  onReset: () => void
  resetSignal: number
  focusComp: { id: string; nonce: number } | null
  onFocusCompHandled: () => void
  onSelectComp: (id: string) => void
}) {
  const [viewMode, setViewMode] = useState<'ranked' | 'tiers' | 'openers'>('ranked')
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
    const element = target ? document.getElementById(`comp-${focusComp.id}`) : null
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
  }, [focusNonce, viewMode])

  return (
    <section className="panel" id="results">
      <div className="panel-head results-head">
        <h2>4 · Recommended comps</h2>
        <div className="head-actions">
          <div className="view-toggle">
            <button
              type="button"
              className={viewMode === 'ranked' ? 'active' : ''}
              onClick={() => setViewMode('ranked')}
            >
              <span className="tab-label-full">Your ranking</span>
              <span className="tab-label-short">Ranked</span>
            </button>
            <button
              type="button"
              className={viewMode === 'tiers' ? 'active' : ''}
              onClick={() => setViewMode('tiers')}
            >
              Tier list
            </button>
            <button
              type="button"
              className={viewMode === 'openers' ? 'active' : ''}
              onClick={() => setViewMode('openers')}
            >
              Openers
            </button>
          </div>
          <div className="head-actions-right">
            {hasInput && (
              <button type="button" className="reset" onClick={onReset}>
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {viewMode === 'ranked' &&
        (!hasInput ? (
          <EmptyState />
        ) : (
          <div className="results">
            {(showAll ? recs : recs.slice(0, TOP_COUNT)).map((rec, index) => (
              <CompCard
                key={rec.comp.id}
                rec={rec}
                rank={index}
                delay={Math.min(index * 60, 480)}
              />
            ))}
            {!showAll && recs.length > TOP_COUNT && (
              <div className="results-peek" aria-hidden="true">
                <CompCard
                  rec={recs[TOP_COUNT]}
                  rank={TOP_COUNT}
                  delay={Math.min(TOP_COUNT * 60, 480)}
                />
              </div>
            )}
            {recs.length > TOP_COUNT && (
              <button
                type="button"
                className="show-all-toggle"
                aria-expanded={showAll}
                onClick={() => setShowAll((value) => !value)}
              >
                {showAll ? 'Show top 5 only' : `Show all ${recs.length} comps`}
              </button>
            )}
          </div>
        ))}

      {viewMode === 'tiers' && recs.length > 0 && (
        <TierList
          recs={recs}
          hasInput={hasInput}
          expandedId={expandedId}
          onToggle={(id) =>
            setExpanded({ id: expandedId === id ? null : id, epoch: resetSignal })
          }
        />
      )}

      {viewMode === 'openers' && (
        <>
          <div className="results">
            {openerRecs.map((rec, index) => (
              <OpenerCard
                key={rec.opener.id}
                rec={rec}
                hasInput={hasInput}
                comps={comps}
                onSelectComp={onSelectComp}
                delay={Math.min(index * 60, 480)}
              />
            ))}
          </div>
          {specialStarts.length > 0 && (
            <div className="special-starts">
              <h4>Special starts</h4>
              {specialStarts.map((start) => (
                <div className="special-start-row" key={start.condition}>
                  <span className="special-start-condition">{start.condition}</span>
                  <span className="special-start-comps">
                    {start.compIds.map((compId) => {
                      const comp = comps.find((entry) => entry.id === compId)
                      if (!comp) return null
                      return (
                        <button
                          key={compId}
                          type="button"
                          className="opener-leads-chip"
                          onClick={() => onSelectComp(compId)}
                        >
                          <span className={`tier ${TIER_CLASS[comp.tier] ?? 'tier-c'}`}>
                            {comp.tier}
                          </span>
                          {comp.name}
                        </button>
                      )
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  )
}
