import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TableSkeleton } from '@/components/ui/loading'
import { Search, Shield, UserX, RefreshCw, UserCheck, Trash2, Eye, Phone, MapPin, Calendar, Mail, IdCard, CheckCircle2, XCircle } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { sendAccountNotification } from '@/lib/email'
import { createAuditLog } from '@/lib/audit'
import { useAuth } from '@/hooks/useAuth'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import toast from 'react-hot-toast'
import type { Profile } from '@/types'

const ROLE_COLORS: Record<string, string> = {
  super_admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  admin: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  owner: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  agent: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  tenant: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
}

function UserProfileModal({ user, open, onClose, onSuspend, onVerify, onDelete, onRoleChange, currentUserRole }: {
  user: Profile | null
  open: boolean
  onClose: () => void
  onSuspend: (user: Profile) => void
  onVerify: (user: Profile) => void
  onDelete: (user: Profile) => void
  onRoleChange: (user: Profile, role: string) => void
  currentUserRole: string | undefined
}) {
  const { t } = useTranslation()
  if (!user) return null
  const initials = user.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'
  const location = [user.sector, user.district, user.province].filter(Boolean).join(', ')

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-0 overflow-hidden">
        {/* Header banner */}
        <div className="relative h-24 bg-gradient-to-br from-primary-600 via-primary-500 to-indigo-600">
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }}
          />
        </div>

        {/* Avatar overlapping the banner */}
        <div className="px-6 pb-6">
          <div className="-mt-12 mb-4 flex items-end justify-between">
            <div className="relative">
              <Avatar className="h-24 w-24 ring-4 ring-white dark:ring-gray-900 shadow-xl rounded-2xl">
                <AvatarImage src={user.avatar_url || undefined} alt={user.full_name || ''} className="object-cover rounded-2xl" />
                <AvatarFallback className="rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 text-white text-3xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {user.is_verified && (
                <div className="absolute -bottom-1 -right-1 rounded-full bg-green-500 p-1 ring-2 ring-white dark:ring-gray-900">
                  <CheckCircle2 className="h-3 w-3 text-white" />
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 pt-2">
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${ROLE_COLORS[user.role] || ROLE_COLORS.tenant}`}>
                {user.role.replace('_', ' ')}
              </span>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${user.is_suspended ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                }`}>
                {user.is_suspended ? t('suspended') : t('active')}
              </span>
            </div>
          </div>

          {/* Name & email */}
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{user.full_name || t('unknown')}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            {user.phone && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 col-span-1">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                  <Phone className="h-4 w-4 text-gray-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">{t('phone')}</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200 text-xs">{user.phone}</p>
                </div>
              </div>
            )}
            {location && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                  <MapPin className="h-4 w-4 text-gray-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">{t('location')}</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200 text-xs">{location}</p>
                </div>
              </div>
            )}
            {user.national_id && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                  <IdCard className="h-4 w-4 text-gray-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">{t('national_id')}</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200 text-xs">{user.national_id}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                <Calendar className="h-4 w-4 text-gray-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400">{t('joined')}</p>
                <p className="font-medium text-gray-800 dark:text-gray-200 text-xs">{new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</p>
              </div>
            </div>
          </div>

          {/* Bio */}
          {user.bio && (
            <div className="mb-5 rounded-xl bg-gray-50 dark:bg-gray-800/60 p-3">
              <p className="text-xs text-gray-500 mb-1">{t('bio')}</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{user.bio}</p>
            </div>
          )}

          {/* Role changer */}
          <div className="mb-4 flex items-center gap-3">
            <label className="text-xs font-medium text-gray-500 shrink-0">{t('change_role')}:</label>
            <select
              value={user.role}
              onChange={e => onRoleChange(user, e.target.value)}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="tenant">{t('tenant')}</option>
              <option value="owner">{t('owner')}</option>
              <option value="agent">{t('agent')}</option>
              <option value="admin">{t('admin')}</option>
              {currentUserRole === 'super_admin' && <option value="super_admin">{t('super_admin')}</option>}
            </select>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className={`flex-1 ${user.is_verified ? 'text-gray-600' : 'text-blue-600 border-blue-300'}`}
              onClick={() => onVerify(user)}
            >
              {user.is_verified ? <XCircle className="h-4 w-4 mr-1.5" /> : <Shield className="h-4 w-4 mr-1.5" />}
              {user.is_verified ? t('unverify') : t('verify')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={`flex-1 ${user.is_suspended ? 'text-green-600 border-green-300' : 'text-orange-600 border-orange-300'}`}
              onClick={() => onSuspend(user)}
            >
              {user.is_suspended ? <UserCheck className="h-4 w-4 mr-1.5" /> : <UserX className="h-4 w-4 mr-1.5" />}
              {user.is_suspended ? t('reinstate_user') : t('suspend_user')}
            </Button>
            {currentUserRole === 'super_admin' && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                onClick={() => { onClose(); onDelete(user) }}
              >
                <Trash2 className="h-4 w-4 mr-1.5" />
                {t('delete_user')}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function AdminUsers() {
  const { t } = useTranslation()
  const { profile: currentUser } = useAuth()
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<Profile[]>([])
  const [search, setSearch] = useState('')

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      setUsers((data || []) as unknown as Profile[])
    } catch {
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const toggleSuspend = async (user: Profile) => {
    const newSuspended = !user.is_suspended
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_suspended: newSuspended } as never)
        .eq('user_id', user.user_id)
      if (error) throw error
      toast.success(newSuspended ? t('user_suspended') : t('user_reinstated'))
      sendAccountNotification(user.user_id, newSuspended ? 'suspended' : 'reinstated')
      createAuditLog(newSuspended ? 'user_suspended' : 'user_reinstated', 'user', user.user_id, { email: user.email })
      setUsers(prev => prev.map(u => u.user_id === user.user_id ? { ...u, is_suspended: newSuspended } : u))
    } catch {
      toast.error(t('failed_to_update_user'))
    }
  }

  const toggleVerify = useCallback(async (user: Profile) => {
    try {
      await supabase.from('profiles').update({ is_verified: !user.is_verified } as never).eq('user_id', user.user_id)
      setUsers(prev => prev.map(u => u.user_id === user.user_id ? { ...u, is_verified: !user.is_verified } : u))
      toast.success(t('verification_updated'))
      sendAccountNotification(user.user_id, !user.is_verified ? 'verified' : 'unverified')
      createAuditLog('user_verified', 'user', user.user_id, { verified: !user.is_verified, email: user.email })
    } catch { toast.error(t('failed')) }
  }, [t])

  const [viewUser, setViewUser] = useState<Profile | null>(null)
  const [deleteUser, setDeleteUser] = useState<Profile | null>(null)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async (user: Profile) => {
    setDeleting(true)
    try {
      const { error } = await supabase.functions.invoke('delete-user', {
        body: { user_id: user.user_id },
      })
      if (error) throw error
      toast.success(t('user_deleted'))
      createAuditLog('user_deleted', 'user', user.user_id, { email: user.email })
      setUsers(prev => prev.filter(u => u.user_id !== user.user_id))
      setDeleteUser(null)
    } catch {
      toast.error(t('failed_to_delete_user'))
    } finally {
      setDeleting(false)
    }
  }

  const changeRole = async (user: Profile, role: string) => {
    try {
      const { error } = await supabase.from('profiles').update({ role } as never).eq('user_id', user.user_id)
      if (error) throw error
      toast.success(`${t('role_changed')} ${t(role)}`)
      sendAccountNotification(user.user_id, 'role_changed', { new_role: role })
      createAuditLog('role_changed', 'user', user.user_id, { new_role: role, email: user.email })
      setUsers(prev => prev.map(u => u.user_id === user.user_id ? { ...u, role: role as Profile['role'] } : u))
    } catch {
      toast.error(t('failed_to_change_role'))
    }
  }

  const filtered = users.filter(u =>
    !search ||
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('users')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{users.length} {t('total_users')}</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchUsers}><RefreshCw className="h-4 w-4" /> {t('refresh')}</Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t('search_users')}
          className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {loading ? (
        <TableSkeleton rows={5} />
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Search className="mx-auto h-8 w-8 text-gray-300" />
            <p className="mt-3 text-gray-500">{t('no_users_found')}</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">{t('user')}</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">{t('email')}</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">{t('role')}</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">{t('status')}</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">{t('joined')}</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-500">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-gray-700">
                  {filtered.map(user => (
                    <tr key={user.user_id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar_url || undefined} alt={user.full_name || ''} />
                            <AvatarFallback className="bg-primary-100 text-sm font-bold text-primary-600 dark:bg-primary-900/50">
                              {user.full_name?.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <span className="font-medium text-gray-900 dark:text-gray-100">{user.full_name || t('unknown')}</span>
                            {user.is_verified && <span className="ml-2 text-xs text-green-600">✓ {t('verified')}</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{user.email}</td>
                      <td className="px-4 py-3">
                        <select
                          value={user.role}
                          onChange={e => changeRole(user, e.target.value)}
                          className="rounded border border-gray-300 bg-white px-2 py-1 text-xs dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                        >
                          <option value="tenant">{t('tenant')}</option>
                          <option value="owner">{t('owner')}</option>
                          <option value="agent">{t('agent')}</option>
                          <option value="admin">{t('admin')}</option>
                          {currentUser?.role === 'super_admin' && (
                            <option value="super_admin">{t('super_admin')}</option>
                          )}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={user.is_suspended ? 'danger' : 'success'}>
                          {user.is_suspended ? t('suspended') : t('active')}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-primary-600"
                            onClick={() => setViewUser(user)}
                            title={t('view_profile')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={user.is_suspended ? 'text-green-500' : 'text-red-500'}
                            onClick={() => toggleSuspend(user)}
                            title={user.is_suspended ? t('reinstate_user') : t('suspend_user')}
                          >
                            {user.is_suspended ? <UserCheck className="h-4 w-4" /> : <UserX className="h-4 w-4" />}
                          </Button>
                          <Button variant="ghost" size="icon" className="text-blue-500" title={t('verify_user')}
                            onClick={() => toggleVerify(user)}
                          >
                            <Shield className="h-4 w-4" />
                          </Button>
                          {currentUser?.role === 'super_admin' && (
                            <Button variant="ghost" size="icon" className="text-red-500" title={t('delete_user')}
                              onClick={() => setDeleteUser(user)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Profile View Modal */}
      <UserProfileModal
        user={viewUser}
        open={!!viewUser}
        onClose={() => setViewUser(null)}
        onSuspend={(u) => { toggleSuspend(u); setViewUser(prev => prev ? { ...prev, is_suspended: !prev.is_suspended } : null) }}
        onVerify={(u) => { toggleVerify(u); setViewUser(prev => prev ? { ...prev, is_verified: !prev.is_verified } : null) }}
        onDelete={(u) => setDeleteUser(u)}
        onRoleChange={(u, role) => { changeRole(u, role); setViewUser(prev => prev ? { ...prev, role: role as Profile['role'] } : null) }}
        currentUserRole={currentUser?.role}
      />

      <Dialog open={!!deleteUser} onOpenChange={() => setDeleteUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('delete_user')}</DialogTitle>
            <DialogDescription>
              {t('delete_user_confirmation', { name: deleteUser?.full_name || '' })}
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
            {t('delete_user_warning')}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteUser(null)} disabled={deleting}>
              {t('cancel')}
            </Button>
            <Button variant="destructive" onClick={() => deleteUser && handleDelete(deleteUser)} loading={deleting}>
              {t('delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
