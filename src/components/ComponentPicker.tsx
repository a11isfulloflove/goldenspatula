import { items } from '../data'
import SparkleMark from './SparkleMark'
import './ComponentPicker.css'

export default function ComponentPicker({
  counts,
  onAdd,
  onRemove,
}: {
  counts: Record<string, number>
  onAdd: (id: string) => void
  onRemove: (id: string) => void
}) {
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
            <div className="component-wrap" key={component.id}>
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
                <span className="component-stat">{component.stat}</span>
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
            </div>
          )
        })}
      </div>
    </section>
  )
}
