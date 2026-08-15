import { useEffect, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { CardSkeleton } from '@/components/ui/loading'
import { useAuth } from '@/hooks/useAuth'
import { applicationApi } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import { formatDate, formatPrice } from '@/lib/utils'
import { XCircle, CheckCircle2, ClipboardList, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import type { RentalApplication } from '@/types'

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  under_review: 'bg-blue-50 text-blue-700 border-blue-200',
  approved: 'bg-green-50 text-green-700 border-green-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
  withdrawn: 'bg-gray-100 text-gray-600 border-gray-200',
}

export function ApplicationsPage() {
  const { t } = useTranslation()
  const { profile } = useAuth()
  const [applications, setApplications] = useState<RentalApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)

  const isOwner = profile?.role === 'owner' || profile?.role === 'admin' || profile?.role === 'super_admin'

  const load = useCallback(async () => {
    if (!profile?.user_id) return
    setLoading(true)
    try {
      if (isOwner) {
        const { data } = await supabase
          .from('rental_applications')
          .select('*, property:properties(*), unit:property_units(*), applicant:profiles!applicant_id(*)')
          .order('submitted_at', { ascending: false })
        setApplications((data || []) as unknown as RentalApplication[])
      } else {
        const { data } = await supabase
          .from('rental_applications')
          .select('*, property:properties(*), unit:property_units(*)')
          .eq('applicant_id', profile.user_id)
          .order('submitted_at', { ascending: false })
        setApplications((data || []) as unknown as RentalApplication[])
      }
    } catch {
      setApplications([])
    }
    setLoading(false)
  }, [profile?.user_id, isOwner])

  useEffect(() => { load() }, [load])

  const updateStatus = async (id: string, status: RentalApplication['status'], reason?: string) => {
    setBusyId(id)
    try {
      await applicationApi.updateStatus(id, status, reason ? { rejection_reason: reason } : undefined)
      toast.success(t('status_updated'))
      load()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t('failed'))
    }
    setBusyId(null)
  }

  const withdraw = async (app: RentalApplication) => {
    if (!profile?.user_id) return
    setBusyId(app.id)
    try {
      await applicationApi.withdraw(app.id, profile.user_id)
      toast.success(t('application_withdrawn'))
      load()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t('failed'))
    }
    setBusyId(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('applications')}</h1>
        <p className="mt-1 text-sm text-gray-500">{isOwner ? t('owner_applications_hint') : t('tenant_applications_hint')}</p>
      </div>

      {loading ? (
        <div className="space-y-4"><CardSkeleton /><CardSkeleton /></div>
      ) : applications.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <EmptyState icon={ClipboardList} title={t('no_applications')} description={t('no_applications_hint')} />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {applications.map(app => (
            <Card key={app.id}>
              <CardContent className="pt-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{app.property?.title ?? t('property')}</p>
                      {app.unit && <span className="text-sm text-gray-500"># {app.unit.unit_number || ''}</span>}
                      <Badge className={STATUS_STYLES[app.status]}>{t(app.status)}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      {isOwner && app.applicant?.full_name ? `${app.applicant.full_name} · ` : ''}{t('applied')}: {formatDate(app.submitted_at)}
                      {app.monthly_rent_offer ? ` · ${t('offer')}: ${formatPrice(app.monthly_rent_offer)}` : ''}
                    </p>
                    {app.message && <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{app.message}</p>}
                    {app.rejection_reason && app.status === 'rejected' && (
                      <p className="mt-2 text-sm text-red-500">{t('reason')}: {app.rejection_reason}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isOwner && (app.status === 'pending' || app.status === 'under_review') && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => updateStatus(app.id, 'under_review')} disabled={busyId === app.id}>
                          <Clock className="h-4 w-4 mr-1.5" />{t('under_review')}
                        </Button>
                        <Button size="sm" onClick={() => updateStatus(app.id, 'approved')} disabled={busyId === app.id}>
                          <CheckCircle2 className="h-4 w-4 mr-1.5" />{t('approve')}
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => {
                          const reason = window.prompt(t('rejection_reason'))
                          if (reason !== null) updateStatus(app.id, 'rejected', reason)
                        }} disabled={busyId === app.id}>
                          <XCircle className="h-4 w-4 mr-1.5" />{t('reject')}
                        </Button>
                      </>
                    )}
                    {!isOwner && app.status === 'pending' && (
                      <Button size="sm" variant="outline" onClick={() => withdraw(app)} disabled={busyId === app.id}>{t('withdraw')}</Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}