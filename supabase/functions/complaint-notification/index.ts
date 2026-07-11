import { createClient } from 'npm:@supabase/supabase-js'
import { corsHeaders, handleCors } from '../_shared/cors.ts'
import { createTransporter, getFromEmail } from '../_shared/smtp.ts'

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  try {
    const { complaint_id, new_status } = await req.json()
    if (!complaint_id || !new_status) {
      return new Response(JSON.stringify({ error: 'Missing complaint_id or new_status' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: complaint, error } = await supabase
      .from('complaints')
      .select('*, user:profiles!user_id(*)')
      .eq('id', complaint_id)
      .single()
    if (error || !complaint) {
      return new Response(JSON.stringify({ error: 'Complaint not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const transporter = createTransporter()
    const fromEmail = getFromEmail()

    const statusLabel = new_status.replace(/_/g, ' ')
    const subject = `Complaint Status Updated: ${statusLabel}`
    const body = `Hi ${complaint.user?.full_name},

Your complaint "#${complaint.id.substring(0, 8)}" - "${complaint.subject}" has been updated to: ${statusLabel}.

Original description: ${complaint.description}

If you have any questions, please reply to this email or contact support.

Best regards,
The EasyRent Team`

    await transporter.sendMail({
      from: `"EasyRent" <${fromEmail}>`,
      to: complaint.user?.email,
      subject,
      text: body,
    })

    await supabase.from('email_logs').insert({
      user_id: complaint.user_id,
      recipient: complaint.user?.email,
      email_type: 'complaint_status_update',
      subject,
      status: 'sent',
    })

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
