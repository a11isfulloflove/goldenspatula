import { useState } from 'react'
import { TIER_CLASS } from '../constants'
import type { OpenerRecommendation, Recommendation } from '../engine/recommend'
import ChampionPortrait from './ChampionPortrait'
import CompCard from './CompCard'
import FinalBoard from './FinalBoard'
import { needStatusClass } from '../ui-helpers'
import './OpenerCard.css'

const CATEGORY_LABEL: Record<string, string> = { flex: 'Flex', ad: 'AD', ap: 'AP' }
const TOP_DESTINATIONS = 3

export default function OpenerCard({
  rec,
  hasInput,
  recs,
  pickedChampions,
  delay,
}: {
  rec: OpenerRecommendation
  hasInput: boolean
  recs: Recommendation[]
  pickedChampions: Record<string, number>
  delay?: number
}) {
  const { opener } = rec
  const [openDestId, setOpenDestId] = useState<string | null>(null)

  const destinations = opener.leadsTo
    .map((compId) => recs.find((entry) => entry.comp.id === compId))
    .filter((entry): entry is Recommendation => Boolean(entry))
    .sort((a, b) => b.score - a.score)
  const top = destinations.slice(0, TOP_DESTINATIONS)
  const rest = destinations.slice(TOP_DESTINATIONS)

  return (
    <article
      className="opener-card"
      style={delay ? { animationDelay: `${delay}ms` } : undefined}
    >
      <header className="opener-header">
        <div className="opener-title">
          <h3>{opener.name}</h3>
          <span className={`opener-category ${opener.category}`}>
            {CATEGORY_LABEL[opener.category] ?? opener.category}
          </span>
        </div>
        {hasInput && (
          <div className="opener-score">
            <div className="score-bar">
              <div className="score-fill" style={{ width: `${Math.round(rec.score * 100)}%` }} />
            </div>
            <span className="score-label">{Math.round(rec.score * 100)}%</span>
          </div>
        )}
      </header>

      <div className="opener-units">
        {opener.units.map((unit) => (
          <span key={unit} className="opener-unit">
            <ChampionPortrait name={unit} />
            {unit}
          </span>
        ))}
      </div>

      <div className="opener-holds">
        {opener.itemHolds.map((hold) => (
          <span key={hold.champion} className="opener-hold">
            <strong>{hold.champion}</strong> {hold.note}
          </span>
        ))}
      </div>

      {hasInput && (
        <div className="needs">
          {rec.needs.map((need) => (
            <span key={need.label} className={`need ${needStatusClass(need.have, need.need)}`}>
              {need.label} {need.have}/{need.need}
            </span>
          ))}
          {rec.unusedCount > 0 && (
            <span className="need unused">{rec.unusedCount} item(s) don&apos;t fit</span>
          )}
        </div>
      )}

      <div className="comp-section opener-tips">
        <h4>Tips</h4>
        <ul>
          {opener.tips.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </div>

      <div className="opener-leads">
        <h4>Builds into — tap one to see the full build</h4>
        <div className="opener-destinations">
          {top.map((entry) => {
            const open = openDestId === entry.comp.id
            return (
              <div key={entry.comp.id} className={`opener-destination ${open ? 'open' : ''}`}>
                <button
                  type="button"
                  className="opener-destination-toggle"
                  aria-expanded={open}
                  onClick={() => setOpenDestId((current) => (current === entry.comp.id ? null : entry.comp.id))}
                >
                  <span className="opener-destination-head">
                    <span className={`tier ${TIER_CLASS[entry.comp.tier] ?? 'tier-c'}`}>
                      {entry.comp.tier}
                    </span>
                    <span className="opener-destination-name">{entry.comp.name}</span>
                    {hasInput && (
                      <span className="opener-destination-pct">
                        {Math.round(entry.score * 100)}%
                      </span>
                    )}
                    <span className="opener-destination-caret" aria-hidden="true">
                      {open ? '−' : '+'}
                    </span>
                  </span>
                  <FinalBoard comp={entry.comp} pickedChampions={pickedChampions} compact />
                </button>
                {open && (
                  <div className="opener-destination-detail">
                    <CompCard rec={entry} pickedChampions={pickedChampions} compactBoard />
                  </div>
                )}
              </div>
            )
          })}
        </div>
        {rest.length > 0 && (
          <div className="opener-leads-list">
            {rest.map((entry) => (
              <button
                key={entry.comp.id}
                type="button"
                className="opener-leads-chip"
                onClick={() => setOpenDestId((current) => (current === entry.comp.id ? null : entry.comp.id))}
              >
                <span className={`tier ${TIER_CLASS[entry.comp.tier] ?? 'tier-c'}`}>
                  {entry.comp.tier}
                </span>
                {entry.comp.name}
              </button>
            ))}
            {rest
              .filter((entry) => openDestId === entry.comp.id)
              .map((entry) => (
                <div key={entry.comp.id} className="opener-destination-detail standalone">
                  <CompCard rec={entry} pickedChampions={pickedChampions} compactBoard />
                </div>
              ))}
          </div>
        )}
      </div>
    </article>
  )
}
