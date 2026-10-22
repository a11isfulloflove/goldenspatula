import { useEffect, useState } from 'react'
import type { Recommendation } from '../engine/recommend'
import { TIER_CLASS } from '../constants'
import { items } from '../data'
import type { ItemComponent } from '../types'
import ChampionPortrait from './ChampionPortrait'
import { ChevronUp } from '../ui'
import { needStatusClass, asset } from '../ui-helpers'
import './StickyBuildBar.css'

const TOP_COUNT = 3

function buildPickedComponents(counts: Record<string, number>): ItemComponent[] {
  const picked: ItemComponent[] = []
  for (const [id, count] of Object.entries(counts)) {
    const component = items.components.find((c) => c.id === id)
    if (!component?.icon) continue
    for (let i = 0; i < count; i++) picked.push(component)
  }
  return picked
}

export default function StickyBuildBar({
  recs,
  counts,
  champions,
  onSelectComp,
}: {
  recs: Recommendation[]
  counts: Record<string, number>
  champions: string[]
  onSelectComp: (id: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [resultsOnScreen, setResultsOnScreen] = useState(false)

  useEffect(() => {
    const results = document.getElementById('results')
    if (!results) return
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        setResultsOnScreen(entry.isIntersecting)
        if (entry.isIntersecting) setExpanded(false)
      },
      { threshold: 0 },
    )
    observer.observe(results)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!expanded) return
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setExpanded(false)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [expanded])

  const top = recs.slice(0, TOP_COUNT)
  const best = top[0]
  if (!best) return null

  const pickedComponents = buildPickedComponents(counts)
  const hasPicks = pickedComponents.length + champions.length > 0

  function renderPicks() {
    return (
      <>
        {pickedComponents.map((component, index) => (
          <img
            key={`${component.id}-${index}`}
            className="sticky-bar-pick-icon"
            src={asset(`items/${component.icon}`)}
            alt=""
            title={component.name}
            draggable={false}
          />
        ))}
        {champions.map((name) => (
          <ChampionPortrait key={name} name={name} />
        ))}
      </>
    )
  }

  return (
    <div className={`sticky-bar ${resultsOnScreen ? '' : 'visible'}`}>
      <div className="sticky-bar-card">
        <button
          type="button"
          className="sticky-bar-summary"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
        >
          {expanded ? (
            <>
              <span className="sticky-bar-title">Top matches for</span>
              <span className="sticky-bar-picks-inline">{renderPicks()}</span>
              <ChevronUp className="sticky-bar-chevron open" />
            </>
          ) : (
            <>
              <span className="sticky-bar-rank">#1</span>
              <span className={`tier ${TIER_CLASS[best.comp.tier] ?? 'tier-c'}`}>
                {best.comp.tier}
              </span>
              <span className="sticky-bar-name">{best.comp.name}</span>
              <span className="sticky-bar-pct">{Math.round(best.score * 100)}%</span>
              <ChevronUp className="sticky-bar-chevron" />
            </>
          )}
        </button>

        {!expanded && hasPicks && (
          <div className="sticky-bar-picks">{renderPicks()}</div>
        )}

        {expanded && (
          <div className="sticky-bar-details">
            {top.map((rec, index) => (
              <button
                key={rec.comp.id}
                type="button"
                className="sticky-bar-row"
                onClick={() => {
                  setExpanded(false)
                  onSelectComp(rec.comp.id)
                }}
              >
                <span className="sticky-bar-row-top">
                  <span className="sticky-bar-row-rank">{index + 1}</span>
                  <span className={`tier ${TIER_CLASS[rec.comp.tier] ?? 'tier-c'}`}>
                    {rec.comp.tier}
                  </span>
                  <span className="sticky-bar-row-name">{rec.comp.name}</span>
                  <span className="sticky-bar-row-pct">{Math.round(rec.score * 100)}%</span>
                  <svg className="sticky-bar-row-go" viewBox="0 0 16 16" aria-hidden="true">
                    <path
                      d="M6 3l5 5-5 5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span className="sticky-bar-row-info">
                  {rec.needs.map((need) => (
                    <span
                      key={need.label}
                      className={`sticky-bar-need ${needStatusClass(need.have, need.need)}`}
                    >
                      {need.label} {need.have}/{need.need}
                    </span>
                  ))}
                  {rec.matchedChampions.length > 0 && (
                    <span className="sticky-bar-matched">
                      {rec.matchedChampions.slice(0, 3).map((champion) => (
                        <ChampionPortrait key={champion.name} name={champion.name} />
                      ))}
                    </span>
                  )}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
