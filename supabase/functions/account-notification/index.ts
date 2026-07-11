import { createClient } from 'npm:@supabase/supabase-js'
import { corsHeaders, handleCors } from '../_shared/cors.ts'
import { createTransporter, getAdminEmail, getFromEmail } from '../_shared/smtp.ts'
import { buildEmailHtml } from '../_shared/templates.ts'

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  try {
    const { user_id, event, details } = await req.json()
    if (!user_id || !event) {
      return new Response(JSON.stringify({ error: 'Missing user_id or event' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', user_id).single()
    if (!profile) {
      return new Response(JSON.stringify({ error: 'Profile not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const transporter = createTransporter()
    const fromEmail = getFromEmail()
    const adminEmail = getAdminEmail()

    let subject = ''
    let emailType = ''
    let recipient = profile.email
    let htmlBody = ''

    switch (event) {
      case 'suspended': {
        subject = 'Your EasyRent Account Has Been Suspended'
        htmlBody = buildEmailHtml({
          title: 'Account Suspended ⚠️',
          greeting: `Hi ${profile.full_name},`,
          paragraphs: [
            'Your EasyRent account has been suspended.',
            `Reason: ${details?.reason || 'Violation of platform policies'}`,
            'If you believe this is a mistake, please contact our support team.',
          ],
        })
        emailType = 'account_suspended'
        break
      }
      case 'reinstated': {
        subject = 'Your EasyRent Account Has Been Reinstated'
        htmlBody = buildEmailHtml({
          title: 'Account Reinstated ✅',
          greeting: `Hi ${profile.full_name},`,
          paragraphs: [
            'Your EasyRent account has been reinstated. You can now use the platform as normal.',
            'We apologize for any inconvenience caused.',
          ],
        })
        emailType = 'account_reinstated'
        break
      }
      case 'verified': {
        subject = 'Your EasyRent Account Has Been Verified'
        htmlBody = buildEmailHtml({
          title: 'Account Verified ✅',
          greeting: `Hi ${profile.full_name},`,
          paragraphs: [
            'Congratulations! Your EasyRent account has been verified.',
            'You now have a verified badge on your profile, building trust with other users.',
          ],
        })
        emailType = 'account_verified'
        break
      }
      case 'unverified': {
        subject = 'Your EasyRent Account Verification Updated'
        htmlBody = buildEmailHtml({
          title: 'Verification Status Updated',
          greeting: `Hi ${profile.full_name},`,
          paragraphs: [
            'Your EasyRent account verification status has been updated.',
            'If you have questions, please contact support.',
          ],
        })
        emailType = 'account_unverified'
        break
      }
      case 'role_changed': {
        const newRole = details?.new_role || profile.role
        subject = 'Your EasyRent Account Role Has Changed'
        htmlBody = buildEmailHtml({
          title: 'Account Role Updated 🔄',
          greeting: `Hi ${profile.full_name},`,
          paragraphs: [
            `Your account role on EasyRent has been changed to: <strong>${newRole}</strong>.`,
            `You can now access features available to ${newRole}s on the platform.`,
          ],
        })
        emailType = 'role_changed'
        break
      }
      case 'password_changed': {
        subject = 'Your EasyRent Password Was Changed'
        htmlBody = buildEmailHtml({
          title: 'Password Changed 🔑',
          greeting: `Hi ${profile.full_name},`,
          paragraphs: [
            'Your EasyRent account password was recently changed.',
            'If you did not make this change, please reset your password immediately.',
          ],
          cta: { text: 'Reset Password', url: 'https://rwanda-easyrent.vercel.app/auth/forgot-password' },
        })
        emailType = 'password_changed'
        break
      }
      case 'account_deleted': {
        recipient = adminEmail
        subject = `User ${profile.full_name} Deleted Their Account`
        htmlBody = buildEmailHtml({
          title: 'Account Deleted 🗑️',
          greeting: 'Hi Admin,',
          paragraphs: [
            `User <strong>${profile.full_name}</strong> (${profile.email}) has deleted their EasyRent account.`,
          ],
          features: [
            { icon: '👤', text: `Role: ${profile.role}` },
            { icon: '📅', text: `Account created: ${new Date(profile.created_at).toLocaleDateString()}` },
          ],
          footer: 'This account has been removed from the platform.',
        })
        emailType = 'account_deleted_admin'
        break
      }
      default: {
        return new Response(JSON.stringify({ error: 'Unknown event type' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }
    }

    await transporter.sendMail({
      from: `"EasyRent" <${fromEmail}>`,
      to: recipient,
      subject,
      html: htmlBody,
    })

    try { await supabase.from('email_logs').insert({
      user_id,
      recipient,
      email_type: emailType,
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
