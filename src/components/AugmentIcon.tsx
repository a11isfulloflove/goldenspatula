import { asset } from '../ui-helpers'
import './AugmentIcon.css'

export default function AugmentIcon({
  icon,
  tier,
  size,
  fallbackChar,
  title,
}: {
  icon?: string
  tier: string
  size: number
  fallbackChar?: string
  title?: string
}) {
  return (
    <span
      className={`aug-frame tier-${tier}`}
      style={{ width: size, height: size }}
      title={title}
    >
      {icon ? (
        <img src={asset(icon)} alt="" draggable={false} decoding="async" />
      ) : (
        <span className="aug-letter" aria-hidden="true">
          {fallbackChar ?? 'A'}
        </span>
      )}
    </span>
  )
}
