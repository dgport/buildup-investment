import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import { ProtectedRoutes } from './ProtectedRoutes'
import { ROUTES } from '@/constants/routes'
import { LoadingScreen } from '@/components/shared/loaders/LoadingScreen'

const Home = lazy(() => import('@/pages/Home'))
const Signin = lazy(() => import('@/pages/Signin'))
const Signup = lazy(() => import('@/pages/Signup'))
const Admin = lazy(() => import('@/pages/Admin'))
const Unauthorized = lazy(() => import('@/pages/Unauthorized'))
const NotFound = lazy(() => import('@/pages/NotFound'))
const Contact = lazy(() => import('@/pages/Contact'))
const Properties = lazy(() => import('@/pages/Properties'))
const PartnerProjects = lazy(() => import('@/pages/PartnerProjects'))
const Project = lazy(() => import('@/pages/Project'))
const Partners = lazy(() => import('@/pages/Partners'))
const AllProjects = lazy(() => import('@/pages/AllProjects'))
const InventoryMap = lazy(() => import('@/pages/Map'))

export const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path={ROUTES.HOME} element={<Home />} />
        <Route path={ROUTES.SIGNUP} element={<Signup />} />
        <Route path={ROUTES.SIGNIN} element={<Signin />} />
        <Route path={ROUTES.CONTACT} element={<Contact />} />
        <Route path={ROUTES.PARTNERS} element={<Partners />} />
        <Route path={ROUTES.PARTNER_PROJECTS} element={<PartnerProjects />} />
        <Route path={ROUTES.PROJECT} element={<Project />} />
        <Route path={ROUTES.ALL_PROJECTS} element={<AllProjects />} />
        <Route path={ROUTES.PROPERTY} element={<Properties />} />
        <Route path="/map" element={<InventoryMap />} />
        <Route path={ROUTES.ADMIN} element={<Admin />} />
        <Route element={<ProtectedRoutes redirectTo={ROUTES.SIGNIN} />}>
          {/* <Route path={ROUTES.ADMIN} element={<Admin />} /> */}
        </Route>
        <Route path={ROUTES.UNAUTHORIZED} element={<Unauthorized />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}
