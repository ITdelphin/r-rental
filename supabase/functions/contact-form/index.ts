import { createClient } from 'npm:@supabase/supabase-js'
import { corsHeaders, handleCors } from '../_shared/cors.ts'
import { createTransporter, getAdminEmail, getFromEmail } from '../_shared/smtp.ts'

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  try {
    const { name, email, subject: formSubject, message } = await req.json()
    if (!name || !email || !formSubject || !message) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const transporter = createTransporter()
    const fromEmail = getFromEmail()
    const adminEmail = getAdminEmail()

    const subject = `Contact Form: ${formSubject}`
    const body = `New Contact Form Submission

Name: ${name}
Email: ${email}
Subject: ${formSubject}

Message:
${message}

---
Sent from EasyRent Contact Page`

    await transporter.sendMail({
      from: `"EasyRent Contact" <${fromEmail}>`,
      to: adminEmail,
      replyTo: email,
      subject,
      text: body,
    })

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    try { await supabase.from('email_logs').insert({
      recipient: adminEmail,
      email_type: 'contact_form',
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
