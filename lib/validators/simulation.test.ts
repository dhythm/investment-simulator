import { describe, it, expect } from 'vitest'
import { validateSimulationRequest } from './simulation'

describe('SimulationValidator', () => {
  const validRequest = {
    principal: 1000000,
    interestType: 'compound',
    annualRate: 5,
    years: 10,
    depositAmount: 10000,
    depositFrequency: 'monthly',
    taxRate: 20.315,
    taxTiming: 'annual',
    managementFee: 0.5,
    tradingFee: 1000
  }

  it('有効なリクエストが通ること', () => {
    const result = validateSimulationRequest(validRequest)
    
    expect(result.success).toBe(true)
    expect(result.data).toBeDefined()
    expect(result.error).toBeUndefined()
  })

  it('必須フィールドが不足している場合エラーになること', () => {
    const invalidRequest = { ...validRequest }
    delete (invalidRequest as any).principal
    
    const result = validateSimulationRequest(invalidRequest)
    
    expect(result.success).toBe(false)
    expect(result.error).toContain('principal')
    expect(result.data).toBeUndefined()
  })

  it('数値フィールドに文字列が入っている場合エラーになること', () => {
    const invalidRequest = { ...validRequest, principal: 'abc' as any }
    
    const result = validateSimulationRequest(invalidRequest)
    
    expect(result.success).toBe(false)
    expect(result.error).toContain('数値')
  })

  it('負の数値が入っている場合エラーになること', () => {
    const invalidRequest = { ...validRequest, principal: -1000 }
    
    const result = validateSimulationRequest(invalidRequest)
    
    expect(result.success).toBe(false)
    expect(result.error).toContain('0以上')
  })

  it('範囲外の値が入っている場合エラーになること', () => {
    const invalidRequest = { ...validRequest, annualRate: 101 }
    
    const result = validateSimulationRequest(invalidRequest)
    
    expect(result.success).toBe(false)
    expect(result.error).toContain('100以下')
  })

  it('不正な選択肢が入っている場合エラーになること', () => {
    const invalidRequest = { ...validRequest, interestType: 'invalid' as any }
    
    const result = validateSimulationRequest(invalidRequest)
    
    expect(result.success).toBe(false)
    expect(result.error).toContain('compound')
  })

  it('depositFrequencyの選択肢が正しくチェックされること', () => {
    const invalidRequest = { ...validRequest, depositFrequency: 'weekly' as any }
    
    const result = validateSimulationRequest(invalidRequest)
    
    expect(result.success).toBe(false)
    expect(result.error).toContain('積立頻度')
  })

  it('taxTimingの選択肢が正しくチェックされること', () => {
    const invalidRequest = { ...validRequest, taxTiming: 'quarterly' as any }
    
    const result = validateSimulationRequest(invalidRequest)
    
    expect(result.success).toBe(false)
    expect(result.error).toContain('課税タイミング')
  })
})