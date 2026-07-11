import { createClient } from 'npm:@supabase/supabase-js'
import { corsHeaders, handleCors } from '../_shared/cors.ts'
import { createTransporter, getFromEmail, getAdminEmail } from '../_shared/smtp.ts'
import { buildEmailHtml } from '../_shared/templates.ts'

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
    const htmlBody = buildEmailHtml({
      title: 'Newsletter Subscription Confirmed 📧',
      greeting: 'Hi there,',
      paragraphs: [
        'Thank you for subscribing to the EasyRent newsletter!',
        "You'll now receive updates about new property listings, price drops, special offers, and market trends.",
      ],
      features: [
        { icon: '🏠', text: 'New property listings in your area' },
        { icon: '📉', text: 'Price drops and special offers' },
        { icon: '📊', text: 'Market trends and insights' },
      ],
    })

    await transporter.sendMail({
      from: `"EasyRent" <${fromEmail}>`,
      to: email,
      subject,
      html: htmlBody,
    })

    try { await supabase.from('email_logs').insert({
      recipient: email,
      email_type: 'newsletter_subscription',
      subject,
      status: 'sent',
    }) } catch { /* non-critical */ }

    // Notify admin
    const adminHtml = buildEmailHtml({
      title: 'New Newsletter Subscriber',
      greeting: 'Hi Admin,',
      paragraphs: [`A new user has subscribed to the newsletter: <strong>${email}</strong>.`],
    })
    await transporter.sendMail({
      from: `"EasyRent" <${fromEmail}>`,
      to: adminEmail,
      subject: 'New Newsletter Subscriber',
      html: adminHtml,
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
