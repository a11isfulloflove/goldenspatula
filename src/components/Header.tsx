import { activeSet } from '../data'
import './Header.css'

export default function Header() {
  return (
      <header className="app-header">
        <div className="title-row">
          <span className="title-sparkle-group mirrored" aria-hidden="true">
            <span className="title-sparkle big" />
            <span className="title-sparkle small top" />
            <span className="title-sparkle small bottom" />
          </span>
          <h1>Golden Spatula</h1>
          <span className="title-sparkle-group" aria-hidden="true">
            <span className="title-sparkle big" />
            <span className="title-sparkle small top" />
            <span className="title-sparkle small bottom" />
          </span>
        </div>
        <p className="tagline">Tell it what the game gave you. It tells you what to play.</p>
      <div className="meta-badges">
        <span className="badge">
          Set {activeSet.meta.setNumber} · Patch {activeSet.meta.patch}
        </span>
      </div>
    </header>
  )
}
