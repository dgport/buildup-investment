import { useEffect } from 'react'

export const Tawk = () => {
  useEffect(() => {
    const script = document.createElement('script')
    script.async = true
    script.src = 'https://embed.tawk.to/69450c78b0232f1983a97b2b/1jcqrhdrt'
    script.charset = 'UTF-8'
    script.setAttribute('crossorigin', '*')

    document.body.appendChild(script)

    script.onload = () => {
      setTimeout(() => {
        const style = document.createElement('style')
        style.innerHTML = `
          /* Move widget up (desktop + mobile) */
          #tawk-bubble-container,
          .tawk-button,
          .tawk-custom-color,
          .tawk-chat-panel,
          .tawk-min-container,
          div[id^="tawk-widget"] {
            bottom: 100px !important;
          }

          /* 📱 Mobile only */
          @media (max-width: 768px) {
            #tawk-bubble-container,
            .tawk-button,
            .tawk-chat-panel,
            .tawk-min-container {
              bottom: 110px !important;
            }

            /* 🔽 Make chat icon smaller on mobile */
            #tawk-bubble-container,
            .tawk-button {
              transform: scale(0.8) !important;
              transform-origin: bottom right !important;
            }
          }
        `
        document.head.appendChild(style)
      }, 1500)
    }

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }

      // remove injected widget if component unmounts
      const tawkWidget = document.getElementById('tawk-widget-container')
      if (tawkWidget) {
        tawkWidget.remove()
      }
    }
  }, [])

  return null
}
