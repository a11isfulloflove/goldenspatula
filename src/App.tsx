import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { activeSet, championUniverse, items } from './data'
import { recommend } from './engine/recommend'
import type { Recommendation } from './engine/recommend'
import { COMPONENT_COLORS, ROLE_ICONS } from './componentMeta'

const MAX_PER_COMPONENT = 5
const TIER_CLASS: Record<string, string> = { S: 'tier-s', A: 'tier-a', B: 'tier-b', C: 'tier-c' }
const TIER_ORDER: string[] = ['S', 'A', 'B', 'C']
const STORAGE_KEY = 'golden-spatula-input-v1'

interface PersistedInput {
  counts: Record<string, number>
  champions: string[]
}

function loadPersistedInput(): PersistedInput {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { counts: {}, champions: [] }
    const parsed = JSON.parse(raw) as Partial<PersistedInput>
    const validIds = new Set(items.components.map((c) => c.id))
    const counts: Record<string, number> = {}
    if (parsed.counts && typeof parsed.counts === 'object') {
      for (const [id, count] of Object.entries(parsed.counts)) {
        if (validIds.has(id) && typeof count === 'number') {
          const clamped = Math.floor(Math.min(Math.max(count, 0), MAX_PER_COMPONENT))
          if (clamped > 0) counts[id] = clamped
        }
      }
    }
    const champions = Array.isArray(parsed.champions)
      ? parsed.champions.filter(
          (name): name is string => typeof name === 'string' && championUniverse.includes(name),
        )
      : []
    return { counts, champions }
  } catch {
    return { counts: {}, champions: [] }
  }
}

function needStatusClass(have: number, need: number): string {
  if (have >= need) return 'ok'
  if (have > 0) return 'partial'
  return 'none'
}

function componentIconSrc(id: string): string | null {
  const component = items.components.find((c) => c.id === id)
  return component?.icon ? `/items/${component.icon}` : null
}

function MiniItemIcon({ id }: { id: string }) {
  const src = componentIconSrc(id)
  if (!src) return null
  return (
    <span className="mini-icon">
      <img src={src} alt="" draggable={false} />
    </span>
  )
}

function ItemIcon({ name, size = 'sm' }: { name: string; size?: 'sm' | 'md' }) {
  const file = items.itemIcons?.[name]
  if (!file) return null
  return <img className={`item-icon ${size}`} src={`/items/${file}`} alt="" draggable={false} />
}

function ItemName({ name }: { name: string }) {
  const recipe = items.recipes.find((r) => r.name === name)
  const hasIcon = Boolean(items.itemIcons?.[name])
  const label = (
    <>
      {hasIcon && <ItemIcon name={name} />}
      {name}
    </>
  )
  if (!recipe) return <span className="item-chip plain">{label}</span>
  const shortNames = recipe.components.map(
    (id) => items.components.find((c) => c.id === id)?.short ?? id,
  )
  return (
    <span className="item-chip" tabIndex={0}>
      {label}
      <span className="recipe-tip" role="tooltip">
        {recipe.components.map((id, index) => (
          <span className="recipe-part" key={id}>
            {index > 0 && <span className="recipe-plus">+</span>}
            <MiniItemIcon id={id} />
          </span>
        ))}
        <span className="recipe-text">{shortNames.join(' + ')}</span>
      </span>
    </span>
  )
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

function CompCard({ rec, rank, delay }: { rec: Recommendation; rank?: number; delay?: number }) {
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

function TierList({
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

const DIFFICULTY_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'easy', label: 'Easy' },
  { id: 'medium', label: 'Medium' },
  { id: 'hard', label: 'Hard' },
] as const

type DifficultyFilter = (typeof DIFFICULTY_FILTERS)[number]['id']

const ROLE_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'carry', label: 'Carries' },
  { id: 'tank', label: 'Tanks' },
  { id: 'support', label: 'Supports' },
] as const

type RoleFilter = (typeof ROLE_FILTERS)[number]['id']

const ROLE_CLASS: Record<string, string> = {
  carry: 'role-carry',
  tank: 'role-tank',
  support: 'role-support',
  flex: 'role-flex',
}

function roleOf(name: string): string {
  return activeSet.championRoles?.[name] ?? 'flex'
}

function championSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
}

function primaryChampionName(raw: string): string {
  return raw
    .split('/')[0]
    .trim()
    .replace(/\s*\(.*\)$/, '')
    .trim()
}

function ChampionPortrait({
  name,
  size = 'sm',
}: {
  name: string
  size?: 'sm' | 'lg'
}) {
  return (
    <img
      className={`champ-icon ${size}`}
      src={`/champs/${championSlug(name)}.png`}
      alt=""
      loading="lazy"
      draggable={false}
      onError={(event) => {
        event.currentTarget.style.display = 'none'
      }}
    />
  )
}

function App() {
  const [counts, setCounts] = useState<Record<string, number>>(() => loadPersistedInput().counts)
  const [champions, setChampions] = useState<string[]>(() => loadPersistedInput().champions)
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')
  const [viewMode, setViewMode] = useState<'ranked' | 'tiers'>('ranked')
  const [difficulty, setDifficulty] = useState<DifficultyFilter>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const totalItems = Object.values(counts).reduce((sum, n) => sum + n, 0)
  const hasInput = totalItems > 0 || champions.length > 0

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ counts, champions }))
    } catch {
      return
    }
  }, [counts, champions])

  const recs = useMemo(
    () => recommend(activeSet.comps, items, counts, champions),
    [counts, champions],
  )

  const visibleRecs = useMemo(
    () =>
      difficulty === 'all' ? recs : recs.filter((r) => r.comp.difficulty === difficulty),
    [recs, difficulty],
  )

  const normalizedQuery = query.trim().toLowerCase()
  const visibleChampions = championUniverse.filter((name) => {
    if (normalizedQuery && !name.toLowerCase().includes(normalizedQuery)) return false
    if (roleFilter !== 'all' && roleOf(name) !== roleFilter) return false
    return true
  })

  function addComponent(id: string) {
    setCounts((c) => ({ ...c, [id]: Math.min((c[id] ?? 0) + 1, MAX_PER_COMPONENT) }))
  }

  function removeComponent(id: string) {
    setCounts((c) => ({ ...c, [id]: Math.max((c[id] ?? 0) - 1, 0) }))
  }

  function toggleChampion(name: string) {
    setChampions((cs) => (cs.includes(name) ? cs.filter((c) => c !== name) : [...cs, name]))
  }

  function reset() {
    setCounts({})
    setChampions([])
    setQuery('')
    setExpandedId(null)
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Golden Spatula</h1>
        <p className="tagline">Tell it what the game gave you. It tells you what to play.</p>
        <div className="meta-badges">
          <span className="badge">
            Set {activeSet.meta.setNumber} · Patch {activeSet.meta.patch}
          </span>
        </div>
      </header>

      <section className="panel">
                <div className="panel-head">
                  <h2>1 · Your item components</h2>
                  <span className="panel-hint">Tap an item to add · use the − button to remove</span>
                </div>
        <div className="components">
          {items.components.map((component) => {
            const count = counts[component.id] ?? 0
            const color = COMPONENT_COLORS[component.id] ?? '#93a0b4'
            return (
              <div className="component-wrap" key={component.id}>
                <button
                  type="button"
                  className={`component ${count > 0 ? 'active' : ''}`}
                  onClick={() => addComponent(component.id)}
                >
                  <span className="tile">
                    {component.icon && (
                      <img src={`/items/${component.icon}`} alt="" draggable={false} />
                    )}
                  </span>
                  <span className="component-name">{component.short}</span>
                  <span className="component-stat">{component.stat}</span>
                </button>
                {count > 0 && (
                  <div className="tile-controls">
                    <button
                      type="button"
                      className="tile-minus"
                      onClick={() => removeComponent(component.id)}
                      aria-label={`Remove one ${component.name}`}
                    >
                      <span className="minus-bar" aria-hidden="true" />
                    </button>
                    <span className="tile-count" style={{ background: color }}>
                      {count}
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h2>2 · Champions you&apos;ve been offered</h2>
          <span className="panel-hint">Early copies signal which line to play</span>
        </div>
        <div className="champ-controls">
          <input
            className="champ-filter"
            type="search"
            placeholder="Filter champions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="role-filter" role="group" aria-label="Filter champions by role">
            {ROLE_FILTERS.map((option) => (
              <button
                key={option.id}
                type="button"
                className={roleFilter === option.id ? 'active' : ''}
                onClick={() => setRoleFilter(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        <div className="champ-cards">
          {visibleChampions.map((name) => {
            const role = roleOf(name)
            const RoleIcon = ROLE_ICONS[role]
            return (
              <button
                key={name}
                type="button"
                className={`champ-card ${champions.includes(name) ? 'active' : ''} ${ROLE_CLASS[role]}`}
                title={role}
                onClick={() => toggleChampion(name)}
              >
                <ChampionPortrait name={name} size="lg" />
                {roleFilter === 'all' &&
                  (RoleIcon ? (
                    <RoleIcon className="champ-role-icon" />
                  ) : (
                    <span className="champ-role-dot" aria-hidden="true" />
                  ))}
                <span className="champ-card-name">{name}</span>
              </button>
            )
          })}
          {visibleChampions.length === 0 && <span className="champ-empty">No matches</span>}
        </div>
      </section>

      <section className="panel">
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
              <button type="button" className="reset" onClick={reset}>
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
              {visibleRecs.map((rec, index) => (
                <CompCard key={rec.comp.id} rec={rec} rank={index} delay={index * 60} />
              ))}
            </div>
          ))}

        {viewMode === 'tiers' && visibleRecs.length > 0 && (
          <TierList
            recs={visibleRecs}
            hasInput={hasInput}
            expandedId={expandedId}
            onToggle={(id) => setExpandedId((current) => (current === id ? null : id))}
          />
        )}
        {viewMode === 'tiers' && visibleRecs.length === 0 && (
          <div className="empty-state">
            <span>No comps match this difficulty filter.</span>
          </div>
        )}
      </section>

      <footer className="app-footer">
        <p className="disclaimer">
          Golden Spatula is fan-made content. It isn&apos;t endorsed by Riot Games and doesn&apos;t
          reflect the views or opinions of Riot Games or anyone officially involved in producing
          or managing Teamfight Tactics. Teamfight Tactics &#8482; &#169; Riot Games, Inc.
        </p>
      </footer>
    </div>
  )
}

export default App
