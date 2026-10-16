import { championSlug } from '../champions'
import './ChampionPortrait.css'

export default function ChampionPortrait({
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
      decoding="async"
      draggable={false}
      onError={(event) => {
        event.currentTarget.style.display = 'none'
      }}
    />
  )
}
