import { createClient } from 'npm:@supabase/supabase-js'
import { corsHeaders, handleCors } from '../_shared/cors.ts'
import { createTransporter, getFromEmail } from '../_shared/smtp.ts'
import { buildEmailHtml } from '../_shared/templates.ts'

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  try {
    const { booking_id, event } = await req.json()
    if (!booking_id || !event) {
      return new Response(JSON.stringify({ error: 'Missing booking_id or event' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*, property:properties(*), tenant:profiles!tenant_id(*), owner:profiles!owner_id(*)')
      .eq('id', booking_id)
      .single()
    if (error || !booking) {
      return new Response(JSON.stringify({ error: 'Booking not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const transporter = createTransporter()
    const fromEmail = getFromEmail()
    const propertyTitle = booking.property?.title || 'Property'

    if (event === 'created') {
      const subject = `New Booking Request for ${propertyTitle}`
      const htmlBody = buildEmailHtml({
        title: 'New Booking Request 📋',
        greeting: `Hi ${booking.owner?.full_name},`,
        paragraphs: [
          `${booking.tenant?.full_name} has requested to book your property "${propertyTitle}".`,
        ],
        features: [
          { icon: '📅', text: `Visit Date: ${booking.visit_date ? new Date(booking.visit_date).toLocaleDateString() : 'Not specified'}` },
          { icon: '💬', text: `Message: ${booking.message || 'No message'}` },
        ],
        cta: { text: 'Review Booking', url: 'https://rwanda-easyrent.vercel.app/dashboard/bookings' },
      })

      await transporter.sendMail({
        from: `"EasyRent" <${fromEmail}>`,
        to: booking.owner?.email,
        subject,
        html: htmlBody,
      })

      try { await supabase.from('email_logs').insert({
        user_id: booking.owner_id,
        recipient: booking.owner?.email,
        email_type: 'booking_created',
        subject,
        status: 'sent',
      }) } catch { /* non-critical */ }
    } else if (event === 'approved') {
      const subject = `Booking Approved - ${propertyTitle}`
      const htmlBody = buildEmailHtml({
        title: 'Booking Approved ✅',
        greeting: `Hi ${booking.tenant?.full_name},`,
        paragraphs: [
          `Your booking request for "${propertyTitle}" has been approved by the owner!`,
        ],
        features: [
          { icon: '📅', text: `Visit Date: ${booking.visit_date ? new Date(booking.visit_date).toLocaleDateString() : 'Not specified'}` },
          { icon: '👤', text: `Owner: ${booking.owner?.full_name} (${booking.owner?.email})` },
        ],
        cta: { text: 'View Booking', url: 'https://rwanda-easyrent.vercel.app/dashboard/bookings' },
      })

      await transporter.sendMail({
        from: `"EasyRent" <${fromEmail}>`,
        to: booking.tenant?.email,
        subject,
        html: htmlBody,
      })

      try { await supabase.from('email_logs').insert({
        user_id: booking.tenant_id,
        recipient: booking.tenant?.email,
        email_type: 'booking_approved',
        subject,
        status: 'sent',
      }) } catch { /* non-critical */ }
    } else if (event === 'cancelled') {
      const subject = `Booking Cancelled - ${propertyTitle}`
      const htmlBody = buildEmailHtml({
        title: 'Booking Cancelled ❌',
        greeting: `Hi ${booking.owner?.full_name},`,
        paragraphs: [
          `${booking.tenant?.full_name} has cancelled their booking request for "${propertyTitle}".`,
          'If you have any questions, please contact support.',
        ],
      })

      await transporter.sendMail({
        from: `"EasyRent" <${fromEmail}>`,
        to: booking.owner?.email,
        subject,
        html: htmlBody,
      })

      try { await supabase.from('email_logs').insert({
        user_id: booking.owner_id,
        recipient: booking.owner?.email,
        email_type: 'booking_cancelled',
        subject,
        status: 'sent',
      }) } catch { /* non-critical */ }
    } else if (event === 'rejected') {
      const subject = `Booking Rejected - ${propertyTitle}`
      const htmlBody = buildEmailHtml({
        title: 'Booking Rejected ❌',
        greeting: `Hi ${booking.tenant?.full_name},`,
        paragraphs: [
          `Your booking request for "${propertyTitle}" was not approved by the owner.`,
          booking.reply_message ? `Owner's message: ${booking.reply_message}` : 'We encourage you to browse other available properties.',
        ],
        cta: { text: 'Browse Properties', url: 'https://rwanda-easyrent.vercel.app/properties' },
      })

      await transporter.sendMail({
        from: `"EasyRent" <${fromEmail}>`,
        to: booking.tenant?.email,
        subject,
        html: htmlBody,
      })

      try { await supabase.from('email_logs').insert({
        user_id: booking.tenant_id,
        recipient: booking.tenant?.email,
        email_type: 'booking_rejected',
        subject,
        status: 'sent',
      }) } catch { /* non-critical */ }
    } else if (event === 'completed') {
      const subject = `Booking Completed - ${propertyTitle}`
      const htmlBody = buildEmailHtml({
        title: 'Booking Completed ✅',
        greeting: `Hi ${booking.tenant?.full_name},`,
        paragraphs: [
          `Your booking for "${propertyTitle}" has been marked as completed. Your payment has been processed successfully.`,
          'Thank you for using EasyRent!',
        ],
        cta: { text: 'View Booking', url: 'https://rwanda-easyrent.vercel.app/dashboard/bookings' },
      })

      await transporter.sendMail({
        from: `"EasyRent" <${fromEmail}>`,
        to: booking.tenant?.email,
        subject,
        html: htmlBody,
      })

      try { await supabase.from('email_logs').insert({
        user_id: booking.tenant_id,
        recipient: booking.tenant?.email,
        email_type: 'booking_completed',
        subject,
        status: 'sent',
      }) } catch { /* non-critical */ }

      // Also notify the owner about the completed booking
      const ownerSubject = `Payment Received - ${propertyTitle}`
      const ownerHtmlBody = buildEmailHtml({
        title: 'Payment Received 💰',
        greeting: `Hi ${booking.owner?.full_name},`,
        paragraphs: [
          `${booking.tenant?.full_name} has completed their booking and payment for "${propertyTitle}".`,
          'The funds will be available in your account.',
        ],
        cta: { text: 'View Booking', url: 'https://rwanda-easyrent.vercel.app/dashboard/bookings' },
      })

      await transporter.sendMail({
        from: `"EasyRent" <${fromEmail}>`,
        to: booking.owner?.email,
        subject: ownerSubject,
        html: ownerHtmlBody,
      })

      try { await supabase.from('email_logs').insert({
        user_id: booking.owner_id,
        recipient: booking.owner?.email,
        email_type: 'booking_completed_owner',
        subject: ownerSubject,
        status: 'sent',
      }) } catch { /* non-critical */ }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
