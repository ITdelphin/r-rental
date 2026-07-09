import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function useSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('settings').select('key, value') as unknown as { data: { key: string; value: string }[] | null }
      if (data) {
        const map: Record<string, string> = {}
        for (const row of data) map[row.key] = row.value
        setSettings(map)
      }
      setLoaded(true)
    }
    fetch()
  }, [])

  return { settings, loaded }
}
