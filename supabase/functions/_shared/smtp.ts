import nodemailer from 'npm:nodemailer'

export function createTransporter() {
  const host = Deno.env.get('SMTP_HOST')
  const port = Deno.env.get('SMTP_PORT')
  const user = Deno.env.get('SMTP_USER')
  const pass = Deno.env.get('SMTP_PASS')

  if (!host || !port || !user || !pass) {
    throw new Error('SMTP configuration missing. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS secrets.')
  }

  return nodemailer.createTransport({
    host,
    port: parseInt(port),
    secure: parseInt(port) === 465,
    auth: { user, pass },
  })
}

export function getFromEmail(): string {
  return Deno.env.get('FROM_EMAIL') || 'noreply@easyrent.com'
}

export function getAdminEmail(): string {
  return Deno.env.get('ADMIN_EMAIL') || Deno.env.get('FROM_EMAIL') || 'admin@easyrent.com'
}
