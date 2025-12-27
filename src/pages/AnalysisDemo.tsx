import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, DollarSign, TrendingUp, Clock, Hammer, FileText, Download, Share2 } from "lucide-react";

// Mock data for demonstration
const mockAnalysis = {
  conditionAssessment: [
    {
      component: "Roof",
      conditionScore: 3,
      issues: ["Missing shingles on north side", "Worn flashing around chimney"],
      confidence: 0.85
    },
    {
      component: "Siding",
      conditionScore: 4,
      issues: ["Minor paint peeling on south wall"],
      confidence: 0.92
    },
    {
      component: "Windows",
      conditionScore: 2,
      issues: ["Several windows have broken seals", "Drafty frames"],
      confidence: 0.88
    },
    {
      component: "Driveway",
      conditionScore: 3,
      issues: ["Multiple cracks", "Staining from oil leaks"],
      confidence: 0.95
    },
    {
      component: "Lawn",
      conditionScore: 4,
      issues: ["Some bare patches in back yard"],
      confidence: 0.90
    },
    {
      component: "Porch",
      conditionScore: 2,
      issues: ["Rotting boards", "Loose railings"],
      confidence: 0.87
    }
  ],
  repairs: [
    {
      component: "Roof",
      recommendation: "Repair",
      materials: [
        { name: "Asphalt shingles", quantity: "15 bundles", costRange: "$80-$120 each" },
        { name: "Flashing", quantity: "20 linear feet", costRange: "$15-$25 per foot" },
        { name: "Roofing nails", quantity: "2 boxes", costRange: "$20-$30 each" }
      ],
      diySteps: [
        "Remove damaged shingles carefully",
        "Install new underlayment if needed",
        "Nail new shingles in place, starting from bottom",
        "Replace flashing around chimney",
        "Seal all edges with roofing cement"
      ],
      proRecommended: true,
      costRange: { low: 3500, high: 6000 }
    },
    {
      component: "Windows",
      recommendation: "Replace",
      materials: [
        { name: "Double-pane windows", quantity: "8 units", costRange: "$300-$500 each" },
        { name: "Caulk", quantity: "6 tubes", costRange: "$5-$10 each" },
        { name: "Spray foam insulation", quantity: "4 cans", costRange: "$8-$12 each" }
      ],
      diySteps: [
        "Measure all window openings accurately",
        "Order custom-fit replacement windows",
        "Remove old windows carefully",
        "Install new windows with proper shimming",
        "Seal and insulate all gaps",
        "Apply exterior trim"
      ],
      proRecommended: true,
      costRange: { low: 4000, high: 7000 }
    },
    {
      component: "Driveway",
      recommendation: "Repair",
      materials: [
        { name: "Crack filler", quantity: "5 gallons", costRange: "$30-$45 per gallon" },
        { name: "Sealant", quantity: "10 gallons", costRange: "$25-$40 per gallon" },
        { name: "Asphalt patch", quantity: "3 bags", costRange: "$15-$25 each" }
      ],
      diySteps: [
        "Clean driveway thoroughly with pressure washer",
        "Fill all cracks with crack filler",
        "Let dry for 24 hours",
        "Apply sealant in even coats",
        "Allow to cure for 48 hours before use"
      ],
      proRecommended: false,
      costRange: { low: 400, high: 800 }
    }
  ],
  roi: {
    currentValue: 450000,
    projectedValue: 475000,
    rentUplift: 200,
    roiPercentage: 15,
    paybackPeriodMonths: 12
  },
  costBreakdown: [
    { component: "Roof", low: 3500, high: 6000 },
    { component: "Windows", low: 4000, high: 7000 },
    { component: "Driveway", low: 400, high: 800 },
    { component: "Porch", low: 2000, high: 3500 }
  ],
  totalCost: { low: 9900, high: 17300 },
  estimatedTime: "6-10 weeks DIY, 3-4 weeks with contractors",
  beforeImage: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800",
  afterImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800"
};

export default function AnalysisDemo() {
  return (
    <div className="min-h-screen bg-background pb-20" data-testid="analysis-demo-page">
      <Navbar />
      <main className="container mx-auto px-4 py-8 space-y-12">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2" data-testid="analysis-title">Property Analysis Report</h1>
            <p className="text-muted-foreground">ZIP Code: 90210 • Generated on {new Date().toLocaleDateString()}</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <Share2 className="w-4 h-4" />
              Share
            </Button>
            <Button className="gap-2">
              <Download className="w-4 h-4" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card data-testid="stat-investment">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Investment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${mockAnalysis.totalCost.low.toLocaleString()} - ${mockAnalysis.totalCost.high.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">{mockAnalysis.estimatedTime}</p>
            </CardContent>
          </Card>
          <Card data-testid="stat-value-increase">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Value Increase</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">+${(mockAnalysis.roi.projectedValue - mockAnalysis.roi.currentValue).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">{mockAnalysis.roi.roiPercentage}% ROI</p>
            </CardContent>
          </Card>
          <Card data-testid="stat-total-profit">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Profit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">+${((mockAnalysis.roi.projectedValue - mockAnalysis.roi.currentValue) - mockAnalysis.totalCost.high).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">After max costs</p>
            </CardContent>
          </Card>
          <Card data-testid="stat-payback">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Payback Period</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockAnalysis.roi.paybackPeriodMonths} Months</div>
              <p className="text-xs text-muted-foreground mt-1">+${mockAnalysis.roi.rentUplift}/mo rent</p>
            </CardContent>
          </Card>
        </div>

        {/* Section 1: Condition Scores */}
        <section data-testid="section-condition">
          <h2 className="text-3xl font-bold mb-6">Condition Assessment</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockAnalysis.conditionAssessment.map((item, idx) => (
              <Card key={idx} data-testid={`condition-card-${idx}`}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle>{item.component}</CardTitle>
                    <Badge variant={item.conditionScore >= 4 ? "default" : item.conditionScore >= 3 ? "secondary" : "destructive"}>
                      Score: {item.conditionScore}/5
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Progress value={item.conditionScore * 20} className="h-2 mb-4" />
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    {item.issues.map((issue, i) => (
                      <li key={i}>{issue}</li>
                    ))}
                  </ul>
                  <div className="mt-4 text-xs text-muted-foreground text-right">
                    Confidence: {Math.round(item.confidence * 100)}%
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Section 2: Repairs & DIY Plans */}
        <section data-testid="section-repairs">
          <h2 className="text-3xl font-bold mb-6">Repairs & DIY Plans</h2>
          <Accordion type="single" collapsible className="w-full space-y-4">
            {mockAnalysis.repairs.map((repair, idx) => (
              <AccordionItem key={idx} value={`item-${idx}`} className="border rounded-lg px-4" data-testid={`repair-item-${idx}`}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-4 w-full">
                    <span className="font-semibold text-lg">{repair.component}</span>
                    <Badge variant="outline">{repair.recommendation}</Badge>
                    {repair.proRecommended && <Badge variant="destructive">Pro Recommended</Badge>}
                    <span className="ml-auto mr-4 text-muted-foreground">
                      ${repair.costRange.low.toLocaleString()} - ${repair.costRange.high.toLocaleString()}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2"><Hammer className="w-4 h-4" /> Materials Needed</h4>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Material</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Cost</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {repair.materials.map((mat, i) => (
                            <TableRow key={i}>
                              <TableCell>{mat.name}</TableCell>
                              <TableCell>{mat.quantity}</TableCell>
                              <TableCell>{mat.costRange}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2"><FileText className="w-4 h-4" /> DIY Steps</h4>
                      <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                        {repair.diySteps.map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* Section 3: Cost Breakdown */}
        <section data-testid="section-cost">
          <h2 className="text-3xl font-bold mb-6">Cost Breakdown</h2>
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Component</TableHead>
                    <TableHead>Low Estimate</TableHead>
                    <TableHead>High Estimate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockAnalysis.costBreakdown.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{item.component}</TableCell>
                      <TableCell>${item.low.toLocaleString()}</TableCell>
                      <TableCell>${item.high.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-bold bg-muted/50">
                    <TableCell>Total</TableCell>
                    <TableCell>${mockAnalysis.totalCost.low.toLocaleString()}</TableCell>
                    <TableCell>${mockAnalysis.totalCost.high.toLocaleString()}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <div className="mt-4 flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Estimated time: {mockAnalysis.estimatedTime}</span>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Section 4: Value & ROI */}
        <section data-testid="section-roi">
          <h2 className="text-3xl font-bold mb-6">Value & ROI Analysis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Current Value</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold">${mockAnalysis.roi.currentValue.toLocaleString()}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Projected Value</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold text-primary">${mockAnalysis.roi.projectedValue.toLocaleString()}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">ROI</CardTitle></CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{mockAnalysis.roi.roiPercentage}%</div>
                <p className="text-xs text-muted-foreground">Return on Investment</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Payback Period</CardTitle></CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockAnalysis.roi.paybackPeriodMonths} Months</div>
                <p className="text-xs text-muted-foreground">To recoup costs</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Section 5: Before/After Visuals */}
        <section data-testid="section-visuals">
          <h2 className="text-3xl font-bold mb-6">Visual Transformation</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Before</CardTitle></CardHeader>
              <CardContent className="p-0 overflow-hidden rounded-b-lg">
                <img src={mockAnalysis.beforeImage} alt="Before" className="w-full h-auto object-cover" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>After (AI Projected)</CardTitle></CardHeader>
              <CardContent className="p-0 overflow-hidden rounded-b-lg">
                <img src={mockAnalysis.afterImage} alt="After" className="w-full h-auto object-cover" />
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Section 6: Plan & Billing */}
        <section className="bg-muted/30 p-8 rounded-xl border" data-testid="section-billing">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h3 className="text-xl font-bold mb-2">Unlock More Insights</h3>
              <p className="text-muted-foreground">Get detailed contractor quotes and export PDF reports.</p>
            </div>
            <div className="flex gap-4">
              <Button variant="outline">View Plans</Button>
              <Button>Buy Add-on ($10)</Button>
            </div>
          </div>
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span>Monthly Scans</span>
              <span>2 / 5 Remaining</span>
            </div>
            <Progress value={40} className="h-2" />
          </div>
        </section>

        {/* Section 7: Trust & Disclaimer */}
        <section className="text-center text-sm text-muted-foreground max-w-2xl mx-auto pt-8 border-t" data-testid="section-disclaimer">
          <p>
            <strong>Disclaimer:</strong> This report is generated by AI for informational purposes only. 
            Cost estimates are based on regional averages and may vary. 
            Always consult with a licensed professional contractor for exact quotes and structural assessments. 
            Valuation estimates are not appraisals.
          </p>
        </section>

      </main>
    </div>
  );
}
