import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const PhoneIcon = ({ className }: { className?: string }) => (
  <span className={className}>📞</span>
)

const EmailIcon = ({ className }: { className?: string }) => (
  <span className={className}>✉️</span>
)

const CONTACT_PHONE = '+995 595 80 47 95'
const CONTACT_EMAIL = 'unitedcompany2026@gmail.com'

export default function Footer() {
  const { t } = useTranslation()
  const location = useLocation()
  const pathname = location.pathname

  const isAdminPath = pathname.includes('/admin')
  if (isAdminPath) return null

  const isActive = (path: string) => pathname === path

  const quickLinks = [
    { path: '/', label: t('nav.home'), isComingSoon: false },
    { path: '/our-projects', label: t('nav.ourProjects'), isComingSoon: true },
    { path: '/projects', label: t('nav.projects'), isComingSoon: false },
    { path: '/properties', label: t('nav.properties'), isComingSoon: false },
  ]

  const companyLinks = [
    { path: '/contact', label: t('nav.contact'), isComingSoon: false },
  ]

  return (
    <footer className="w-full bg-[#F2F5FF] border-t border-gray-200 px-8 sm:px-8 md:px-12 lg:px-16 xl:px-20 shadow-[0_-2px_4px_-1px_rgba(0,0,0,0.06)]">
      <div className="container mx-auto pt-12 pb-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-8">
          <div className="space-y-5 col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 group cursor-pointer">
              <img src="./Logo.png" className="w-24 h-24" alt="Logo" />
              <div className="flex flex-col">
                <span className="text-base font-bold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors duration-200">
                  United
                </span>
                <span className="text-xs font-semibold text-gray-700 leading-tight">
                  Construction and Real Estate
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-base font-bold mb-5 text-gray-900">
              {t('nav.quickLinks')}
            </h3>
            <ul className="space-y-2.5">
              {quickLinks.map(link => (
                <li key={link.path}>
                  <a
                    href={link.isComingSoon ? '#' : link.path}
                    onClick={e => link.isComingSoon && e.preventDefault()}
                    className={`text-sm transition-all duration-200 inline-flex items-center gap-2 ${
                      link.isComingSoon
                        ? 'text-gray-400 cursor-not-allowed'
                        : isActive(link.path)
                          ? 'text-blue-600 font-semibold'
                          : 'text-gray-600 hover:text-blue-600 hover:translate-x-1'
                    }`}
                  >
                    <span className="text-blue-600">›</span>
                    <span className={link.isComingSoon ? 'line-through' : ''}>
                      {link.label}
                    </span>
                    {link.isComingSoon && (
                      <span className="text-[8px] font-bold text-white bg-gradient-to-r from-orange-500 to-orange-600 px-1.5 py-0.5 rounded-full shadow-sm ml-1">
                        SOON
                      </span>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-base font-bold mb-5 text-gray-900">
              {t('nav.company')}
            </h3>
            <ul className="space-y-2.5">
              {companyLinks.map(link => (
                <li key={link.path}>
                  <a
                    href={link.path}
                    className={`text-sm transition-all duration-200 inline-flex items-center gap-2 ${
                      isActive(link.path)
                        ? 'text-blue-600 font-semibold'
                        : 'text-gray-600 hover:text-blue-600 hover:translate-x-1'
                    }`}
                  >
                    <span className="text-blue-600">›</span>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="hidden md:block">
            <h3 className="text-base font-bold mb-5 text-gray-900">
              {t('contact.getInTouch')}
            </h3>
            <div className="space-y-3">
              <a
                href={`tel:${CONTACT_PHONE}`}
                className="flex items-center gap-3 p-3 rounded-lg bg-white border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all duration-200 group"
              >
                <PhoneIcon className="text-lg group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-gray-800 group-hover:text-blue-600">
                  {CONTACT_PHONE}
                </span>
              </a>

              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="flex items-center gap-3 p-3 rounded-lg bg-white border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all duration-200 group"
              >
                <EmailIcon className="text-lg group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-gray-800 group-hover:text-blue-600">
                  {CONTACT_EMAIL}
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-200">
        <div className="container mx-auto py-5">
          <div className="flex flex-col md:flex-row items-center justify-center gap-3">
            <p className="text-sm text-gray-500 text-center">
              © 2026 United Construction Company.{' '}
              {t('common.allRightsReserved')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
