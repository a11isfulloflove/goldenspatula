import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { activeSet, items } from './data'
import { recommend, recommendOpeners } from './engine/recommend'
import { MAX_CHAMPION_COPIES, MAX_PER_COMPONENT } from './constants'
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
  const [championCounts, setChampionCounts] = useState<Record<string, number>>(
    () => loadPersistedInput().championCounts,
  )
  const [query, setQuery] = useState('')
  const [resetSignal, setResetSignal] = useState(0)
  const [focusComp, setFocusComp] = useState<{ id: string; nonce: number } | null>(null)

  const totalItems = Object.values(counts).reduce((sum, n) => sum + n, 0)
  const totalChampionCopies = Object.values(championCounts).reduce((sum, n) => sum + n, 0)
  const hasInput = totalItems > 0 || totalChampionCopies > 0

  useEffect(() => {
    savePersistedInput({ counts, championCounts })
  }, [counts, championCounts])

  const recs = useMemo(
    () => recommend(activeSet.comps, items, counts, championCounts),
    [counts, championCounts],
  )

  const openerRecs = useMemo(
    () => recommendOpeners(activeSet.openers?.openers ?? [], items, counts, championCounts),
    [counts, championCounts],
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

  function reset() {
    setCounts({})
    setChampionCounts({})
    setQuery('')
    setResetSignal((n) => n + 1)
  }

  return (
    <div className="app">
      <Header />
      <div className="app-columns">
        <div className="column-pickers">
          <ComponentPicker counts={counts} onAdd={addComponent} onRemove={removeComponent} />
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
          onSelectComp={(id) => setFocusComp({ id, nonce: Date.now() })}
        />
      )}
      <ScrollTopButton />
    </div>
  )
}

export default App
