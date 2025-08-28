import { NextRequest, NextResponse } from 'next/server'
import { SimulationResponse } from '@/lib/types/simulation'
import { validateSimulationRequest } from '@/lib/validators/simulation'
import { calculateSimulation } from '@/lib/services/simulation-calculator'

export async function POST(request: NextRequest) {
  try {
    // リクエストボディの取得
    const body = await request.json()

    // バリデーション
    const validationResult = validateSimulationRequest(body)
    
    if (!validationResult.success) {
      const response: SimulationResponse = {
        success: false,
        error: validationResult.error
      }
      return NextResponse.json(response, { status: 400 })
    }

    // 計算実行
    const results = calculateSimulation(validationResult.data!)
    
    // 成功レスポンス
    const response: SimulationResponse = {
      success: true,
      data: results
    }
    
    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('Simulation calculation error:', error)
    
    const response: SimulationResponse = {
      success: false,
      error: 'サーバーエラーが発生しました。しばらく時間をおいて再度お試しください。'
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}

// OPTIONS メソッドのハンドラー（CORS対応）
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}