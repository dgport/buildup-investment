import { useState, useEffect, useRef } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2, XCircle, Loader2, Mail, AlertCircle } from 'lucide-react'

type VerificationStatus =
  | 'verifying'
  | 'success'
  | 'error'
  | 'expired'
  | 'already_verified'

const VerifyEmailPage = () => {
  const [status, setStatus] = useState<VerificationStatus>('verifying')
  const [message, setMessage] = useState('')
  const [isResending, setIsResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(
    null
  )
  const hasVerified = useRef(false)

  useEffect(() => {
    // Prevent double verification in strict mode
    if (hasVerified.current) return
    hasVerified.current = true

    verifyEmail()
  }, [])

  useEffect(() => {
    if (status === 'success' && redirectCountdown === null) {
      // Start countdown only after success status is set
      setRedirectCountdown(3)
    }
  }, [status, redirectCountdown])

  useEffect(() => {
    if (redirectCountdown === null || redirectCountdown <= 0) return

    const timer = setTimeout(() => {
      if (redirectCountdown === 1) {
        // Redirect when countdown reaches 0
        window.location.href = '/signin'
      } else {
        setRedirectCountdown(prev => (prev !== null ? prev - 1 : null))
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [redirectCountdown])

  const verifyEmail = async () => {
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get('token')

    if (!token) {
      setStatus('error')
      setMessage('No verification token found. Please check your email link.')
      return
    }

    try {
      const response = await fetch(
        `http://localhost:3000/api/auth/verify-email?token=${token}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage(data.message || 'Your email has been verified successfully!')
        // Note: redirect is now handled by the countdown effect
      } else {
        if (response.status === 400) {
          if (data.message?.toLowerCase().includes('expired')) {
            setStatus('expired')
            setMessage(
              'Your verification link has expired. Please request a new one.'
            )
          } else if (
            data.message?.toLowerCase().includes('already verified') ||
            data.message?.toLowerCase().includes('already been verified')
          ) {
            setStatus('already_verified')
            setMessage(
              'This email has already been verified. You can sign in now.'
            )
          } else {
            setStatus('error')
            setMessage(data.message || 'Verification failed. Please try again.')
          }
        } else if (response.status === 404) {
          setStatus('error')
          setMessage(
            'Invalid verification link. Please check your email or request a new link.'
          )
        } else {
          setStatus('error')
          setMessage(data.message || 'Verification failed. Please try again.')
        }
      }
    } catch (error) {
      setStatus('error')
      setMessage('Something went wrong. Please try again later.')
    }
  }

  const handleResendEmail = async () => {
    const email = prompt('Please enter your email address:')

    if (!email) return

    setIsResending(true)
    setResendSuccess(false)

    try {
      const response = await fetch(
        'http://localhost:3000/api/auth/resend-verification',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        }
      )

      const data = await response.json()

      if (response.ok) {
        setResendSuccess(true)
        setMessage('Verification email sent! Please check your inbox.')
      } else {
        alert(data.message || 'Failed to resend email. Please try again.')
      }
    } catch (error) {
      alert('Something went wrong. Please try again later.')
    } finally {
      setIsResending(false)
    }
  }

  const renderContent = () => {
    switch (status) {
      case 'verifying':
        return (
          <div className="text-center py-8">
            <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Verifying your email...
            </h2>
            <p className="text-muted-foreground">
              Please wait while we verify your email address.
            </p>
          </div>
        )

      case 'success':
        return (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Email Verified!
            </h2>
            <p className="text-muted-foreground mb-4">{message}</p>
            <Alert className="bg-green-50 border-green-200 mb-6">
              <AlertDescription className="text-green-800 text-sm">
                Redirecting you to sign in page in {redirectCountdown ?? 3}{' '}
                second{redirectCountdown !== 1 ? 's' : ''}
                ...
              </AlertDescription>
            </Alert>
            <Button
              onClick={() => (window.location.href = '/signin')}
              className="w-full"
            >
              Go to Sign In Now
            </Button>
          </div>
        )

      case 'already_verified':
        return (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-12 h-12 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Already Verified
            </h2>
            <p className="text-muted-foreground mb-6">{message}</p>
            <Alert className="bg-blue-50 border-blue-200 mb-6">
              <AlertDescription className="text-blue-800 text-sm">
                Your email is already verified. You can proceed to sign in.
              </AlertDescription>
            </Alert>
            <Button
              onClick={() => (window.location.href = '/signin')}
              className="w-full"
            >
              Go to Sign In
            </Button>
          </div>
        )

      case 'expired':
        return (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-12 h-12 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Link Expired
            </h2>
            <p className="text-muted-foreground mb-6">{message}</p>

            {resendSuccess ? (
              <Alert className="bg-green-50 border-green-200 mb-4">
                <Mail className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Verification email sent! Please check your inbox.
                </AlertDescription>
              </Alert>
            ) : (
              <Button
                onClick={handleResendEmail}
                className="w-full"
                disabled={isResending}
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Resend Verification Email
                  </>
                )}
              </Button>
            )}
          </div>
        )

      case 'error':
        return (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Verification Failed
            </h2>
            <p className="text-muted-foreground mb-6">{message}</p>

            <div className="space-y-3">
              <Button
                onClick={handleResendEmail}
                variant="outline"
                className="w-full bg-transparent"
                disabled={isResending}
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Resend Verification Email
                  </>
                )}
              </Button>

              <Button
                onClick={() => (window.location.href = '/signin')}
                variant="ghost"
                className="w-full"
              >
                Back to Sign In
              </Button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Email Verification
          </CardTitle>
          <CardDescription>
            Verify your email address to continue
          </CardDescription>
        </CardHeader>

        <CardContent>{renderContent()}</CardContent>
      </Card>
    </div>
  )
}

export default VerifyEmailPage
