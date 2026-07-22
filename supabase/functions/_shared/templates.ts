export function buildEmailHtml(opts: {
  title: string
  greeting: string
  paragraphs: string[]
  features?: { icon: string; text: string }[]
  cta?: { text: string; url: string }
  footer?: string
}) {
  const { title, greeting, paragraphs, features, cta, footer } = opts

  const featuresHtml = features?.length
    ? `<table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
        ${features.map(f => `<tr><td style="padding:8px 0;color:#3f3f46;font-size:14px;line-height:1.6;">${f.icon} ${f.text}</td></tr>`).join('')}
       </table>`
    : ''

  const ctaHtml = cta
    ? `<table cellpadding="0" cellspacing="0" style="margin:28px 0;">
        <tr>
          <td style="background:#0891b2;border-radius:8px;text-align:center;">
            <a href="${cta.url}" style="display:inline-block;padding:14px 36px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:8px;">${cta.text}</a>
          </td>
        </tr>
       </table>`
    : ''

  const footerText = footer || 'If you have any questions, reply to this email or contact our support team.'

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:'Inter',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 10px;">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

<tr>
<td style="background:linear-gradient(135deg,#0891b2,#0e7490);padding:32px 40px;border-radius:16px 16px 0 0;text-align:center;">
  <h1 style="color:#ffffff;font-size:26px;font-weight:800;margin:0;letter-spacing:-0.5px;">EasyRent</h1>
  <p style="color:#cffafe;font-size:13px;margin:4px 0 0;opacity:0.9;">Rwanda's Trusted Property Platform</p>
</td>
</tr>

<tr>
<td style="background:#ffffff;padding:40px;border-left:1px solid #e4e4e7;border-right:1px solid #e4e4e7;">

  <h2 style="color:#18181b;font-size:20px;font-weight:700;margin:0 0 6px;">${title}</h2>

  <p style="color:#3f3f46;font-size:15px;line-height:1.7;margin:0 0 16px;">${greeting}</p>

  ${paragraphs.map(p => `<p style="color:#3f3f46;font-size:15px;line-height:1.7;margin:0 0 12px;">${p}</p>`).join('')}

  ${featuresHtml}

  ${ctaHtml}

  <hr style="border:none;border-top:1px solid #e4e4e7;margin:28px 0 20px;">

  <p style="color:#71717a;font-size:13px;line-height:1.6;margin:0;">${footerText}</p>

  <p style="color:#3f3f46;font-size:14px;line-height:1.6;margin:20px 0 0;">Best regards,<br><strong style="color:#0891b2;">The EasyRent Team</strong></p>

</td>
</tr>

<tr>
<td style="background:#18181b;padding:24px 40px;border-radius:0 0 16px 16px;text-align:center;">
  <p style="color:#71717a;font-size:12px;margin:0 0 6px;">&copy; ${new Date().getFullYear()} EasyRent. All rights reserved.</p>
  <p style="color:#52525b;font-size:12px;margin:0;">Gisenyi, Rwanda &mdash; delphinngarambe@gmail.com</p>
</td>
</tr>

</table>
</td></tr></table>
</body>
</html>`
}
