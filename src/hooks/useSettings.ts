import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

async function fetchSettings(): Promise<Record<string, string>> {
  const { data } = await supabase.from('settings').select('key, value') as unknown as { data: { key: string; value: string }[] | null }
  if (!data) return {}
  const map: Record<string, string> = {}
  for (const row of data) map[row.key] = row.value
  return map
}

export function useSettings() {
  const { data: settings = {}, isLoading: loaded } = useQuery({
    queryKey: ['settings'],
    queryFn: fetchSettings,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  return { settings, loaded }
}
