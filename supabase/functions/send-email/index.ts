import { createClient } from 'npm:@supabase/supabase-js'
import { corsHeaders, handleCors } from '../_shared/cors.ts'
import { createTransporter, getFromEmail } from '../_shared/smtp.ts'

interface SendEmailPayload {
  to: string
  subject: string
  body: string
  email_type: string
  user_id?: string
}

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  try {
    const { to, subject, body, email_type, user_id }: SendEmailPayload = await req.json()

    if (!to || !subject || !body) {
      return new Response(JSON.stringify({ error: 'Missing required fields: to, subject, body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const transporter = createTransporter()
    const fromEmail = getFromEmail()

    await transporter.sendMail({
      from: `"EasyRent" <${fromEmail}>`,
      to,
      subject,
      text: body,
    })

    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
      const supabase = createClient(supabaseUrl, supabaseServiceKey)
      await supabase.from('email_logs').insert({
        user_id: user_id || null,
        recipient: to,
        email_type,
        subject,
        status: 'sent',
      })
    } catch {
      // non-critical
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
