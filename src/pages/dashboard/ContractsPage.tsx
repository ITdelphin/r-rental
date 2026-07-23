import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TableSkeleton } from '@/components/ui/loading'
import { EmptyState } from '@/components/ui/empty-state'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import { FileText, Search, Plus, Calendar, DollarSign, Download, ArrowUpRight, CheckCircle, Clock } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { formatPrice } from '@/lib/utils'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import toast from 'react-hot-toast'

interface Contract {
    id: string
    booking_id: string
    tenant_id: string
    owner_id: string
    property_id: string
    start_date: string
    end_date: string
    monthly_rent: number
    deposit_amount: number
    status: 'active' | 'expired' | 'terminated'
    document_url: string | null
    created_at: string
    property?: { title: string; district: string; province: string; price: number; deposit: number }
    tenant?: { full_name: string; email: string }
    owner?: { full_name: string; email: string }
}

interface ApprovedBooking {
    id: string
    property_id: string
    tenant_id: string
    owner_id: string
    property?: { title: string; price: number; deposit: number }
    tenant?: { full_name: string }
}

export function ContractsPage() {
    const { t } = useTranslation()
    const { user, profile } = useAuth()
    const [loading, setLoading] = useState(true)
    const [contracts, setContracts] = useState<Contract[]>([])
    const [approvedBookings, setApprovedBookings] = useState<ApprovedBooking[]>([])
    const [search, setSearch] = useState('')
    const [isGenerateOpen, setIsGenerateOpen] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    // Contract Generation Form fields
    const [selectedBookingId, setSelectedBookingId] = useState('')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [monthlyRent, setMonthlyRent] = useState('')
    const [depositAmount, setDepositAmount] = useState('')

    const fetchContracts = useCallback(async () => {
        setLoading(true)
        try {
            let query = supabase
                .from('contracts')
                .select('*, property:properties(title, district, province), tenant:profiles!tenant_id(full_name, email), owner:profiles!owner_id(full_name, email)')
                .order('created_at', { ascending: false })

            if (profile?.role === 'tenant') {
                query = query.eq('tenant_id', user!.id)
            } else if (profile?.role === 'owner' || profile?.role === 'agent') {
                query = query.eq('owner_id', user!.id)
            }

            const { data, error } = await query
            if (error) throw error
            setContracts((data || []) as unknown as Contract[])
        } catch (err) {
            console.error(err)
            setContracts([])
        } finally {
            setLoading(false)
        }
    }, [user, profile])

    const fetchApprovedBookingsWithoutContract = useCallback(async () => {
        try {
            const { data: bookingsData, error } = await supabase
                .from('bookings')
                .select('id, property_id, tenant_id, owner_id, property:properties(title, price, deposit), tenant:profiles!tenant_id(full_name)')
                .eq('owner_id', user!.id)
                .in('status', ['approved', 'completed'])

            if (error) throw error

            const { data: existingContracts } = await supabase
                .from('contracts')
                .select('booking_id')

            const contractBookingIds = new Set((existingContracts || []).map((c: any) => c.booking_id))
            const needContract = (bookingsData || []).filter((b: any) => !contractBookingIds.has(b.id))
            setApprovedBookings(needContract as unknown as ApprovedBooking[])
        } catch (err) {
            console.error('Failed to load approved bookings:', err)
        }
    }, [user])

    useEffect(() => {
        if (user) {
            fetchContracts()
            if (profile?.role === 'owner' || profile?.role === 'agent') {
                fetchApprovedBookingsWithoutContract()
            }
        }
    }, [fetchContracts, fetchApprovedBookingsWithoutContract, user, profile])

    const handleBookingChange = (bookingId: string) => {
        setSelectedBookingId(bookingId)
        const booking = approvedBookings.find(b => b.id === bookingId)
        if (booking?.property) {
            setMonthlyRent(String(booking.property.price))
            setDepositAmount(String(booking.property.deposit || 0))
        } else {
            setMonthlyRent('')
            setDepositAmount('')
        }
    }

    const handleGenerateContract = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedBookingId || !startDate || !endDate || !monthlyRent || !depositAmount) {
            toast.error(t('please_fill_all_fields'))
            return
        }
        const booking = approvedBookings.find(b => b.id === selectedBookingId)
        if (!booking) return

        setSubmitting(true)
        try {
            const { error } = await supabase.from('contracts').insert({
                booking_id: selectedBookingId,
                tenant_id: booking.tenant_id,
                owner_id: user!.id,
                property_id: booking.property_id,
                start_date: startDate,
                end_date: endDate,
                monthly_rent: Number(monthlyRent),
                deposit_amount: Number(depositAmount),
                status: 'active',
                document_url: null,
            } as never)

            if (error) throw error
            toast.success(t('contract_generated'))
            setIsGenerateOpen(false)
            setSelectedBookingId('')
            setStartDate('')
            setEndDate('')
            setMonthlyRent('')
            setDepositAmount('')
            fetchContracts()
            fetchApprovedBookingsWithoutContract()
        } catch {
            toast.error(t('failed_to_generate_contract'))
        } finally {
            setSubmitting(false)
        }
    }

    const terminateContract = async (id: string) => {
        if (!confirm(t('terminate_contract_confirm'))) return
        try {
            const { error } = await supabase
                .from('contracts')
                .update({ status: 'terminated' } as never)
                .eq('id', id)
            if (error) throw error
            toast.success(t('contract_terminated'))
            setContracts(prev => prev.map(c => c.id === id ? { ...c, status: 'terminated' } : c))
        } catch {
            toast.error(t('failed_to_terminate_contract'))
        }
    }

    const handleDownloadPdf = (contract: Contract) => {
        try {
            const doc = new jsPDF()

            // Header
            doc.setFontSize(22)
            doc.setTextColor(30, 58, 138) // dark blue
            doc.text('Rwanda EasyRent', 105, 20, { align: 'center' })

            doc.setFontSize(16)
            doc.setTextColor(0, 0, 0)
            doc.text('Rental Lease Agreement', 105, 30, { align: 'center' })

            doc.setFontSize(10)
            doc.setTextColor(100, 100, 100)
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 38, { align: 'center' })
            doc.text(`Contract ID: ${contract.id}`, 105, 43, { align: 'center' })

            // Property Info
            doc.setFontSize(14)
            doc.setTextColor(0, 0, 0)
            doc.text('Property Details', 14, 55)

            doc.setFontSize(12)
            doc.setTextColor(50, 50, 50)
            doc.text(`Title: ${contract.property?.title || 'N/A'}`, 14, 63)
            doc.text(`Location: ${contract.property?.district}, ${contract.property?.province}`, 14, 70)

            // Parties
            doc.setFontSize(14)
            doc.setTextColor(0, 0, 0)
            doc.text('Parties', 14, 85)

            doc.setFontSize(12)
            doc.setTextColor(50, 50, 50)
            doc.text(`Landlord: ${contract.owner?.full_name} (${contract.owner?.email})`, 14, 93)
            doc.text(`Tenant: ${contract.tenant?.full_name} (${contract.tenant?.email})`, 14, 100)

            // Terms Table
            doc.setFontSize(14)
            doc.setTextColor(0, 0, 0)
            doc.text('Terms of Agreement', 14, 115)

            const tableData = [
                ['Start Date', new Date(contract.start_date).toLocaleDateString()],
                ['End Date', new Date(contract.end_date).toLocaleDateString()],
                ['Monthly Rent', formatPrice(contract.monthly_rent)],
                ['Security Deposit', formatPrice(contract.deposit_amount)],
                ['Status', contract.status.toUpperCase()]
            ];

            (doc as any).autoTable({
                startY: 122,
                head: [['Term', 'Detail']],
                body: tableData,
                theme: 'grid',
                headStyles: { fillColor: [30, 58, 138] },
                styles: { fontSize: 11, cellPadding: 5 }
            })

            // Signatures
            const finalY = (doc as any).lastAutoTable.finalY || 160

            doc.setFontSize(10)
            doc.setTextColor(100, 100, 100)
            doc.text('By signing below, both parties agree to the terms outlined in this agreement.', 14, finalY + 15)

            doc.setFontSize(12)
            doc.setTextColor(0, 0, 0)
            doc.text('Landlord Signature: _______________________', 14, finalY + 40)
            doc.text('Date: ____________', 140, finalY + 40)

            doc.text('Tenant Signature: _______________________', 14, finalY + 60)
            doc.text('Date: ____________', 140, finalY + 60)

            doc.save(`lease-agreement-${contract.id.substring(0, 8)}.pdf`)
            toast.success(t('download_started') || 'Download started')
        } catch (error) {
            console.error('Failed to generate PDF:', error)
            toast.error('Failed to generate PDF contract')
        }
    }

    const filtered = contracts.filter(c =>
        !search ||
        c.property?.title.toLowerCase().includes(search.toLowerCase()) ||
        c.tenant?.full_name.toLowerCase().includes(search.toLowerCase()) ||
        c.owner?.full_name.toLowerCase().includes(search.toLowerCase())
    )

    const isOwner = profile?.role === 'owner' || profile?.role === 'agent'

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('rental_contracts')}</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('manage_your_lease_agreements')}</p>
                </div>

                {isOwner && approvedBookings.length > 0 && (
                    <Dialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="cursor-pointer">
                                <Plus className="h-4 w-4 mr-1" /> {t('create_contract')}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>{t('generate_new_contract')}</DialogTitle>
                                <DialogDescription>{t('generate_contract_subtitle')}</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleGenerateContract} className="space-y-4 pt-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('booking')}</label>
                                    <select
                                        value={selectedBookingId}
                                        onChange={e => handleBookingChange(e.target.value)}
                                        required
                                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white p-2.5 text-sm dark:bg-gray-800 dark:text-gray-100"
                                    >
                                        <option value="">{t('select_booking')}</option>
                                        {approvedBookings.map(b => (
                                            <option key={b.id} value={b.id}>
                                                {b.property?.title} ({b.tenant?.full_name})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('start_date')}</label>
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={e => setStartDate(e.target.value)}
                                            required
                                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white p-2.5 text-sm dark:bg-gray-800 dark:text-gray-100"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('end_date')}</label>
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={e => setEndDate(e.target.value)}
                                            required
                                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white p-2.5 text-sm dark:bg-gray-800 dark:text-gray-100"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('monthly_rent')}</label>
                                        <input
                                            type="number"
                                            value={monthlyRent}
                                            onChange={e => setMonthlyRent(e.target.value)}
                                            required
                                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white p-2.5 text-sm dark:bg-gray-800 dark:text-gray-100"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('deposit_rwf')}</label>
                                        <input
                                            type="number"
                                            value={depositAmount}
                                            onChange={e => setDepositAmount(e.target.value)}
                                            required
                                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white p-2.5 text-sm dark:bg-gray-800 dark:text-gray-100"
                                        />
                                    </div>
                                </div>
                                <DialogFooter className="pt-2">
                                    <Button type="button" variant="outline" onClick={() => setIsGenerateOpen(false)}>{t('cancel')}</Button>
                                    <Button type="submit" disabled={submitting}>{submitting ? t('generating') : t('create')}</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder={t('search_contracts')}
                    className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                />
            </div>

            {loading ? (
                <TableSkeleton rows={2} />
            ) : filtered.length === 0 ? (
                <EmptyState icon={FileText} title={t('no_contracts')} description={t('no_contracts_description')} />
            ) : (
                <div className="grid gap-6 md:grid-cols-2">
                    {filtered.map(contract => (
                        <Card key={contract.id} className="hover:shadow-md transition-shadow relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4">
                                <Badge variant={contract.status === 'active' ? 'success' : contract.status === 'expired' ? 'secondary' : 'danger'}>
                                    {t(contract.status)}
                                </Badge>
                            </div>
                            <CardContent className="p-6 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-900/20">
                                        <FileText className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate max-w-[200px]">
                                            {contract.property?.title}
                                        </h3>
                                        <p className="text-xs text-gray-500">{t('lease_agreement')}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 border-t dark:border-gray-700 pt-4 text-sm">
                                    <div>
                                        <p className="text-gray-400 text-xs">{t('start_date')}</p>
                                        <p className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-1.5 mt-0.5">
                                            <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                            {new Date(contract.start_date).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-xs">{t('end_date')}</p>
                                        <p className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-1.5 mt-0.5">
                                            <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                            {new Date(contract.end_date).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-xs">{t('monthly_rent')}</p>
                                        <p className="font-semibold text-primary-600 mt-0.5">
                                            {formatPrice(contract.monthly_rent)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-xs">{t('deposit')}</p>
                                        <p className="font-semibold text-primary-600 mt-0.5">
                                            {formatPrice(contract.deposit_amount)}
                                        </p>
                                    </div>
                                </div>

                                <div className="border-t dark:border-gray-700 pt-4 text-xs space-y-1.5">
                                    <p className="text-gray-500">
                                        <span className="font-medium text-gray-700 dark:text-gray-300">{t('tenant')}:</span> {contract.tenant?.full_name} ({contract.tenant?.email})
                                    </p>
                                    <p className="text-gray-500">
                                        <span className="font-medium text-gray-700 dark:text-gray-300">{t('owner')}:</span> {contract.owner?.full_name} ({contract.owner?.email})
                                    </p>
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <Button variant="outline" size="sm" className="flex-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800" onClick={() => handleDownloadPdf(contract)}>
                                        <Download className="h-4 w-4 mr-1.5" />
                                        {t('download_pdf')}
                                    </Button>
                                    {isOwner && contract.status === 'active' && (
                                        <Button variant="outline" size="sm" className="text-red-500 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/20" onClick={() => terminateContract(contract.id)}>
                                            {t('terminate')}
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
