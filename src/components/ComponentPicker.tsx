import { useEffect, useRef, useState } from 'react'
import { items } from '../data'
import SparkleMark from './SparkleMark'
import './ComponentPicker.css'

function SpatulaTip({ open, onClose }: { open: boolean; onClose: () => void }) {
  const recipes = items.emblemRecipes ?? []
  const craftable = items.components
    .map((component) => ({
      component,
      emblems: recipes.filter((recipe) => recipe.component === component.id),
    }))
    .filter((group) => group.emblems.length > 0)
  const augmentOnly = recipes
    .filter((recipe) => recipe.component === null)
    .map((recipe) => recipe.name.replace(' Emblem', ''))
    .join(', ')

  return (
    <span className={`spatula-tip ${open ? 'open' : ''}`} role="tooltip">
      <button type="button" className="spatula-close" aria-label="Close" onClick={onClose}>
        &#10005;
      </button>
      <span className="spatula-tip-title">Emblem recipes</span>
      {craftable.map((group) => (
        <span className="spatula-tip-row" key={group.component.id}>
          <span className="mini-icon">
            <img src="/items/tft_item_spatula.png" alt="" draggable={false} />
          </span>
          <span className="spatula-plus">+</span>
          <span className="mini-icon">
            <img src={`/items/${group.component.icon}`} alt="" draggable={false} />
          </span>
          <span className="spatula-arrow">&#8594;</span>
          {group.emblems.map((emblem) => (
            <span key={emblem.name} className="spatula-emblem">
              <img
                className="spatula-emblem-icon"
                src={`/emblems/${emblem.icon}`}
                alt=""
                draggable={false}
              />
              {emblem.name.replace(' Emblem', '')}
            </span>
          ))}
        </span>
      ))}
      <span className="spatula-tip-note">
        {augmentOnly} emblems come from augments only
      </span>
    </span>
  )
}

export default function ComponentPicker({
  counts,
  onAdd,
  onRemove,
}: {
  counts: Record<string, number>
  onAdd: (id: string) => void
  onRemove: (id: string) => void
}) {
  const [spatulaTipOpen, setSpatulaTipOpen] = useState(false)
  const spatulaWrapRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!spatulaTipOpen) return
    function handleDocumentClick(event: MouseEvent) {
      const wrap = spatulaWrapRef.current
      if (wrap && !wrap.contains(event.target as Node)) {
        setSpatulaTipOpen(false)
      }
    }
    document.addEventListener('click', handleDocumentClick)
    return () => document.removeEventListener('click', handleDocumentClick)
  }, [spatulaTipOpen])

  return (
    <section className="panel">
      <div className="panel-head">
        <div className="panel-head-text">
          <h2>1 · Your item components</h2>
          <span className="panel-hint">
            Tap to add <SparkleMark /> − removes <SparkleMark /> 2-3 items is plenty
          </span>
        </div>
      </div>
      <div className="components">
        {items.components.map((component) => {
          const count = counts[component.id] ?? 0
          return (
              <div
                className="component-wrap"
                key={component.id}
                ref={component.id === 'spatula' ? spatulaWrapRef : undefined}
              >
              <button
                type="button"
                className={`component ${count > 0 ? 'active' : ''}`}
                onClick={() => onAdd(component.id)}
              >
                <span className="tile">
                  {component.icon && (
                    <img
                      src={`/items/${component.icon}`}
                      alt=""
                      draggable={false}
                      decoding="async"
                    />
                  )}
                </span>
                <span className="component-name">{component.short}</span>
                {component.id !== 'spatula' && (
                  <span className="component-stat">{component.stat}</span>
                )}
              </button>
                {count > 0 && (
                  <div className="tile-controls">
                    <button
                      type="button"
                      className="tile-minus"
                      onClick={() => onRemove(component.id)}
                      aria-label={`Remove one ${component.name}`}
                    >
                      <span className="minus-bar" aria-hidden="true" />
                    </button>
                    <span className="tile-count">{count}</span>
                  </div>
                )}
                {component.id === 'spatula' && (
                  <>
                    <button
                      type="button"
                      className="tile-info"
                      aria-label="Emblem recipes"
                      aria-expanded={spatulaTipOpen}
                      onClick={() => setSpatulaTipOpen((value) => !value)}
                    >
                      ?
                    </button>
                    <SpatulaTip
                      open={spatulaTipOpen}
                      onClose={() => setSpatulaTipOpen(false)}
                    />
                  </>
                )}
              </div>
          )
        })}
      </div>
    </section>
  )
}
