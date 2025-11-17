import { useState } from 'react'

const Logo = ({ className }: { className?: string }) => (
  <div
    className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg ${className}`}
  >
    <span className="text-xl font-bold text-white">UC</span>
  </div>
)

const PhoneIcon = ({ className }: { className?: string }) => (
  <span className={className}>📞</span>
)

const EmailIcon = ({ className }: { className?: string }) => (
  <span className={className}>✉️</span>
)

const SocialIcons = () => (
  <div className="flex gap-3">
    <a
      href="#"
      className="h-10 w-10 flex items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-200 hover:scale-110"
    >
      <span className="text-lg">🐦</span>
    </a>
    <a
      href="#"
      className="h-10 w-10 flex items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-200 hover:scale-110"
    >
      <span className="text-lg">📘</span>
    </a>
    <a
      href="#"
      className="h-10 w-10 flex items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-200 hover:scale-110"
    >
      <span className="text-lg">📸</span>
    </a>
  </div>
)

const CONTACT_PHONE = '+995 555 123 456'
const CONTACT_EMAIL = 'info@unitedcompany.ge'
const TERMS_URL = '#'
const PRIVACY_URL = '#'

export default function Footer() {
  const pathname = window.location.pathname
  const [email, setEmail] = useState('')

  const isAdminPath = pathname.includes('/admin')

  if (isAdminPath) {
    return null
  }

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Subscribe:', email)
    setEmail('')
  }

  const isActive = (path: string) => pathname === path

  const quickLinks = [
    { path: '/', label: 'Home' },
    { path: '/our-projects', label: 'Our Projects', comingSoon: true },
    { path: '/all-projects', label: 'Partner Projects' },
    { path: '/properties', label: 'Properties' },
  ]

  const companyLinks = [
    { path: '/about', label: 'About Us' },
    { path: '/contact', label: 'Contact' },
    { path: '/careers', label: 'Careers' },
    { path: '/blog', label: 'Blog' },
  ]

  return (
    <footer className="w-full relative overflow-hidden px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20">
      {/* Background Image with Overlay */}

      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/95 via-blue-800/90 to-blue-900/95 backdrop-blur-sm"></div>

      {/* Main Footer Content */}
      <div className="container mx-auto pt-16 pb-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Company Info */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 group cursor-pointer">
              <Logo />
              <span className="text-xl font-bold group-hover:text-blue-400 transition-colors duration-200">
                United Company
              </span>
            </div>
            <p className="text-sm text-blue-100/90 leading-relaxed">
              Your trusted partner in real estate. We help you find the perfect
              property that matches your dreams and aspirations.
            </p>
            <SocialIcons />
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-base font-bold mb-6 text-white">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map(link => (
                <li key={link.path}>
                  <a
                    href={link.comingSoon ? '#' : link.path}
                    onClick={e => link.comingSoon && e.preventDefault()}
                    className={`text-sm transition-all duration-200 inline-flex items-center gap-2 ${
                      link.comingSoon
                        ? 'text-blue-200/60 cursor-not-allowed'
                        : isActive(link.path)
                          ? 'text-white font-semibold'
                          : 'text-blue-100/80 hover:text-white hover:translate-x-1'
                    }`}
                  >
                    {!link.comingSoon && <span className="text-white">›</span>}
                    <span className={link.comingSoon ? 'line-through' : ''}>
                      {link.label}
                    </span>
                    {link.comingSoon && (
                      <span className="text-[9px] font-bold text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded-full border border-orange-400/20">
                        SOON
                      </span>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-base font-bold mb-6 text-white">Company</h3>
            <ul className="space-y-3">
              {companyLinks.map(link => (
                <li key={link.path}>
                  <a
                    href={link.path}
                    className={`text-sm transition-all duration-200 inline-flex items-center gap-2 ${
                      isActive(link.path)
                        ? 'text-white font-semibold'
                        : 'text-blue-100/80 hover:text-white hover:translate-x-1'
                    }`}
                  >
                    <span className="text-white">›</span>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div>
            <h3 className="text-base font-bold mb-6 text-white">
              Get In Touch
            </h3>
            <div className="space-y-4">
              <a
                href={`tel:${CONTACT_PHONE}`}
                className="flex items-center gap-3 p-3 rounded-lg bg-white/15 backdrop-blur-sm hover:bg-white/25 transition-all duration-200 group"
              >
                <PhoneIcon className="text-xl group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">{CONTACT_PHONE}</span>
              </a>

              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="flex items-center gap-3 p-3 rounded-lg bg-white/15 backdrop-blur-sm hover:bg-white/25 transition-all duration-200 group"
              >
                <EmailIcon className="text-xl group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">{CONTACT_EMAIL}</span>
              </a>

              {/* Newsletter */}
              <div className="mt-6">
                <p className="text-sm text-blue-100/80 mb-3">
                  Subscribe to our newsletter
                </p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Your email"
                    className="flex-1 px-3 py-2 text-sm bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg focus:outline-none focus:border-white focus:bg-white/30 transition-all placeholder:text-blue-100/60"
                  />
                  <button
                    onClick={handleSubscribe}
                    className="px-4 py-2 text-sm font-semibold bg-white text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-105 shadow-lg"
                  >
                    →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/20 relative z-10">
        <div className="container mx-auto px-4 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-blue-100/70">
              © 2024 United Company. All rights reserved.
            </p>

            <div className="flex items-center gap-6">
              <a
                href={TERMS_URL}
                className="text-sm text-blue-100/70 hover:text-white transition-colors duration-200"
              >
                Terms & Conditions
              </a>
              <div className="h-4 w-px bg-white/30"></div>
              <a
                href={PRIVACY_URL}
                className="text-sm text-blue-100/70 hover:text-white transition-colors duration-200"
              >
                Privacy Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
