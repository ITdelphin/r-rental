import { useState, useRef, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/hooks/useAuth'
import { profileApi } from '@/lib/api'
import { sendAccountNotification } from '@/lib/email'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CardSkeleton } from '@/components/ui/loading'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Camera, Save, Key, Trash2, Loader2, AlertTriangle, Upload, User, Shield, Bell, Palette, Settings, Sun, Moon, Monitor, Building, Image, RefreshCw, X, Eye, Globe, AlertCircle, Check, Languages } from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

type Tab = 'profile' | 'security' | 'notifications' | 'appearance' | 'system'

const TABS: { key: Tab; labelKey: string; icon: typeof User; roles?: string[] }[] = [
  { key: 'profile', labelKey: 'profile', icon: User },
  { key: 'security', labelKey: 'security', icon: Shield },
  { key: 'notifications', labelKey: 'notifications', icon: Bell },
  { key: 'appearance', labelKey: 'appearance', icon: Palette },
  { key: 'system', labelKey: 'system', icon: Settings, roles: ['super_admin'] },
]

function InputField({ label, value, onChange, type = 'text', placeholder, error }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; error?: string
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-lg border bg-white px-3 py-2 text-sm dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 outline-none ${error ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'
          }`}
      />
      {error && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{error}</p>}
    </div>
  )
}

function SectionCard({ title, description, icon: Icon, children }: { title: string; description?: string; icon: typeof User; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/30">
            <Icon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-5">{children}</CardContent>
    </Card>
  )
}

function ProfileTab() {
  const { t } = useTranslation()
  const { profile, user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [localAvatar, setLocalAvatar] = useState<string | undefined>(undefined)
  const [dragOver, setDragOver] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    national_id: profile?.national_id || '',
    province: profile?.province || '',
    district: profile?.district || '',
    sector: profile?.sector || '',
    cell: profile?.cell || '',
    village: profile?.village || '',
    address: profile?.address || '',
    bio: profile?.bio || '',
  })

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        national_id: profile.national_id || '',
        province: profile.province || '',
        district: profile.district || '',
        sector: profile.sector || '',
        cell: profile.cell || '',
        village: profile.village || '',
        address: profile.address || '',
        bio: profile.bio || '',
      })
    }
  }, [profile])

  const uploadAvatar = useCallback(async (file: File) => {
    if (!user) return
    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const filePath = `u/${user.id}/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true })
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath)
      await profileApi.update(user.id, { avatar_url: publicUrl } as never)
      setLocalAvatar(publicUrl ?? undefined)
      toast.success(t('profile_updated'))
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t('upload_failed'))
    } finally {
      setUploading(false)
    }
  }, [user, t])

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setAvatarPreview(URL.createObjectURL(file))
    await uploadAvatar(file)
    setAvatarPreview(null)
  }

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (!file || !file.type.startsWith('image/')) {
      toast.error(t('upload_failed'))
      return
    }
    setAvatarPreview(URL.createObjectURL(file))
    await uploadAvatar(file)
    setAvatarPreview(null)
  }, [uploadAvatar, t])

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragOver(true) }
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setDragOver(false) }

  const handleProfileUpdate = async () => {
    if (!user) return
    setSaving(true)
    try {
      await profileApi.update(user.id, form as never)
      toast.success(t('profile_updated'))
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t('update_failed'))
    } finally {
      setSaving(false)
    }
  }

  if (!profile) return null

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <SectionCard title={t('profile_information')} description={t('profile_info_description')} icon={User}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('full_name')}</label>
              <input type="text" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('email')}</label>
              <input type="email" value={profile.email} disabled className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('phone')}</label>
              <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('national_id')}</label>
              <input type="text" value={form.national_id} onChange={(e) => setForm({ ...form, national_id: e.target.value })} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('province')}</label>
              <input type="text" value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('district')}</label>
              <input type="text" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('sector')}</label>
              <input type="text" value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('cell')}</label>
              <input type="text" value={form.cell} onChange={(e) => setForm({ ...form, cell: e.target.value })} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('village')}</label>
              <input type="text" value={form.village} onChange={(e) => setForm({ ...form, village: e.target.value })} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('address')}</label>
              <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100" />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('bio')}</label>
            <textarea rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100" />
          </div>
          <Button className="mt-4" onClick={handleProfileUpdate} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {t('save_changes')}
          </Button>
        </SectionCard>
      </div>

      <div className="space-y-6">
        <SectionCard title={t('profile_photo')} description={t('profile_photo_description')} icon={Camera}>
          <div className="flex flex-col items-center gap-4">
            <div onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave} className="relative">
              <Avatar className={cn('h-24 w-24 ring-2 transition-shadow', dragOver ? 'ring-primary-500 shadow-lg shadow-primary-200 dark:shadow-primary-900' : 'ring-transparent')}>
                {(avatarPreview ?? localAvatar ?? profile.avatar_url) ? <AvatarImage src={avatarPreview ?? localAvatar ?? profile.avatar_url ?? undefined} /> : null}
                <AvatarFallback className="text-2xl">{profile.full_name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                </div>
              )}
              <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-white shadow hover:bg-primary-700 disabled:opacity-50 cursor-pointer">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </div>
            <p className="text-xs text-gray-500">{t('click_to_change_photo')}</p>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Upload className="h-3 w-3" />
              <span>{t('or_drag_drop') || 'or drag & drop'}</span>
            </div>
            <div className="w-full border-t pt-4 dark:border-gray-700 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">{t('account_type')}</span>
                <span className="font-medium capitalize text-gray-900 dark:text-gray-100">{profile.role}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">{t('member_since')}</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{new Date(profile.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">{t('verified')}</span>
                <span className={`font-medium ${profile.is_verified ? 'text-green-600' : 'text-gray-400'}`}>{profile.is_verified ? t('yes') : t('no')}</span>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  )
}

function SecurityTab() {
  const { t } = useTranslation()
  const { profile, user } = useAuth()

  const [passwordForm, setPasswordForm] = useState({ current_password: '', new_password: '', confirm_password: '' })
  const [sendingReset, setSendingReset] = useState(false)

  const handlePasswordChange = async () => {
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error(t('passwords_do_not_match'))
      return
    }
    if (passwordForm.new_password.length < 6) {
      toast.error(t('password_too_short'))
      return
    }
    try {
      const { error } = await supabase.auth.updateUser({ password: passwordForm.new_password })
      if (error) throw error
      toast.success(t('password_updated'))
      if (user) sendAccountNotification(user.id, 'password_changed')
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' })
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t('password_update_failed'))
    }
  }

  const handleForgotPassword = async () => {
    if (!profile?.email) return
    setSendingReset(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(profile.email, {
        redirectTo: 'https://rwanda-easyrent.vercel.app/auth/forgot-password',
      })
      if (error) throw error
      toast.success(t('reset_link_sent') || 'Password reset link sent to your email!')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t('password_update_failed'))
    } finally {
      setSendingReset(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!window.confirm(t('delete_account_confirm'))) return
    try {
      if (user) {
        sendAccountNotification(user.id, 'account_deleted')
        await supabase.from('profiles').delete().eq('user_id', user.id)
        await supabase.auth.signOut()
        window.location.href = '/'
      }
    } catch {
      toast.error(t('delete_failed'))
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <SectionCard title={t('change_password')} description={t('password_description')} icon={Key}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('current_password')}</label>
            <input type="password" value={passwordForm.current_password} onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100" />
            <button type="button" onClick={handleForgotPassword} disabled={sendingReset} className="mt-1 text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 cursor-pointer">
              {sendingReset ? t('sending') : t('forgot_password')}
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('new_password')}</label>
              <input type="password" value={passwordForm.new_password} onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('confirm_password')}</label>
              <input type="password" value={passwordForm.confirm_password} onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100" />
            </div>
          </div>
          <Button onClick={handlePasswordChange}>
            <Key className="h-4 w-4 mr-2" /> {t('update_password')}
          </Button>
        </div>
      </SectionCard>

      <SectionCard title={t('danger_zone')} description={t('danger_zone_description')} icon={AlertTriangle}>
        <div className="space-y-4">
          <p className="text-sm text-gray-500">{t('delete_account_confirm')}</p>
          <Button variant="outline" className="w-full text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={handleDeleteAccount}>
            <Trash2 className="h-4 w-4 mr-2" /> {t('delete_account')}
          </Button>
        </div>
      </SectionCard>
    </div>
  )
}

function NotificationsTab() {
  const { t } = useTranslation()

  return (
    <SectionCard title={t('notification_preferences')} description={t('notification_preferences_description')} icon={Bell}>
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Bell className="h-12 w-12 text-gray-300 mb-4" />
        <p className="text-sm text-gray-500">{t('notification_settings_description')}</p>
        <p className="text-xs text-gray-400 mt-2">{t('email_notifications_desc')}</p>
      </div>
    </SectionCard>
  )
}

function AppearanceTab() {
  const { t } = useTranslation()

  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => {
    const saved = localStorage.getItem('theme')
    if (saved === 'dark' || saved === 'light') return saved
    return 'system'
  })

  const applyTheme = (mode: 'light' | 'dark' | 'system') => {
    setTheme(mode)
    if (mode === 'system') {
      localStorage.removeItem('theme')
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      document.documentElement.classList.toggle('dark', prefersDark)
    } else {
      localStorage.setItem('theme', mode)
      document.documentElement.classList.toggle('dark', mode === 'dark')
    }
  }

  const options: { value: 'light' | 'dark' | 'system'; icon: typeof Sun; labelKey: string }[] = [
    { value: 'light', icon: Sun, labelKey: 'light_mode' },
    { value: 'dark', icon: Moon, labelKey: 'dark_mode' },
    { value: 'system', icon: Monitor, labelKey: 'system_mode' },
  ]

  return (
    <SectionCard title={t('appearance_settings')} description={t('appearance_description')} icon={Palette}>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{t('theme_mode')}</label>
        <div className="grid grid-cols-3 gap-3">
          {options.map(opt => {
            const Icon = opt.icon
            const isActive = theme === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => applyTheme(opt.value)}
                className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors cursor-pointer ${isActive
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                  : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
              >
                <Icon className={`h-6 w-6 ${isActive ? 'text-primary-600' : ''}`} />
                <span className="text-sm font-medium">{t(opt.labelKey)}</span>
                {isActive && <Check className="h-4 w-4 text-primary-600" />}
              </button>
            )
          })}
        </div>
      </div>
    </SectionCard>
  )
}

type SystemSection = 'general' | 'branding' | 'localization'

const SYSTEM_TABS: { key: SystemSection; labelKey: string; icon: typeof Building }[] = [
  { key: 'general', labelKey: 'general_settings', icon: Building },
  { key: 'branding', labelKey: 'branding', icon: Image },
  { key: 'localization', labelKey: 'localization', icon: Languages },
]

function UploadZone({ label, accept, currentUrl, onUpload, onRemove, uploading, uploadLabel }: {
  label: string; accept: string; currentUrl: string; onUpload: (file: File) => void; onRemove: () => void; uploading: boolean; uploadLabel: string
}) {
  const { t } = useTranslation()
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) onUpload(file)
  }, [onUpload])

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      {currentUrl ? (
        <div className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-3">
          {accept.startsWith('image') ? (
            <img src={currentUrl} alt="" className="h-12 w-auto rounded object-contain" />
          ) : (
            <div className="flex h-12 w-16 items-center justify-center rounded bg-gray-200 dark:bg-gray-700 text-gray-400"><Image className="h-5 w-5" /></div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{currentUrl.split('/').pop()}</p>
            <p className="text-xs text-gray-500 truncate">{currentUrl}</p>
          </div>
          <button onClick={onRemove} className="shrink-0 rounded p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"><X className="h-4 w-4" /></button>
        </div>
      ) : (
        <div onDragOver={e => { e.preventDefault(); setDragOver(true) }} onDragLeave={() => setDragOver(false)} onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 transition-colors ${dragOver ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-primary-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
            }`}
        >
          <div className={`rounded-full p-2.5 ${dragOver ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-400 dark:bg-gray-800'}`}>
            <Upload className="h-5 w-5" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{uploadLabel}</p>
            <p className="text-xs text-gray-500 mt-0.5">{t('click_or_drag_to_upload', 'Click or drag to upload')}</p>
          </div>
          <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) onUpload(f) }} />
        </div>
      )}
      {uploading && <div className="flex items-center gap-2 text-sm text-primary-600"><Loader2 className="h-4 w-4 animate-spin" /> {t('uploading', 'Uploading...')}</div>}
    </div>
  )
}

function SystemTab() {
  const { t, i18n } = useTranslation()
  const [section, setSection] = useState<SystemSection>('general')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  const [supportEmail, setSupportEmail] = useState('delphinngarambe@gmail.com')
  const [phoneNumber, setPhoneNumber] = useState('0782680268')
  const [address, setAddress] = useState('Gisenyi, Rwanda')
  const [generalDirty, setGeneralDirty] = useState(false)
  const [generalErrors, setGeneralErrors] = useState<Record<string, string>>({})

  const [heroBgUrl, setHeroBgUrl] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [faviconUrl, setFaviconUrl] = useState('')
  const [uploading, setUploading] = useState<string | null>(null)

  const [defaultLanguage, setDefaultLanguage] = useState('en')
  const [baseCurrency, setBaseCurrency] = useState('RWF')
  const [localizationDirty, setLocalizationDirty] = useState(false)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await supabase.from('settings').select('key, value') as { data: { key: string; value: string }[] | null }
      if (data) {
        const map: Record<string, string> = {}
        for (const row of data) map[row.key] = row.value
        if (map.support_email) setSupportEmail(map.support_email)
        if (map.phone_number) setPhoneNumber(map.phone_number)
        if (map.address) setAddress(map.address)
        if (map.hero_background) setHeroBgUrl(map.hero_background)
        if (map.logo_url) setLogoUrl(map.logo_url)
        if (map.favicon_url) setFaviconUrl(map.favicon_url)
        if (map.default_language) setDefaultLanguage(map.default_language)
        if (map.base_currency) setBaseCurrency(map.base_currency)
      }
    } catch { toast.error(t('failed_to_load_settings')) }
    setLoading(false)
  }, [t])

  useEffect(() => { fetchAll() }, [fetchAll])

  const upsertSetting = async (key: string, value: string) => {
    const { error } = await supabase.from('settings').upsert({ key, value } as never, { onConflict: 'key' })
    if (error) throw error
  }

  const saveGeneral = async () => {
    const errors: Record<string, string> = {}
    if (!supportEmail.trim()) errors.supportEmail = t('required')
    setGeneralErrors(errors)
    if (Object.keys(errors).length > 0) return
    setSaving('general')
    try {
      const keys = ['support_email', 'phone_number', 'address']
      const values = { support_email: supportEmail.trim(), phone_number: phoneNumber.trim(), address: address.trim() }
      for (const key of keys) await upsertSetting(key, values[key as keyof typeof values])
      toast.success(t('settings_saved'))
      setGeneralDirty(false)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t('failed_to_save'))
    }
    setSaving(null)
  }

  const saveLocalization = async () => {
    setSaving('localization')
    try {
      await upsertSetting('default_language', defaultLanguage)
      await upsertSetting('base_currency', baseCurrency)
      toast.success(t('settings_saved'))
      setLocalizationDirty(false)
      await i18n.changeLanguage(defaultLanguage)
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : t('failed_to_save')) }
    setSaving(null)
  }

  const uploadMedia = async (file: File, folder: string): Promise<string | null> => {
    const ext = file.name.split('.').pop()
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error: uploadError } = await supabase.storage.from('cms').upload(path, file)
    if (uploadError) { toast.error(`${t('upload_failed')}: ${uploadError.message}`); return null }
    const { data: { publicUrl } } = supabase.storage.from('cms').getPublicUrl(path)
    return publicUrl
  }

  const handleUpload = (field: string, folder: string, setter: (v: string) => void) => async (file: File) => {
    setUploading(field)
    try {
      const url = await uploadMedia(file, folder)
      if (url) { setter(url); await upsertSetting(field, url); toast.success(`${t('uploaded')} ${t('successfully')}`) }
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : t('upload_failed')) }
    setUploading(null)
  }

  if (loading) return (
    <div className="space-y-6">
      <CardSkeleton />
      <CardSkeleton />
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{t('system_settings_description')}</p>
        <Button variant="outline" size="sm" onClick={fetchAll}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {t('refresh')}
        </Button>
      </div>

      <div className="flex gap-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-1">
        {SYSTEM_TABS.map(tab => (
          <button key={tab.key} onClick={() => setSection(tab.key)}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${section === tab.key
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
          >
            <tab.icon className="h-4 w-4" />
            {t(tab.labelKey)}
          </button>
        ))}
      </div>

      {section === 'general' && (
        <SectionCard title={t('general_settings')} description={t('general_settings_description')} icon={Building}>
          <div className="grid gap-4 sm:grid-cols-2">
            <InputField label={t('support_email')} value={supportEmail} onChange={v => { setSupportEmail(v); setGeneralDirty(true); setGeneralErrors(p => ({ ...p, supportEmail: '' })) }} type="email" placeholder="delphinngarambe@gmail.com" error={generalErrors.supportEmail} />
            <InputField label={t('phone_number')} value={phoneNumber} onChange={v => { setPhoneNumber(v); setGeneralDirty(true) }} type="tel" placeholder="0782680268" />
            <InputField label={t('address')} value={address} onChange={v => { setAddress(v); setGeneralDirty(true) }} placeholder="Gisenyi, Rwanda" />
          </div>
          <div className="mt-6 flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-4">
            <span className="text-xs text-gray-400">{generalDirty ? t('unsaved_changes') : t('all_changes_saved')}</span>
            <Button disabled={saving === 'general'} onClick={saveGeneral}>
              {saving === 'general' ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {t('saving')}...</> : <><Save className="h-4 w-4 mr-2" /> {t('save_changes')}</>}
            </Button>
          </div>
        </SectionCard>
      )}

      {section === 'branding' && (
        <div className="space-y-6">
          <SectionCard title={t('logo_favicon')} description={t('brand_assets_description')} icon={Image}>
            <div className="grid gap-6 sm:grid-cols-2">
              <UploadZone label={t('site_logo')} accept="image/*" currentUrl={logoUrl} onUpload={handleUpload('logo_url', 'logo', setLogoUrl)} onRemove={async () => { setLogoUrl(''); try { await upsertSetting('logo_url', '') } catch { toast.error(t('failed_to_save')) } }} uploading={uploading === 'logo_url'} uploadLabel={t('upload_logo')} />
              <UploadZone label={t('favicon')} accept="image/*" currentUrl={faviconUrl} onUpload={handleUpload('favicon_url', 'favicon', setFaviconUrl)} onRemove={async () => { setFaviconUrl(''); try { await upsertSetting('favicon_url', '') } catch { toast.error(t('failed_to_save')) } }} uploading={uploading === 'favicon_url'} uploadLabel={t('upload_favicon')} />
            </div>
          </SectionCard>
          <SectionCard title={t('hero_section')} description={t('hero_section_description')} icon={Eye}>
            <UploadZone label={t('hero_background')} accept="image/*" currentUrl={heroBgUrl} onUpload={handleUpload('hero_background', 'hero-bg', setHeroBgUrl)} onRemove={async () => { setHeroBgUrl(''); try { await upsertSetting('hero_background', '') } catch { toast.error(t('failed_to_save')) } }} uploading={uploading === 'hero_background'} uploadLabel={t('upload_image')} />
          </SectionCard>
          {(logoUrl || heroBgUrl) && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base"><Globe className="h-4 w-4 text-primary-500" /> {t('preview')}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative aspect-[3/1] overflow-hidden rounded-b-lg bg-gradient-to-r from-primary-600 to-primary-800">
                  {heroBgUrl && <img src={heroBgUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />}
                  <div className="absolute inset-0 bg-black/40" />
                  <div className="relative flex h-full items-center p-6">
                    {logoUrl ? <img src={logoUrl} alt="" className="h-10 w-auto" /> : <img src="/images/easyrentlogo.jpeg" alt="" className="h-10 w-auto rounded" />}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {section === 'localization' && (
        <div className="space-y-6">
          <SectionCard title={t('localization')} description={t('localization_description')} icon={Languages}>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('default_language')}</label>
                <select value={defaultLanguage} onChange={e => { setDefaultLanguage(e.target.value); setLocalizationDirty(true) }}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white px-3 py-2 text-sm dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 outline-none">
                  <option value="en">English</option>
                  <option value="rw">Kinyarwanda</option>
                  <option value="fr">Français</option>
                  <option value="sw">Kiswahili</option>
                </select>
                <p className="mt-1 text-xs text-gray-400">{t('default_language_hint')}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('base_currency')}</label>
                <select value={baseCurrency} onChange={e => { setBaseCurrency(e.target.value); setLocalizationDirty(true) }}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white px-3 py-2 text-sm dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 outline-none">
                  <option value="RWF">RWF — Rwandan Franc</option>
                  <option value="USD">USD — US Dollar</option>
                  <option value="EUR">EUR — Euro</option>
                </select>
                <p className="mt-1 text-xs text-gray-400">{t('base_currency_hint')}</p>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-4">
              <span className="text-xs text-gray-400">{localizationDirty ? t('unsaved_changes') : t('all_changes_saved')}</span>
              <Button disabled={saving === 'localization'} onClick={saveLocalization}>
                {saving === 'localization' ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {t('saving')}...</> : <><Save className="h-4 w-4 mr-2" /> {t('save_changes')}</>}
              </Button>
            </div>
          </SectionCard>
        </div>
      )}
    </div>
  )
}

export function SettingsPage() {
  const { t } = useTranslation()
  const { profile } = useAuth()
  const [tab, setTab] = useState<Tab>('profile')

  const visibleTabs = TABS.filter(tab => !tab.roles || tab.roles.includes(profile?.role || ''))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('settings')}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{t('manage_account')}</p>
      </div>

      <div className="flex gap-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-1 flex-wrap">
        {visibleTabs.map(tabItem => (
          <button
            key={tabItem.key}
            onClick={() => setTab(tabItem.key)}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${tab === tabItem.key
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
          >
            <tabItem.icon className="h-4 w-4" />
            {t(tabItem.labelKey)}
          </button>
        ))}
      </div>

      {tab === 'profile' && <ProfileTab />}
      {tab === 'security' && <SecurityTab />}
      {tab === 'notifications' && <NotificationsTab />}
      {tab === 'appearance' && <AppearanceTab />}
      {tab === 'system' && <SystemTab />}
    </div>
  )
}
