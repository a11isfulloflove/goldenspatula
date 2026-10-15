import { activeSet } from '../data'
import './Header.css'

export default function Header() {
  return (
    <header className="app-header">
      <h1>Golden Spatula</h1>
      <p className="tagline">Tell it what the game gave you. It tells you what to play.</p>
      <div className="meta-badges">
        <span className="badge">
          Set {activeSet.meta.setNumber} · Patch {activeSet.meta.patch}
        </span>
      </div>
    </header>
  )
}
