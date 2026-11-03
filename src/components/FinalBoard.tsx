import ChampionPortrait from './ChampionPortrait'
import { primaryChampionName } from '../champions'
import type { Comp } from '../types'
import './FinalBoard.css'

export default function FinalBoard({
  comp,
  pickedChampions,
}: {
  comp: Comp
  pickedChampions: Record<string, number>
}) {
  const board = comp.finalBoard
  if (!board) return null
  const carries = new Set(comp.carryItems.map((carry) => primaryChampionName(carry.champion)))

  function slot(name: string) {
    const owned = (pickedChampions[name] ?? 0) > 0
    const isCarry = carries.has(name)
    return (
      <span
        key={name}
        className={`board-slot ${owned ? 'owned' : ''}`}
        title={`${name}${isCarry ? ' (carry)' : ''}${owned ? ' — you have it' : ''}`}
      >
        <ChampionPortrait name={name} size="lg" />
        {isCarry && <span className="board-carry" aria-label="carry">★</span>}
        {owned && <span className="board-owned" aria-label="you have it">✓</span>}
      </span>
    )
  }

  const flex = board.flex ?? 0

  return (
    <div className="final-board">
      <div className="final-board-row">
        {board.front.map(slot)}
        {flex > 0 && <span className="board-flex">+{flex} flex</span>}
      </div>
      <div className="final-board-row">
        {board.back.map(slot)}
      </div>
    </div>
  )
}
