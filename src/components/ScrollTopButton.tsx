import { useEffect, useState } from 'react'
import './ScrollTopButton.css'

export default function ScrollTopButton() {
  const [resultsOnScreen, setResultsOnScreen] = useState(false)

  useEffect(() => {
    const results = document.getElementById('results')
    if (!results) return
    const observer = new IntersectionObserver(
      (entries) => setResultsOnScreen(entries[0].isIntersecting),
      { threshold: 0 },
    )
    observer.observe(results)
    return () => observer.disconnect()
  }, [])

  return (
    <button
      type="button"
      className={`scroll-top ${resultsOnScreen ? 'visible' : ''}`}
      aria-label="Scroll back to the pickers"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    >
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path
          d="M3 10l5-5 5 5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}
