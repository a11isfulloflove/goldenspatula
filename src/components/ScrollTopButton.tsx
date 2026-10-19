import { useEffect, useState } from 'react'
import './ScrollTopButton.css'

const desktopQuery = window.matchMedia('(min-width: 1100px)')

export default function ScrollTopButton() {
  const [resultsOnScreen, setResultsOnScreen] = useState(false)
  const [deepEnough, setDeepEnough] = useState(false)
  const [isDesktop, setIsDesktop] = useState(desktopQuery.matches)

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

  useEffect(() => {
    let threshold = Number.POSITIVE_INFINITY

    function measure() {
      const results = document.getElementById('results')
      if (!results) return
      const fourthCard = results.querySelectorAll('.comp-card')[3] as HTMLElement | undefined
      if (fourthCard) {
        threshold = fourthCard.offsetTop - window.innerHeight
      } else {
        threshold = results.offsetTop + results.offsetHeight * 0.5 - window.innerHeight
      }
    }

    function update() {
      setDeepEnough(window.scrollY >= threshold)
    }

    function refresh() {
      measure()
      update()
    }

    refresh()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', refresh)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', refresh)
    }
  }, [])

  useEffect(() => {
    function handleChange() {
      setIsDesktop(desktopQuery.matches)
    }
    desktopQuery.addEventListener('change', handleChange)
    return () => desktopQuery.removeEventListener('change', handleChange)
  }, [])

  const visible = isDesktop ? deepEnough : resultsOnScreen

  return (
    <button
      type="button"
      className={`scroll-top ${visible ? 'visible' : ''}`}
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
