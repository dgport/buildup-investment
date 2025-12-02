import { ROUTES } from '@/constants/routes'
import { getAccessToken } from '@/lib/utils/auth'
import { Navigate, Outlet } from 'react-router-dom'

interface ProtectedRouteProps {
  redirectTo?: string
}

export const ProtectedRoutes = ({
  redirectTo = ROUTES.SIGNIN,
}: ProtectedRouteProps) => {
  const token = getAccessToken()

  if (!token) {
    return <Navigate to={redirectTo} replace />
  }

  return <Outlet />
}
