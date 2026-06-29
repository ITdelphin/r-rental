import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Shield, UserX } from 'lucide-react'

const mockUsers = [
  { id: '1', name: 'Alice Mutesi', email: 'alice@email.com', role: 'tenant', status: 'active', joined: 'Dec 1, 2024' },
  { id: '2', name: 'Jean-Pierre Kagame', email: 'jp@email.com', role: 'owner', status: 'active', joined: 'Nov 15, 2024' },
  { id: '3', name: 'Diane Uwimana', email: 'diane@email.com', role: 'agent', status: 'suspended', joined: 'Oct 20, 2024' },
]

export function AdminUsers() {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('users') || 'Users'}</h1>
      <div className="flex gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search users..." className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm dark:border-gray-600 dark:bg-gray-800" />
        </div>
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Email</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Role</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Joined</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-700">
                {mockUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{user.name}</td>
                    <td className="px-4 py-3 text-gray-500">{user.email}</td>
                    <td className="px-4 py-3"><Badge variant="secondary" className="capitalize">{user.role}</Badge></td>
                    <td className="px-4 py-3"><Badge variant={user.status === 'active' ? 'success' : 'danger'}>{user.status}</Badge></td>
                    <td className="px-4 py-3 text-gray-500">{user.joined}</td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="icon"><Shield className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="text-red-500"><UserX className="h-4 w-4" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
