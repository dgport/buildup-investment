
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { setAccessToken } from '@/lib/utils/auth'
import { queryClient } from '@/lib/tanstack/query-client'
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

// Success Page Component
export const GoogleAuthSuccess = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const handleSuccess = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search)
        const token = urlParams.get('token')

        if (!token) {
          navigate('/signin?error=no_token')
          return
        }

        // Store the access token (true = remember me)
        setAccessToken(token, true)

        // Invalidate queries to fetch fresh user data
        await queryClient.invalidateQueries({ queryKey: ['auth', 'currentUser'] })

        // Small delay to show success message
        setTimeout(() => {
          navigate('/')
        }, 1500)
      } catch (error) {
        console.error('Error handling Google auth:', error)
        navigate('/signin?error=callback_failed')
      }
    }

    handleSuccess()
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto animate-pulse" />
            <h2 className="text-2xl font-bold text-gray-900">Success!</h2>
            <p className="text-gray-600">
              Signing you in with Google...
            </p>
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}