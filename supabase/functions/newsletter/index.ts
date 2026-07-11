import { createClient } from 'npm:@supabase/supabase-js'
import { corsHeaders, handleCors } from '../_shared/cors.ts'
import { createTransporter, getFromEmail, getAdminEmail } from '../_shared/smtp.ts'

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  try {
    const { email } = await req.json()
    if (!email) {
      return new Response(JSON.stringify({ error: 'Missing email' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { error: upsertError } = await supabase.from('newsletters').upsert(
      { email, is_active: true },
      { onConflict: 'email' }
    )
    if (upsertError) throw upsertError

    const transporter = createTransporter()
    const fromEmail = getFromEmail()
    const adminEmail = getAdminEmail()

    const subject = 'Welcome to EasyRent Newsletter!'
    const body = `Hi there,

Thank you for subscribing to the EasyRent newsletter!

You'll now receive updates about:
- New property listings in your area
- Price drops and special offers
- Market trends and insights

Stay tuned for our next update!

Best regards,
The EasyRent Team`

    await transporter.sendMail({
      from: `"EasyRent" <${fromEmail}>`,
      to: email,
      subject,
      text: body,
    })

    try { await supabase.from('email_logs').insert({
      recipient: email,
      email_type: 'newsletter_subscription',
      subject,
      status: 'sent',
    }) } catch { /* non-critical */ }

    // Notify admin
    await transporter.sendMail({
      from: `"EasyRent" <${fromEmail}>`,
      to: adminEmail,
      subject: 'New Newsletter Subscriber',
      text: `A new user has subscribed to the newsletter:\n\nEmail: ${email}`,
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
