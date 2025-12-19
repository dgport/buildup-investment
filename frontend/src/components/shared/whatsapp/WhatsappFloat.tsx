import { MessageCircle } from 'lucide-react'
import { useState } from 'react'

export const WhatsAppFloat = () => {
  const [isHovered, setIsHovered] = useState(false)

  const phoneNumber = '995595804795'
  const message = encodeURIComponent(
    'Hello! I am interested in your properties.'
  )
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="fixed bottom-24 right-6 z-50 flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
      aria-label="Contact us on WhatsApp"
    >
      <div className="flex items-center gap-3 py-3 px-4">
        <MessageCircle
          className={`w-6 h-6 transition-transform duration-300 ${isHovered ? 'scale-110' : ''}`}
          strokeWidth={2.5}
        />
        <span
          className={`font-medium text-sm whitespace-nowrap overflow-hidden transition-all duration-300 ${
            isHovered ? 'max-w-[150px] opacity-100' : 'max-w-0 opacity-0'
          }`}
        >
          Chat with us
        </span>
      </div>

      <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-20" />
    </a>
  )
}
