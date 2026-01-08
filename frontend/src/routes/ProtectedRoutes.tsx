import { Navigate, Outlet } from 'react-router-dom'
import { useCurrentUser } from '@/lib/hooks/useAuth'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  redirectTo?: string
  requireAdmin?: boolean
}

export const ProtectedRoutes = ({
  redirectTo = '/signin',
  requireAdmin = false,
}: ProtectedRouteProps) => {
  const { data: user, isLoading, isError } = useCurrentUser()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    )
  }

  if (isError || !user) {
    return <Navigate to={redirectTo} replace />
  }

  if (requireAdmin && user.role !== 'ADMIN') {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}
