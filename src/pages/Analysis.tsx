import { useState, useEffect } from "react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import FullExteriorUploadZone, { type FullExteriorFiles } from "@/components/FullExteriorUploadZone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, AlertTriangle, DollarSign, TrendingUp, Clock, Hammer, ArrowRight, Download, Share2, Search, Calculator, Palette, FileText, Eye, FolderPlus, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { YardAnalysis } from "@shared/schema";

const ANALYSIS_STEPS = [
  { id: "scanning", icon: Search, title: "Scanning property...", tooltips: ["Identifying roof, siding, windows...", "Assessing condition scores..."] },
  { id: "calculating", icon: Calculator, title: "Calculating costs & ROI...", tooltips: ["Estimating material costs...", "Projecting value increase..."] },
  { id: "generating", icon: Palette, title: "Generating visuals...", tooltips: ["Creating after-repair visualization...", "Finalizing report..."] },
];

export default function Analysis() {
  const [analysis, setAnalysis] = useState<YardAnalysis | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const { toast } = useToast();

  const analysisMutation = useMutation({
    mutationFn: async (files: { front: File; right: File; left: File; zipCode: string } | FullExteriorFiles) => {
      const formData = new FormData();
      formData.append('front', files.front);
      formData.append('zipCode', files.zipCode);
      
      if ('right' in files) formData.append('right', files.right);
      if ('left' in files) formData.append('left', files.left);
      if ('back' in files && files.back) formData.append('back', files.back);
      // Add other files if present

      const response = await fetch('/api/analyze-yard', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || error.message || 'Failed to analyze property');
      }

      return response.json() as Promise<YardAnalysis>;
    },
    onSuccess: (data) => {
      setAnalysis(data);
      setShowSuccessScreen(true);
    },
    onError: (error) => {
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const handleUpload = (files: any) => {
    setCurrentStep(0);
    setShowSuccessScreen(false);
    analysisMutation.mutate(files);
  };

  useEffect(() => {
    if (!analysisMutation.isPending) return;
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < ANALYSIS_STEPS.length - 1 ? prev + 1 : prev));
    }, 3000);
    return () => clearInterval(interval);
  }, [analysisMutation.isPending]);

  if (!analysis && !analysisMutation.isPending) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">AI Property Analysis</h1>
            <p className="text-muted-foreground text-lg">Upload photos to get a comprehensive condition report, repair plan, and ROI analysis.</p>
          </div>
          <FullExteriorUploadZone onUpload={handleUpload} />
        </main>
      </div>
    );
  }

  if (analysisMutation.isPending) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 border-4 border-primary/20 rounded-full animate-pulse" />
            <div className="absolute inset-0 border-4 border-t-primary rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              {(() => {
                const Icon = ANALYSIS_STEPS[currentStep].icon;
                return <Icon className="w-8 h-8 text-primary" />;
              })()}
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">{ANALYSIS_STEPS[currentStep].title}</h2>
            <p className="text-muted-foreground">{ANALYSIS_STEPS[currentStep].tooltips[0]}</p>
          </div>
        </div>
      </div>
    );
  }

  const data = analysis?.analysis;
  if (!data) return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      <main className="container mx-auto px-4 py-8 space-y-12">
        
        {/* Section 1: Condition Scores */}
        <section>
          <h2 className="text-3xl font-bold mb-6">Condition Assessment</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.conditionAssessment.map((item, idx) => (
              <Card key={idx}>
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
        <section>
          <h2 className="text-3xl font-bold mb-6">Repairs & DIY Plans</h2>
          <Accordion type="single" collapsible className="w-full space-y-4">
            {data.repairs.map((repair, idx) => (
              <AccordionItem key={idx} value={`item-${idx}`} className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-4 w-full">
                    <span className="font-semibold text-lg">{repair.component}</span>
                    <Badge variant="outline">{repair.recommendation}</Badge>
                    {repair.proRecommended && <Badge variant="destructive">Pro Recommended</Badge>}
                    <span className="ml-auto mr-4 text-muted-foreground">
                      ${repair.costRange.low} - ${repair.costRange.high}
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
        <section>
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
                  {data.costBreakdown.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{item.component}</TableCell>
                      <TableCell>${item.low.toLocaleString()}</TableCell>
                      <TableCell>${item.high.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-bold bg-muted/50">
                    <TableCell>Total</TableCell>
                    <TableCell>${data.totalCost.low.toLocaleString()}</TableCell>
                    <TableCell>${data.totalCost.high.toLocaleString()}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <div className="mt-4 flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Estimated time: {data.estimatedTime}</span>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Section 4: Value & ROI */}
        <section>
          <h2 className="text-3xl font-bold mb-6">Value & ROI Analysis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Current Value</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold">${data.roi.currentValue.toLocaleString()}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Projected Value</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold text-primary">${data.roi.projectedValue.toLocaleString()}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">ROI</CardTitle></CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{data.roi.roiPercentage}%</div>
                <p className="text-xs text-muted-foreground">Return on Investment</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Payback Period</CardTitle></CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.roi.paybackPeriodMonths} Months</div>
                <p className="text-xs text-muted-foreground">To recoup costs</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Section 5: Before/After Visuals */}
        <section>
          <h2 className="text-3xl font-bold mb-6">Visual Transformation</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Before</CardTitle></CardHeader>
              <CardContent className="p-0 overflow-hidden rounded-b-lg">
                <img src={data.beforeImage} alt="Before" className="w-full h-auto object-cover" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>After (AI Projected)</CardTitle></CardHeader>
              <CardContent className="p-0 overflow-hidden rounded-b-lg">
                <img src={data.afterImage} alt="After" className="w-full h-auto object-cover" />
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Section 6: Plan & Billing */}
        <section className="bg-muted/30 p-8 rounded-xl border">
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
        <section className="text-center text-sm text-muted-foreground max-w-2xl mx-auto pt-8 border-t">
          <p>
            Disclaimer: This report is generated by AI for informational purposes only. 
            Cost estimates are based on regional averages and may vary. 
            Always consult with a licensed professional contractor for exact quotes and structural assessments. 
            Valuation estimates are not appraisals.
          </p>
        </section>

      </main>
    </div>
  );
}
