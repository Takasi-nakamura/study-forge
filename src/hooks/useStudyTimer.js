import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * setInterval の積算誤差を避けるため、常に Date.now() の差分から経過時間を再計算する。
 * バックグラウンドタブでも正確な経過時間を保つ。
 */
export function useStudyTimer() {
  const [elapsedMs, setElapsedMs] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const startTimeRef = useRef(null)
  const baseElapsedRef = useRef(0)
  const rafRef = useRef(null)

  const tick = useCallback(() => {
    if (startTimeRef.current !== null) {
      const now = Date.now()
      setElapsedMs(baseElapsedRef.current + (now - startTimeRef.current))
      rafRef.current = requestAnimationFrame(tick)
    }
  }, [])

  const start = useCallback(() => {
    if (isRunning) return
    startTimeRef.current = Date.now()
    setIsRunning(true)
    rafRef.current = requestAnimationFrame(tick)
  }, [isRunning, tick])

  const pause = useCallback(() => {
    if (!isRunning) return
    baseElapsedRef.current = elapsedMs
    startTimeRef.current = null
    setIsRunning(false)
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
  }, [isRunning, elapsedMs])

  const reset = useCallback(() => {
    baseElapsedRef.current = 0
    startTimeRef.current = isRunning ? Date.now() : null
    setElapsedMs(0)
  }, [isRunning])

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const minutes = elapsedMs / 60000

  return { elapsedMs, minutes, isRunning, start, pause, reset }
}
