import { supabase } from './supabase'

export async function getSettings(): Promise<Record<string, string>> {
  const { data } = await supabase.from('settings').select('key, value') as { data: { key: string; value: string }[] | null }
  const map: Record<string, string> = {}
  if (data) {
    for (const row of data) {
      map[row.key] = row.value
    }
  }
  return map
}
