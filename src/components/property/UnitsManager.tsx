import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, DoorOpen, Loader2 } from 'lucide-react'
import { unitApi } from '@/lib/api'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { PropertyUnit, UnitStatus } from '@/types'

const STATUS_STYLES: Record<UnitStatus, string> = {
  available: 'bg-green-50 text-green-700 border-green-200',
  reserved: 'bg-blue-50 text-blue-700 border-blue-200',
  occupied: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  maintenance: 'bg-orange-50 text-orange-700 border-orange-200',
  unavailable: 'bg-gray-100 text-gray-600 border-gray-200',
}

const emptyUnit = { unit_number: '', floor: '', bedrooms: 1, bathrooms: 1, monthly_rent: 0, deposit_amount: '' }

export function UnitsManager({ propertyId }: { propertyId: string }) {
  const { t } = useTranslation()
  const [units, setUnits] = useState<PropertyUnit[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(emptyUnit)

  const load = async () => {
    setLoading(true)
    try {
      setUnits(await unitApi.listForProperty(propertyId))
    } catch {
      setUnits([])
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [propertyId])

  const addUnit = async () => {
    const rent = Number(form.monthly_rent)
    if (!rent || rent <= 0) {
      toast.error(t('monthly_rent_required'))
      return
    }
    setSaving(true)
    try {
      await unitApi.create({
        property_id: propertyId,
        unit_number: form.unit_number || null,
        floor: form.floor || null,
        bedrooms: Number(form.bedrooms) || 1,
        bathrooms: Number(form.bathrooms) || 1,
        monthly_rent: rent,
        deposit_amount: form.deposit_amount ? Number(form.deposit_amount) : null,
        status: 'available',
      })
      toast.success(t('unit_added'))
      setForm(emptyUnit)
      load()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t('unit_add_failed'))
    }
    setSaving(false)
  }

  const updateStatus = async (unit: PropertyUnit, status: UnitStatus) => {
    try {
      await unitApi.update(unit.id, { status } as Partial<PropertyUnit>)
      toast.success(t('status_updated'))
      load()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t('unit_update_failed'))
    }
  }

  const removeUnit = async (unit: PropertyUnit) => {
    if (!window.confirm(t('delete_unit_confirm'))) return
    try {
      await unitApi.remove(unit.id)
      toast.success(t('unit_deleted'))
      load()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t('unit_delete_failed'))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <DoorOpen className="h-5 w-5 text-primary-500" />
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{t('property_units')}</h3>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-gray-500"><Loader2 className="h-4 w-4 animate-spin" /> {t('loading')}...</div>
      ) : units.length === 0 ? (
        <p className="text-sm text-gray-500">{t('no_units_yet')}</p>
      ) : (
        <div className="space-y-2">
          {units.map(unit => (
            <div key={unit.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {unit.unit_number ? `${t('unit')} ${unit.unit_number}` : t('unit')}
                    {unit.floor ? ` · ${t('floor')} ${unit.floor}` : ''}
                  </p>
                  <Badge className={STATUS_STYLES[unit.status]}>{t(unit.status)}</Badge>
                </div>
                <p className="mt-0.5 text-xs text-gray-500">{unit.bedrooms} {t('bedrooms')} · {unit.bathrooms} {t('bathrooms')} · {formatPrice(unit.monthly_rent)}/{t('mo')}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <select
                  value={unit.status}
                  onChange={e => updateStatus(unit, e.target.value as UnitStatus)}
                  className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white px-2 py-1.5 text-xs dark:bg-gray-800 dark:text-gray-100"
                >
                  {(Object.keys(STATUS_STYLES) as UnitStatus[]).map(s => <option key={s} value={s}>{t(s)}</option>)}
                </select>
                <Button size="sm" variant="ghost" className="text-red-500" onClick={() => removeUnit(unit)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-600 p-4 space-y-3">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('add_new_unit')}</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <input value={form.unit_number} onChange={e => setForm({ ...form, unit_number: e.target.value })} placeholder={t('unit_number_placeholder')} className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white px-3 py-2 text-sm dark:bg-gray-800 dark:text-gray-100" />
          <input value={form.floor} onChange={e => setForm({ ...form, floor: e.target.value })} placeholder={t('floor_placeholder')} className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white px-3 py-2 text-sm dark:bg-gray-800 dark:text-gray-100" />
          <input type="number" min={0} value={form.bedrooms} onChange={e => setForm({ ...form, bedrooms: Number(e.target.value) })} placeholder={t('bedrooms')} className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white px-3 py-2 text-sm dark:bg-gray-800 dark:text-gray-100" />
          <input type="number" min={0} value={form.bathrooms} onChange={e => setForm({ ...form, bathrooms: Number(e.target.value) })} placeholder={t('bathrooms')} className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white px-3 py-2 text-sm dark:bg-gray-800 dark:text-gray-100" />
          <input type="number" min={0} value={form.monthly_rent} onChange={e => setForm({ ...form, monthly_rent: Number(e.target.value) })} placeholder={`${t('monthly_rent')} (RWF)`} className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white px-3 py-2 text-sm dark:bg-gray-800 dark:text-gray-100" />
          <input type="number" min={0} value={form.deposit_amount} onChange={e => setForm({ ...form, deposit_amount: e.target.value })} placeholder={`${t('deposit')} (RWF)`} className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white px-3 py-2 text-sm dark:bg-gray-800 dark:text-gray-100" />
        </div>
        <Button size="sm" onClick={addUnit} disabled={saving}><Plus className="h-4 w-4 mr-1.5" /> {t('add')}</Button>
      </div>
    </div>
  )
}