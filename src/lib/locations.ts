import { supabase } from './supabase'

export interface LocationItem {
  code: string
  name: string
  type: string
  parent_code: string | null
}

export async function getProvinces(): Promise<LocationItem[]> {
  const { data } = await supabase
    .from('locations')
    .select('code, name, type, parent_code')
    .eq('type', 'province')
    .order('name')
  return (data || []) as LocationItem[]
}

export async function getDistricts(provinceCode: string): Promise<LocationItem[]> {
  const { data } = await supabase
    .from('locations')
    .select('code, name, type, parent_code')
    .eq('type', 'district')
    .eq('parent_code', provinceCode)
    .order('name')
  return (data || []) as LocationItem[]
}

export async function getSectors(districtCode: string): Promise<LocationItem[]> {
  const { data } = await supabase
    .from('locations')
    .select('code, name, type, parent_code')
    .eq('type', 'sector')
    .eq('parent_code', districtCode)
    .order('name')
  return (data || []) as LocationItem[]
}

export async function getCells(sectorCode: string): Promise<LocationItem[]> {
  const { data } = await supabase
    .from('locations')
    .select('code, name, type, parent_code')
    .eq('type', 'cell')
    .eq('parent_code', sectorCode)
    .order('name')
  return (data || []) as LocationItem[]
}

export async function getVillages(cellCode: string): Promise<LocationItem[]> {
  const { data } = await supabase
    .from('locations')
    .select('code, name, type, parent_code')
    .eq('type', 'village')
    .eq('parent_code', cellCode)
    .order('name')
  return (data || []) as LocationItem[]
}
