import { useState } from 'react'
import { Facebook, Mail, Phone, MapPin, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const Contact = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    message: '',
  })
  const [result, setResult] = useState('')

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setResult('Sending...')
    setTimeout(() => {
      setResult('Message sent successfully!')
      setFormData({ fullName: '', email: '', phone: '', message: '' })
      setTimeout(() => setResult(''), 5000)
    }, 1500)
  }

  return (
    <section className="min-h-screen bg-stone-50   px-6 md:px-12 lg:px-20">
      <div className="max-w-6xl mx-auto">
        <div className="mb-16 max-w-2xl">
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-teal-950 mb-6">
            Let's Discuss Your Investment Goals
          </h1>
        </div>
        <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
          <div className="lg:col-span-3 order-2 lg:order-1">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-teal-900 mb-2">
                  Full Name
                </label>
                <Input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  placeholder="Your name"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-teal-900 mb-2">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-teal-900 mb-2">
                    Phone Number
                  </label>
                  <Input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white border border-stone-200 rounded-lg focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-colors text-stone-800 placeholder:text-stone-400"
                    placeholder="+995 (000) 00-00-00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-teal-900 mb-2">
                  Message
                </label>
                <Textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={6}
                  required
                  className="w-full px-4 py-3 bg-white border border-stone-200 rounded-lg focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-colors text-stone-800 placeholder:text-stone-400 resize-none"
                  placeholder="Tell us about your investment interests..."
                />
              </div>

              <Button type="submit">
                Send Message
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>

              {result && (
                <p
                  className={`text-sm font-medium ${
                    result.includes('success')
                      ? 'text-teal-700'
                      : result.includes('Sending')
                        ? 'text-stone-500'
                        : 'text-red-600'
                  }`}
                >
                  {result}
                </p>
              )}
            </form>
          </div>
          <div className="lg:col-span-2 order-1 lg:order-2 space-y-8">
            <div className="bg-white border border-amber-200/50 rounded-2xl p-8 space-y-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-teal-950 mb-1">Location</h3>
                  <a
                    href="https://maps.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-stone-600 hover:text-teal-700 transition-colors"
                  >
                    Batumi, Georgia
                    <br />
                    Investment & Development Hub
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-100 to-teal-200 rounded-full flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-teal-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-teal-950 mb-1">Phone</h3>
                  <a
                    href="tel:+995000000000"
                    className="text-sm text-stone-600 hover:text-teal-700 transition-colors"
                  >
                    +995 000 00 00 00
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-teal-950 mb-1">Email</h3>
                  <a
                    href="mailto:digitalport@gmail.com"
                    className="text-sm text-stone-600 hover:text-teal-700 transition-colors break-all"
                  >
                    digitalport@gmail.com
                  </a>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-xs font-medium tracking-[0.2em] uppercase text-teal-600 mb-4">
                Connect With Us
              </h3>
              <div className="flex gap-3">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 bg-white border border-amber-200 rounded-full flex items-center justify-center text-teal-700 hover:text-amber-600 hover:border-amber-400 hover:bg-amber-50 transition-all duration-300"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              </div>
            </div>
            <div className="hidden lg:block pt-8">
              <div className="w-24 h-1 bg-gradient-to-r from-teal-400 to-amber-400 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Contact
