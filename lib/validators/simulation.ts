import { SimulationRequest, ValidationResult } from '@/lib/types/simulation'

export function validateSimulationRequest(data: unknown): ValidationResult<SimulationRequest> {
  if (!data || typeof data !== 'object') {
    return {
      success: false,
      error: 'リクエストデータが不正です'
    }
  }

  const input = data as Record<string, unknown>

  // 必須フィールドのチェック
  const requiredFields = [
    'principal', 'interestType', 'annualRate', 'years',
    'depositAmount', 'depositFrequency', 'taxRate', 
    'taxTiming', 'managementFee', 'tradingFee'
  ]

  for (const field of requiredFields) {
    if (!(field in input)) {
      return {
        success: false,
        error: `必須項目「${field}」が不足しています`
      }
    }
  }

  // 数値フィールドの型と範囲チェック
  const numericFields = [
    { name: 'principal', min: 0, max: 1000000000000 },
    { name: 'annualRate', min: 0, max: 100 },
    { name: 'years', min: 1, max: 100 },
    { name: 'depositAmount', min: 0, max: 1000000000 },
    { name: 'taxRate', min: 0, max: 100 },
    { name: 'managementFee', min: 0, max: 100 },
    { name: 'tradingFee', min: 0, max: 1000000000 }
  ]

  for (const field of numericFields) {
    const value = input[field.name]
    
    if (typeof value !== 'number' || isNaN(value as number)) {
      return {
        success: false,
        error: `「${field.name}」は数値である必要があります`
      }
    }

    if ((value as number) < field.min || (value as number) > field.max) {
      return {
        success: false,
        error: `「${field.name}」は${field.min}以上${field.max}以下である必要があります`
      }
    }
  }

  // 文字列フィールドの選択肢チェック
  if (!['compound', 'simple'].includes(input.interestType as string)) {
    return {
      success: false,
      error: '運用方式は「compound」または「simple」である必要があります'
    }
  }

  if (!['none', 'monthly', 'yearly'].includes(input.depositFrequency as string)) {
    return {
      success: false,
      error: '積立頻度は「none」「monthly」「yearly」のいずれかである必要があります'
    }
  }

  if (!['annual', 'maturity'].includes(input.taxTiming as string)) {
    return {
      success: false,
      error: '課税タイミングは「annual」または「maturity」である必要があります'
    }
  }

  return {
    success: true,
    data: {
      principal: input.principal as number,
      interestType: input.interestType as 'compound' | 'simple',
      annualRate: input.annualRate as number,
      years: input.years as number,
      depositAmount: input.depositAmount as number,
      depositFrequency: input.depositFrequency as 'none' | 'monthly' | 'yearly',
      taxRate: input.taxRate as number,
      taxTiming: input.taxTiming as 'annual' | 'maturity',
      managementFee: input.managementFee as number,
      tradingFee: input.tradingFee as number
    }
  }
}