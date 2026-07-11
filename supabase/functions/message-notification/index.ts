import { createClient } from 'npm:@supabase/supabase-js'
import { corsHeaders, handleCors } from '../_shared/cors.ts'
import { createTransporter, getFromEmail } from '../_shared/smtp.ts'
import { buildEmailHtml } from '../_shared/templates.ts'

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  try {
    const { message_id } = await req.json()
    if (!message_id) {
      return new Response(JSON.stringify({ error: 'Missing message_id' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: message, error } = await supabase
      .from('messages')
      .select('*, sender:profiles!sender_id(*), receiver:profiles!receiver_id(*)')
      .eq('id', message_id)
      .single()
    if (error || !message) {
      return new Response(JSON.stringify({ error: 'Message not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    if (message.sender_id === message.receiver_id) return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

    const transporter = createTransporter()
    const fromEmail = getFromEmail()

    const contentPreview = message.content.length > 100 ? message.content.substring(0, 100) + '...' : message.content
    const subject = `New Message from ${message.sender?.full_name}`
    const htmlBody = buildEmailHtml({
      title: 'New Message 💬',
      greeting: `Hi ${message.receiver?.full_name},`,
      paragraphs: [
        `You have received a new message from <strong>${message.sender?.full_name}</strong>:`,
        `"${contentPreview}"`,
      ],
      cta: { text: 'View Message', url: 'https://rwanda-easyrent.vercel.app/dashboard/messages' },
    })

    await transporter.sendMail({
      from: `"EasyRent" <${fromEmail}>`,
      to: message.receiver?.email,
      subject,
      html: htmlBody,
    })

    try { await supabase.from('email_logs').insert({
      user_id: message.receiver_id,
      recipient: message.receiver?.email,
      email_type: 'new_message',
      subject,
      status: 'sent',
    }) } catch { /* non-critical */ }

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
