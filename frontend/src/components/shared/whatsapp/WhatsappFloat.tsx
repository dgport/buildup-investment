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
      className="fixed bottom-[100px] right-6 z-50 flex items-center gap-2 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 group md:bottom-[100px] md:right-4"
      aria-label="Contact us on WhatsApp"
    >
      <div className="flex items-center gap-2 md:gap-3 py-3 px-4 md:py-3.5 md:px-4">
        <MessageCircle
          className={` w-6  h-6 transition-transform duration-300 flex-shrink-0 ${isHovered ? 'scale-110 rotate-12' : ''}`}
          strokeWidth={2.5}
        />
        <span
          className={`font-semibold text-sm md:text-base whitespace-nowrap overflow-hidden transition-all duration-300 ${
            isHovered ? 'max-w-[150px] opacity-100' : 'max-w-0 opacity-0'
          }`}
        >
          Chat with us
        </span>
      </div>

      <div className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20 pointer-events-none" />
    </a>
  )
}
