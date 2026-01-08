import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react'
import { useForgotPassword } from '@/lib/hooks/useAuth'
import { useSearchParams } from 'react-router-dom'

const ForgotPasswordPage = () => {
  const forgotPasswordMutation = useForgotPassword()
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState(searchParams.get('email') || '')
  const [fieldError, setFieldError] = useState('')

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    if (fieldError) {
      setFieldError('')
    }
  }

  const validateEmail = () => {
    if (!email.trim()) {
      setFieldError('Email is required')
      return false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFieldError('Please provide a valid email address')
      return false
    }
    return true
  }

  const handleSubmit = async () => {
    if (!validateEmail()) {
      return
    }

    forgotPasswordMutation.mutate(
      { email },
      {
        onSuccess: () => {
          setEmail('')
        },
      }
    )
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !forgotPasswordMutation.isPending) {
      handleSubmit()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Forgot Password?
          </CardTitle>
          <CardDescription className="text-center">
            Enter your email and we'll send you a reset link
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {forgotPasswordMutation.isError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {(forgotPasswordMutation.error as any)?.response?.data
                  ?.message || 'Failed to send reset email. Please try again.'}
              </AlertDescription>
            </Alert>
          )}

          {forgotPasswordMutation.isSuccess && (
            <Alert className="border-green-500 bg-green-50 text-green-900">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription>
                Password reset link has been sent to your email. Please check
                your inbox.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john.doe@example.com"
                value={email}
                onChange={handleEmailChange}
                onKeyPress={handleKeyPress}
                className={fieldError ? 'border-red-500' : ''}
                disabled={forgotPasswordMutation.isPending}
                autoComplete="email"
              />
              {fieldError && (
                <p className="text-xs text-red-500">{fieldError}</p>
              )}
            </div>

            <Button
              onClick={handleSubmit}
              className="w-full"
              disabled={forgotPasswordMutation.isPending}
            >
              {forgotPasswordMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Reset Link'
              )}
            </Button>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => (window.location.href = '/signin')}
            disabled={forgotPasswordMutation.isPending}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Sign In
          </Button>

          <div className="text-sm text-gray-600 text-center">
            Remember your password?{' '}
            <a
              href="/signin"
              className="text-blue-600 hover:underline font-medium"
            >
              Sign in
            </a>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

export default ForgotPasswordPage
