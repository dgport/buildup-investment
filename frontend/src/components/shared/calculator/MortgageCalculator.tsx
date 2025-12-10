import { useState, useEffect } from 'react'

import { useMortgageRates } from '@/lib/hooks/useCalculator'

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

const MortgageCalculator = () => {
  const [price, setPrice] = useState<number>(100000)
  const [downPayment, setDownPayment] = useState<number>(10000)
  const [months, setMonths] = useState<number>(12)
  const [result, setResult] = useState<MortgageResult | null>(null)

  const { data: rates, isLoading: ratesLoading } = useMortgageRates()

  const minYear = rates?.[0]?.yearFrom || 1
  const maxYear = rates?.[rates.length - 1]?.yearTo || 30
  const minMonths = minYear * 12
  const maxMonths = maxYear * 12
  const minDownPayment = price * 0.1

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

  const downPaymentPercent = ((downPayment / price) * 100).toFixed(0)
  const interestPercent = result
    ? ((result.totalInterest / result.totalPayment) * 100).toFixed(0)
    : 0
  const principalPercent = result
    ? ((result.loanAmount / result.totalPayment) * 100).toFixed(0)
    : 0

  if (ratesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <div className="text-gray-600">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-auto  p-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              იპოთეკარი კალკულატორი
            </h2>

            <div className="space-y-8">
              <div>
                <div className="flex justify-between items-baseline mb-3">
                  <label className="text-sm text-gray-600">
                    ქონების ღირებულება
                  </label>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(price)} ₾
                  </div>
                </div>
                <input
                  type="range"
                  min="10000"
                  max="1000000"
                  step="1000"
                  value={price}
                  onChange={e => setPrice(Number(e.target.value))}
                  className="w-full h-1 bg-gray-300 rounded appearance-none cursor-pointer accent-cyan-500"
                />
              </div>

              <div>
                <div className="flex justify-between items-baseline mb-3">
                  <label className="text-sm text-gray-600">
                    წინასწარი შენატანი {downPaymentPercent}%
                  </label>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(downPayment)} ₾
                  </div>
                </div>
                <input
                  type="range"
                  min={minDownPayment}
                  max={price}
                  step="1000"
                  value={downPayment}
                  onChange={e => setDownPayment(Number(e.target.value))}
                  className="w-full h-1 bg-gray-300 rounded appearance-none cursor-pointer accent-cyan-500"
                />
              </div>

              <div>
                <div className="flex justify-between items-baseline mb-3">
                  <label className="text-sm text-gray-600">სესხის ვადა</label>
                  <div className="text-2xl font-bold text-gray-900">
                    {years}{' '}
                    <span className="text-base text-gray-400">წელი</span>
                  </div>
                </div>
                <input
                  type="range"
                  min={minMonths}
                  max={maxMonths}
                  step="12"
                  value={months}
                  onChange={e => setMonths(Number(e.target.value))}
                  className="w-full h-1 bg-gray-300 rounded appearance-none cursor-pointer accent-cyan-500"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6">
              <div className="flex items-center h-4 rounded-full overflow-hidden mb-4">
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

              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-400"></span>
                  <span className="text-gray-600">პროცენტი</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-yellow-300"></span>
                  <span className="text-gray-600">წინასწარი შენატანი</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-400"></span>
                  <span className="text-gray-600">ძირი</span>
                </div>
              </div>

              {result && (
                <>
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="text-sm text-gray-600 mb-1">
                      ყოველთვიური შენატანი
                    </div>
                    <div className="text-3xl font-bold text-gray-900">
                      {formatCurrency(result.monthlyPayment)} ₾
                    </div>
                    <div className="text-sm text-gray-500 mt-2">
                      საპროცენტო განაკვეთი: {result.interestRate}% წელიწადში
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">
                        სესხის თანხა (წინასწარი შენატანის შემდეგ)
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        {formatCurrency(result.loanAmount)} ₾
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">
                        სულ გადასახდელი (წინასწარი შენატანის ჩათვლით)
                      </div>
                      <div className="text-3xl font-bold text-gray-900">
                        {formatCurrency(
                          result.totalPayment + result.downPayment
                        )}{' '}
                        ₾
                      </div>
                    </div>
                  </div>

                  <button className="w-full mt-6 bg-cyan-500 hover:bg-cyan-600 text-white font-medium py-4 px-6 rounded-lg transition-colors">
                    მოითხოვე სესხი
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MortgageCalculator
