import { TIER_CLASS } from '../constants'
import type { Comp } from '../types'
import type { OpenerRecommendation } from '../engine/recommend'
import ChampionPortrait from './ChampionPortrait'
import { needStatusClass } from '../ui-helpers'
import './OpenerCard.css'

const CATEGORY_LABEL: Record<string, string> = { flex: 'Flex', ad: 'AD', ap: 'AP' }

export default function OpenerCard({
  rec,
  hasInput,
  comps,
  onSelectComp,
  delay,
}: {
  rec: OpenerRecommendation
  hasInput: boolean
  comps: Comp[]
  onSelectComp: (id: string) => void
  delay?: number
}) {
  const { opener } = rec

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
        <h4>Leads to</h4>
        <div className="opener-leads-list">
          {opener.leadsTo.map((compId) => {
            const comp = comps.find((entry) => entry.id === compId)
            if (!comp) return null
            return (
              <button
                key={compId}
                type="button"
                className="opener-leads-chip"
                onClick={() => onSelectComp(compId)}
              >
                <span className={`tier ${TIER_CLASS[comp.tier] ?? 'tier-c'}`}>{comp.tier}</span>
                {comp.name}
              </button>
            )
          })}
        </div>
      </div>
    </article>
  )
}
