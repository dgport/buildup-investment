import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import { ProtectedRoutes } from './ProtectedRoutes'
import { ROUTES } from '@/constants/routes'
import { LoadingScreen } from '@/components/shared/loaders/LoadingScreen'
import SignupPage from '@/pages/Signup'
import SigninPage from '@/pages/Signin'
import VerifyEmailPage from '@/pages/VerifyEmail'
import ForgotPasswordPage from '@/pages/ForgotPassword'
import ResetPasswordPage from '@/pages/ResetPassword'
import DashboardPage from '@/pages/Dashboard'
import { GoogleAuthSuccess } from '@/pages/GoogleAuthSuccess'
import { GoogleAuthError } from '@/pages/GoogleAuthError'
const Home = lazy(() => import('@/pages/Home'))
const Signin = lazy(() => import('@/pages/Signin'))
const Admin = lazy(() => import('@/pages/Admin'))
const Unauthorized = lazy(() => import('@/pages/Unauthorized'))
const NotFound = lazy(() => import('@/pages/NotFound'))
const Contact = lazy(() => import('@/pages/Contact'))
const Properties = lazy(() => import('@/pages/Properties'))
const Partners = lazy(() => import('@/pages/Partners'))
const Property = lazy(() => import('@/pages/Property'))

export const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path={ROUTES.HOME} element={<Home />} />
        <Route path={ROUTES.SIGNIN} element={<Signin />} />
        <Route path={ROUTES.CONTACT} element={<Contact />} />
        <Route path={ROUTES.PARTNERS} element={<Partners />} />
        <Route path={ROUTES.PROPERTIES} element={<Properties />} />
        <Route path={ROUTES.PROPERTY} element={<Property />} />
        <Route path={ROUTES.SIGNUP} element={<SignupPage />} />
        <Route path={ROUTES.SIGNIN} element={<SigninPage />} />
        <Route path={ROUTES.VERIFY_EMAIL} element={<VerifyEmailPage />} />
        <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
        <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
        <Route path={ROUTES.AUTH_SUCCESS} element={<GoogleAuthSuccess />} />
        <Route path={ROUTES.AUTH_ERROR} element={<GoogleAuthError />} />

        <Route
          element={
            <ProtectedRoutes redirectTo={ROUTES.SIGNIN} requireAdmin={true} />
          }
        >
          <Route path={ROUTES.ADMIN} element={<Admin />} />
        </Route>
        <Route
          element={
            <ProtectedRoutes redirectTo={ROUTES.SIGNIN} requireAdmin={false} />
          }
        >
          <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
        </Route>
        <Route path={ROUTES.UNAUTHORIZED} element={<Unauthorized />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}
