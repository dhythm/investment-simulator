export interface SimulationRequest {
  principal: number
  interestType: 'compound' | 'simple'
  annualRate: number
  years: number
  depositAmount: number
  depositFrequency: 'none' | 'monthly' | 'yearly'
  taxRate: number
  taxTiming: 'annual' | 'maturity'
  managementFee: number
  tradingFee: number
}

export interface SimulationResult {
  year: number
  principal: number
  deposit: number
  interest: number
  tax: number
  fee: number
  balance: number
}

export interface SimulationResponse {
  success: boolean
  data?: SimulationResult[]
  error?: string
}

export interface ValidationResult<T> {
  success: boolean
  data?: T
  error?: string
}