import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, Loader2 } from "lucide-react"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

export const GoogleAuthError = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const errorMessage = urlParams.get('message') || 'Authentication failed'

    console.error('Google auth error:', errorMessage)

    // Redirect to signin after 3 seconds
    const timer = setTimeout(() => {
      navigate('/signin')
    }, 3000)

    return () => clearTimeout(timer)
  }, [navigate])

  const urlParams = new URLSearchParams(window.location.search)
  const errorMessage = urlParams.get('message') || 'Authentication failed'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto" />
            <h2 className="text-2xl font-bold text-gray-900">
              Authentication Failed
            </h2>
            <p className="text-gray-600">{decodeURIComponent(errorMessage)}</p>
            <p className="text-sm text-gray-500">Redirecting to sign in...</p>
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
