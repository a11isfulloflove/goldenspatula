import { TIER_CLASS, TIER_ORDER } from '../constants'
import type { Recommendation } from '../engine/recommend'
import CompCard from './CompCard'
import './TierList.css'

export default function TierList({
  recs,
  hasInput,
  expandedId,
  onToggle,
}: {
  recs: Recommendation[]
  hasInput: boolean
  expandedId: string | null
  onToggle: (id: string) => void
}) {
  const groups = TIER_ORDER.map((tier) => ({
    tier,
    list: recs.filter((r) => r.comp.tier === tier),
  })).filter((group) => group.list.length > 0)

  return (
    <div className="tierlist">
      {groups.map((group) => (
        <div className="tier-row" key={group.tier}>
          <div className={`tier-medallion ${TIER_CLASS[group.tier]}`}>{group.tier}</div>
          <div className="tier-comps">
            {group.list.map((rec) => (
              <div
                className={`tier-cell ${expandedId === rec.comp.id ? 'open' : ''}`}
                key={rec.comp.id}
              >
                <button
                  type="button"
                  className={`tier-card ${expandedId === rec.comp.id ? 'open' : ''}`}
                  onClick={() => onToggle(rec.comp.id)}
                >
                  <span className="tier-card-name">{rec.comp.name}</span>
                  <span className="tier-card-sub">{rec.comp.playstyle}</span>
                  {hasInput && (
                    <span className="tier-card-score">
                      <span className="tier-card-bar">
                        <span
                          style={{
                            display: 'block',
                            width: `${Math.round(rec.score * 100)}%`,
                          }}
                        />
                      </span>
                      <span className="tier-card-pct">{Math.round(rec.score * 100)}%</span>
                    </span>
                  )}
                </button>
                {expandedId === rec.comp.id && <CompCard rec={rec} />}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
