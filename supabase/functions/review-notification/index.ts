import { createClient } from 'npm:@supabase/supabase-js'
import { corsHeaders, handleCors } from '../_shared/cors.ts'
import { createTransporter, getFromEmail } from '../_shared/smtp.ts'
import { buildEmailHtml } from '../_shared/templates.ts'

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  try {
    const { review_id } = await req.json()
    if (!review_id) {
      return new Response(JSON.stringify({ error: 'Missing review_id' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: review, error } = await supabase
      .from('reviews')
      .select('*, property:properties(*, owner:profiles(*)), user:profiles(*)')
      .eq('id', review_id)
      .single()
    if (error || !review) {
      return new Response(JSON.stringify({ error: 'Review not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const transporter = createTransporter()
    const fromEmail = getFromEmail()
    const owner = review.property?.owner

    if (!owner) {
      return new Response(JSON.stringify({ error: 'Property owner not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const starIcons = '⭐'.repeat(review.rating)
    const subject = `New Review for ${review.property?.title}`
    const htmlBody = buildEmailHtml({
      title: 'New Review Received ⭐',
      greeting: `Hi ${owner.full_name},`,
      paragraphs: [
        `${review.user?.full_name} left a review on your property "<strong>${review.property?.title}</strong>".`,
      ],
      features: [
        { icon: starIcons, text: `${review.rating}/5 rating` },
        { icon: '💬', text: `"${review.comment || 'No comment'}"` },
      ],
      cta: { text: 'View Reviews', url: 'https://rwanda-easyrent.vercel.app/dashboard' },
    })

    await transporter.sendMail({
      from: `"EasyRent" <${fromEmail}>`,
      to: owner.email,
      subject,
      html: htmlBody,
    })

    try { await supabase.from('email_logs').insert({
      user_id: owner.user_id,
      recipient: owner.email,
      email_type: 'new_review',
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
