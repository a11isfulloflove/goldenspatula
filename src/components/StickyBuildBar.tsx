import { useEffect, useState } from 'react'
import type { Recommendation } from '../engine/recommend'
import type { Augment } from '../types'
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
  augments,
  emblems,
  crafted,
  onSelectComp,
  onRemoveComponent,
  onRemoveChampion,
  onRemoveAugment,
  onRemoveEmblem,
  onRemoveCrafted,
}: {
  recs: Recommendation[]
  counts: Record<string, number>
  champions: Record<string, number>
  augments: Augment[]
  emblems: Augment[]
  crafted: string[]
  onSelectComp: (id: string) => void
  onRemoveComponent: (id: string) => void
  onRemoveChampion: (name: string) => void
  onRemoveAugment: (id: string) => void
  onRemoveEmblem: (name: string) => void
  onRemoveCrafted: (name: string) => void
}) {
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    const results = document.getElementById('results')
    if (!results) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) setExpanded(false)
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
  const pickedChampions = Object.entries(champions)
  const hasPicks =
    pickedComponents.length + pickedChampions.length + augments.length + emblems.length + crafted.length > 0

  function renderPicks() {
    return (
      <>
        {pickedComponents.map((component, index) => (
          <button
            key={`${component.id}-${index}`}
            type="button"
            className="sticky-bar-remove"
            onClick={() => onRemoveComponent(component.id)}
            title={`Remove one ${component.name}`}
            aria-label={`Remove one ${component.name}`}
          >
            <img
              className="sticky-bar-pick-icon"
              src={asset(`items/${component.icon}`)}
              alt=""
              draggable={false}
            />
          </button>
        ))}
        {pickedChampions.map(([name, copies]) => (
          <button
            key={name}
            type="button"
            className="sticky-bar-remove"
            onClick={() => onRemoveChampion(name)}
            title={`Remove one copy of ${name} (${copies} left)`}
            aria-label={`Remove one copy of ${name}`}
          >
            <span className="sticky-bar-pick-champ">
              <ChampionPortrait name={name} />
              {copies > 1 && <span className="sticky-bar-copies">×{copies}</span>}
            </span>
          </button>
        ))}
        {augments.map((augment) => (
          <button
            key={augment.id}
            type="button"
            className="sticky-bar-remove"
            onClick={() => onRemoveAugment(augment.id)}
            title={`Remove ${augment.name}`}
            aria-label={`Remove ${augment.name}`}
          >
            <img
              className="sticky-bar-pick-augment"
              src={
                augment.icon
                  ? asset(`emblems/${augment.icon}`)
                  : asset('items/tft_item_spatula.png')
              }
              alt=""
              draggable={false}
            />
          </button>
        ))}
        {emblems.map((emblem) => (
          <button
            key={emblem.id}
            type="button"
            className="sticky-bar-remove"
            onClick={() => onRemoveEmblem(emblem.id)}
            title={`Un-craft ${emblem.name}`}
            aria-label={`Un-craft ${emblem.name}`}
          >
            <img
              className="sticky-bar-pick-augment"
              src={asset(`emblems/${emblem.icon ?? 'tft18_emblem_fae.png'}`)}
              alt=""
              draggable={false}
            />
          </button>
        ))}
        {crafted.map((name) => {
          const icon = items.itemIcons?.[name]
          return (
            <button
              key={name}
              type="button"
              className="sticky-bar-remove"
              onClick={() => onRemoveCrafted(name)}
              title={`Un-craft ${name}`}
              aria-label={`Un-craft ${name}`}
            >
              <img
                className="sticky-bar-pick-icon"
                src={icon ? asset(`items/${icon}`) : asset('items/tft_item_spatula.png')}
                alt=""
                draggable={false}
              />
            </button>
          )
        })}
      </>
    )
  }

  return (
    <div className={`sticky-bar ${hasPicks ? 'visible' : ''}`}>
      <div className="sticky-bar-card">
        <button
          type="button"
          className="sticky-bar-summary"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
        >
          {expanded ? (
            <>
              <span className="sticky-bar-title">Top matches for your picks</span>
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

        {hasPicks && (
          <div className="sticky-bar-picks">
            {renderPicks()}
            <p className="sticky-bar-hint">Tap a pick to mark it as sold</p>
          </div>
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
