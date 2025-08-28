"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Calculator, Save, Upload, Download, Moon, Sun, TrendingUp, DollarSign, PieChart } from "lucide-react"
import { useTheme } from "next-themes"

interface SimulationResult {
  year: number
  principal: number
  deposit: number
  interest: number
  tax: number
  fee: number
  balance: number
}

export default function InvestmentSimulator() {
  const { theme, setTheme } = useTheme()

  // Basic settings
  const [principal, setPrincipal] = useState(1000000)
  const [interestType, setInterestType] = useState<"compound" | "simple">("compound")
  const [annualRate, setAnnualRate] = useState([5])
  const [years, setYears] = useState([10])

  // Periodic deposit settings
  const [depositAmount, setDepositAmount] = useState(0)
  const [depositFrequency, setDepositFrequency] = useState("none")

  // Tax and fee settings
  const [taxRate, setTaxRate] = useState(20.315)
  const [taxTiming, setTaxTiming] = useState<"annual" | "maturity">("maturity")
  const [managementFee, setManagementFee] = useState(0)
  const [tradingFee, setTradingFee] = useState(0)

  // Results
  const [results, setResults] = useState<SimulationResult[]>([])
  const [isCalculating, setIsCalculating] = useState(false)

  // Preset management
  const [presetName, setPresetName] = useState("")
  const [presets, setPresets] = useState<string[]>([])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const calculateSimulation = async () => {
    setIsCalculating(true)

    // Simulate calculation delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const yearlyResults: SimulationResult[] = []
    let currentBalance = principal
    const rate = annualRate[0] / 100
    const yearlyDeposit =
      depositFrequency === "monthly" ? depositAmount * 12 : depositFrequency === "yearly" ? depositAmount : 0

    for (let year = 1; year <= years[0]; year++) {
      let yearlyInterest = 0
      let yearlyTax = 0
      let yearlyFee = 0

      // Add yearly deposit
      currentBalance += yearlyDeposit

      // Calculate interest
      if (interestType === "compound") {
        yearlyInterest = currentBalance * rate
      } else {
        yearlyInterest = principal * rate
      }

      // Calculate management fee
      yearlyFee = currentBalance * (managementFee / 100)

      // Calculate tax
      if (taxTiming === "annual") {
        yearlyTax = yearlyInterest * (taxRate / 100)
      }

      // Update balance
      currentBalance += yearlyInterest - yearlyTax - yearlyFee

      yearlyResults.push({
        year,
        principal: year === 1 ? principal : yearlyResults[year - 2].principal + yearlyDeposit,
        deposit: yearlyDeposit,
        interest: yearlyInterest,
        tax: yearlyTax,
        fee: yearlyFee,
        balance: currentBalance,
      })
    }

    // Apply maturity tax if needed
    if (taxTiming === "maturity") {
      const totalInterest = yearlyResults.reduce((sum, result) => sum + result.interest, 0)
      const maturityTax = totalInterest * (taxRate / 100)
      yearlyResults[yearlyResults.length - 1].tax = maturityTax
      yearlyResults[yearlyResults.length - 1].balance -= maturityTax
    }

    setResults(yearlyResults)
    setIsCalculating(false)
  }

  const resetForm = () => {
    setPrincipal(1000000)
    setInterestType("compound")
    setAnnualRate([5])
    setYears([10])
    setDepositAmount(0)
    setDepositFrequency("none")
    setTaxRate(20.315)
    setTaxTiming("maturity")
    setManagementFee(0)
    setTradingFee(0)
    setResults([])
  }

  const savePreset = () => {
    if (presetName.trim()) {
      setPresets([...presets, presetName.trim()])
      setPresetName("")
    }
  }

  const finalResult = results[results.length - 1]
  const totalPrincipal = finalResult ? finalResult.principal + results.reduce((sum, r) => sum + r.deposit, 0) : 0
  const totalInterest = results.reduce((sum, r) => sum + r.interest, 0)
  const totalTax = results.reduce((sum, r) => sum + r.tax, 0)
  const totalFee = results.reduce((sum, r) => sum + r.fee, 0)
  const netReturn = totalInterest - totalTax - totalFee
  const effectiveRate = totalPrincipal > 0 ? ((netReturn / totalPrincipal) * 100) / years[0] : 0

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calculator className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">投資シミュレーター</h1>
                <p className="text-sm text-muted-foreground">複利/単利計算ツール</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <Button variant="outline" size="sm">
                <Save className="h-4 w-4 mr-2" />
                設定保存
              </Button>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                設定読込
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column - Input Parameters */}
          <div className="space-y-6">
            {/* Basic Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  基本設定
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="principal">元本金額（円）</Label>
                  <Input
                    id="principal"
                    type="number"
                    value={principal}
                    onChange={(e) => setPrincipal(Number(e.target.value))}
                    className="text-right"
                  />
                </div>

                <div className="space-y-3">
                  <Label>運用方式</Label>
                  <RadioGroup
                    value={interestType}
                    onValueChange={(value: "compound" | "simple") => setInterestType(value)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="compound" id="compound" />
                      <Label htmlFor="compound">複利</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="simple" id="simple" />
                      <Label htmlFor="simple">単利</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>年利率（%）</Label>
                    <span className="text-sm font-medium">{annualRate[0]}%</span>
                  </div>
                  <Slider
                    value={annualRate}
                    onValueChange={setAnnualRate}
                    max={20}
                    min={0}
                    step={0.1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>運用年数</Label>
                    <span className="text-sm font-medium">{years[0]}年</span>
                  </div>
                  <Slider value={years} onValueChange={setYears} max={50} min={1} step={1} className="w-full" />
                </div>
              </CardContent>
            </Card>

            {/* Periodic Deposit Settings */}
            <Accordion type="single" collapsible>
              <AccordionItem value="deposits">
                <AccordionTrigger>定期積立設定</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="depositAmount">積立額（円）</Label>
                    <Input
                      id="depositAmount"
                      type="number"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(Number(e.target.value))}
                      className="text-right"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>積立頻度</Label>
                    <Select value={depositFrequency} onValueChange={setDepositFrequency}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">なし</SelectItem>
                        <SelectItem value="monthly">毎月</SelectItem>
                        <SelectItem value="yearly">毎年</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Tax and Fee Settings */}
            <Accordion type="single" collapsible>
              <AccordionItem value="tax-fees">
                <AccordionTrigger>税金・手数料設定</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="taxRate">税率（%）</Label>
                    <Input
                      id="taxRate"
                      type="number"
                      value={taxRate}
                      onChange={(e) => setTaxRate(Number(e.target.value))}
                      step="0.001"
                      className="text-right"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>課税タイミング</Label>
                    <RadioGroup value={taxTiming} onValueChange={(value: "annual" | "maturity") => setTaxTiming(value)}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="annual" id="annual" />
                        <Label htmlFor="annual">毎年</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="maturity" id="maturity" />
                        <Label htmlFor="maturity">満期時</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="managementFee">運用手数料（年率%）</Label>
                    <Input
                      id="managementFee"
                      type="number"
                      value={managementFee}
                      onChange={(e) => setManagementFee(Number(e.target.value))}
                      step="0.01"
                      className="text-right"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tradingFee">売買手数料（円）</Label>
                    <Input
                      id="tradingFee"
                      type="number"
                      value={tradingFee}
                      onChange={(e) => setTradingFee(Number(e.target.value))}
                      className="text-right"
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button onClick={calculateSimulation} disabled={isCalculating} className="flex-1" size="lg">
                {isCalculating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    計算中...
                  </>
                ) : (
                  <>
                    <Calculator className="h-4 w-4 mr-2" />
                    シミュレーション実行
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={resetForm} size="lg">
                条件をリセット
              </Button>
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="space-y-6">
            {results.length > 0 && (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">最終評価額</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-primary">{formatCurrency(finalResult?.balance || 0)}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">投資元本総額</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency(totalPrincipal)}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">運用益（税引前）</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-bold text-chart-2">{formatCurrency(totalInterest)}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">運用益（税引後）</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-bold text-chart-2">{formatCurrency(netReturn)}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">支払税額総額</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-bold text-destructive">{formatCurrency(totalTax)}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">実質年利回り</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-bold text-primary">{effectiveRate.toFixed(2)}%</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      グラフ表示
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="growth" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="growth">資産推移</TabsTrigger>
                        <TabsTrigger value="breakdown">内訳</TabsTrigger>
                      </TabsList>

                      <TabsContent value="growth" className="space-y-4">
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={results}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="year" />
                              <YAxis tickFormatter={(value) => `¥${(value / 1000000).toFixed(1)}M`} />
                              <Tooltip
                                formatter={(value: number) => [formatCurrency(value), ""]}
                                labelFormatter={(label) => `${label}年目`}
                              />
                              <Legend />
                              <Line
                                type="monotone"
                                dataKey="balance"
                                stroke="hsl(var(--primary))"
                                strokeWidth={2}
                                name="資産残高"
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </TabsContent>

                      <TabsContent value="breakdown" className="space-y-4">
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={results}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="year" />
                              <YAxis tickFormatter={(value) => `¥${(value / 1000000).toFixed(1)}M`} />
                              <Tooltip
                                formatter={(value: number) => [formatCurrency(value), ""]}
                                labelFormatter={(label) => `${label}年目`}
                              />
                              <Legend />
                              <Bar dataKey="principal" stackId="a" fill="hsl(var(--chart-1))" name="元本" />
                              <Bar dataKey="interest" stackId="a" fill="hsl(var(--chart-2))" name="運用益" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>

                {/* Data Table */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="h-5 w-5" />
                      年次推移テーブル
                    </CardTitle>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      CSV
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">年度</th>
                            <th className="text-right p-2">年初残高</th>
                            <th className="text-right p-2">積立額</th>
                            <th className="text-right p-2">運用益</th>
                            <th className="text-right p-2">税金</th>
                            <th className="text-right p-2">手数料</th>
                            <th className="text-right p-2">年末残高</th>
                          </tr>
                        </thead>
                        <tbody>
                          {results.map((result, index) => (
                            <tr key={result.year} className="border-b hover:bg-muted/50">
                              <td className="p-2">{result.year}年目</td>
                              <td className="text-right p-2">
                                {formatCurrency(index === 0 ? principal : results[index - 1].balance)}
                              </td>
                              <td className="text-right p-2">{formatCurrency(result.deposit)}</td>
                              <td className="text-right p-2 text-chart-2">{formatCurrency(result.interest)}</td>
                              <td className="text-right p-2 text-destructive">{formatCurrency(result.tax)}</td>
                              <td className="text-right p-2 text-destructive">{formatCurrency(result.fee)}</td>
                              <td className="text-right p-2 font-medium">{formatCurrency(result.balance)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>

        {/* Footer - Preset Management */}
        <footer className="mt-12 border-t pt-6">
          <Card>
            <CardHeader>
              <CardTitle>プリセット保存</CardTitle>
              <CardDescription>現在の設定を保存して後で呼び出すことができます</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="プリセット名を入力"
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={savePreset} disabled={!presetName.trim()}>
                  現在の設定を保存
                </Button>
              </div>

              {presets.length > 0 && (
                <div className="space-y-2">
                  <Label>保存済みプリセット</Label>
                  <div className="flex flex-wrap gap-2">
                    {presets.map((preset, index) => (
                      <Badge key={index} variant="secondary" className="cursor-pointer hover:bg-accent">
                        {preset}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </footer>
      </div>
    </div>
  )
}
