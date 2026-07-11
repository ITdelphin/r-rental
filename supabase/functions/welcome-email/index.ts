import { createClient } from 'npm:@supabase/supabase-js'
import { corsHeaders, handleCors } from '../_shared/cors.ts'
import { createTransporter, getFromEmail } from '../_shared/smtp.ts'

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  try {
    const { user_id } = await req.json()
    if (!user_id) {
      return new Response(JSON.stringify({ error: 'Missing user_id' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
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

    const subject = `Welcome to EasyRent, ${profile.full_name}!`
    const body = `Hi ${profile.full_name},

Welcome to EasyRent! Your account has been created successfully.

Account Details:
- Email: ${profile.email}
- Role: ${profile.role}

As a ${profile.role}, you can:
${profile.role === 'owner' ? '- List your properties for rent or sale\n- Manage bookings and messages\n- Track your earnings' : profile.role === 'tenant' ? '- Browse and search for properties\n- Book visits and message owners\n- Save your favorite properties' : profile.role === 'agent' ? '- Manage client properties\n- Handle bookings on behalf of owners' : '- Manage the platform and users'}

Get started by visiting your dashboard.
https://rwanda-easyrent.vercel.app/dashboard

Best regards,
The EasyRent Team`

    await transporter.sendMail({
      from: `"EasyRent" <${fromEmail}>`,
      to: profile.email,
      subject,
      text: body,
    })

    await supabase.from('email_logs').insert({
      user_id,
      recipient: profile.email,
      email_type: 'welcome',
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
