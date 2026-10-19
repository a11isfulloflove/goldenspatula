import ChampionPortrait from './ChampionPortrait'
import { SwordsIcon } from '../roleIcons'
import './EmptyState.css'

function StepArrow() {
  return (
    <svg className="empty-step-arrow" viewBox="0 0 24 12" aria-hidden="true">
      <path d="M2 6h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M14 2l6 4-6 4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function EmptyState() {
  return (
    <div className="empty-steps">
      <div className="empty-step">
        <span className="empty-step-num">1</span>
        <div className="empty-mock" aria-hidden="true">
          <div className="mock-component">
            <div className="mock-controls">
              <span className="mock-minus">
                <span className="mock-minus-bar" />
              </span>
              <span className="mock-badge">3</span>
            </div>
            <span className="mock-tile">
              <img src="/items/tft_item_needlesslylargerod.png" alt="" draggable={false} />
            </span>
            <span className="mock-component-name">Rod</span>
          </div>
        </div>
        <span className="empty-step-label">Pick your items</span>
      </div>

      <StepArrow />

      <div className="empty-step">
        <span className="empty-step-num">2</span>
        <div className="empty-mock" aria-hidden="true">
          <div className="mock-champ-card">
            <span className="champ-portrait-wrap">
              <ChampionPortrait name="Azir" size="lg" />
              <span className="champ-role-badge">
                <SwordsIcon className="mock-role-icon" />
              </span>
            </span>
            <span className="champ-cost-stars" aria-hidden="true">
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} className={`cost-star ${star <= 4 ? 'filled' : ''}`} />
              ))}
            </span>
            <span className="mock-champ-name">Azir</span>
          </div>
        </div>
        <span className="empty-step-label">Pick champions you&apos;re offered</span>
      </div>

      <StepArrow />

      <div className="empty-step">
        <span className="empty-step-num">3</span>
        <div className="empty-mock" aria-hidden="true">
          <div className="mock-comp-card">
            <div className="mock-comp-header">
              <span className="tier tier-s">S</span>
              <span className="mock-comp-name">Azir Rammus reroll</span>
            </div>
            <div className="mock-score-row">
              <div className="mock-score-bar">
                <span style={{ width: '96%' }} />
              </div>
              <span className="mock-score-pct">96%</span>
            </div>
          </div>
        </div>
        <span className="empty-step-label">Get ranked builds</span>
      </div>

      <p className="empty-note">Everything updates live as you pick.</p>
    </div>
  )
}
