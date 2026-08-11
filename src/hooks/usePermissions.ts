import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

export type PermissionKey =
  | 'users.view' | 'users.create' | 'users.edit' | 'users.suspend' | 'users.delete' | 'users.verify'
  | 'properties.view' | 'properties.create' | 'properties.edit' | 'properties.verify' | 'properties.reject' | 'properties.delete' | 'properties.feature'
  | 'bookings.view' | 'bookings.edit' | 'bookings.approve' | 'bookings.reject' | 'bookings.cancel'
  | 'payments.view' | 'payments.manage' | 'payments.refund'
  | 'complaints.view' | 'complaints.manage' | 'complaints.resolve'
  | 'reports.view' | 'reports.export'
  | 'cms.view' | 'cms.edit' | 'cms.publish'
  | 'notifications.view' | 'notifications.manage'
  | 'settings.view' | 'settings.manage'
  | 'audit_logs.view' | 'security.manage'
  | 'admin.manage' | 'admin.permissions'
  | 'system.manage'

export interface Permission {
  id: string
  key: PermissionKey
  category: string
  label: string
  description: string | null
}

export interface AdminRole {
  id: string
  profile_id: string
  role_name: string
  permissions: PermissionKey[]
  template_id: string | null
  assigned_by: string | null
  is_active: boolean
  expires_at: string | null
  created_at: string
}

export interface RoleTemplate {
  id: string
  name: string
  description: string | null
  permissions: PermissionKey[]
  is_system: boolean
}

async function fetchPermissions(): Promise<Permission[]> {
  const { data, error } = await supabase.from('permissions').select('*').order('category, key')
  if (error) throw error
  return (data || []) as Permission[]
}

async function fetchAdminRoles(): Promise<AdminRole[]> {
  const { data, error } = await supabase.from('admin_roles').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return (data || []) as AdminRole[]
}

async function fetchRoleTemplates(): Promise<RoleTemplate[]> {
  const { data, error } = await supabase.from('role_templates').select('*').order('name')
  if (error) throw error
  return (data || []) as RoleTemplate[]
}

async function fetchUserPermissions(userId: string): Promise<PermissionKey[]> {
  const { data, error } = await supabase.rpc('get_user_permissions')
  if (error) throw error
  return (data || []) as PermissionKey[]
}

export function usePermissions() {
  const { profile } = useAuth()
  const isSuperAdmin = profile?.role === 'super_admin'
  const isAdmin = profile?.role === 'admin' || isSuperAdmin

  const { data: allPermissions = [], isLoading: permissionsLoading } = useQuery({
    queryKey: ['permissions'],
    queryFn: fetchPermissions,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    enabled: isAdmin,
  })

  const { data: userPermissions = [], isLoading: userPermissionsLoading } = useQuery({
    queryKey: ['user-permissions', profile?.user_id],
    queryFn: () => fetchUserPermissions(profile!.user_id),
    staleTime: 5 * 60 * 1000,
    enabled: isAdmin && !!profile?.user_id,
  })

  const hasPermission = (key: PermissionKey): boolean => {
    if (isSuperAdmin) return true
    return userPermissions.includes(key)
  }

  const hasAnyPermission = (keys: PermissionKey[]): boolean => {
    if (isSuperAdmin) return true
    return keys.some(k => userPermissions.includes(k))
  }

  return {
    allPermissions,
    userPermissions,
    hasPermission,
    hasAnyPermission,
    isSuperAdmin,
    isAdmin,
    isLoading: permissionsLoading || userPermissionsLoading,
  }
}

export function useAdminRoles() {
  const { data: roles = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-roles'],
    queryFn: fetchAdminRoles,
    staleTime: 2 * 60 * 1000,
  })

  const assignRole = async (profileId: string, roleName: string, permissions: PermissionKey[], templateId?: string) => {
    const { error } = await supabase.from('admin_roles').upsert({
      profile_id: profileId,
      role_name: roleName,
      permissions,
      template_id: templateId || null,
      is_active: true,
    } as never, { onConflict: 'profile_id,role_name' })
    if (error) throw error
    refetch()
  }

  const revokeRole = async (id: string) => {
    const { error } = await supabase.from('admin_roles').update({ is_active: false } as never).eq('id', id)
    if (error) throw error
    refetch()
  }

  const getRoleForProfile = (profileId: string): AdminRole | undefined => {
    return roles.find(r => r.profile_id === profileId && r.is_active)
  }

  return { roles, isLoading, assignRole, revokeRole, getRoleForProfile, refetch }
}

export function useRoleTemplates() {
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['role-templates'],
    queryFn: fetchRoleTemplates,
    staleTime: 30 * 60 * 1000,
  })

  return { templates, isLoading }
}
