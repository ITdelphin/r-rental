export interface EmailButton {
  text: string
  url: string
}

export interface BuildEmailHtmlOptions {
  title: string
  greeting: string
  paragraphs: string[]
  preheader?: string
  subtext?: string
  features?: { icon: string; text: string }[]
  cta?: EmailButton
  secondaryCta?: EmailButton
  footer?: string
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const EASY_RENT_LOGO_URL = 'https://rwanda-easyrent.vercel.app/easyrent-logo.jpg'

export function buildNewsletterAdminHtml(email: string): string {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>New Newsletter Subscriber</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    @media only screen and (max-width:620px){
      .container{width:100% !important;max-width:100% !important;}
      .header{padding:32px 20px !important;}
      .content{padding:32px 22px !important;}
      .footer{padding:24px 20px !important;}
      .stack{display:block !important;width:100% !important;}
    }
  </style>
</head>
<body style="margin:0;padding:0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;background-color:#eef1f6;font-family:Arial,Helvetica,sans-serif;">
  <div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;font-family:sans-serif;">
    A new user has subscribed to the EasyRent newsletter.
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#eef1f6;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 12px 36px rgba(15,23,42,0.10);">

          <!-- Header -->
          <tr>
            <td class="header" align="center" style="background:linear-gradient(135deg,#2563eb 0%,#1d4ed8 55%,#1e40af 100%);padding:38px 40px;">
              <img src="${EASY_RENT_LOGO_URL}" width="96" height="96" alt="EasyRent" style="display:inline-block;border:0;outline:none;text-decoration:none;border-radius:18px;width:96px;height:96px;" />
              <div style="color:#ffffff;font-size:26px;font-weight:800;letter-spacing:-0.4px;margin-top:14px;">EasyRent</div>
              <div style="color:#dbeafe;font-size:13px;letter-spacing:0.4px;margin-top:4px;">Rwanda&rsquo;s Trusted Property Platform</div>
            </td>
          </tr>

          <!-- Dark content -->
          <tr>
            <td class="content" style="background:#0f172a;padding:42px 46px;">
              <h1 style="margin:0 0 22px;font-size:27px;line-height:1.3;font-weight:800;color:#ffffff;letter-spacing:-0.4px;">New Newsletter Subscriber</h1>
              <hr style="border:none;border-top:1px solid #334155;margin:0 0 26px;width:64px;text-align:left;margin-left:0;">
              <p style="margin:0 0 10px;font-size:15px;line-height:1.7;color:#cbd5e1;">Hi Admin,</p>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#94a3b8;">A new user has subscribed to the newsletter:</p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#1e293b;border:1px solid #334155;border-radius:14px;">
                <tr>
                  <td style="padding:18px 22px;">
                    <span style="color:#60a5fa;font-size:12px;font-weight:700;letter-spacing:0.6px;text-transform:uppercase;">Subscriber Email</span>
                    <div style="color:#f8fafc;font-size:19px;font-weight:700;line-height:1.4;margin-top:6px;word-break:break-all;">${escapeHtml(email)}</div>
                  </td>
                </tr>
              </table>
              <hr style="border:none;border-top:1px solid #334155;margin:30px 0 22px;">
              <p style="margin:0;font-size:13px;line-height:1.7;color:#94a3b8;">If you have any questions, reply to this email or contact our support team.</p>
              <p style="margin:24px 0 0;font-size:14px;line-height:1.7;color:#cbd5e1;">Best regards,<br><span style="color:#ffffff;font-weight:700;">The EasyRent Team</span></p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="footer" align="center" style="background:#0b1220;padding:28px 32px;">
              <p style="margin:0 0 6px;font-size:12px;color:#94a3b8;">&copy; 2026 EasyRent. All rights reserved.</p>
              <p style="margin:0 0 6px;font-size:12px;color:#94a3b8;">Gisenyi, Rwanda</p>
              <p style="margin:0;font-size:12px;color:#94a3b8;">
                <a href="mailto:delphinngarambe@gmail.com" style="color:#94a3b8;text-decoration:none;">delphinngarambe@gmail.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function renderButton(button: EmailButton, variant: 'primary' | 'secondary'): string {
  const primary = variant === 'primary'
  const bg = primary ? '#0e7490' : '#ffffff'
  const color = primary ? '#ffffff' : '#0e7490'
  const border = primary ? '' : 'border:1px solid #0e7490;'
  const text = escapeHtml(button.text)

  return `
  <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:separate;mso-table-lspace:0pt;mso-table-rspace:0pt;">
    <tr>
      <td align="center" style="border-radius:10px;background:${bg};${border}">
        <a href="${button.url}" target="_blank" rel="noopener"
           style="display:inline-block;padding:13px 34px;background:${bg};color:${color};font-size:15px;font-weight:600;line-height:20px;text-decoration:none;border-radius:10px;font-family:Arial,Helvetica,sans-serif;">
          ${text}
        </a>
      </td>
    </tr>
  </table>`
}

export function buildEmailHtml(opts: BuildEmailHtmlOptions) {
  const { title, greeting, paragraphs, features, cta, secondaryCta, footer } = opts

  const preheader = opts.preheader
    ? `<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;font-family:sans-serif;">
        ${escapeHtml(opts.preheader)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
      </div>`
    : ''

  const subtextHtml = opts.subtext
    ? `<p style="color:#52525b;font-size:15px;line-height:1.6;margin:0 0 4px;">${opts.subtext}</p>`
    : ''

  const featuresHtml = features?.length
    ? `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:8px 0 4px;">
        ${features.map(f => `
        <tr>
          <td style="padding:10px 14px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;margin:0 0 8px;">
            <table role="presentation" cellpadding="0" cellspacing="0">
              <tr>
                <td style="width:34px;vertical-align:top;">
                  <span style="display:inline-block;width:34px;height:34px;line-height:34px;text-align:center;background:#e0f2fe;border-radius:8px;font-size:17px;">${f.icon}</span>
                </td>
                <td style="padding-left:12px;vertical-align:middle;">
                  <span style="color:#334155;font-size:14px;line-height:1.5;">${f.text}</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>`).join('')}
      </table>`
    : ''

  const ctaRow = cta || secondaryCta
    ? `<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td align="center" style="padding:12px 0 4px;">${cta ? renderButton(cta, 'primary') : ''}</td>
        </tr>
        ${secondaryCta ? `<tr><td align="center" style="padding:10px 0 0;"><span style="color:#71717a;font-size:13px;">&mdash; or &mdash;</span></td></tr>
        <tr><td align="center" style="padding:10px 0 0;">${renderButton(secondaryCta, 'secondary')}</td></tr>` : ''}
      </table>`
    : ''

  const footerText = footer || 'If you have any questions, reply to this email or contact our support team.'

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>${escapeHtml(title)}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    /* Liquid rescale for small screens only */
    @media only screen and (max-width:620px){
      .container{width:100% !important;max-width:100% !important;}
      .content{padding:32px 20px !important;}
      .header{padding:28px 20px !important;}
      .footer{padding:24px 20px !important;}
      .stack{display:block !important;width:100% !important;}
    }
  </style>
</head>
<body style="margin:0;padding:0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;background-color:#eef2f6;">
  ${preheader}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#eef2f6;">
    <tr>
      <td align="center" style="padding:28px 12px;">
        <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(15,23,42,0.08);">

          <!-- Header -->
          <tr>
            <td class="header" style="background:linear-gradient(135deg,#0e7490 0%,#0f766e 100%);padding:34px 40px;text-align:center;">
              <table role="presentation" cellpadding="0" cellspacing="0" align="center">
                <tr>
                  <td style="background:rgba(255,255,255,0.14);border-radius:12px;padding:10px 18px;">
                    <span style="color:#ffffff;font-size:24px;font-weight:800;letter-spacing:-0.5px;font-family:Arial,Helvetica,sans-serif;">EasyRent</span>
                  </td>
                </tr>
              </table>
              <p style="color:#cffafe;font-size:13px;margin:12px 0 0;font-family:Arial,Helvetica,sans-serif;letter-spacing:0.3px;">Rwanda&rsquo;s Trusted Property Platform</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td class="content" style="padding:40px;background:#ffffff;">
              <h2 style="color:#0f172a;font-size:22px;font-weight:700;margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;line-height:1.3;">${title}</h2>
              <p style="color:#64748b;font-size:14px;margin:0 0 20px;font-family:Arial,Helvetica,sans-serif;">${subtextHtml || ''}</p>
              <p style="color:#1e293b;font-size:15px;line-height:1.7;margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;">${greeting}</p>
              ${paragraphs.map(p => `<p style="color:#334155;font-size:15px;line-height:1.7;margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;">${p}</p>`).join('')}
              ${featuresHtml}
              ${ctaRow}
              <hr style="border:none;border-top:1px solid #e2e8f0;margin:30px 0 22px;">
              <p style="color:#94a3b8;font-size:13px;line-height:1.6;margin:0;font-family:Arial,Helvetica,sans-serif;">${escapeHtml(footerText)}</p>
              <p style="color:#334155;font-size:14px;line-height:1.6;margin:20px 0 0;font-family:Arial,Helvetica,sans-serif;">Best regards,<br><strong style="color:#0e7490;">The EasyRent Team</strong></p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="footer" style="background:#0f172a;padding:26px 40px;text-align:center;">
              <p style="color:#94a3b8;font-size:12px;margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;">&copy; ${new Date().getFullYear()} EasyRent. All rights reserved.</p>
              <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:0 auto;">
                <tr>
                  <td style="padding:0 8px;"><a href="https://rwanda-easyrent.vercel.app" style="color:#cbd5e1;font-size:12px;">Website</a></td>
                  <td style="color:#475569;padding:0;">&bull;</td>
                  <td style="padding:0 8px;"><a href="https://rwanda-easyrent.vercel.app/privacy" style="color:#cbd5e1;font-size:12px;">Privacy</a></td>
                  <td style="color:#475569;padding:0;">&bull;</td>
                  <td style="padding:0 8px;"><a href="https://rwanda-easyrent.vercel.app/terms" style="color:#cbd5e1;font-size:12px;">Terms</a></td>
                </tr>
              </table>
              <p style="color:#475569;font-size:11px;margin:14px 0 0;font-family:Arial,Helvetica,sans-serif;">This is an automated message from EasyRent. Please do not reply to this email.</p>
            </td>
          </tr>

        </table>
        <p style="color:#94a3b8;font-size:11px;margin:16px 0 0;font-family:Arial,Helvetica,sans-serif;">You are receiving this email because you have an account on EasyRent.</p>
      </td>
    </tr>
  </table>
</body>
</html>`
}
