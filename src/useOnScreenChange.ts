import { useEffect, useRef } from 'react'

export function useOnScreenChange(
  elementId: string,
  onChange: (onScreen: boolean) => void,
): void {
  const callbackRef = useRef(onChange)

  useEffect(() => {
    callbackRef.current = onChange
  })

  useEffect(() => {
    const element = document.getElementById(elementId)
    if (!element) return
    const observer = new IntersectionObserver(
      (entries) => callbackRef.current(entries[0].isIntersecting),
      { threshold: 0 },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [elementId])
}
