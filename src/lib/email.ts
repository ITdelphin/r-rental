import { supabase } from './supabase'

export async function triggerEmail(functionName: string, payload: Record<string, unknown>) {
  try {
    const { error } = await supabase.functions.invoke(functionName, {
      body: payload,
    })
    if (error) {
      console.error(`Email function ${functionName} failed:`, error)
    }
    return { success: !error, error }
  } catch (err) {
    console.error(`Email function ${functionName} error:`, err)
    return { success: false, error: err }
  }
}

export async function sendWelcomeEmail(userId: string) {
  return triggerEmail('welcome-email', { user_id: userId })
}

export async function sendBookingNotification(bookingId: string, event: 'created' | 'approved' | 'cancelled' | 'rejected' | 'completed') {
  return triggerEmail('booking-notification', { booking_id: bookingId, event })
}


export async function sendMessageNotification(messageId: string) {
  return triggerEmail('message-notification', { message_id: messageId })
}

export async function sendContactForm(name: string, email: string, subject: string, message: string) {
  return triggerEmail('contact-form', { name, email, subject, message })
}

export async function sendComplaintNotification(complaintId: string, newStatus: string) {
  return triggerEmail('complaint-notification', { complaint_id: complaintId, new_status: newStatus })
}

export async function sendAccountNotification(userId: string, event: string, details?: Record<string, unknown>) {
  return triggerEmail('account-notification', { user_id: userId, event, details })
}

export async function sendNewPropertyNotification(propertyId: string, ownerName: string, propertyTitle: string, propertyImage?: string) {
  return triggerEmail('new-property-notification', { property_id: propertyId, owner_name: ownerName, property_title: propertyTitle, property_image: propertyImage })
}
