import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react'

type Currency = 'USD' | 'GEL'

interface CurrencyContextType {
  currency: Currency
  setCurrency: (currency: Currency) => void
  exchangeRate: number
  isLoading: boolean
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(
  undefined
)

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<Currency>('USD')
  const [exchangeRate, setExchangeRate] = useState<number>(2.8) // fallback rate
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(
          'https://api.exchangerate-api.com/v4/latest/USD'
        )
        const data = await response.json()

        if (data.rates && data.rates.GEL) {
          setExchangeRate(data.rates.GEL)
        }
      } catch (error) {
        console.error('Failed to fetch exchange rate:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchExchangeRate()
    const interval = setInterval(fetchExchangeRate, 3600000)

    return () => clearInterval(interval)
  }, [])

  return (
    <CurrencyContext.Provider
      value={{ currency, setCurrency, exchangeRate, isLoading }}
    >
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  return context
}
