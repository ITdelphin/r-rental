import { supabase } from './supabase'

export async function createNotification(userId: string, title: string, body: string, type = 'info', data?: Record<string, string>) {
  try {
    const { error } = await supabase.from('notifications').insert({
      user_id: userId,
      title,
      body,
      type,
      data: data || null,
      is_read: false,
    } as never)
    if (error) console.error('Failed to create notification:', error)
  } catch (err) {
    console.error('Failed to create notification:', err)
  }
}

export async function notifyBookingCreated(bookingId: string, tenantId: string, ownerId: string, propertyTitle: string) {
  const { data: tenant } = await supabase
    .from('profiles')
    .select('full_name, email, phone')
    .eq('user_id', tenantId)
    .single()
  if (tenant) {
    const t = tenant as unknown as { full_name: string; email: string | null; phone: string | null }
    await createNotification(
      ownerId,
      'New Booking Request',
      `${t.full_name} booked "${propertyTitle}". Contact: ${t.email || t.phone || 'N/A'}`,
      'info',
      { booking_id: bookingId, tenant_id: tenantId }
    )
  }
}

export async function notifyBookingResponded(bookingId: string, tenantId: string, status: 'approved' | 'rejected', propertyTitle: string) {
  await createNotification(
    tenantId,
    `Booking ${status}`,
    `Your booking for "${propertyTitle}" has been ${status}.`,
    status === 'approved' ? 'success' : 'error',
    { booking_id: bookingId }
  )
}

export async function notifyPropertyAdded(propertyId: string, ownerName: string, propertyTitle: string) {
  const { data: admins } = await supabase
    .from('profiles')
    .select('user_id')
    .in('role', ['admin', 'super_admin'])
  if (admins) {
    for (const admin of admins) {
      const a = admin as unknown as { user_id: string }
      await createNotification(
        a.user_id,
        'New Property Added',
        `${ownerName} added "${propertyTitle}"`,
        'info',
        { property_id: propertyId }
      )
    }
  }
}
