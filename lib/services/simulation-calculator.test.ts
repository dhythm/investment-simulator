import { describe, it, expect } from 'vitest'
import { calculateSimulation } from './simulation-calculator'
import { SimulationRequest } from '../types/simulation'

describe('SimulationCalculator', () => {
  it('複利計算が正しく動作すること', () => {
    const request: SimulationRequest = {
      principal: 1000000,
      interestType: 'compound',
      annualRate: 5,
      years: 3,
      depositAmount: 0,
      depositFrequency: 'none',
      taxRate: 20,
      taxTiming: 'maturity',
      managementFee: 0,
      tradingFee: 0
    }

    const results = calculateSimulation(request)

    expect(results).toHaveLength(3)
    expect(results[0].year).toBe(1)
    expect(results[2].year).toBe(3)
    
    // 複利計算の確認（税引前）
    const totalInterest = results.reduce((sum, r) => sum + r.interest, 0)
    expect(totalInterest).toBeGreaterThan(150000) // 5%の3年分より大きい
  })

  it('単利計算が正しく動作すること', () => {
    const request: SimulationRequest = {
      principal: 1000000,
      interestType: 'simple',
      annualRate: 5,
      years: 3,
      depositAmount: 0,
      depositFrequency: 'none',
      taxRate: 20,
      taxTiming: 'maturity',
      managementFee: 0,
      tradingFee: 0
    }

    const results = calculateSimulation(request)

    expect(results).toHaveLength(3)
    
    // 単利計算の確認
    results.forEach(result => {
      expect(result.interest).toBe(50000) // 毎年同じ利息
    })
  })

  it('定期積立が正しく計算されること', () => {
    const request: SimulationRequest = {
      principal: 1000000,
      interestType: 'compound',
      annualRate: 5,
      years: 2,
      depositAmount: 10000,
      depositFrequency: 'monthly',
      taxRate: 20,
      taxTiming: 'maturity',
      managementFee: 0,
      tradingFee: 0
    }

    const results = calculateSimulation(request)

    expect(results[0].deposit).toBe(120000) // 月1万円×12ヶ月
    expect(results[1].deposit).toBe(120000)
  })

  it('年次課税が正しく適用されること', () => {
    const request: SimulationRequest = {
      principal: 1000000,
      interestType: 'compound',
      annualRate: 5,
      years: 2,
      depositAmount: 0,
      depositFrequency: 'none',
      taxRate: 20,
      taxTiming: 'annual',
      managementFee: 0,
      tradingFee: 0
    }

    const results = calculateSimulation(request)

    results.forEach(result => {
      expect(result.tax).toBeGreaterThan(0) // 毎年税金が発生
      expect(result.tax).toBeCloseTo(result.interest * 0.2, 2) // 20%の税金
    })
  })

  it('満期時課税が正しく適用されること', () => {
    const request: SimulationRequest = {
      principal: 1000000,
      interestType: 'compound',
      annualRate: 5,
      years: 3,
      depositAmount: 0,
      depositFrequency: 'none',
      taxRate: 20,
      taxTiming: 'maturity',
      managementFee: 0,
      tradingFee: 0
    }

    const results = calculateSimulation(request)

    // 最終年のみ税金が発生
    expect(results[0].tax).toBe(0)
    expect(results[1].tax).toBe(0)
    expect(results[2].tax).toBeGreaterThan(0)
    
    // 税額が利息合計の20%であること
    const totalInterest = results.reduce((sum, r) => sum + r.interest, 0)
    expect(results[2].tax).toBeCloseTo(totalInterest * 0.2, 2)
  })
})