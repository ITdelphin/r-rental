import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TableSkeleton } from '@/components/ui/loading'
import { Search, Shield, UserX, RefreshCw, UserCheck } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { sendAccountNotification } from '@/lib/email'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'
import type { Profile } from '@/types'

export function AdminUsers() {
  const { t } = useTranslation()
  const { profile: currentUser } = useAuth()
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<Profile[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
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
  }

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
    } catch { toast.error(t('failed')) }
  }, [t])

  const changeRole = async (user: Profile, role: string) => {
    try {
      const { error } = await supabase.from('profiles').update({ role } as never).eq('user_id', user.user_id)
      if (error) throw error
      toast.success(`${t('role_changed')} ${t(role)}`)
      sendAccountNotification(user.user_id, 'role_changed', { new_role: role })
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
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-600 dark:bg-primary-900/50">
                            {user.full_name?.charAt(0) || '?'}
                          </div>
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
    </div>
  )
}
