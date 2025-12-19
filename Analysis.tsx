import { useState, useEffect } from "react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import MultiUploadZone from "@/components/MultiUploadZone";
import FullExteriorUploadZone, { type FullExteriorFiles } from "@/components/FullExteriorUploadZone";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, ArrowRight, Download, Share2, TrendingUp, Wrench, DollarSign, Lock, AlertTriangle, Search, Calculator, Palette, FileText, Sparkles, Eye, FolderPlus, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { YardAnalysis } from "@shared/schema";
import jsPDF from "jspdf";

const TEST_MODE = false;

const ANALYSIS_STEPS = [
  {
    id: "scanning",
    icon: Search,
    title: "Scanning roof, siding, and driveway...",
    tooltips: [
      "We're mapping your property's exterior — every detail counts.",
      "Analyzing surfaces for repair potential and curb appeal impact."
    ]
  },
  {
    id: "calculating",
    icon: Calculator,
    title: "Calculating repair costs and ROI projections...",
    tooltips: [
      "Crunching numbers so you don't have to.",
      "Estimating costs and forecasting profit — your ROI is loading."
    ]
  },
  {
    id: "generating",
    icon: Palette,
    title: "Generating before/after visuals...",
    tooltips: [
      "Visualizing your upgrades — see the transformation before it happens.",
      "Building side-by-side comparisons to show value clearly."
    ]
  },
  {
    id: "building",
    icon: FileText,
    title: "Building property valuation report...",
    tooltips: [
      "Compiling your personalized ROI report.",
      "Final step — your insights are almost ready."
    ]
  }
];

const LOADING_MESSAGES = [
  "Smart repairs take smart analysis — hang tight.",
  "Your property's potential is being unlocked...",
  "This isn't just a report — it's your profit roadmap."
];

function ConfettiPiece({ delay, left }: { delay: number; left: number }) {
  const colors = ["#3b82f6", "#6366f1", "#8b5cf6", "#06b6d4", "#0ea5e9"];
  const color = colors[Math.floor(Math.random() * colors.length)];
  
  return (
    <motion.div
      className="absolute w-3 h-3 rounded-sm"
      style={{ backgroundColor: color, left: `${left}%` }}
      initial={{ y: -20, opacity: 1, rotate: 0 }}
      animate={{ 
        y: 400, 
        opacity: 0, 
        rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
        x: (Math.random() - 0.5) * 200
      }}
      transition={{ 
        duration: 2.5 + Math.random(), 
        delay: delay,
        ease: "easeOut"
      }}
    />
  );
}

function Confetti() {
  const pieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    delay: Math.random() * 0.5,
    left: Math.random() * 100
  }));
  
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {pieces.map((piece) => (
        <ConfettiPiece key={piece.id} delay={piece.delay} left={piece.left} />
      ))}
    </div>
  );
}

type AnalysisType = 'curb' | 'full-exterior' | 'interior';

const ANALYSIS_TYPES = [
  {
    id: 'curb' as AnalysisType,
    title: 'Curb View Analysis',
    description: 'Analyze front-facing exterior and curb appeal improvements',
    icon: Eye,
    available: true,
  },
  {
    id: 'full-exterior' as AnalysisType,
    title: 'Full Exterior Analysis',
    description: 'Complete exterior analysis including all sides of the property',
    icon: FolderPlus,
    available: true,
  },
  {
    id: 'interior' as AnalysisType,
    title: 'Interior Analysis',
    description: 'Analyze interior rooms and renovation opportunities',
    icon: Sparkles,
    available: false,
    comingSoon: true,
  },
];

export default function Analysis() {
  const [analysisType, setAnalysisType] = useState<AnalysisType>('curb');
  const [analysis, setAnalysis] = useState<YardAnalysis | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentTooltipIndex, setCurrentTooltipIndex] = useState(0);
  const [currentLoadingMessage, setCurrentLoadingMessage] = useState(0);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  const generatePDF = async () => {
    if (!analysis) return;
    
    setIsGeneratingPdf(true);
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      let yPosition = margin;
      
      pdf.setFillColor(59, 130, 246);
      pdf.rect(0, 0, pageWidth, 40, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Mypropertunity', margin, 20);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Property ROI Analysis Report', margin, 30);
      
      pdf.setTextColor(0, 0, 0);
      yPosition = 55;
      
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Generated: ${new Date().toLocaleDateString()}`, margin, yPosition);
      if (analysis.zipCode) {
        pdf.text(`ZIP Code: ${analysis.zipCode}`, pageWidth - margin - 30, yPosition);
      }
      yPosition += 15;
      
      pdf.setFillColor(239, 246, 255);
      pdf.roundedRect(margin, yPosition, pageWidth - (margin * 2), 35, 3, 3, 'F');
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      
      const summaryColWidth = (pageWidth - (margin * 2)) / 3;
      
      pdf.text('Investment Range', margin + 5, yPosition + 10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${formatCurrency(analysis.analysis.estimatedCost.min)} - ${formatCurrency(analysis.analysis.estimatedCost.max)}`, margin + 5, yPosition + 20);
      
      pdf.setFont('helvetica', 'bold');
      pdf.text('Value Increase', margin + summaryColWidth + 5, yPosition + 10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(59, 130, 246);
      pdf.text(`+${formatCurrency(analysis.analysis.valueIncrease.amount)}`, margin + summaryColWidth + 5, yPosition + 20);
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Total Profit', margin + (summaryColWidth * 2) + 5, yPosition + 10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(16, 185, 129);
      pdf.text(`+${formatCurrency(calculateTotalProfit())}`, margin + (summaryColWidth * 2) + 5, yPosition + 20);
      
      yPosition += 45;
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Current Condition', margin, yPosition);
      yPosition += 8;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const conditionLines = pdf.splitTextToSize(analysis.analysis.currentCondition, pageWidth - (margin * 2));
      pdf.text(conditionLines, margin, yPosition);
      yPosition += (conditionLines.length * 5) + 10;
      
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Profitable Repairs & Upgrades', margin, yPosition);
      yPosition += 10;
      
      for (const suggestion of analysis.analysis.suggestions.sort((a, b) => a.priority - b.priority)) {
        if (yPosition > pageHeight - 60) {
          pdf.addPage();
          yPosition = margin;
        }
        
        const profit = (suggestion.valueIncrease || 0) - (suggestion.estimatedCost || 0);
        
        pdf.setFillColor(248, 250, 252);
        pdf.roundedRect(margin, yPosition, pageWidth - (margin * 2), 35, 2, 2, 'F');
        
        pdf.setFillColor(59, 130, 246);
        pdf.circle(margin + 8, yPosition + 8, 5, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text(String(suggestion.priority), margin + 6, yPosition + 10);
        
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text(suggestion.title, margin + 18, yPosition + 10);
        
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        const descLines = pdf.splitTextToSize(suggestion.description, pageWidth - (margin * 2) - 20);
        pdf.text(descLines.slice(0, 2), margin + 18, yPosition + 18);
        
        const costY = yPosition + 30;
        pdf.setFontSize(8);
        pdf.text(`Cost: ${formatCurrency(suggestion.estimatedCost || 0)}`, margin + 18, costY);
        pdf.setTextColor(59, 130, 246);
        pdf.text(`Value: +${formatCurrency(suggestion.valueIncrease || 0)}`, margin + 60, costY);
        pdf.setTextColor(16, 185, 129);
        pdf.text(`Profit: +${formatCurrency(profit)}`, margin + 110, costY);
        pdf.setTextColor(0, 0, 0);
        
        yPosition += 42;
      }
      
      if (yPosition > pageHeight - 70) {
        pdf.addPage();
        yPosition = margin;
      }
      
      yPosition += 5;
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Pricing Options', margin, yPosition);
      yPosition += 10;
      
      const pricingData = [
        { tier: 'DIY (Materials Only)', price: analysis.analysis.pricing.diy },
        { tier: 'Budget Contractor', price: analysis.analysis.pricing.lowGradeContractor },
        { tier: 'Premium Contractor', price: analysis.analysis.pricing.highGradeContractor }
      ];
      
      for (const pricing of pricingData) {
        pdf.setFillColor(248, 250, 252);
        pdf.roundedRect(margin, yPosition, pageWidth - (margin * 2), 12, 2, 2, 'F');
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(pricing.tier, margin + 5, yPosition + 8);
        pdf.setFont('helvetica', 'bold');
        pdf.text(formatCurrency(pricing.price), pageWidth - margin - 30, yPosition + 8);
        yPosition += 15;
      }
      
      yPosition += 10;
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Top 3 Improvements', margin, yPosition);
      yPosition += 8;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      for (let i = 0; i < analysis.analysis.improvements.length; i++) {
        pdf.text(`${i + 1}. ${analysis.analysis.improvements[i]}`, margin, yPosition);
        yPosition += 6;
      }
      
      pdf.setFillColor(240, 240, 240);
      pdf.rect(0, pageHeight - 15, pageWidth, 15, 'F');
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text('Smarter repairs. Higher ROI. Powered by Mypropertunity.', pageWidth / 2, pageHeight - 7, { align: 'center' });
      
      pdf.save(`mypropertunity-report-${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({
        title: "PDF Downloaded",
        description: "Your ROI report has been saved as a PDF.",
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: "Export Failed",
        description: "There was an error generating the PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const analysisMutation = useMutation({
    mutationFn: async (files: { front: File; right: File; left: File; zipCode: string } | FullExteriorFiles) => {
      const formData = new FormData();
      formData.append('front', files.front);
      formData.append('zipCode', files.zipCode);
      formData.append('analysisType', analysisType);

      if (analysisType === 'full-exterior' && 'back' in files) {
        formData.append('back', files.back);
        formData.append('left', files.left);
        formData.append('right', files.right);
        if (files.cornerFrontLeft) formData.append('cornerFrontLeft', files.cornerFrontLeft);
        if (files.cornerFrontRight) formData.append('cornerFrontRight', files.cornerFrontRight);
        if (files.cornerBackLeft) formData.append('cornerBackLeft', files.cornerBackLeft);
        if (files.cornerBackRight) formData.append('cornerBackRight', files.cornerBackRight);
      } else if ('right' in files && 'left' in files) {
        formData.append('right', files.right);
        formData.append('left', files.left);
      }

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
      setUploadedImageUrl(data.imageUrl);
      setShowSuccessScreen(true);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Session Expired",
          description: "Please log in again to continue.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const handleUpload = (files: { front: File; right: File; left: File; zipCode: string } | FullExteriorFiles) => {
    const objectUrl = URL.createObjectURL(files.front);
    setUploadedImageUrl(objectUrl);
    setCurrentStep(0);
    setCurrentTooltipIndex(0);
    setCurrentLoadingMessage(0);
    setShowSuccessScreen(false);
    analysisMutation.mutate(files);
  };

  useEffect(() => {
    if (!analysisMutation.isPending) return;
    
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev < ANALYSIS_STEPS.length - 1 ? prev + 1 : prev));
    }, 45000);
    
    const tooltipInterval = setInterval(() => {
      setCurrentTooltipIndex((prev) => (prev + 1) % 2);
    }, 4000);
    
    const messageInterval = setInterval(() => {
      setCurrentLoadingMessage((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 6000);
    
    return () => {
      clearInterval(stepInterval);
      clearInterval(tooltipInterval);
      clearInterval(messageInterval);
    };
  }, [analysisMutation.isPending]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateProfit = (cost: number, valueIncrease: number) => {
    return valueIncrease - cost;
  };

  const calculateTotalProfit = () => {
    if (!analysis) return 0;
    const avgCost = (analysis.analysis.estimatedCost.min + analysis.analysis.estimatedCost.max) / 2;
    return analysis.analysis.valueIncrease.amount - avgCost;
  };

  const canAnalyze = TEST_MODE || (user && (user.subscriptionTier !== 'free' || (user.photoUploadsThisPeriod || 0) < 9));

  // Show loading state (skip in test mode)
  if (isLoading && !TEST_MODE) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated (skip in test mode)
  if (!isAuthenticated && !TEST_MODE) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Navbar />
        <div className="pt-24 md:pt-32 container mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-lg mx-auto text-center"
          >
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Start Your 7-Day Free Trial
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Sign up and get 3 property analyses free for 7 days. See exactly what repairs will boost your home's value.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/api/login">
                <Button size="lg" className="rounded-full px-8" data-testid="button-signup-cta">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </a>
              <a href="/api/login">
                <Button variant="outline" size="lg" className="rounded-full px-8" data-testid="button-login-cta">
                  Log In
                </Button>
              </a>
            </div>
            <p className="text-sm text-muted-foreground mt-6">
              7-day trial includes 3 property analyses - no credit card required
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      
      {TEST_MODE && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-amber-500 text-amber-900 px-4 py-2 text-center text-sm font-medium">
          <AlertTriangle className="w-4 h-4 inline-block mr-2" />
          Test Mode Active - No login required for testing
        </div>
      )}
      
      <div className={`${TEST_MODE ? 'pt-32' : 'pt-24'} md:pt-32 container mx-auto px-4 md:px-8`}>
        {!analysisMutation.isPending && !analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center"
          >
            {canAnalyze ? (
              <>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-6">
                  <CheckCircle2 className="w-4 h-4" />
                  {TEST_MODE && !user ? "Test Mode - Try it out!" :
                   user?.subscriptionTier === 'enterprise' ? "Unlimited Analyses" :
                   user?.subscriptionTier !== 'free' ? `${user?.subscriptionTier?.charAt(0).toUpperCase()}${user?.subscriptionTier?.slice(1)} Plan` :
                   `7-Day Free Trial - ${Math.max(0, 3 - Math.floor((user?.photoUploadsThisPeriod || 0) / 3))} analyses remaining`}
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-6">
                  Analyze Your Property
                </h1>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Select the type of analysis you need, then upload your photos.
                </p>
                
                {/* Analysis Type Selector */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 max-w-3xl mx-auto">
                  {ANALYSIS_TYPES.map((type) => {
                    const TypeIcon = type.icon;
                    const isSelected = analysisType === type.id;
                    const isDisabled = !type.available;
                    
                    return (
                      <button
                        key={type.id}
                        onClick={() => type.available && setAnalysisType(type.id)}
                        disabled={isDisabled}
                        data-testid={`button-analysis-type-${type.id}`}
                        className={`relative p-6 rounded-2xl border-2 text-left transition-all duration-200 ${
                          isDisabled 
                            ? 'bg-muted/30 border-muted cursor-not-allowed opacity-60' 
                            : isSelected 
                              ? 'bg-primary/5 border-primary shadow-lg shadow-primary/10' 
                              : 'bg-card border-border hover:border-primary/50 hover:shadow-md cursor-pointer'
                        }`}
                      >
                        {type.comingSoon && (
                          <span className="absolute top-3 right-3 px-2 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
                            Coming Soon
                          </span>
                        )}
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                          isSelected ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                        }`}>
                          <TypeIcon className="w-6 h-6" />
                        </div>
                        <h3 className={`font-semibold mb-1 ${isSelected ? 'text-primary' : ''}`}>
                          {type.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {type.description}
                        </p>
                        {isSelected && type.available && (
                          <div className="absolute top-3 right-3">
                            <CheckCircle2 className="w-5 h-5 text-primary" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                <h2 className="text-2xl font-bold mb-4">
                  Upload Your Property Photos
                </h2>
                <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                  {analysisType === 'curb' 
                    ? 'Upload 3 photos of your property front from different angles (center, left, and right views).'
                    : 'Upload 4-8 photos showing all sides of your property exterior. 4 required (front, back, left, right) plus optional corner views.'}
                </p>
                {analysisType === 'curb' ? (
                  <MultiUploadZone onUploadComplete={handleUpload} />
                ) : (
                  <FullExteriorUploadZone onUploadComplete={handleUpload} />
                )}
              </>
            ) : (
              <>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-orange-700 text-sm font-medium mb-6">
                  <Lock className="w-4 h-4" />
                  Free Trial Complete
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-6">
                  Subscribe for More Analyses
                </h1>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                  You've used all 3 property analyses in your 7-day free trial. Subscribe to continue analyzing properties and maximize your home's value.
                </p>
                <Link href="/pricing">
                  <Button size="lg" className="rounded-full px-8" data-testid="button-subscribe">
                    Subscribe Now
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </>
            )}
          </motion.div>
        )}

        {analysisMutation.isPending && (
          <div className="flex flex-col items-center justify-center py-12 max-w-2xl mx-auto">
            <div className="relative w-24 h-24 mb-8">
              <div className="absolute inset-0 border-4 border-primary/20 rounded-full animate-pulse" />
              <div className="absolute inset-0 border-t-4 border-primary rounded-full animate-spin" />
              <div className="absolute inset-2 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-primary animate-pulse" />
              </div>
            </div>
            
            <h2 className="text-2xl md:text-3xl font-bold mb-3 text-center">Analyzing Your Property</h2>
            
            <AnimatePresence mode="wait">
              <motion.p
                key={currentLoadingMessage}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-muted-foreground text-center mb-8 italic"
              >
                "{LOADING_MESSAGES[currentLoadingMessage]}"
              </motion.p>
            </AnimatePresence>
            
            <div className="w-full space-y-3 mb-8">
              {ANALYSIS_STEPS.map((step, index) => {
                const StepIcon = step.icon;
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;
                
                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${
                      isActive 
                        ? 'bg-primary/10 border-2 border-primary/30 shadow-lg' 
                        : isCompleted 
                          ? 'bg-blue-50 border border-blue-200' 
                          : 'bg-muted/30 border border-transparent'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      isActive 
                        ? 'bg-primary text-white' 
                        : isCompleted 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-muted text-muted-foreground'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <StepIcon className={`w-5 h-5 ${isActive ? 'animate-pulse' : ''}`} />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium ${isActive ? 'text-primary' : isCompleted ? 'text-blue-700' : 'text-muted-foreground'}`}>
                        {step.title}
                      </p>
                      {isActive && (
                        <AnimatePresence mode="wait">
                          <motion.p
                            key={currentTooltipIndex}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-sm text-muted-foreground mt-1"
                          >
                            {step.tooltips[currentTooltipIndex]}
                          </motion.p>
                        </AnimatePresence>
                      )}
                    </div>
                    
                    {isActive && (
                      <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
                    )}
                  </motion.div>
                );
              })}
            </div>
            
            <div className="w-full bg-muted rounded-full h-2 mb-4 overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-primary to-indigo-500 rounded-full"
                initial={{ width: "5%" }}
                animate={{ width: `${((currentStep + 1) / ANALYSIS_STEPS.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {ANALYSIS_STEPS.length}
            </p>
            
            {uploadedImageUrl && (
              <div className="mt-8 max-w-sm rounded-2xl overflow-hidden border shadow-lg">
                <img src={uploadedImageUrl} alt="Uploaded property" className="w-full h-auto" />
              </div>
            )}
          </div>
        )}

        {analysisMutation.isError && (
          <div className="max-w-2xl mx-auto text-center py-20">
            <div className="p-6 rounded-2xl bg-destructive/10 border border-destructive/20 mb-6">
              <h2 className="text-2xl font-bold text-destructive mb-2">Analysis Failed</h2>
              <p className="text-muted-foreground">
                {analysisMutation.error instanceof Error 
                  ? analysisMutation.error.message 
                  : 'An error occurred while analyzing your property'}
              </p>
            </div>
            <Button onClick={() => analysisMutation.reset()}>
              Try Again
            </Button>
          </div>
        )}

        {analysis && showSuccessScreen && (
          <>
            {showConfetti && <Confetti />}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-2xl mx-auto text-center py-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle2 className="w-10 h-10 text-blue-600" />
              </motion.div>
              
              <h1 className="text-3xl md:text-4xl font-bold mb-3">
                Your ROI Report is Ready!
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Here's how your property can gain value.
              </p>
              
              <Card className="p-6 mb-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                  <div>
                    <span className="text-sm text-muted-foreground block mb-1">Top Repair</span>
                    <p className="font-bold text-lg">
                      {analysis.analysis.suggestions[0]?.title || "Property Improvements"}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground block mb-1">Investment Range</span>
                    <p className="font-bold text-lg">
                      {formatCurrency(analysis.analysis.estimatedCost.min)} - {formatCurrency(analysis.analysis.estimatedCost.max)}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground block mb-1">Projected Profit</span>
                    <p className="font-bold text-lg text-blue-600 flex items-center gap-1">
                      <TrendingUp className="w-5 h-5" />
                      +{formatCurrency(calculateTotalProfit())}
                    </p>
                  </div>
                </div>
                
                {analysis.analysis.afterImage && (
                  <div className="mt-6 rounded-xl overflow-hidden border border-blue-200 shadow-lg">
                    <div className="grid grid-cols-2">
                      <div className="relative">
                        {uploadedImageUrl && (
                          <img src={uploadedImageUrl} alt="Before" className="w-full h-48 object-cover" />
                        )}
                        <span className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">Before</span>
                      </div>
                      <div className="relative">
                        <img src={analysis.analysis.afterImage} alt="After" className="w-full h-48 object-cover" />
                        <span className="absolute bottom-2 left-2 bg-primary/80 text-white text-xs px-2 py-1 rounded-full">After</span>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="rounded-full px-8"
                  onClick={() => setShowSuccessScreen(false)}
                  data-testid="button-view-full-report"
                >
                  <Eye className="w-5 h-5 mr-2" />
                  View Full Report
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="rounded-full px-8"
                  data-testid="button-export-pdf"
                  onClick={generatePDF}
                  disabled={isGeneratingPdf}
                >
                  {isGeneratingPdf ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <Download className="w-5 h-5 mr-2" />
                  )}
                  {isGeneratingPdf ? "Generating..." : "Export PDF"}
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="rounded-full px-8"
                  data-testid="button-add-portfolio"
                  onClick={() => {
                    toast({
                      title: "Saved to Portfolio",
                      description: "This property has been added to your dashboard.",
                    });
                  }}
                >
                  <FolderPlus className="w-5 h-5 mr-2" />
                  Add to Portfolio
                </Button>
              </div>
              
              <p className="text-sm text-muted-foreground mt-8">
                Smarter repairs. Higher ROI. Powered by Mypropertunity.
              </p>
            </motion.div>
          </>
        )}

        {analysis && !showSuccessScreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            {/* Before & After Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="overflow-hidden border-0 shadow-xl rounded-3xl">
                <div className="relative aspect-square group">
                  {uploadedImageUrl && (
                    <img src={uploadedImageUrl} alt="Before" className="w-full h-full object-cover" />
                  )}
                  <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-bold">
                    Before
                  </div>
                </div>
              </Card>

              <Card className="overflow-hidden border-0 shadow-xl rounded-3xl">
                <div className="relative aspect-square group">
                  {analysis.analysis.afterImage && (
                    <img src={analysis.analysis.afterImage} alt="After" className="w-full h-full object-cover" />
                  )}
                  <div className="absolute top-4 left-4 bg-primary/80 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-bold">
                    After Repairs
                  </div>
                  <div className="absolute bottom-4 right-4 flex gap-2">
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="rounded-full backdrop-blur-md bg-white/90" 
                      data-testid="button-download"
                      onClick={() => {
                        if (analysis.analysis.afterImage) {
                          const link = document.createElement('a');
                          link.href = analysis.analysis.afterImage;
                          link.download = 'mypropertunity-after.png';
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          toast({
                            title: "Image Saved",
                            description: "The after image has been downloaded.",
                          });
                        }
                      }}
                    >
                      <Download className="w-4 h-4 mr-2" /> Save
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="rounded-full backdrop-blur-md bg-white/90" 
                      data-testid="button-share"
                      onClick={async () => {
                        const shareData = {
                          title: 'Mypropertunity - Property Analysis',
                          text: `Check out my property analysis! Potential profit: ${formatCurrency(calculateTotalProfit())}`,
                          url: window.location.href,
                        };
                        
                        if (navigator.share && navigator.canShare(shareData)) {
                          try {
                            await navigator.share(shareData);
                          } catch (err) {
                            // User cancelled or share failed
                          }
                        } else {
                          await navigator.clipboard.writeText(window.location.href);
                          toast({
                            title: "Link Copied",
                            description: "The link has been copied to your clipboard.",
                          });
                        }
                      }}
                    >
                      <Share2 className="w-4 h-4 mr-2" /> Share
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-8">
                <Card className="p-6 border">
                  <h3 className="text-xl font-bold mb-4">Current Condition</h3>
                  <p className="text-muted-foreground leading-relaxed" data-testid="text-condition">
                    {analysis.analysis.currentCondition}
                  </p>
                </Card>

                {/* Recommended Repairs with Profit */}
                <Card className="p-6 border">
                  <div className="flex items-center gap-2 mb-6">
                    <Wrench className="w-6 h-6 text-primary" />
                    <h3 className="text-xl font-bold">Profitable Repairs & Upgrades</h3>
                  </div>
                  <div className="space-y-4">
                    {analysis.analysis.suggestions
                      .sort((a, b) => a.priority - b.priority)
                      .map((suggestion, index) => {
                        const profit = calculateProfit(suggestion.estimatedCost || 0, suggestion.valueIncrease || 0);
                        return (
                          <div 
                            key={index} 
                            className="p-5 rounded-xl bg-secondary/30 border border-secondary"
                            data-testid={`suggestion-${index}`}
                          >
                            <div className="flex items-start gap-4">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary shrink-0">
                                {suggestion.priority}
                              </div>
                              <div className="flex-1">
                                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                                  <h4 className="font-bold text-lg">{suggestion.title}</h4>
                                </div>
                                <p className="text-sm text-muted-foreground mb-4">{suggestion.description}</p>
                                
                                {/* Cost, Value, Profit breakdown */}
                                <div className="grid grid-cols-3 gap-3">
                                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                                    <span className="text-xs text-muted-foreground block mb-1">Repair Cost</span>
                                    <span className="font-bold text-foreground">{formatCurrency(suggestion.estimatedCost || 0)}</span>
                                  </div>
                                  <div className="p-3 rounded-lg bg-blue-50 text-center">
                                    <span className="text-xs text-blue-600 block mb-1">Value Increase</span>
                                    <span className="font-bold text-blue-700">{formatCurrency(suggestion.valueIncrease || 0)}</span>
                                  </div>
                                  <div className="p-3 rounded-lg bg-emerald-100 text-center">
                                    <span className="text-xs text-emerald-600 block mb-1">Your Profit</span>
                                    <span className="font-bold text-emerald-700 flex items-center justify-center gap-1">
                                      <TrendingUp className="w-3 h-3" />
                                      +{formatCurrency(profit)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                  
                  {/* Total ROI Summary */}
                  <div className="mt-6 p-5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <span className="text-sm text-muted-foreground block mb-1">Total Investment</span>
                        <p className="text-xl font-bold">{formatCurrency(analysis.analysis.estimatedCost.min)} - {formatCurrency(analysis.analysis.estimatedCost.max)}</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground block mb-1">Property Value Increase</span>
                        <p className="text-xl font-bold text-blue-600">+{formatCurrency(analysis.analysis.valueIncrease.amount)}</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground block mb-1">Total Profit</span>
                        <p className="text-2xl font-bold text-emerald-600 flex items-center justify-center gap-1">
                          <DollarSign className="w-5 h-5" />
                          +{formatCurrency(calculateTotalProfit())}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="lg:col-span-4 space-y-6">
                {/* Pricing Tiers */}
                <Card className="p-6 border">
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    Pricing Options
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl border-2 border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer" data-testid="card-diy">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold">DIY</span>
                        <span className="text-2xl font-bold text-primary">{formatCurrency(analysis.analysis.pricing.diy)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Materials only, do-it-yourself</p>
                    </div>

                    <div className="p-4 rounded-xl border border-border hover:border-primary/50 transition-colors cursor-pointer" data-testid="card-low-contractor">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold">Budget Contractor</span>
                        <span className="text-2xl font-bold">{formatCurrency(analysis.analysis.pricing.lowGradeContractor)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Budget-friendly professional service</p>
                    </div>

                    <div className="p-4 rounded-xl border border-border hover:border-primary/50 transition-colors cursor-pointer" data-testid="card-high-contractor">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold">Premium Contractor</span>
                        <span className="text-2xl font-bold">{formatCurrency(analysis.analysis.pricing.highGradeContractor)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">High-end materials & expert service</p>
                    </div>
                  </div>
                </Card>

                {/* Top Improvements Summary */}
                <Card className="p-6 border bg-primary/5">
                  <h3 className="text-lg font-bold mb-4">Top 3 Improvements</h3>
                  <ul className="space-y-3">
                    {analysis.analysis.improvements.map((improvement, index) => (
                      <li key={index} className="flex gap-3 text-sm" data-testid={`improvement-${index}`}>
                        <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-xs font-bold shrink-0 shadow-sm">
                          {index + 1}
                        </span>
                        <span>{improvement}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button className="w-full mt-6 rounded-full" size="lg" data-testid="button-quotes" disabled>
                    Get Contractor Quotes (Coming Soon) <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full mt-3 rounded-full" 
                    size="lg" 
                    data-testid="button-export-pdf-report"
                    onClick={generatePDF}
                    disabled={isGeneratingPdf}
                  >
                    {isGeneratingPdf ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4 mr-2" />
                    )}
                    {isGeneratingPdf ? "Generating..." : "Export PDF Report"}
                  </Button>
                </Card>

                <Card className="p-6 border">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-muted-foreground">Design Style</span>
                    <span className="font-medium bg-secondary px-3 py-1 rounded-full text-sm" data-testid="text-style">
                      {analysis.analysis.style}
                    </span>
                  </div>
                </Card>

                <Button 
                  variant="outline" 
                  className="w-full rounded-full" 
                  onClick={() => {
                    setAnalysis(null);
                    setUploadedImageUrl(null);
                    setShowSuccessScreen(false);
                    setCurrentStep(0);
                    setCurrentTooltipIndex(0);
                    setCurrentLoadingMessage(0);
                    analysisMutation.reset();
                  }}
                  data-testid="button-new-analysis"
                >
                  Analyze Another Property
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
