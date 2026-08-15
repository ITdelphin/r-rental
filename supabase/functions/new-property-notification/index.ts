import { createClient } from 'npm:@supabase/supabase-js'
import { corsHeaders, handleCors } from '../_shared/cors.ts'
import { createTransporter, getFromEmail } from '../_shared/smtp.ts'
import { buildEmailHtml } from '../_shared/templates.ts'

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  try {
    const { property_id, owner_name, property_title, property_image } = await req.json()
    if (!property_id || !property_title) {
      return new Response(JSON.stringify({ error: 'Missing property_id or property_title' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: property } = await supabase
      .from('properties')
      .select('id, title, price, district, province, owner_id')
      .eq('id', property_id)
      .single()

    const { data: users } = await supabase
      .from('profiles')
      .select('user_id, email, full_name')
      .not('email', 'is', null)
      .neq('email', '')
      .limit(500)

    if (!users || users.length === 0) {
      return new Response(JSON.stringify({ success: true, sent: 0 }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const transporter = createTransporter()
    const fromEmail = getFromEmail()
    const title = property?.title || property_title
    const location = property?.district ? `${property.district}, ${property.province || 'Rwanda'}` : (property?.province || 'Rwanda')
    const price = property?.price
    const owner = owner_name || 'A host'

    const subject = `New Property Listed: ${title}`
    const buildHtml = () => buildEmailHtml({
      title: 'New Property Available 🏠',
      greeting: 'Hi there,',
      paragraphs: [
        `${owner} has just listed a new property on EasyRent:`,
        `<strong>${title}</strong>`,
        location ? `Located in ${location}.` : '',
        price != null ? `Price: <strong>${Number(price).toLocaleString()} RWF</strong> per month.` : '',
      ].filter(Boolean),
      cta: { text: 'View Property', url: `https://rwanda-easyrent.vercel.app/properties/${property_id}` },
    })

    const prepareImage = async () => {
      if (!property_image) return undefined
      try {
        const imgRes = await fetch(property_image)
        if (!imgRes.ok) return undefined
        const contentType = imgRes.headers.get('Content-Type') || 'image/jpeg'
        const buf = await imgRes.arrayBuffer()
        return {
          attachment: { filename: 'property.jpg', content: new Uint8Array(buf), contentType, contentDisposition: 'inline', cid: 'property-image' },
          imgTag: `<img src="cid:property-image" alt="${title}" style="width:100%;max-width:540px;height:auto;border-radius:10px;margin:16px 0;display:block;" />`,
        }
      } catch {
        return undefined
      }
    }
    const image = await prepareImage()

    let sent = 0
    for (const user of users) {
      if (!user.email) continue
      try {
        let htmlBody = buildHtml()
        const mailOpts: Record<string, unknown> = {
          from: `"EasyRent" <${fromEmail}>`,
          to: user.email,
          subject,
          html: htmlBody,
        }
        if (image) {
          mailOpts.attachments = [image.attachment]
          htmlBody = htmlBody.replace('</body>', `${image.imgTag}</body>`)
          mailOpts.html = htmlBody
        }
        await transporter.sendMail(mailOpts as never)
        sent++
        try { await supabase.from('email_logs').insert({
          user_id: user.user_id,
          recipient: user.email,
          email_type: 'new_property_notification',
          subject,
          status: 'sent',
        }) } catch { /* non-critical */ }
      } catch { /* skip failed recipient, keep sending to the rest */ }
    }

    return new Response(JSON.stringify({ success: true, sent }), {
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