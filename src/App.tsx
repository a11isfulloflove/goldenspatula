import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { activeSet, items } from './data'
import { recommend } from './engine/recommend'
import { MAX_PER_COMPONENT } from './constants'
import { loadPersistedInput, savePersistedInput } from './persistence'
import Header from './components/Header'
import Footer from './components/Footer'
import ComponentPicker from './components/ComponentPicker'
import ChampionPicker from './components/ChampionPicker'
import ResultsPanel from './components/ResultsPanel'
import StickyBuildBar from './components/StickyBuildBar'
import ScrollTopButton from './components/ScrollTopButton'

function App() {
  const [counts, setCounts] = useState<Record<string, number>>(() => loadPersistedInput().counts)
  const [champions, setChampions] = useState<string[]>(() => loadPersistedInput().champions)
  const [query, setQuery] = useState('')
  const [resetSignal, setResetSignal] = useState(0)
  const [focusComp, setFocusComp] = useState<{ id: string; nonce: number } | null>(null)

  const totalItems = Object.values(counts).reduce((sum, n) => sum + n, 0)
  const hasInput = totalItems > 0 || champions.length > 0

  useEffect(() => {
    savePersistedInput({ counts, champions })
  }, [counts, champions])

  const recs = useMemo(
    () => recommend(activeSet.comps, items, counts, champions),
    [counts, champions],
  )

  function addComponent(id: string) {
    setCounts((c) => ({ ...c, [id]: Math.min((c[id] ?? 0) + 1, MAX_PER_COMPONENT) }))
  }

  function removeComponent(id: string) {
    setCounts((c) => ({ ...c, [id]: Math.max((c[id] ?? 0) - 1, 0) }))
  }

  function toggleChampion(name: string) {
    setChampions((cs) => (cs.includes(name) ? cs.filter((c) => c !== name) : [...cs, name]))
  }

  function reset() {
    setCounts({})
    setChampions([])
    setQuery('')
    setResetSignal((n) => n + 1)
  }

  return (
    <div className="app">
      <Header />
      <ComponentPicker counts={counts} onAdd={addComponent} onRemove={removeComponent} />
      <ChampionPicker
        selected={champions}
        onToggle={toggleChampion}
        query={query}
        onQueryChange={setQuery}
      />
      <ResultsPanel
        recs={recs}
        hasInput={hasInput}
        onReset={reset}
        resetSignal={resetSignal}
        focusComp={focusComp}
        onFocusCompHandled={() => setFocusComp(null)}
      />
      <Footer />
      {hasInput && (
        <StickyBuildBar
          recs={recs}
          counts={counts}
          champions={champions}
          onSelectComp={(id) => setFocusComp({ id, nonce: Date.now() })}
        />
      )}
      <ScrollTopButton />
    </div>
  )
}

export default App
