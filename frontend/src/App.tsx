import { BrowserRouter } from 'react-router-dom'
import { ErrorBoundary } from 'react-error-boundary'
import { useEffect } from 'react'
import { QueryProvider } from './providers/QueryProvider'
import { AppRoutes } from './routes/AppRoutes'
import { queryClient } from './lib/tanstack/query-client'
import Footer from './components/footer/Footer'
import { ScrollToTop } from './lib/utils/scroll-top'
import { ErrorFallback } from './components/shared/errors/ErrorFallback'
import Header from './components/header/Header'
import { WhatsAppFloat } from './components/shared/whatsapp/WhatsappFloat'
import { CurrencyProvider } from './lib/context/CurrencyContext'

export const App = () => {
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
  }, [])

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        console.error('Error caught by boundary:', error, errorInfo)
      }}
      onReset={() => {
        queryClient.clear()
        window.location.href = '/'
      }}
    >
      <BrowserRouter>
        <CurrencyProvider>
          <QueryProvider>
            <ScrollToTop />
            <Header />
            <AppRoutes />
            <WhatsAppFloat />
            <Footer />
          </QueryProvider>
        </CurrencyProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
