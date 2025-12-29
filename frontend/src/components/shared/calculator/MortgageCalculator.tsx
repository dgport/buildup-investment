import { useState, useEffect } from 'react'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { DollarSign, Home } from 'lucide-react'

interface MortgageResult {
  loanAmount: number
  monthlyPayment: number
  totalPayment: number
  months: number
  downPayment: number
  price: number
}

interface MortgageCalculatorProps {
  initialPrice?: number | null
}

const MortgageCalculator = ({
  initialPrice = null,
}: MortgageCalculatorProps) => {
  const [currency, setCurrency] = useState<'GEL' | 'USD'>('GEL')
  const exchangeRate = 2.7

  const defaultPriceGEL = initialPrice || 100000
  const [price, setPrice] = useState<number>(defaultPriceGEL)
  const [downPayment, setDownPayment] = useState<number>(defaultPriceGEL * 0.1)
  const [months, setMonths] = useState<number>(12)
  const [result, setResult] = useState<MortgageResult | null>(null)

  // Bounds for the calculator
  const minMonths = 12
  const maxMonths = 360 // 30 years
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
        months,
        downPayment,
        price,
      })
      return
    }

    // Calculating without interest (Principal only)
    const monthlyPayment = loanAmount / months
    const totalPayment = loanAmount

    setResult({
      loanAmount: Math.round(loanAmount * 100) / 100,
      monthlyPayment: Math.round(monthlyPayment * 100) / 100,
      totalPayment: Math.round(totalPayment * 100) / 100,
      months,
      downPayment,
      price,
    })
  }

  // Ensure down payment doesn't fall below 10% when price changes
  useEffect(() => {
    if (downPayment < minDownPayment) {
      setDownPayment(minDownPayment)
    }
  }, [price, minDownPayment])

  useEffect(() => {
    calculateMortgage()
  }, [price, downPayment, months])

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

  return (
    <div className="  bg-gradient-to-br from-slate-50 via-gray-50 to-slate-50 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-4 items-stretch">
          {/* Input Section */}
          <div className="bg-gradient-to-br from-teal-900/90 to-teal-950/90 backdrop-blur-sm rounded-2xl p-6 border border-amber-400/20 shadow-2xl flex flex-col">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-amber-400 flex items-center gap-2">
                <Home className="w-5 h-5" />
                Loan Details
              </h2>
            </div>

            <div className="space-y-6">
              {/* Property Price */}
              <div>
                <div className="flex justify-between items-baseline mb-3">
                  <label className="text-sm font-semibold text-amber-100/80 uppercase tracking-wider">
                    Property Price
                    {isFixedPrice && (
                      <span className="ml-2 text-xs text-amber-400 bg-amber-400/10 px-2 py-1 rounded-full border border-amber-400/30">
                        Fixed
                      </span>
                    )}
                  </label>
                  <div className="text-xl font-bold text-amber-400">
                    {getDisplayPrice(price)}
                  </div>
                </div>
                {!isFixedPrice && (
                  <Slider
                    min={10000}
                    max={1000000}
                    step={1000}
                    value={[price]}
                    onValueChange={value => setPrice(value[0])}
                  />
                )}
              </div>

              {/* Down Payment */}
              <div>
                <div className="flex justify-between items-baseline mb-3">
                  <label className="text-sm font-semibold text-amber-100/80 uppercase tracking-wider">
                    Down Payment
                  </label>
                  <div className="text-xl font-bold text-amber-400">
                    {getDisplayPrice(downPayment)}
                  </div>
                </div>
                <Slider
                  min={minDownPayment}
                  max={price}
                  step={1000}
                  value={[downPayment]}
                  onValueChange={value => setDownPayment(value[0])}
                  className="[&_[role=slider]]:bg-amber-400 [&_[role=slider]]:border-amber-400 [&_.bg-primary]:bg-amber-400"
                />
                <div className="mt-1 text-xs text-amber-100/60">
                  Minimum: {getDisplayPrice(minDownPayment)} (10%)
                </div>
              </div>

              {/* Loan Term */}
              <div>
                <div className="flex justify-between items-baseline mb-3">
                  <label className="text-sm font-semibold text-amber-100/80 uppercase tracking-wider">
                    Loan Term
                  </label>
                  <div className="text-xl font-bold text-amber-400">
                    {years}{' '}
                    <span className="text-base text-amber-100/60">years</span>
                  </div>
                </div>
                <Slider
                  min={minMonths}
                  max={maxMonths}
                  step={12}
                  value={[months]}
                  onValueChange={value => setMonths(value[0])}
                  className="[&_[role=slider]]:bg-amber-400 [&_[role=slider]]:border-amber-400 [&_.bg-primary]:bg-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="bg-gradient-to-br from-teal-900/90 to-teal-950/90 backdrop-blur-sm rounded-2xl p-6 border border-amber-400/20 shadow-2xl flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-amber-400">Results</h2>
              <div className="flex items-center gap-3 bg-teal-950/50 rounded-full px-4 py-2 border border-amber-400/30">
                <span
                  className={`text-xs font-semibold transition-colors ${currency === 'USD' ? 'text-amber-400' : 'text-amber-100/40'}`}
                >
                  USD
                </span>
                <Switch
                  checked={currency === 'GEL'}
                  onCheckedChange={checked =>
                    setCurrency(checked ? 'GEL' : 'USD')
                  }
                  className="data-[state=checked]:bg-amber-400"
                />
                <span
                  className={`text-xs font-semibold transition-colors ${currency === 'GEL' ? 'text-amber-400' : 'text-amber-100/40'}`}
                >
                  GEL
                </span>
              </div>
            </div>

            {/* Visual Breakdown Bar */}
            <div className="mb-4">
              <div className="flex items-center h-4 rounded-full overflow-hidden shadow-inner bg-teal-950/50 border border-amber-400/20">
                <div
                  className="bg-gradient-to-r from-amber-400 to-amber-500 h-full transition-all duration-500"
                  style={{
                    width: `${((downPayment / price) * 100).toFixed(0)}%`,
                  }}
                />
                <div
                  className="bg-gradient-to-r from-teal-400 to-teal-500 h-full transition-all duration-500"
                  style={{
                    width: `${(((price - downPayment) / price) * 100).toFixed(0)}%`,
                  }}
                />
              </div>
              <div className="flex items-center gap-4 mt-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 shadow-lg"></span>
                  <span className="text-amber-100/70">Down Payment</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-gradient-to-r from-teal-400 to-teal-500 shadow-lg"></span>
                  <span className="text-amber-100/70">Loan Amount</span>
                </div>
              </div>
            </div>

            {result && (
              <>
                <div className="bg-gradient-to-br from-amber-400/20 to-amber-500/10 rounded-2xl p-3 mb-4 border border-amber-400/30 shadow-lg">
                  <div className="flex items-center gap-2 text-sm text-amber-100/70 mb-1">
                    <DollarSign className="w-4 h-4" />
                    Monthly Payment
                  </div>
                  <div className="text-xl font-bold text-amber-400">
                    {getDisplayPrice(result.monthlyPayment)}
                  </div>
                </div>

                <div className="space-y-3 mb-4 flex-grow">
                  <div className="flex justify-between items-center p-3 bg-teal-950/50 rounded-xl border border-amber-400/10">
                    <div className="text-sm text-amber-100/70">Loan Amount</div>
                    <div className="text-base font-bold text-amber-100">
                      {getDisplayPrice(result.loanAmount)}
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-teal-950/50 rounded-xl border border-amber-400/10">
                    <div className="text-sm text-amber-100/70">
                      Down Payment
                    </div>
                    <div className="text-base font-bold text-amber-100">
                      {getDisplayPrice(result.downPayment)}
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-teal-950/50 rounded-xl border border-amber-400/10">
                    <div className="text-sm text-amber-100/70">
                      Total to Repay
                    </div>
                    <div className="text-base font-bold text-amber-100">
                      {getDisplayPrice(result.totalPayment)}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MortgageCalculator
