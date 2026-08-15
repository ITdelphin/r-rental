import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { LoadingSpinner } from '@/components/ui/loading'

export function AuthCallbackPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const handleSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        navigate('/auth/login', { replace: true })
        return
      }

      navigate('/dashboard', { replace: true })
    }

    handleSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        navigate('/dashboard', { replace: true })
      }
    })

    return () => subscription.unsubscribe()
  }, [navigate])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
      <LoadingSpinner />
    </div>
  )
}