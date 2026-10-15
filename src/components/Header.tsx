import { activeSet } from '../data'
import './Header.css'

export default function Header() {
  return (
    <>
      <header className="app-header">
        <h1>Golden Spatula</h1>
        <p className="tagline">Tell it what the game gave you. It tells you what to play.</p>
        <div className="meta-badges">
          <span className="badge">
            Set {activeSet.meta.setNumber} · Patch {activeSet.meta.patch}
          </span>
        </div>
      </header>
      <footer className="app-footer">
        <p className="disclaimer">
          Golden Spatula is fan-made content. It isn&apos;t endorsed by Riot Games and doesn&apos;t
          reflect the views or opinions of Riot Games or anyone officially involved in producing
          or managing Teamfight Tactics. Teamfight Tactics &#8482; &#169; Riot Games, Inc.
        </p>
      </footer>
    </>
  )
}
