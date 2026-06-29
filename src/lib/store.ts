import { useState, useCallback } from 'react'

export function create<T>() {
  return function useStore(initialState: T) {
    const [state, setState] = useState<T>(initialState)
    const set = useCallback((partial: Partial<T> | ((s: T) => Partial<T>)) => {
      setState((prev) => ({ ...prev, ...(typeof partial === 'function' ? partial(prev) : partial) }))
    }, [])
    return [state, set] as const
  }
}
