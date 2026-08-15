import { createClient } from 'npm:@supabase/supabase-js'

/**
 * Verifies the caller's JWT from the Authorization header using the
 * signed-in user's client (not the service role), so a request without
 * a valid token is rejected before any data is touched.
 */
export async function requireUser(req: Request): Promise<{
  user: { id: string; email?: string }
} & { error: null }
> {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or invalid Authorization header')
  }
  const token = authHeader.replace('Bearer ', '')
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || ''
  const supabase = createClient(supabaseUrl, anonKey)
  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data.user) {
    throw new UnauthorizedError('Invalid or expired token')
  }
  return { user: { id: data.user.id, email: data.user.email }, error: null }
}

export class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'UnauthorizedError'
  }
}