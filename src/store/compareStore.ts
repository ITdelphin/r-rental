import { useState, useCallback } from 'react'
import type { Property } from '@/types'

const MAX_COMPARE = 4

let globalState: Property[] = []
let listeners: Array<() => void> = []

function emitChange() {
  for (const listener of listeners) listener()
}

export function useCompareStore() {
  const [, setTick] = useState(0)

  const subscribe = useCallback(() => {
    const listener = () => setTick(t => t + 1)
    listeners.push(listener)
    return () => {
      listeners = listeners.filter(l => l !== listener)
    }
  }, [])

  useState(() => {
    const unsub = subscribe()
    return unsub
  })

  const addItem = useCallback((property: Property) => {
    if (globalState.length >= MAX_COMPARE) return
    if (globalState.some(p => p.id === property.id)) return
    globalState = [...globalState, property]
    emitChange()
  }, [])

  const removeItem = useCallback((id: string) => {
    globalState = globalState.filter(p => p.id !== id)
    emitChange()
  }, [])

  const clearItems = useCallback(() => {
    globalState = []
    emitChange()
  }, [])

  const isInCompare = useCallback((id: string) => {
    return globalState.some(p => p.id === id)
  }, [])

  const toggleItem = useCallback((property: Property) => {
    if (globalState.some(p => p.id === property.id)) {
      globalState = globalState.filter(p => p.id !== property.id)
    } else if (globalState.length < MAX_COMPARE) {
      globalState = [...globalState, property]
    }
    emitChange()
  }, [])

  return {
    items: globalState,
    addItem,
    removeItem,
    clearItems,
    isInCompare,
    toggleItem,
  }
}
