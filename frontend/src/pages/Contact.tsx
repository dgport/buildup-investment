import type React from 'react'

import { useState } from 'react'
import { Facebook, Mail, Phone, MapPin, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useTranslation } from 'react-i18next'
import { useDocumentMeta } from '@/lib/hooks/useDocumentMeta'
 

const Contact = () => {
  const { t, i18n } = useTranslation()

  useDocumentMeta({
    title: t(
      'meta.contact.title',
      'Contact Us | United Construction and Real Estate'
    ),
    description: t(
      'meta.contact.description',
      'Get in touch with United Construction and Real Estate. Contact us in Georgia or Israel for property inquiries, consultations, and real estate services.'
    ),
    keywords: t(
      'meta.contact.keywords',
      'contact United Construction, real estate Georgia contact, property inquiry Batumi, real estate consultation'
    ),
    lang: i18n.language,
  })

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    message: '',
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = () => {
    console.log('Form submitted:', formData)
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      message: '',
    })
  }

  return (
    <div className="min-h-screen relative flex justify-center items-center w-full">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            'url(https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/55 via-gray-900/60 to-slate-800/65"></div>
      </div>

      <div className="relative z-10 px-8 md:px-12 lg:px-16 py-10 w-full xl:max-w-7xl">
        <div className="grid md:grid-cols-5 gap-8 lg:gap-12 md:items-start">
          <div className="md:col-span-2 space-y-6 flex flex-col">
            <div className="flex flex-col gap-6 flex-1">
              {[
                {
                  location: t('contact.locationGeorgia'),
                  phone: '+995 595 80 47 95',
                  email: 'unitedcompany2026@gmail.com',
                },
                {
                  location: t('contact.locationIsrael'),
                  phone: '+972 52-866-2380',
                  email: 'unitedcompany2026@gmail.com',
                },
              ].map((info, idx) => (
                <div
                  key={idx}
                  className="bg-white/15 backdrop-blur-lg border border-white/25 rounded-2xl p-6 space-y-6 flex-1 shadow-xl"
                >
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-amber-500/20 backdrop-blur-sm rounded-lg flex items-center justify-center shrink-0 border border-amber-400/30">
                      <MapPin className="w-6 h-6 text-amber-300" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">
                        {t('contact.address')}
                      </h3>
                      <a
                        href="https://maps.app.goo.gl/hWmyEjYsR3uDBTRi7"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gray-300 leading-relaxed hover:text-amber-300 transition-colors cursor-pointer block"
                      >
                        {info.location}
                      </a>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-emerald-500/20 backdrop-blur-sm rounded-lg flex items-center justify-center shrink-0 border border-emerald-400/30">
                      <Phone className="w-6 h-6 text-emerald-300" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">
                        {t('contact.phone')}
                      </h3>
                      <a
                        href={`tel:${info.phone}`}
                        className="text-sm text-gray-300 hover:text-emerald-300 transition-colors cursor-pointer block"
                      >
                        {info.phone}
                      </a>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-purple-500/20 backdrop-blur-sm rounded-lg flex items-center justify-center shrink-0 border border-purple-400/30">
                      <Mail className="w-6 h-6 text-purple-300" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">
                        {t('contact.email')}
                      </h3>
                      <a
                        href={`mailto:${info.email}`}
                        className="text-sm text-gray-300 hover:text-purple-300 transition-colors cursor-pointer block"
                      >
                        {info.email}
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <h3 className="font-semibold text-white mb-4">
                {t('contact.followUs')}
              </h3>
              <div className="flex gap-3">
                <a
                  href="https://www.facebook.com/profile.php?id=61581642350013"
                  className="w-12 h-12 bg-white/15 backdrop-blur-sm rounded-lg border border-white/25 hover:bg-white/25 flex items-center justify-center text-amber-300 hover:text-amber-200 transition-all duration-300 shadow-lg"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="md:col-span-3 flex flex-col">
            <div className="bg-white/15 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/25 flex flex-col h-full">
              <div className="p-6 md:p-8 h-full flex flex-col">
                <h2 className="text-2xl font-bold text-white mb-6">
                  {t('contact.sendMessage')}
                </h2>
                <div className="space-y-5 flex-1">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      {t('contact.fullName')}
                    </label>
                    <Input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        {t('contact.emailAddress')}
                      </label>
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        {t('contact.phoneNumber')}
                      </label>
                      <Input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col">
                    <label className="block text-sm font-medium text-white mb-2">
                      {t('contact.message')}
                    </label>
                    <Textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={6}
                    />
                  </div>

                  <Button className="w-full" onClick={handleSubmit}>
                    <Send className="w-5 h-5" />
                    {t('contact.send')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact
