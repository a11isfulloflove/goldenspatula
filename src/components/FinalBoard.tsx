import { useRef } from 'react'
import ChampionPortrait from './ChampionPortrait'
import { primaryChampionName } from '../champions'
import type { Comp } from '../types'
import './FinalBoard.css'

const LONG_PRESS_MS = 500
const MOVE_CANCEL_PX = 10

export default function FinalBoard({
  comp,
  pickedChampions,
  compact,
  onAddChampion,
  onRemoveChampion,
}: {
  comp: Comp
  pickedChampions: Record<string, number>
  compact?: boolean
  onAddChampion?: (name: string) => void
  onRemoveChampion?: (name: string) => void
}) {
  const board = comp.finalBoard
  const interactive = Boolean(onAddChampion && onRemoveChampion)
  const timerRef = useRef<number | undefined>(undefined)
  const startRef = useRef<{ x: number; y: number } | null>(null)
  const longFiredRef = useRef(false)
  const movedRef = useRef(false)

  if (!board) return null
  const carries = new Set(comp.carryItems.map((carry) => primaryChampionName(carry.champion)))

  function beginPress(e: React.PointerEvent, name: string) {
    longFiredRef.current = false
    movedRef.current = false
    startRef.current = { x: e.clientX, y: e.clientY }
    timerRef.current = window.setTimeout(() => {
      longFiredRef.current = true
      onRemoveChampion?.(name)
    }, LONG_PRESS_MS)
  }

  function movePress(e: React.PointerEvent) {
    if (!startRef.current) return
    const dx = e.clientX - startRef.current.x
    const dy = e.clientY - startRef.current.y
    if (Math.hypot(dx, dy) > MOVE_CANCEL_PX) {
      window.clearTimeout(timerRef.current)
      movedRef.current = true
    }
  }

  function endPress(name: string, addIfClean: boolean) {
    window.clearTimeout(timerRef.current)
    startRef.current = null
    if (addIfClean && !longFiredRef.current && !movedRef.current) {
      onAddChampion?.(name)
    }
  }

  function slot(name: string) {
    const copies = pickedChampions[name] ?? 0
    const owned = copies > 0
    const isCarry = carries.has(name)
    const badge = copies > 1 ? `×${copies}` : owned ? '✓' : null
    const title = `${name}${isCarry ? ' (carry)' : ''}${owned ? ` — you have ×${copies}` : ''}${interactive ? ' — tap to add, hold to remove' : ''}`

    const badgeEl = badge && (
      <span className={copies > 1 ? 'board-owned stack' : 'board-owned'} aria-label="you have it">
        {badge}
      </span>
    )
    const carryEl = isCarry && (
      <span className="board-carry" aria-label="carry">
        ★
      </span>
    )

    if (!interactive) {
      return (
        <span key={name} className={`board-slot ${owned ? 'owned' : ''}`} title={title}>
          <ChampionPortrait name={name} size="lg" />
          {carryEl}
          {badgeEl}
        </span>
      )
    }

    return (
      <button
        key={name}
        type="button"
        className={`board-slot ${owned ? 'owned' : ''}`}
        title={title}
        aria-label={`${name}${owned ? ', tap to add a copy, hold to remove one' : ', tap to add'}`}
        onPointerDown={(e) => beginPress(e, name)}
        onPointerMove={movePress}
        onPointerUp={() => endPress(name, true)}
        onPointerLeave={() => endPress(name, false)}
        onPointerCancel={() => endPress(name, false)}
        onContextMenu={(e) => {
          e.preventDefault()
          onRemoveChampion?.(name)
        }}
        onClick={(e) => {
          if (e.detail === 0) onAddChampion?.(name)
        }}
      >
        <ChampionPortrait name={name} size="lg" />
        {carryEl}
        {badgeEl}
      </button>
    )
  }

  const flex = board.flex ?? 0

  return (
    <div className={`final-board ${compact ? 'compact' : ''} ${interactive ? 'interactive' : ''}`}>
      <div className="final-board-row">
        {board.front.map(slot)}
        {flex > 0 && <span className="board-flex">+{flex} flex</span>}
      </div>
      <div className="final-board-row">{board.back.map(slot)}</div>
      {interactive && <p className="board-hint">tap to add · hold to remove</p>}
    </div>
  )
}
