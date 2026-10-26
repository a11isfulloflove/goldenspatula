import { useEffect, useRef, useState } from 'react'
import { TIER_CLASS } from '../constants'
import { primaryChampionName } from '../champions'
import type { Recommendation } from '../engine/recommend'
import ChampionPortrait from './ChampionPortrait'
import ItemName from './ItemName'
import { needStatusClass, asset } from '../ui-helpers'
import './CompCard.css'

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

function useMountCountUp(target: number, delayMs: number, durationMs: number): number {
  const [value, setValue] = useState(() => (prefersReducedMotion.matches ? target : 0))
  const [done, setDone] = useState(prefersReducedMotion.matches)
  const rafRef = useRef(0)

  useEffect(() => {
    if (prefersReducedMotion.matches) return
    const start = performance.now() + delayMs
    const tick = (now: number) => {
      const progress = Math.min(Math.max((now - start) / durationMs, 0), 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(target * eased)
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        setDone(true)
      }
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return done ? target : value
}

function ScoreBar({ score, delay }: { score: number; delay: number }) {
  const percent = Math.round(score * 100)
  const shown = useMountCountUp(percent, delay + 150, 600)
  const rounded = Math.round(shown)
  return (
    <div className="score-row">
      <div className="score-bar">
        <div className="score-fill" style={{ width: `${rounded}%` }} />
      </div>
      <span className="score-label">{rounded}% match</span>
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
      id={`comp-${comp.id}`}
      className={`comp-card ${rank === 0 ? 'best' : ''}`}
      style={delay ? { animationDelay: `${delay}ms` } : undefined}
    >
      <header className="comp-header">
        {rank !== undefined && <span className="rank">#{rank + 1}</span>}
        <span className={`tier ${TIER_CLASS[comp.tier] ?? 'tier-c'}`}>{comp.tier}</span>
        <div className="comp-title">
          <h3>{comp.name}</h3>
          <span className="comp-sub">{comp.playstyle}</span>
        </div>
      </header>

      <ScoreBar score={rec.score} delay={delay ?? 0} />

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
              {c.name}
              {c.copies > 1 && <strong className="champ-match-copies">×{c.copies}</strong>}{' '}
              <em>({c.role})</em>
            </span>
          ))}
        </div>
      )}

      {rec.matchedAugments.length > 0 && (
        <div className="augment-matches">
          {rec.matchedAugments.map((augment) => (
            <span key={augment.name} className="augment-match">
              {augment.icon ? (
                <img src={asset(`emblems/${augment.icon}`)} alt="" draggable={false} />
              ) : (
                <span className="augment-match-initial" aria-hidden="true">
                  {augment.name.charAt(0)}
                </span>
              )}
              {augment.name} <em>(augment)</em>
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
                {carry.bis.map((itemName) => (
                  <ItemName key={itemName} name={itemName} />
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
