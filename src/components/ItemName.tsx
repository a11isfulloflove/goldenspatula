import { items } from '../data'
import './ItemName.css'

function componentIconSrc(id: string): string | null {
  const component = items.components.find((c) => c.id === id)
  return component?.icon ? `/items/${component.icon}` : null
}

function MiniItemIcon({ id }: { id: string }) {
  const src = componentIconSrc(id)
  if (!src) return null
  return (
    <span className="mini-icon">
      <img src={src} alt="" draggable={false} decoding="async" />
    </span>
  )
}

function ItemIcon({ name, size = 'sm' }: { name: string; size?: 'sm' | 'md' }) {
  const file = items.itemIcons?.[name]
  if (!file) return null
  return (
    <img
      className={`item-icon ${size}`}
      src={`/items/${file}`}
      alt=""
      draggable={false}
      decoding="async"
    />
  )
}

export default function ItemName({ name }: { name: string }) {
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
