export interface MortgageRate {
  id: number
  yearFrom: number
  yearTo: number
  interestRate: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CalculateMortgageDto {
  price: number
  months: number
  downPayment?: number
}

export interface MortgageCalculationResult {
  loanAmount: number
  monthlyPayment: number
  totalPayment: number
  totalInterest: number
  interestRate: number
  months: number
  downPayment: number
  price: number
}

export interface CreateMortgageRateDto {
  yearFrom: number
  yearTo: number
  interestRate: number
  isActive?: boolean
}

export interface UpdateMortgageRateDto {
  yearFrom?: number
  yearTo?: number
  interestRate?: number
  isActive?: boolean
}

export interface MortgageRate {
  id: number
  yearFrom: number
  yearTo: number
  interestRate: number
  createdAt: string
  updatedAt: string
}

export interface MortgageRatesResponse {
  data: MortgageRate[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}
