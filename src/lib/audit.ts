import { supabase } from './supabase'

export async function createAuditLog(action: string, entityType: string, entityId?: string, details?: Record<string, unknown>) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action,
      entity_type: entityType,
      entity_id: entityId,
      details: details || null,
    } as never)
  } catch {
    // silently fail - audit logs are non-critical
  }
}
