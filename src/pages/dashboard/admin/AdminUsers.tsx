import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TableSkeleton } from '@/components/ui/loading'
import { Search, Shield, UserX, Filter, MoreHorizontal } from 'lucide-react'
import { useState, useEffect } from 'react'

interface User {
  id: string
  name: string
  email: string
  role: string
  status: 'active' | 'suspended' | 'pending'
  joined: string
}

const mockUsers: User[] = [
  { id: '1', name: 'Alice Mutesi', email: 'alice@email.com', role: 'tenant', status: 'active', joined: 'Dec 1, 2024' },
  { id: '2', name: 'Jean-Pierre Kagame', email: 'jp@email.com', role: 'owner', status: 'active', joined: 'Nov 15, 2024' },
  { id: '3', name: 'Diane Uwimana', email: 'diane@email.com', role: 'agent', status: 'suspended', joined: 'Oct 20, 2024' },
  { id: '4', name: 'Patrick Habimana', email: 'patrick@email.com', role: 'tenant', status: 'pending', joined: 'Dec 5, 2024' },
  { id: '5', name: 'Grace Mugabo', email: 'grace@email.com', role: 'admin', status: 'active', joined: 'Sep 10, 2024' },
]

const statusVariant: Record<string, 'success' | 'danger' | 'warning'> = {
  active: 'success',
  suspended: 'danger',
  pending: 'warning',
}

export function AdminUsers() {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<User[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      setUsers(mockUsers)
      setLoading(false)
    }, 700)
    return () => clearTimeout(timer)
  }, [])

  const filtered = users.filter(
    (u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('users')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{users.length} {t('total_users')}</p>
        </div>
        <Button variant="outline" size="sm"><Filter className="h-4 w-4" /> {t('filters')}</Button>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('search_users')}
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
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
                    <th className="px-4 py-3 text-left font-medium text-gray-500">{t('name')}</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">{t('email')}</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">{t('role')}</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">{t('status')}</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">{t('joined')}</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-500">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-gray-700">
                  {filtered.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-600 dark:bg-primary-900/50">
                            {user.name.charAt(0)}
                          </div>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{user.email}</td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary" className="capitalize">{user.role.replace('_', ' ')}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={statusVariant[user.status]} className="capitalize">{user.status}</Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{user.joined}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="text-blue-500">
                            <Shield className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-red-500">
                            <UserX className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
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
