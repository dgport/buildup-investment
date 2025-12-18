import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useMortgageRates } from '@/lib/hooks/useCalculator'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { useCurrency } from '@/lib/context/CurrencyContext'
 

interface MortgageResult {
  loanAmount: number
  monthlyPayment: number
  totalPayment: number
  totalInterest: number
  interestRate: number
  months: number
  downPayment: number
  price: number
}

interface MortgageCalculatorProps {
  initialPrice?: number | null
}

const MortgageCalculator = ({ initialPrice }: MortgageCalculatorProps) => {
  const { t } = useTranslation()
  const { currency, setCurrency, exchangeRate } = useCurrency()

  // Price is always stored in GEL internally
  const defaultPriceGEL = initialPrice || 100000
  const [price, setPrice] = useState<number>(defaultPriceGEL)
  const [downPayment, setDownPayment] = useState<number>(defaultPriceGEL * 0.1)
  const [months, setMonths] = useState<number>(12)
  const [result, setResult] = useState<MortgageResult | null>(null)

  const { data: rates, isLoading: ratesLoading } = useMortgageRates()

  const minYear = rates?.[0]?.yearFrom || 1
  const maxYear = rates?.[rates.length - 1]?.yearTo || 30
  const minMonths = minYear * 12
  const maxMonths = maxYear * 12
  const minDownPayment = price * 0.1

  const isFixedPrice = initialPrice !== null && initialPrice !== undefined

  useEffect(() => {
    if (initialPrice) {
      setPrice(initialPrice)
      setDownPayment(initialPrice * 0.1)
    }
  }, [initialPrice])

  const calculateMortgage = () => {
    const loanAmount = price - downPayment

    if (loanAmount <= 0) {
      setResult({
        loanAmount: 0,
        monthlyPayment: 0,
        totalPayment: 0,
        totalInterest: 0,
        interestRate: 0,
        months,
        downPayment,
        price,
      })
      return
    }

    const years = Math.floor(months / 12)
    const rate = rates?.find(r => r.yearFrom <= years && r.yearTo >= years)

    if (!rate) {
      setResult(null)
      return
    }

    const monthlyRate = rate.interestRate / 12 / 100
    const denominator = Math.pow(1 + monthlyRate, months) - 1

    let monthlyPayment: number
    if (denominator === 0) {
      monthlyPayment = loanAmount / months
    } else {
      monthlyPayment =
        (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, months))) /
        denominator
    }

    const totalPayment = monthlyPayment * months
    const totalInterest = totalPayment - loanAmount

    setResult({
      loanAmount: Math.round(loanAmount * 100) / 100,
      monthlyPayment: Math.round(monthlyPayment * 100) / 100,
      totalPayment: Math.round(totalPayment * 100) / 100,
      totalInterest: Math.round(totalInterest * 100) / 100,
      interestRate: rate.interestRate,
      months,
      downPayment,
      price,
    })
  }

  useEffect(() => {
    if (downPayment < minDownPayment) {
      setDownPayment(minDownPayment)
    }
  }, [price, minDownPayment])

  useEffect(() => {
    if (rates && rates.length > 0) {
      calculateMortgage()
    }
  }, [price, downPayment, months, rates])

  useEffect(() => {
    if (rates && rates.length > 0 && !result) {
      calculateMortgage()
    }
  }, [rates])

  const years = Math.floor(months / 12)

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const getDisplayPrice = (valueInGEL: number): string => {
    if (currency === 'GEL') {
      return `${formatCurrency(valueInGEL)} ₾`
    }
    const valueInUSD = Math.round(valueInGEL / exchangeRate)
    return `$${formatCurrency(valueInUSD)}`
  }

  const downPaymentPercent = ((downPayment / price) * 100).toFixed(0)
  const interestPercent = result
    ? ((result.totalInterest / result.totalPayment) * 100).toFixed(0)
    : 0
  const principalPercent = result
    ? ((result.loanAmount / result.totalPayment) * 100).toFixed(0)
    : 0

  if (ratesLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <div className="text-gray-600">{t('calculator.loading')}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-auto px-3 md:px-4 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-3 md:gap-4 items-start">
          <div className="bg-white rounded-md p-4 md:p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg md:text-xl font-bold text-gray-900">
                {t('calculator.title')}
              </h2>
              <div className="flex items-center gap-2 bg-white rounded-full px-2.5 py-1.5 shadow-sm">
                <span
                  className={`text-xs font-medium ${currency === 'USD' ? 'text-blue-900' : 'text-gray-400'}`}
                >
                  USD
                </span>
                <Switch
                  checked={currency === 'GEL'}
                  onCheckedChange={checked =>
                    setCurrency(checked ? 'GEL' : 'USD')
                  }
                />
                <span
                  className={`text-xs font-medium ${currency === 'GEL' ? 'text-blue-900' : 'text-gray-400'}`}
                >
                  GEL
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-baseline mb-2">
                  <label className="text-xs md:text-sm font-medium text-gray-600">
                    {t('calculator.propertyPrice')}
                    {isFixedPrice && (
                      <span className="ml-2 text-xs text-blue-600">
                        (Fixed)
                      </span>
                    )}
                  </label>
                  <div className="text-base md:text-lg font-bold text-gray-900">
                    {getDisplayPrice(price)}
                  </div>
                </div>
                {!isFixedPrice && (
                  <div className="py-1">
                    <Slider
                      min={10000}
                      max={1000000}
                      step={1000}
                      value={[price]}
                      onValueChange={value => setPrice(value[0])}
                      className="w-full"
                    />
                  </div>
                )}
              </div>
              <div>
                <div className="flex justify-between items-baseline mb-2">
                  <label className="text-xs md:text-sm font-medium text-gray-600">
                    {t('calculator.downPayment')} ({downPaymentPercent}%)
                  </label>
                  <div className="text-base md:text-lg font-bold text-gray-900">
                    {getDisplayPrice(downPayment)}
                  </div>
                </div>
                <div className="py-1">
                  <Slider
                    min={minDownPayment}
                    max={price}
                    step={1000}
                    value={[downPayment]}
                    onValueChange={value => setDownPayment(value[0])}
                    className="w-full"
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-baseline mb-2">
                  <label className="text-xs md:text-sm font-medium text-gray-600">
                    {t('calculator.loanTerm')}
                  </label>
                  <div className="text-base md:text-lg font-bold text-gray-900">
                    {years}{' '}
                    <span className="text-sm text-gray-400">
                      {t('calculator.year')}
                    </span>
                  </div>
                </div>
                <div className="py-1">
                  <Slider
                    min={minMonths}
                    max={maxMonths}
                    step={12}
                    value={[months]}
                    onValueChange={value => setMonths(value[0])}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-md p-4 md:p-5">
            <div className="flex items-center h-2 md:h-3 rounded-full overflow-hidden mb-3">
              <div
                className="bg-red-400 h-full"
                style={{ width: `${interestPercent}%` }}
              />
              <div
                className="bg-yellow-300 h-full"
                style={{ width: `${downPaymentPercent}%` }}
              />
              <div
                className="bg-blue-400 h-full"
                style={{ width: `${principalPercent}%` }}
              />
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs mb-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
                <span className="text-gray-600">
                  {t('calculator.interest')}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-300"></span>
                <span className="text-gray-600">
                  {t('calculator.downPaymentLabel')}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
                <span className="text-gray-600">
                  {t('calculator.principal')}
                </span>
              </div>
            </div>

            {result && (
              <>
                <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg p-3 md:p-4 mb-3 border border-cyan-100">
                  <div className="text-xs md:text-sm text-gray-600 mb-1">
                    {t('calculator.monthlyPayment')}
                  </div>
                  <div className="text-xl md:text-2xl font-bold text-gray-900">
                    {getDisplayPrice(result.monthlyPayment)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {t('calculator.interestRate')}: {result.interestRate}%
                  </div>
                </div>
                <div className="space-y-2.5 mb-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <div className="text-xs md:text-sm text-gray-600">
                      {t('calculator.loanAmountAfterDown')}
                    </div>
                    <div className="text-sm md:text-base font-bold text-gray-900">
                      {getDisplayPrice(result.loanAmount)}
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <div className="text-xs md:text-sm text-gray-600">
                      {t('calculator.totalPayment')}
                    </div>
                    <div className="text-sm md:text-base font-bold text-gray-900">
                      {getDisplayPrice(
                        result.totalPayment + result.downPayment
                      )}
                    </div>
                  </div>
                </div>
                <Button className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-medium py-2.5 md:py-3 rounded-md transition-colors text-sm md:text-base">
                  {t('calculator.requestLoan')}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MortgageCalculator
