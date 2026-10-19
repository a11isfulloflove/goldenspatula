import { activeSet } from '../data'
import './Header.css'

const TAGLINES = [
  'Got weird items? Let\u2019s cook da comp!',
  'When the shop gives you scraps, we make a feast.',
  'You bring the ingredients, we serve the comp.',
  'Every opening is a recipe. Let\u2019s cook yours.',
  'From weird ingredients to five-star comps.',
  'Bad items happen. Good chefs improvise.',
  'You bring the weird ingredients, we cook da comp.',
]

const tagline = TAGLINES[Math.floor(Math.random() * TAGLINES.length)]

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
        <p className="tagline">{tagline}</p>
      <div className="meta-badges">
        <span className="badge">
          Set {activeSet.meta.setNumber} · Patch {activeSet.meta.patch}
        </span>
      </div>
    </header>
  )
}
