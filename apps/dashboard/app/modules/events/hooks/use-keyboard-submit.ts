import { useEffect, useRef } from 'react'

export function useKeyboardSubmit(submit: () => void, enabled: boolean) {
  const submitRef = useRef(submit)

  useEffect(() => {
    submitRef.current = submit
  }, [submit])

  useEffect(() => {
    const handleKeyDown = (browserEvent: KeyboardEvent) => {
      if ((browserEvent.metaKey || browserEvent.ctrlKey) && browserEvent.key === 'Enter') {
        browserEvent.preventDefault()
        if (enabled) {
          submitRef.current()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [enabled])
}
