import { Link, useLocation } from 'react-router-dom'
import { LogOut, Menu, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { useCurrentUser, useSignOut } from '@/lib/hooks/useAuth'
import { ROUTES } from '@/constants/routes'
import { LanguageSwitcher } from '../shared/language-switcher/LanguageSwitcher'
import { useState } from 'react'
import { cn } from '@/lib/utils/cn'

export const Header = () => {
  const { t } = useTranslation()
  const { data: user, isLoading } = useCurrentUser()
  const signOut = useSignOut()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Hide header on admin pages
  const isAdminPath = location.pathname.includes('/admin')

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
    return location.pathname === path
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
      label: t('nav.partnerProjects', { defaultValue: 'Partner Projects' }),
      isComingSoon: false,
    },
    {
      path: ROUTES.PROPERTY,
      label: t('nav.properties', { defaultValue: 'Properties' }),
      isComingSoon: false,
    },
    {
      path: ROUTES.CONTACT,
      label: t('nav.contact', { defaultValue: 'Contact' }),
      isComingSoon: false,
    },
  ]

  return (
    <header className="sticky px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="container mx-auto  ">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link
            to={ROUTES.HOME}
            className="flex items-center gap-3 flex-shrink-0 group"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg group-hover:shadow-xl transition-all duration-200">
              <span className="text-xl font-bold text-white">UC</span>
            </div>
            <span className="text-xl font-bold text-gray-900 hidden sm:inline group-hover:text-blue-600 transition-colors duration-200">
              United Company
            </span>
          </Link>

          {/* Desktop Navigation - Moved to Right */}
          <div className="hidden lg:flex items-center gap-6 flex-1 justify-end">
            <nav className="flex items-center gap-1">
              {navItems.map(item => (
                <Link
                  key={item.path}
                  to={item.isComingSoon ? '#' : item.path}
                  onClick={e => item.isComingSoon && e.preventDefault()}
                  className={cn(
                    'relative px-4 py-2 text-[15px] font-semibold rounded-lg transition-all duration-200',
                    isActive(item.path) && !item.isComingSoon
                      ? 'text-blue-600 bg-blue-50'
                      : item.isComingSoon
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  )}
                >
                  <span className={cn(item.isComingSoon && 'line-through')}>
                    {item.label}
                  </span>
                  {item.isComingSoon && (
                    <span className="absolute -top-1 -right-2 text-[9px] font-bold text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded-full border border-orange-200">
                      SOON
                    </span>
                  )}
                  {isActive(item.path) && !item.isComingSoon && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-blue-600 rounded-full" />
                  )}
                </Link>
              ))}
            </nav>

            {/* Auth & Settings Section */}
            <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
              {isLoading ? (
                <div className="h-10 w-28 animate-pulse rounded-lg bg-gray-200" />
              ) : user ? (
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-semibold text-gray-900">
                      {user.email?.split('@')[0]}
                    </span>
                    <span className="text-xs text-gray-500">
                      {t('auth.admin', { defaultValue: 'Admin' })}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    disabled={signOut.isPending}
                    className="gap-2 text-gray-700 hover:text-red-600 hover:bg-red-50 h-10 px-3"
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

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
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
                    'relative flex items-center justify-between px-4 py-3 text-base font-semibold rounded-lg transition-all duration-200',
                    isActive(item.path) && !item.isComingSoon
                      ? 'text-blue-600 bg-blue-50'
                      : item.isComingSoon
                        ? 'text-gray-400'
                        : 'text-gray-700 hover:bg-gray-50'
                  )}
                >
                  <span className={cn(item.isComingSoon && 'line-through')}>
                    {item.label}
                  </span>
                  {item.isComingSoon && (
                    <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded-full border border-orange-200">
                      COMING SOON
                    </span>
                  )}
                </Link>
              ))}
            </nav>

            {/* Mobile Auth Section */}
            <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
              {isLoading ? (
                <div className="h-12 w-full animate-pulse rounded-lg bg-gray-200" />
              ) : user ? (
                <>
                  <div className="px-4 py-2 bg-gray-50 rounded-lg">
                    <p className="text-sm font-semibold text-gray-900">
                      {user.email}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {t('auth.admin', { defaultValue: 'Admin' })}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={handleSignOut}
                    disabled={signOut.isPending}
                    className="w-full gap-2 text-gray-700 hover:text-red-600 hover:bg-red-50 h-11 justify-start"
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
      </div>
    </header>
  )
}
