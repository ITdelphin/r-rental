import { useState, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/hooks/useAuth'
import { profileApi } from '@/lib/api'
import { sendAccountNotification } from '@/lib/email'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Camera, Save, Key, Trash2, Loader2, AlertTriangle, Upload } from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

export function AccountSettingsPage() {
  const { t } = useTranslation()
  const { profile, user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [localAvatar, setLocalAvatar] = useState<string | undefined>(undefined)
  const [dragOver, setDragOver] = useState(false)

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

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  })
  const [sendingReset, setSendingReset] = useState(false)

  const uploadAvatar = useCallback(async (file: File) => {
    if (!user) return
    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const filePath = `avatars/${user.id}/${Date.now()}.${ext}`

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

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

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

  if (!profile) return null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('account_settings')}</h1>
        <p className="text-gray-500 dark:text-gray-400">{t('manage_account')}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('profile_information')}</CardTitle>
              <CardDescription>{t('profile_info_description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('bio')}</label>
                <textarea rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100" />
              </div>
              <Button onClick={handleProfileUpdate} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {t('save_changes')}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Key className="h-5 w-5" /> {t('change_password')}</CardTitle>
              <CardDescription>{t('password_description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('current_password')}</label>
                  <input type="password" value={passwordForm.current_password} onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100" />
                  <button type="button" onClick={handleForgotPassword} disabled={sendingReset} className="mt-1 text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 cursor-pointer">
                    {sendingReset ? t('sending') : t('forgot_password')}
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('new_password')}</label>
                  <input type="password" value={passwordForm.new_password} onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('confirm_password')}</label>
                  <input type="password" value={passwordForm.confirm_password} onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100" />
                </div>
              </div>
              <Button onClick={handlePasswordChange} variant="outline">
                <Key className="h-4 w-4" /> {t('update_password')}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('profile_photo')}</CardTitle>
              <CardDescription>{t('profile_photo_description')}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className="relative"
              >
                <Avatar className={cn('h-24 w-24 ring-2 transition-shadow', dragOver ? 'ring-primary-500 shadow-lg shadow-primary-200 dark:shadow-primary-900' : 'ring-transparent')}>
                  {(avatarPreview ?? localAvatar ?? profile.avatar_url) ? <AvatarImage src={avatarPreview ?? localAvatar ?? profile.avatar_url ?? undefined} /> : null}
                  <AvatarFallback className="text-2xl">{profile.full_name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                  </div>
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-white shadow hover:bg-primary-700 disabled:opacity-50 cursor-pointer"
                >
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </div>
              <p className="text-xs text-gray-500">{t('click_to_change_photo')}</p>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Upload className="h-3 w-3" />
                <span>{t('or_drag_drop') || 'or drag & drop'}</span>
              </div>
              <div className="w-full border-t pt-4 dark:border-gray-700">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{t('account_type')}</span>
                  <span className="font-medium capitalize text-gray-900 dark:text-gray-100">{profile.role}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-gray-500">{t('member_since')}</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {new Date(profile.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-gray-500">{t('verified')}</span>
                  <span className={`font-medium ${profile.is_verified ? 'text-green-600' : 'text-gray-400'}`}>
                    {profile.is_verified ? t('yes') : t('no')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200 dark:border-red-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" /> {t('danger_zone')}
              </CardTitle>
              <CardDescription className="text-red-500">{t('danger_zone_description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={handleDeleteAccount}>
                <Trash2 className="h-4 w-4" /> {t('delete_account')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
