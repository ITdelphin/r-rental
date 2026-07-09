import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Select } from '@/components/ui/select'
import { getProvinces, getDistricts, getSectors, getCells, getVillages } from '@/lib/locations'
import type { LocationItem } from '@/lib/locations'

interface LocationSelectProps {
  selectedProvince: string
  selectedDistrict: string
  selectedSector: string
  selectedCell: string
  selectedVillage: string
  onChange: (field: string, value: string) => void
}

export function LocationSelect({
  selectedProvince, selectedDistrict, selectedSector, selectedCell, selectedVillage,
  onChange,
}: LocationSelectProps) {
  const { t } = useTranslation()
  const [provinces, setProvinces] = useState<LocationItem[]>([])
  const [districts, setDistricts] = useState<LocationItem[]>([])
  const [sectors, setSectors] = useState<LocationItem[]>([])
  const [cells, setCells] = useState<LocationItem[]>([])
  const [villages, setVillages] = useState<LocationItem[]>([])

  const [loading, setLoading] = useState({ districts: false, sectors: false, cells: false, villages: false })

  useEffect(() => { getProvinces().then(setProvinces) }, [])

  useEffect(() => {
    const province = provinces.find(p => p.name === selectedProvince)
    if (province) {
      setLoading(prev => ({ ...prev, districts: true }))
      getDistricts(province.code).then(d => { setDistricts(d); setLoading(prev => ({ ...prev, districts: false })) })
    } else {
      setDistricts([])
    }
  }, [selectedProvince, provinces])

  useEffect(() => {
    const district = districts.find(d => d.name === selectedDistrict)
    if (district) {
      setLoading(prev => ({ ...prev, sectors: true }))
      getSectors(district.code).then(s => { setSectors(s); setLoading(prev => ({ ...prev, sectors: false })) })
    } else {
      setSectors([])
    }
  }, [selectedDistrict, districts])

  useEffect(() => {
    const sector = sectors.find(s => s.name === selectedSector)
    if (sector) {
      setLoading(prev => ({ ...prev, cells: true }))
      getCells(sector.code).then(c => { setCells(c); setLoading(prev => ({ ...prev, cells: false })) })
    } else {
      setCells([])
    }
  }, [selectedSector, sectors])

  useEffect(() => {
    const cell = cells.find(c => c.name === selectedCell)
    if (cell) {
      setLoading(prev => ({ ...prev, villages: true }))
      getVillages(cell.code).then(v => { setVillages(v); setLoading(prev => ({ ...prev, villages: false })) })
    } else {
      setVillages([])
    }
  }, [selectedCell, cells])

  const toOptions = (items: LocationItem[]) => items.map(i => ({ value: i.name, label: i.name }))

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('province')} *</label>
        <Select
          value={selectedProvince}
          onChange={e => {
            onChange('province', e.target.value)
            onChange('district', '')
            onChange('sector', '')
            onChange('cell', '')
            onChange('village', '')
          }}
          options={toOptions(provinces)}
          placeholder={t('select_province')}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('district')} *</label>
        <Select
          value={selectedDistrict}
          onChange={e => {
            onChange('district', e.target.value)
            onChange('sector', '')
            onChange('cell', '')
            onChange('village', '')
          }}
          options={toOptions(districts)}
          placeholder={loading.districts ? t('loading') : t('select_district')}
          disabled={!selectedProvince}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('sector')}</label>
        <Select
          value={selectedSector}
          onChange={e => {
            onChange('sector', e.target.value)
            onChange('cell', '')
            onChange('village', '')
          }}
          options={toOptions(sectors)}
          placeholder={loading.sectors ? t('loading') : t('select_sector')}
          disabled={!selectedDistrict}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('cell')}</label>
        <Select
          value={selectedCell}
          onChange={e => {
            onChange('cell', e.target.value)
            onChange('village', '')
          }}
          options={toOptions(cells)}
          placeholder={loading.cells ? t('loading') : t('select_cell')}
          disabled={!selectedSector}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('village')}</label>
        <Select
          value={selectedVillage}
          onChange={e => onChange('village', e.target.value)}
          options={toOptions(villages)}
          placeholder={loading.villages ? t('loading') : t('select_village')}
          disabled={!selectedCell}
        />
      </div>
    </div>
  )
}
