import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/types'
import { profileApi } from '@/lib/api'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        profileApi.get(session.user.id).then(setProfile).catch(() => {})
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        profileApi.get(session.user.id).then(setProfile).catch(() => {})
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return { user, profile, loading, isAuthenticated: !!user }
}
