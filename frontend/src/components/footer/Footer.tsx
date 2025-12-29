import { Phone, Mail, MapPin } from 'lucide-react'

const CONTACT_PHONE = '+995 000 00 00 00 '
const CONTACT_EMAIL = 'digitalport@gmail.com'

export default function Footer() {
  const pathname = window.location.pathname
  const isAdminPath = pathname.includes('/admin')

  if (isAdminPath) return null

  const isActive = (path: string) => pathname === path

  const quickLinks = [
    { path: '/', label: 'Home', isComingSoon: false },
    { path: '/properties', label: 'All property', isComingSoon: false },
    { path: '/contact', label: 'Contact', isComingSoon: false },
  ]

  return (
    <footer className="w-full bg-gradient-to-b from-teal-950 via-teal-900 to-teal-950 border-t border-amber-400/20 shadow-[0_-4px_20px_rgba(251,191,36,0.1)]">
      <div className="container mx-auto px-6 md:px-12 lg:px-16 xl:px-24 pt-16 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8">
          {/* Logo and description */}
          <div className="space-y-6 lg:col-span-1">
            <div className="flex items-center gap-3 group cursor-pointer">
              <img
                src="/Logo.png"
                className="h-16 w-auto transition-transform duration-300 group-hover:scale-105"
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
            </div>
            <p className="text-sm text-amber-100/60 leading-relaxed">
              Empowering your investment journey with strategic insights and
              premium opportunities in real estate development.
            </p>
          </div>

          {/* Quick Links and Get In Touch - flex row on mobile, columns on desktop */}
          <div className="lg:col-span-2 flex flex-row lg:grid lg:grid-cols-2 gap-2 lg:gap-8">
            {/* Quick Links */}
            <div className="flex-1">
              <h3 className="text-base font-bold mb-6 text-amber-400 tracking-wide">
                Quick Links
              </h3>
              <ul className="space-y-3">
                {quickLinks.map(link => (
                  <li key={link.path}>
                    <a
                      href={link.isComingSoon ? '#' : link.path}
                      onClick={e => link.isComingSoon && e.preventDefault()}
                      className={`text-sm transition-all duration-300 inline-flex items-center gap-2 group/link ${
                        link.isComingSoon
                          ? 'text-amber-100/30 cursor-not-allowed'
                          : isActive(link.path)
                            ? 'text-amber-400 font-semibold'
                            : 'text-amber-100/70 hover:text-amber-300 hover:translate-x-1'
                      }`}
                    >
                      <span className="text-amber-400/60 group-hover/link:text-amber-400 transition-colors">
                        ›
                      </span>
                      <span className={link.isComingSoon ? 'line-through' : ''}>
                        {link.label}
                      </span>
                      {link.isComingSoon && (
                        <span className="text-[8px] font-bold text-teal-950 bg-gradient-to-r from-amber-400 to-amber-500 px-1.5 py-0.5 rounded-full shadow-sm">
                          SOON
                        </span>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Get In Touch */}
            <div className="flex-1">
              <h3 className="text-base font-bold mb-6 text-amber-400 tracking-wide">
                Get In Touch
              </h3>
              <div className="space-y-4">
                <a
                  href={`tel:${CONTACT_PHONE}`}
                  className="flex items-center gap-3 p-3 rounded-lg bg-teal-800/30 border border-amber-400/20 hover:border-amber-400/40 hover:bg-teal-800/50 transition-all duration-300 group"
                >
                  <Phone className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-amber-100 group-hover:text-amber-300 transition-colors">
                    {CONTACT_PHONE}
                  </span>
                </a>

                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="flex items-center gap-3 p-3 rounded-lg bg-teal-800/30 border border-amber-400/20 hover:border-amber-400/40 hover:bg-teal-800/50 transition-all duration-300 group"
                >
                  <Mail className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-amber-100 group-hover:text-amber-300 transition-colors break-all">
                    {CONTACT_EMAIL}
                  </span>
                </a>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-teal-800/30 border border-amber-400/20">
                  <MapPin className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm font-medium text-amber-100/80">
                    Batumi, Georgia
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-amber-400/20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-amber-100/50 text-center md:text-left">
              © 2026 Build Up Investment. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a
                href="#"
                className="text-sm text-amber-100/50 hover:text-amber-300 transition-colors duration-300"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-sm text-amber-100/50 hover:text-amber-300 transition-colors duration-300"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
