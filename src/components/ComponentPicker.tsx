import { useEffect, useRef, useState } from 'react'
import { items } from '../data'
import { MAX_CRAFTED_ITEMS } from '../constants'
import SparkleMark from './SparkleMark'
import { asset } from '../ui-helpers'
import './ComponentPicker.css'

function SpatulaTip({
  open,
  onClose,
  panOnly,
  crafted,
  onToggleEmblem,
}: {
  open: boolean
  onClose: () => void
  panOnly: boolean
  crafted: string[]
  onToggleEmblem: (name: string) => void
}) {
  const toolIcon = panOnly ? 'tft_item_fryingpan.png' : 'tft_item_spatula.png'
  const recipes = (items.emblemRecipes ?? []).filter((recipe) =>
    panOnly ? recipe.source === 'fryingPan' : recipe.source !== 'fryingPan',
  )
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
      <span className="spatula-tip-title">
        {panOnly ? 'Frying Pan' : 'Spatula'} — tap an emblem to craft it
      </span>
      {craftable.map((group) => (
        <span className="spatula-tip-row" key={group.component.id}>
          <span className="mini-icon">
            <img src={asset(`items/${toolIcon}`)} alt="" draggable={false} />
          </span>
          <span className="spatula-plus">+</span>
          <span className="mini-icon">
            <img src={asset(`items/${group.component.icon}`)} alt="" draggable={false} />
          </span>
          <span className="spatula-arrow">&#8594;</span>
          {group.emblems.map((emblem) => {
            const isCrafted = crafted.includes(emblem.name)
            return (
              <button
                key={emblem.name}
                type="button"
                className={`spatula-emblem emblem-btn ${isCrafted ? 'crafted' : ''}`}
                aria-pressed={isCrafted}
                title={`${emblem.name} — tap to ${isCrafted ? 'un-craft' : 'craft'}`}
                onClick={() => onToggleEmblem(emblem.name)}
              >
                <img
                  className="spatula-emblem-icon"
                  src={asset(`emblems/${emblem.icon}`)}
                  alt=""
                  draggable={false}
                />
                {emblem.name.replace(' Emblem', '')}
                {isCrafted && <strong className="emblem-check">&#10003;</strong>}
              </button>
            )
          })}
        </span>
      ))}
      {augmentOnly && (
        <span className="spatula-tip-note">{augmentOnly} emblems come from augments only</span>
      )}
    </span>
  )
}

export default function ComponentPicker({
  counts,
  onAdd,
  onRemove,
  emblems,
  onToggleEmblem,
  crafted,
  onToggleCrafted,
}: {
  counts: Record<string, number>
  onAdd: (id: string) => void
  onRemove: (id: string) => void
  emblems: string[]
  onToggleEmblem: (name: string) => void
  crafted: string[]
  onToggleCrafted: (name: string) => void
}) {
  const [openTip, setOpenTip] = useState<string | null>(null)
  const [craftQuery, setCraftQuery] = useState('')
  const tipWrapRef = useRef<HTMLDivElement | null>(null)
  const emblemSource = (name: string) =>
    (items.emblemRecipes ?? []).find((recipe) => recipe.name === name)?.source
  const craftedEmblems = (items.emblemRecipes ?? []).filter((recipe) =>
    emblems.includes(recipe.name),
  )
  const atCraftLimit = crafted.length >= MAX_CRAFTED_ITEMS
  const normalizedCraftQuery = craftQuery.trim().toLowerCase()
  const visibleRecipes = items.recipes.filter(
    (recipe) =>
      !normalizedCraftQuery || recipe.name.toLowerCase().includes(normalizedCraftQuery),
  )

  useEffect(() => {
    if (!openTip) return
    function handleDocumentClick(event: MouseEvent) {
      const wrap = tipWrapRef.current
      if (wrap && !wrap.contains(event.target as Node)) {
        setOpenTip(null)
      }
    }
    document.addEventListener('click', handleDocumentClick)
    return () => document.removeEventListener('click', handleDocumentClick)
  }, [openTip])

  return (
    <section className="panel">
      <div className="panel-head">
        <div className="panel-head-text">
          <h2>1 · Your item components</h2>
          <span className="panel-hint">
            Tap to add <SparkleMark /> − removes <SparkleMark /> tap a spatula tool to craft
            emblems
          </span>
        </div>
      </div>
      <div className="components">
        {items.components.map((component) => {
          const count = counts[component.id] ?? 0
          const isTool = component.id === 'spatula' || component.id === 'fryingpan'
          const pool = isTool
            ? emblems.filter(
                (name) => emblemSource(name) === (component.id === 'fryingpan' ? 'fryingPan' : undefined),
              ).length > 0
            : false
          return (
              <div
                className="component-wrap"
                key={component.id}
                ref={openTip === component.id ? tipWrapRef : undefined}
              >
              <button
                type="button"
                className={`component ${!isTool && count > 0 ? 'active' : ''} ${isTool && pool ? 'active' : ''}`}
                aria-expanded={isTool ? openTip === component.id : undefined}
                onClick={() =>
                  isTool
                    ? setOpenTip((current) =>
                        current === component.id ? null : component.id,
                      )
                    : onAdd(component.id)
                }
              >
                <span className="tile">
                  {component.icon && (
                    <img
                      src={asset(`items/${component.icon}`)}
                      alt=""
                      draggable={false}
                      decoding="async"
                    />
                  )}
                </span>
                <span className="component-name">{component.short}</span>
                {!isTool && <span className="component-stat">{component.stat}</span>}
                {count > 1 && <span className="tile-copies">×{count}</span>}
              </button>
                {!isTool && count > 0 && (
                  <button
                    type="button"
                    className="tile-remove"
                    onClick={() => onRemove(component.id)}
                    aria-label={`Remove one ${component.name}`}
                  >
                    −
                  </button>
                )}
                {isTool && (
                  <SpatulaTip
                    open={openTip === component.id}
                    onClose={() => setOpenTip(null)}
                    panOnly={component.id === 'fryingpan'}
                    crafted={emblems}
                    onToggleEmblem={onToggleEmblem}
                  />
                )}
              </div>
          )
        })}
      </div>
      <div className="crafted-items-row">
        <span className="crafted-items-label">
          Completed items — crafting locks the components into one path
        </span>
        <div className="champ-controls">
          <input
            className="champ-filter crafted-filter"
            type="search"
            placeholder="Filter completed items..."
            value={craftQuery}
            onChange={(e) => setCraftQuery(e.target.value)}
          />
        </div>
        <div className="crafted-item-cards">
          {visibleRecipes.map((recipe) => {
            const isCrafted = crafted.includes(recipe.name)
            const disabled = !isCrafted && atCraftLimit
            const icon = items.itemIcons?.[recipe.name]
            return (
              <button
                key={recipe.name}
                type="button"
                className={`crafted-item ${isCrafted ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
                aria-pressed={isCrafted}
                title={`${recipe.name} (${recipe.components.join(' + ')}) — tap to ${
                  isCrafted ? 'un-craft' : 'mark as crafted'
                }`}
                onClick={() => !disabled && onToggleCrafted(recipe.name)}
              >
                {icon && (
                  <img src={asset(`items/${icon}`)} alt="" draggable={false} decoding="async" />
                )}
                <span className="crafted-item-name">{recipe.name}</span>
              </button>
            )
          })}
          {visibleRecipes.length === 0 && (
            <span className="champ-empty">No matches</span>
          )}
        </div>
      </div>
      {craftedEmblems.length > 0 && (
        <div className="crafted-strip">
          <span className="crafted-strip-label">Crafted:</span>
          {craftedEmblems.map((emblem) => (
            <button
              key={emblem.name}
              type="button"
              className="crafted-chip"
              title={`${emblem.name} — tap to un-craft`}
              aria-label={`Un-craft ${emblem.name}`}
              onClick={() => onToggleEmblem(emblem.name)}
            >
              <img
                src={asset(`emblems/${emblem.icon}`)}
                alt=""
                draggable={false}
                decoding="async"
              />
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
