import { createClient } from 'npm:@supabase/supabase-js'
import { corsHeaders, handleCors } from '../_shared/cors.ts'
import { requireUser, UnauthorizedError } from '../_shared/auth.ts'
import { createTransporter, getFromEmail } from '../_shared/smtp.ts'
import { buildEmailHtml } from '../_shared/templates.ts'

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  try {
    const { user } = await requireUser(req)
    const { user_id } = await req.json()
    if (!user_id) {
      return new Response(JSON.stringify({ error: 'Missing user_id' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
    if (user.id !== user_id) {
      return new Response(JSON.stringify({ error: 'Forbidden: you can only request your own welcome email' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: profile, error } = await supabase.from('profiles').select('*').eq('user_id', user_id).single()
    if (error || !profile) {
      return new Response(JSON.stringify({ error: 'Profile not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const transporter = createTransporter()
    const fromEmail = getFromEmail()

    const roleFeatures = profile.role === 'owner'
      ? [{ icon: '🏠', text: 'List your properties for rent or sale' }, { icon: '📋', text: 'Manage bookings and messages' }, { icon: '💰', text: 'Track your earnings' }]
      : profile.role === 'tenant'
      ? [{ icon: '🔍', text: 'Browse and search for properties' }, { icon: '📅', text: 'Book visits and message owners' }, { icon: '❤️', text: 'Save your favorite properties' }]
      : profile.role === 'agent'
      ? [{ icon: '🏢', text: 'Manage client properties' }, { icon: '📞', text: 'Handle bookings on behalf of owners' }]
      : [{ icon: '⚙️', text: 'Manage the platform and users' }]

    const subject = `Welcome to EasyRent, ${profile.full_name}!`
    const htmlBody = buildEmailHtml({
      title: 'Welcome to EasyRent! 🎉',
      preheader: 'Your account is ready. Here is how to get started.',
      greeting: `Hi ${profile.full_name},`,
      subtext: 'Your account has been created successfully.',
      paragraphs: [
        `Email: ${profile.email}<br>Account Type: ${profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}`,
      ],
      features: roleFeatures,
      cta: { text: 'Login to Your Account', url: 'https://rwanda-easyrent.vercel.app/auth/login' },
      secondaryCta: { text: 'Browse Properties', url: 'https://rwanda-easyrent.vercel.app/properties' },
    })

    await transporter.sendMail({
      from: `"EasyRent" <${fromEmail}>`,
      to: profile.email,
      subject,
      html: htmlBody,
    })

    try { await supabase.from('email_logs').insert({
      user_id,
      recipient: profile.email,
      email_type: 'welcome',
      subject,
      status: 'sent',
    }) } catch { /* non-critical */ }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const status = err instanceof UnauthorizedError ? 401 : 500
    const message = err instanceof Error ? err.message : 'Unknown error'
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
