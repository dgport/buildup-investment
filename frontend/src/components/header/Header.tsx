import { cn } from '@/lib/utils/cn'
import { Menu, X, LogOut, User } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useCurrentUser, useLogout } from '@/lib/hooks/useAuth'
import { isAuthenticated } from '@/lib/utils/auth'

const ROUTES = {
  HOME: '/',
  PROPERTY: '/properties',
  CONTACT: '/contact',
  PARTNERS: '/partners',
  SIGNIN: '/signin',
  SIGNUP: '/signup',
}

const navItems = [
  { path: ROUTES.HOME, label: 'Home', isComingSoon: false },
  { path: ROUTES.PROPERTY, label: 'All property', isComingSoon: false },
  { path: ROUTES.CONTACT, label: 'Contact', isComingSoon: false },
]

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const pathname = location.pathname

  const isAuth = isAuthenticated()
  const { data: user, isLoading } = useCurrentUser()
  const logoutMutation = useLogout()

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  const handleLogout = async () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        navigate('/signin')
      },
    })
  }

  const isActive = (path: string) => pathname === path

  return (
    <header className="top-0 z-50 w-full bg-gradient-to-r from-teal-950/95 via-teal-900/95 to-teal-950/95 backdrop-blur-md border-b border-amber-400/20 shadow-xl">
      <div className="px-6 md:px-12 lg:px-16 xl:px-24">
        <div className="flex h-20 items-center justify-between">
          <Link
            to={ROUTES.HOME}
            className="flex items-center gap-3 shrink-0 group"
          >
            <img
              src="/Logo.png"
              className="h-14 w-auto transition-transform duration-300 group-hover:scale-105"
              alt="Build Up Investment"
            />
            <div className="flex flex-col">
              <span className="text-lg font-bold text-amber-400 leading-tight tracking-wide">
                Build Up Investment
              </span>
              <span className="text-xs font-medium text-amber-100/70 tracking-wider">
                STRATEGIC GROWTH PARTNERS
              </span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-6">
            <nav className="flex items-center gap-1">
              {navItems.map(item => (
                <Link
                  key={item.path}
                  to={item.isComingSoon ? '#' : item.path}
                  onClick={e => item.isComingSoon && e.preventDefault()}
                  className={cn(
                    'relative px-4 py-2 text-sm font-semibold transition-all duration-300 rounded-lg group/nav',
                    item.isComingSoon
                      ? 'text-amber-200/40 cursor-not-allowed'
                      : isActive(item.path)
                        ? 'text-teal-950 bg-amber-400'
                        : 'text-amber-100 hover:text-amber-300 hover:bg-teal-800/50'
                  )}
                >
                  <span className={cn(item.isComingSoon && 'line-through')}>
                    {item.label}
                  </span>
                  {!isActive(item.path) && !item.isComingSoon && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-0.5 w-0 bg-amber-400 rounded-full transition-all duration-300 group-hover/nav:w-[calc(100%-2rem)]" />
                  )}
                  {item.isComingSoon && (
                    <span className="absolute -top-1 -right-1 text-[8px] font-bold text-teal-950 bg-gradient-to-r from-amber-400 to-amber-500 px-1.5 py-0.5 rounded-full">
                      SOON
                    </span>
                  )}
                </Link>
              ))}
            </nav>

            {!isLoading && (
              <div className="flex items-center gap-2">
                {isAuth && user ? (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-teal-800/50 rounded-lg border border-amber-400/30">
                      <User className="h-4 w-4 text-amber-400" />
                      <span className="text-sm font-medium text-amber-100">
                        {user.firstname || user.email}
                      </span>
                    </div>
                    <button
                      onClick={handleLogout}
                      disabled={logoutMutation.isPending}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-amber-100 hover:text-amber-300 hover:bg-teal-800/50 rounded-lg transition-all duration-300 border border-amber-400/30 disabled:opacity-50"
                    >
                      <LogOut className="h-4 w-4" />
                      {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
                    </button>
                  </div>
                ) : (
                  <>
                    <Link
                      to={ROUTES.SIGNIN}
                      className="px-4 py-2 text-sm font-semibold text-amber-100 hover:text-amber-300 hover:bg-teal-800/50 rounded-lg transition-all duration-300"
                    >
                      Sign In
                    </Link>
                    <Link
                      to={ROUTES.SIGNUP}
                      className="px-4 py-2 text-sm font-semibold text-teal-950 bg-amber-400 hover:bg-amber-500 rounded-lg transition-all duration-300 shadow-lg shadow-amber-400/20"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-amber-400 hover:bg-teal-800/50 rounded-lg transition-colors border border-amber-400/30"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      <div
        className={cn(
          'lg:hidden overflow-hidden transition-all duration-300 bg-gradient-to-b from-teal-950/98 to-teal-900/98 backdrop-blur-md border-t border-amber-400/20',
          mobileMenuOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <nav className="flex flex-col p-6 gap-2">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.isComingSoon ? '#' : item.path}
              onClick={e => {
                if (item.isComingSoon) {
                  e.preventDefault()
                } else {
                  setMobileMenuOpen(false)
                }
              }}
              className={cn(
                'relative flex items-center justify-between px-4 py-3 rounded-lg text-base font-semibold transition-all',
                item.isComingSoon
                  ? 'text-amber-200/40'
                  : isActive(item.path)
                    ? 'text-teal-950 bg-amber-400'
                    : 'text-amber-100 hover:bg-teal-800/50 hover:text-amber-300'
              )}
            >
              <span className={cn(item.isComingSoon && 'line-through')}>
                {item.label}
              </span>
            </Link>
          ))}

          {!isLoading && (
            <div className="mt-4 pt-4 border-t border-amber-400/20 space-y-2">
              {isAuth && user ? (
                <>
                  <div className="flex items-center gap-2 px-4 py-3 bg-teal-800/50 rounded-lg border border-amber-400/30">
                    <User className="h-5 w-5 text-amber-400" />
                    <span className="text-base font-medium text-amber-100">
                      {user.firstname || user.email}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 text-base font-semibold text-amber-100 hover:text-amber-300 hover:bg-teal-800/50 rounded-lg transition-all duration-300 border border-amber-400/30 disabled:opacity-50"
                  >
                    <LogOut className="h-5 w-5" />
                    {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to={ROUTES.SIGNIN}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full px-4 py-3 text-center text-base font-semibold text-amber-100 hover:text-amber-300 hover:bg-teal-800/50 rounded-lg transition-all duration-300 border border-amber-400/30"
                  >
                    Sign In
                  </Link>
                  <Link
                    to={ROUTES.SIGNUP}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full px-4 py-3 text-center text-base font-semibold text-teal-950 bg-amber-400 hover:bg-amber-500 rounded-lg transition-all duration-300 shadow-lg shadow-amber-400/20"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
