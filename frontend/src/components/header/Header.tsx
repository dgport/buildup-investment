import { Link, useLocation } from 'react-router-dom'
import { LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { LanguageSwitcher } from '../shared/language-switcher/LanguageSwitcher'

const useTranslation = () => ({
  t: (key: string, options?: any) => options?.defaultValue || key,
})
const useCurrentUser = () => ({ data: null, isLoading: false })
const useSignOut = () => ({ mutateAsync: async () => {}, isPending: false })
const Button = ({ children, onClick, disabled, className }: any) => (
  <button onClick={onClick} disabled={disabled} className={className}>
    {children}
  </button>
)

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ')

const ROUTES = {
  HOME: '/',
  ALL_PROJECTS: '/projects',
  PROPERTY: '/properties',
  CONTACT: '/contact',
  PARTNERS: '/partners',
}

export default function Header() {
  const { t } = useTranslation()
  const { data: user, isLoading } = useCurrentUser()
  const signOut = useSignOut()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const pathname = location.pathname

  const isAdminPath = pathname.includes('/admin')

  if (isAdminPath) {
    return null
  }

  const handleSignOut = async () => {
    try {
      await signOut.mutateAsync()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const isActive = (path: string) => {
    return pathname === path
  }

  const navItems = [
    {
      path: ROUTES.HOME,
      label: t('nav.home', { defaultValue: 'Home' }),
      isComingSoon: false,
    },
    {
      path: '/our-projects',
      label: t('nav.ourProjects', { defaultValue: 'Our Projects' }),
      isComingSoon: true,
    },
    {
      path: ROUTES.ALL_PROJECTS,
      label: t('nav.partnerProjects', {
        defaultValue: 'Projects from developers',
      }),
      isComingSoon: false,
    },
    {
      path: ROUTES.PROPERTY,
      label: t('nav.properties', { defaultValue: 'All property' }),
      isComingSoon: false,
    },
    {
      path: ROUTES.CONTACT,
      label: t('nav.contact', { defaultValue: 'Contact' }),
      isComingSoon: false,
    },
  ]

  return (
    <header className="px-6 sm:px-8 md:px-12 lg:px-16 xl:px-28 top-0 z-50 w-full border-b border-gray-200 bg-white shadow-sm">
      <div className="flex h-20 items-center justify-between">
        {/* Updated Logo */}
        <Link
          to={ROUTES.HOME}
          className="flex items-center gap-2.5 shrink-0 group"
        >
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-200">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors duration-200">
              United Construction
            </span>
            <span className="text-xs font-semibold text-blue-600 leading-tight">
              Company
            </span>
          </div>
        </Link>

        <div className="hidden lg:flex items-center gap-6 flex-1 justify-end">
          {/* Updated Navigation with Pill Style */}
          <nav className="flex items-center gap-2">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.isComingSoon ? '#' : item.path}
                onClick={e => item.isComingSoon && e.preventDefault()}
                className={cn(
                  'relative px-5 py-2.5 text-[15px] font-medium rounded-full transition-all duration-300',
                  isActive(item.path) && !item.isComingSoon
                    ? 'text-white bg-gradient-to-r from-blue-600 to-blue-700 shadow-md'
                    : item.isComingSoon
                      ? 'text-gray-400 cursor-not-allowed bg-gray-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50/80'
                )}
              >
                <span className={cn(item.isComingSoon && 'line-through')}>
                  {item.label}
                </span>
                {item.isComingSoon && (
                  <span className="absolute -top-2 -right-2 text-[9px] font-bold text-white bg-gradient-to-r from-orange-500 to-orange-600 px-2 py-0.5 rounded-full shadow-sm">
                    SOON
                  </span>
                )}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3 pl-6 border-l border-gray-300">
            {isLoading ? (
              <div className="h-10 w-28 animate-pulse rounded-lg bg-gray-200" />
            ) : user ? (
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-semibold text-gray-800">
                    {/* {user.email?.split('@')[0]} */}
                  </span>
                  <span className="text-xs text-gray-600">
                    {t('auth.admin', { defaultValue: 'Admin' })}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  disabled={signOut.isPending}
                  className="gap-2 text-gray-700 hover:text-red-600 hover:bg-red-50 h-10 px-3 rounded-lg transition-all"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {signOut.isPending
                      ? t('auth.signingOut')
                      : t('auth.logout')}
                  </span>
                </Button>
              </div>
            ) : null}

            <LanguageSwitcher />
          </div>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-gray-700 hover:bg-blue-50 rounded-lg transition-colors"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 py-4 animate-fade-in">
          <nav className="flex flex-col gap-2">
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
                  'relative flex items-center justify-between px-4 py-3 text-base font-medium rounded-xl transition-all duration-200',
                  isActive(item.path) && !item.isComingSoon
                    ? 'text-white bg-gradient-to-r from-blue-600 to-blue-700 shadow-md'
                    : item.isComingSoon
                      ? 'text-gray-400 bg-gray-50'
                      : 'text-gray-700 hover:bg-blue-50'
                )}
              >
                <span className={cn(item.isComingSoon && 'line-through')}>
                  {item.label}
                </span>
                {item.isComingSoon && (
                  <span className="text-[10px] font-bold text-white bg-gradient-to-r from-orange-500 to-orange-600 px-2 py-1 rounded-full shadow-sm">
                    COMING SOON
                  </span>
                )}
              </Link>
            ))}
          </nav>

          <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
            {isLoading ? (
              <div className="h-12 w-full animate-pulse rounded-lg bg-gray-200" />
            ) : user ? (
              <>
                <div className="px-4 py-2 bg-blue-50 rounded-lg">
                  <p className="text-sm font-semibold text-gray-800">
                    {/* {user.email} */}
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {t('auth.admin', { defaultValue: 'Admin' })}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  onClick={handleSignOut}
                  disabled={signOut.isPending}
                  className="w-full gap-2 text-gray-700 hover:text-red-600 hover:bg-red-50 h-11 justify-start rounded-lg"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="font-medium">
                    {signOut.isPending
                      ? t('auth.signingOut')
                      : t('auth.logout')}
                  </span>
                </Button>
              </>
            ) : null}

            <div className="px-4">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
