import { useState, useCallback } from 'react'

export interface SearchParams {
  query?: string
  location?: string
  minPrice?: number
  maxPrice?: number
  bedrooms?: number
  category?: string
  propertyType?: string
}

interface SavedSearch {
  id: string
  name: string
  params: SearchParams
  createdAt: string
}

const STORAGE_KEY = 'easyrent_saved_searches'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

function loadSavedSearches(): SavedSearch[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveSearches(searches: SavedSearch[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(searches))
}

export function useSavedSearches() {
  const [searches, setSearches] = useState<SavedSearch[]>(loadSavedSearches)

  const addSearch = useCallback((name: string, params: SearchParams) => {
    const newSearch: SavedSearch = {
      id: generateId(),
      name,
      params,
      createdAt: new Date().toISOString(),
    }
    const updated = [newSearch, ...searches].slice(0, 10)
    setSearches(updated)
    saveSearches(updated)
    return newSearch
  }, [searches])

  const removeSearch = useCallback((id: string) => {
    const updated = searches.filter(s => s.id !== id)
    setSearches(updated)
    saveSearches(updated)
  }, [searches])

  const clearSearches = useCallback(() => {
    setSearches([])
    saveSearches([])
  }, [])

  return {
    searches,
    addSearch,
    removeSearch,
    clearSearches,
  }
}
