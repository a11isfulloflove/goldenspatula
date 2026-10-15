import { TIER_CLASS } from '../constants'
import { primaryChampionName } from '../champions'
import type { Recommendation } from '../engine/recommend'
import ChampionPortrait from './ChampionPortrait'
import ItemName from './ItemName'
import './CompCard.css'

function needStatusClass(have: number, need: number): string {
  if (have >= need) return 'ok'
  if (have > 0) return 'partial'
  return 'none'
}

function ScoreBar({ score }: { score: number }) {
  return (
    <div className="score-row">
      <div className="score-bar">
        <div className="score-fill" style={{ width: `${Math.round(score * 100)}%` }} />
      </div>
      <span className="score-label">{Math.round(score * 100)}% match</span>
    </div>
  )
}

export default function CompCard({
  rec,
  rank,
  delay,
}: {
  rec: Recommendation
  rank?: number
  delay?: number
}) {
  const { comp } = rec
  return (
    <article
      className={`comp-card ${rank === 0 ? 'best' : ''}`}
      style={delay ? { animationDelay: `${delay}ms` } : undefined}
    >
      <header className="comp-header">
        {rank !== undefined && <span className="rank">#{rank + 1}</span>}
        <span className={`tier ${TIER_CLASS[comp.tier] ?? 'tier-c'}`}>{comp.tier}</span>
        <div className="comp-title">
          <h3>{comp.name}</h3>
          <span className="comp-sub">
            {comp.playstyle} · {comp.difficulty}
          </span>
        </div>
      </header>

      <ScoreBar score={rec.score} />

      {rank === 0 && <p className="best-tag">TOP PICK FOR YOUR START</p>}

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

      {rec.matchedChampions.length > 0 && (
        <div className="champ-matches">
          {rec.matchedChampions.map((c) => (
            <span key={c.name} className="champ-match">
              <ChampionPortrait name={c.name} />
              {c.name} <em>({c.role})</em>
            </span>
          ))}
        </div>
      )}

      <div className="comp-section">
        <h4>Play it when</h4>
        <ul>
          {comp.conditions.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </div>

      <div className="comp-section">
        <h4>Items per carry</h4>
        <div className="carries">
          {comp.carryItems.map((carry) => (
            <div className="carry" key={carry.champion}>
              <span className="carry-name">
                <ChampionPortrait name={primaryChampionName(carry.champion)} />
                {carry.champion}
              </span>
              <span className="carry-items">
                {carry.bis.map((itemName, index) => (
                  <span className="carry-item-wrap" key={itemName}>
                    {index > 0 && <span className="dot">·</span>}
                    <ItemName name={itemName} />
                  </span>
                ))}
              </span>
              {carry.alternatives && (
                <span className="carry-alt">also: {carry.alternatives.join(', ')}</span>
              )}
              {carry.note && <span className="carry-note">{carry.note}</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="comp-section">
        <h4>Tips</h4>
        <ul>
          {comp.tips.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </div>
    </article>
  )
}
