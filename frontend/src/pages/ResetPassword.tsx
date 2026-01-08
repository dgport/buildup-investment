import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
import {
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react'
import { useResetPassword } from '@/lib/hooks/useAuth'

const ResetPasswordPage = () => {
  const navigate = useNavigate()
  const resetPasswordMutation = useResetPassword()

  const [formData, setFormData] = useState({
    token: '',
    password: '',
    confirmPassword: '',
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [tokenValid, setTokenValid] = useState(true)

  useEffect(() => {
    // Get token from URL query params
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get('token')

    if (!token) {
      setTokenValid(false)
    } else {
      setFormData(prev => ({ ...prev, token }))
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.password) {
      errors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters'
    } else if (
      !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(formData.password)
    ) {
      errors.password =
        'Password must contain uppercase, lowercase, number, and special character'
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    resetPasswordMutation.mutate(
      {
        token: formData.token,
        password: formData.password,
      },
      {
        onSuccess: () => {
          setTimeout(() => {
            navigate('/signin')
          }, 2000)
        },
      }
    )
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !resetPasswordMutation.isPending && tokenValid) {
      handleSubmit()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Set Your Password
          </CardTitle>
          <CardDescription className="text-center">
            Enter your new password below
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {!tokenValid && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Invalid or missing token. Please request a new link.
              </AlertDescription>
            </Alert>
          )}

          {resetPasswordMutation.isError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {(resetPasswordMutation.error as any)?.response?.data
                  ?.message ||
                  'Failed to set password. The link may be expired or invalid.'}
              </AlertDescription>
            </Alert>
          )}

          {resetPasswordMutation.isSuccess && (
            <Alert className="border-green-500 bg-green-50 text-green-900">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription>
                Password set successfully! Redirecting to sign in...
              </AlertDescription>
            </Alert>
          )}

          {tokenValid ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    onKeyPress={handleKeyPress}
                    className={
                      fieldErrors.password ? 'border-red-500 pr-10' : 'pr-10'
                    }
                    disabled={resetPasswordMutation.isPending}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    disabled={resetPasswordMutation.isPending}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="text-xs text-red-500">{fieldErrors.password}</p>
                )}
                <p className="text-xs text-gray-500">
                  Must be at least 8 characters with uppercase, lowercase,
                  number & special character
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onKeyPress={handleKeyPress}
                    className={
                      fieldErrors.confirmPassword
                        ? 'border-red-500 pr-10'
                        : 'pr-10'
                    }
                    disabled={resetPasswordMutation.isPending}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    disabled={resetPasswordMutation.isPending}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
                {fieldErrors.confirmPassword && (
                  <p className="text-xs text-red-500">
                    {fieldErrors.confirmPassword}
                  </p>
                )}
              </div>

              <Button
                onClick={handleSubmit}
                className="w-full"
                disabled={resetPasswordMutation.isPending}
              >
                {resetPasswordMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Setting Password...
                  </>
                ) : (
                  'Set Password'
                )}
              </Button>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-600 mb-4">
                This link is invalid or has expired.
              </p>
              <Button
                onClick={() => (window.location.href = '/forgot-password')}
                className="w-full"
              >
                Request New Link
              </Button>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => (window.location.href = '/signin')}
            disabled={resetPasswordMutation.isPending}
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

export default ResetPasswordPage
