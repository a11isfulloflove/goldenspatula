import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { activeSet, items } from './data'
import { recommend, recommendOpeners } from './engine/recommend'
import { MAX_AUGMENTS, MAX_CHAMPION_COPIES, MAX_CRAFTED_ITEMS, MAX_PER_COMPONENT } from './constants'
import { loadPersistedInput, savePersistedInput } from './persistence'
import Header from './components/Header'
import Footer from './components/Footer'
import ComponentPicker from './components/ComponentPicker'
import ChampionPicker from './components/ChampionPicker'
import AugmentPicker from './components/AugmentPicker'
import ResultsPanel from './components/ResultsPanel'
import StickyBuildBar from './components/StickyBuildBar'
import ScrollTopButton from './components/ScrollTopButton'

function App() {
  const [counts, setCounts] = useState<Record<string, number>>(() => loadPersistedInput().counts)
  const [championCounts, setChampionCounts] = useState<Record<string, number>>(
    () => loadPersistedInput().championCounts,
  )
  const [augments, setAugments] = useState<string[]>(() => loadPersistedInput().augments)
  const [emblems, setEmblems] = useState<string[]>(() => loadPersistedInput().emblems)
  const [crafted, setCrafted] = useState<string[]>(() => loadPersistedInput().crafted)
  const [query, setQuery] = useState('')
  const [resetSignal, setResetSignal] = useState(0)
  const [focusComp, setFocusComp] = useState<{ id: string; nonce: number } | null>(null)

  const totalItems = Object.values(counts).reduce((sum, n) => sum + n, 0)
  const totalChampionCopies = Object.values(championCounts).reduce((sum, n) => sum + n, 0)
  const hasInput =
    totalItems > 0 ||
    totalChampionCopies > 0 ||
    augments.length > 0 ||
    emblems.length > 0 ||
    crafted.length > 0

  useEffect(() => {
    savePersistedInput({ counts, championCounts, augments, emblems, crafted })
  }, [counts, championCounts, augments, emblems, crafted])

  const augmentDefs = useMemo(
    () => (activeSet.augments ?? []).filter((augment) => augments.includes(augment.id)),
    [augments],
  )

  const emblemDefs = useMemo(
    () =>
      (items.emblemRecipes ?? [])
        .filter((emblem) => emblems.includes(emblem.name))
        .map((emblem) => ({
          id: emblem.name,
          name: emblem.name,
          trait: emblem.name.replace(' Emblem', ''),
          icon: emblem.icon,
        })),
    [emblems],
  )

  const recs = useMemo(
    () =>
      recommend(
        activeSet.comps,
        items,
        counts,
        championCounts,
        [...augmentDefs, ...emblemDefs],
        crafted,
      ),
    [counts, championCounts, augmentDefs, emblemDefs, crafted],
  )

  const openerRecs = useMemo(
    () =>
      recommendOpeners(activeSet.openers?.openers ?? [], items, counts, championCounts, crafted),
    [counts, championCounts, crafted],
  )

  function addComponent(id: string) {
    setCounts((c) => ({ ...c, [id]: Math.min((c[id] ?? 0) + 1, MAX_PER_COMPONENT) }))
  }

  function removeComponent(id: string) {
    setCounts((c) => ({ ...c, [id]: Math.max((c[id] ?? 0) - 1, 0) }))
  }

  function addChampionCopy(name: string) {
    setChampionCounts((cc) => ({
      ...cc,
      [name]: Math.min((cc[name] ?? 0) + 1, MAX_CHAMPION_COPIES),
    }))
  }

  function removeChampionCopy(name: string) {
    setChampionCounts((cc) => {
      const next = { ...cc, [name]: Math.max((cc[name] ?? 0) - 1, 0) }
      if (next[name] === 0) delete next[name]
      return next
    })
  }

  function toggleAugment(id: string) {
    setAugments((a) =>
      a.includes(id) ? a.filter((entry) => entry !== id) : [...a, id].slice(0, MAX_AUGMENTS),
    )
  }

  function toggleEmblem(name: string) {
    setEmblems((e) => (e.includes(name) ? e.filter((entry) => entry !== name) : [...e, name]))
  }

  function toggleCrafted(name: string) {
    setCrafted((c) =>
      c.includes(name)
        ? c.filter((entry) => entry !== name)
        : [...c, name].slice(0, MAX_CRAFTED_ITEMS),
    )
  }

  function reset() {
    setCounts({})
    setChampionCounts({})
    setAugments([])
    setEmblems([])
    setCrafted([])
    setQuery('')
    setResetSignal((n) => n + 1)
  }

  return (
    <div className="app">
      <Header />
      <div className="app-columns">
        <div className="column-pickers">
          <ComponentPicker
            counts={counts}
            onAdd={addComponent}
            onRemove={removeComponent}
            emblems={emblems}
            onToggleEmblem={toggleEmblem}
            crafted={crafted}
            onToggleCrafted={toggleCrafted}
          />
          <AugmentPicker selected={augments} onToggle={toggleAugment} />
          <ChampionPicker
            counts={championCounts}
            onAdd={addChampionCopy}
            onRemove={removeChampionCopy}
            query={query}
            onQueryChange={setQuery}
          />
        </div>
        <div className="column-results">
          <ResultsPanel
            recs={recs}
            openerRecs={openerRecs}
            specialStarts={activeSet.openers?.specialStarts ?? []}
            comps={activeSet.comps}
            hasInput={hasInput}
            onReset={reset}
            resetSignal={resetSignal}
            focusComp={focusComp}
            onFocusCompHandled={() => setFocusComp(null)}
            onSelectComp={(id) => setFocusComp({ id, nonce: Date.now() })}
          />
        </div>
      </div>
      <Footer />
      {hasInput && (
        <StickyBuildBar
          recs={recs}
          counts={counts}
          champions={championCounts}
          augments={augmentDefs}
          emblems={emblemDefs}
          crafted={crafted}
          onSelectComp={(id) => setFocusComp({ id, nonce: Date.now() })}
        />
      )}
      <ScrollTopButton />
    </div>
  )
}

export default App
