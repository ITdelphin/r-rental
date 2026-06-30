import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { ChevronLeft, Building2, Save, Upload, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'

const provinces = ['Kigali', 'Eastern', 'Western', 'Northern', 'Southern']
const propertyTypes = ['House', 'Apartment', 'Villa', 'Studio', 'Commercial', 'Cottage']
const categories = ['Rent', 'Sale', 'Short-term']

const amenityFields = [
    { key: 'parking', label: 'Parking' },
    { key: 'balcony', label: 'Balcony' },
    { key: 'garden', label: 'Garden' },
    { key: 'swimming_pool', label: 'Swimming Pool' },
    { key: 'security', label: 'Security' },
    { key: 'internet', label: 'Internet' },
    { key: 'water', label: 'Water Supply' },
    { key: 'electricity', label: 'Electricity' },
    { key: 'furnished', label: 'Furnished' },
]

export function AddPropertyPage() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { user, profile } = useAuth()
    const [submitting, setSubmitting] = useState(false)
    const [uploadingImages, setUploadingImages] = useState(false)
    const [uploadedImages, setUploadedImages] = useState<string[]>([])

    const [form, setForm] = useState({
        title: '',
        description: '',
        category: 'Rent',
        property_type: 'Apartment',
        bedrooms: 1,
        bathrooms: 1,
        kitchen: 1,
        price: '',
        deposit: '',
        province: 'Kigali',
        district: '',
        sector: '',
        cell: '',
        village: '',
        latitude: '',
        longitude: '',
        parking: false,
        balcony: false,
        garden: false,
        swimming_pool: false,
        security: true,
        internet: true,
        water: true,
        electricity: true,
        furnished: false,
    })

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        if (!files.length || !user) return
        setUploadingImages(true)
        const urls: string[] = []
        try {
            for (const file of files) {
                const ext = file.name.split('.').pop()
                const path = `properties/${user.id}-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
                const { error: uploadError } = await supabase.storage.from('property-images').upload(path, file)
                if (uploadError) throw uploadError
                const { data: { publicUrl } } = supabase.storage.from('property-images').getPublicUrl(path)
                urls.push(publicUrl)
            }
            setUploadedImages(prev => [...prev, ...urls])
            toast.success(`${urls.length} image(s) uploaded`)
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Upload failed')
        } finally {
            setUploadingImages(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user || !profile) return
        if (!form.title || !form.price || !form.district) {
            toast.error('Please fill in all required fields')
            return
        }

        setSubmitting(true)
        try {
            const propertyData = {
                owner_id: profile.id || user.id,
                title: form.title,
                description: form.description,
                category: form.category,
                property_type: form.property_type,
                bedrooms: form.bedrooms,
                bathrooms: form.bathrooms,
                kitchen: form.kitchen,
                price: parseInt(form.price),
                deposit: form.deposit ? parseInt(form.deposit) : null,
                province: form.province,
                district: form.district,
                sector: form.sector,
                cell: form.cell,
                village: form.village,
                latitude: form.latitude ? parseFloat(form.latitude) : null,
                longitude: form.longitude ? parseFloat(form.longitude) : null,
                parking: form.parking,
                balcony: form.balcony,
                garden: form.garden,
                swimming_pool: form.swimming_pool,
                security: form.security,
                internet: form.internet,
                water: form.water,
                electricity: form.electricity,
                furnished: form.furnished,
                status: 'pending_approval',
                is_featured: false,
                views_count: 0,
            }

            const { data, error } = await supabase.from('properties').insert(propertyData as never).select().single()
            if (error) throw error

            // Save images
            if (uploadedImages.length > 0 && data) {
                const insertedProperty = data as { id: string }
                const imageRows = uploadedImages.map((url, i) => ({
                    property_id: insertedProperty.id,
                    url,
                    is_floor_plan: false,
                    sort_order: i,
                }))
                await supabase.from('property_images').insert(imageRows as never)
            }

            toast.success('Property submitted for approval!')
            navigate('/dashboard/properties')
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Failed to submit property')
        } finally {
            setSubmitting(false)
        }
    }

    const toggle = (key: string) => setForm(prev => ({ ...prev, [key]: !(prev as Record<string, unknown>)[key] }))

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
                    <ChevronLeft className="h-5 w-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('add_property')}</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('list_your_property')}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5" /> Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Property Title *</label>
                            <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Modern 2BR Apartment in Kicukiro" required />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                            <textarea
                                value={form.description}
                                onChange={e => setForm({ ...form, description: e.target.value })}
                                rows={4}
                                placeholder="Describe your property..."
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Category *</label>
                                <Select
                                    value={form.category}
                                    onChange={e => setForm({ ...form, category: e.target.value })}
                                    options={categories.map(c => ({ value: c, label: c }))}
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Property Type *</label>
                                <Select
                                    value={form.property_type}
                                    onChange={e => setForm({ ...form, property_type: e.target.value })}
                                    options={propertyTypes.map(pt => ({ value: pt, label: pt }))}
                                />
                            </div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-3">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Bedrooms</label>
                                <Input type="number" min={0} max={20} value={form.bedrooms} onChange={e => setForm({ ...form, bedrooms: parseInt(e.target.value) || 0 })} />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Bathrooms</label>
                                <Input type="number" min={0} max={20} value={form.bathrooms} onChange={e => setForm({ ...form, bathrooms: parseInt(e.target.value) || 0 })} />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Kitchens</label>
                                <Input type="number" min={0} max={10} value={form.kitchen} onChange={e => setForm({ ...form, kitchen: parseInt(e.target.value) || 0 })} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Pricing */}
                <Card>
                    <CardHeader>
                        <CardTitle>Pricing</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Price (RWF/month) *</label>
                            <Input type="number" min={0} value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="e.g. 250000" required />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Deposit (RWF)</label>
                            <Input type="number" min={0} value={form.deposit} onChange={e => setForm({ ...form, deposit: e.target.value })} placeholder="e.g. 50000" />
                        </div>
                    </CardContent>
                </Card>

                {/* Location */}
                <Card>
                    <CardHeader>
                        <CardTitle>Location</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Province *</label>
                                <Select
                                    value={form.province}
                                    onChange={e => setForm({ ...form, province: e.target.value })}
                                    options={provinces.map(p => ({ value: p, label: p }))}
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">District *</label>
                                <Input value={form.district} onChange={e => setForm({ ...form, district: e.target.value })} placeholder="e.g. Kicukiro" required />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Sector</label>
                                <Input value={form.sector} onChange={e => setForm({ ...form, sector: e.target.value })} placeholder="e.g. Gatenga" />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Cell</label>
                                <Input value={form.cell} onChange={e => setForm({ ...form, cell: e.target.value })} placeholder="e.g. Gatenga" />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Village</label>
                                <Input value={form.village} onChange={e => setForm({ ...form, village: e.target.value })} placeholder="e.g. Gatenga Center" />
                            </div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Latitude (optional)</label>
                                <Input value={form.latitude} onChange={e => setForm({ ...form, latitude: e.target.value })} placeholder="e.g. -1.9541" />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Longitude (optional)</label>
                                <Input value={form.longitude} onChange={e => setForm({ ...form, longitude: e.target.value })} placeholder="e.g. 30.0588" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Amenities */}
                <Card>
                    <CardHeader>
                        <CardTitle>Amenities & Features</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                            {amenityFields.map(({ key, label }) => {
                                const isOn = (form as Record<string, unknown>)[key] as boolean
                                return (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => toggle(key)}
                                        className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition-colors cursor-pointer ${isOn
                                            ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 dark:border-primary-600'
                                            : 'border-gray-300 text-gray-600 hover:border-gray-400 dark:border-gray-600 dark:text-gray-400'
                                            }`}
                                    >
                                        {isOn && <Check className="h-4 w-4" />}
                                        {label}
                                    </button>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Images */}
                <Card>
                    <CardHeader>
                        <CardTitle>Property Images</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <label className="flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed border-gray-300 p-8 hover:border-primary-400 dark:border-gray-600 dark:hover:border-primary-500 transition-colors">
                            <Upload className="h-8 w-8 text-gray-400" />
                            <div className="text-center">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {uploadingImages ? 'Uploading...' : 'Click to upload images'}
                                </p>
                                <p className="text-xs text-gray-400">PNG, JPG, WEBP up to 10MB each</p>
                            </div>
                            <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImages} />
                        </label>
                        {uploadedImages.length > 0 && (
                            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                                {uploadedImages.map((url, i) => (
                                    <div key={i} className="relative aspect-square overflow-hidden rounded-lg">
                                        <img src={url} alt="" className="h-full w-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => setUploadedImages(prev => prev.filter((_, j) => j !== i))}
                                            className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white text-xs hover:bg-red-600 cursor-pointer"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="flex items-center justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
                    <Button type="submit" disabled={submitting} className="flex items-center gap-2">
                        <Save className="h-4 w-4" />
                        {submitting ? 'Submitting...' : 'Submit for Review'}
                    </Button>
                </div>
            </form>
        </div>
    )
}
