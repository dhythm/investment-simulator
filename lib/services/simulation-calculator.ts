import { SimulationRequest, SimulationResult } from '@/lib/types/simulation'

export function calculateSimulation(params: SimulationRequest): SimulationResult[] {
  const {
    principal,
    interestType,
    annualRate,
    years,
    depositAmount,
    depositFrequency,
    taxRate,
    taxTiming,
    managementFee,
    tradingFee
  } = params

  const yearlyResults: SimulationResult[] = []
  let currentBalance = principal
  const rate = annualRate / 100
  
  // 年間積立額の計算
  const yearlyDeposit =
    depositFrequency === 'monthly' ? depositAmount * 12 :
    depositFrequency === 'yearly' ? depositAmount : 
    0

  // 初期手数料を適用（売買手数料）
  currentBalance -= tradingFee

  for (let year = 1; year <= years; year++) {
    let yearlyInterest = 0
    let yearlyTax = 0
    let yearlyFee = 0

    // 年間積立額を追加
    currentBalance += yearlyDeposit

    // 利息計算
    if (interestType === 'compound') {
      // 複利計算
      yearlyInterest = currentBalance * rate
    } else {
      // 単利計算（元本に対してのみ利息計算）
      yearlyInterest = principal * rate
    }

    // 運用手数料の計算（残高に対して）
    yearlyFee = currentBalance * (managementFee / 100)

    // 税金計算（年次課税の場合）
    if (taxTiming === 'annual') {
      yearlyTax = yearlyInterest * (taxRate / 100)
    }

    // 残高の更新
    currentBalance += yearlyInterest - yearlyTax - yearlyFee

    // 結果を記録
    yearlyResults.push({
      year,
      principal: year === 1 ? principal : yearlyResults[year - 2].principal + yearlyDeposit,
      deposit: yearlyDeposit,
      interest: yearlyInterest,
      tax: yearlyTax,
      fee: yearlyFee,
      balance: currentBalance
    })
  }

  // 満期時課税の場合の処理
  if (taxTiming === 'maturity' && yearlyResults.length > 0) {
    const totalInterest = yearlyResults.reduce((sum, result) => sum + result.interest, 0)
    const maturityTax = totalInterest * (taxRate / 100)
    
    // 最終年の税金と残高を更新
    const lastIndex = yearlyResults.length - 1
    yearlyResults[lastIndex].tax = maturityTax
    yearlyResults[lastIndex].balance -= maturityTax
  }

  return yearlyResults
}