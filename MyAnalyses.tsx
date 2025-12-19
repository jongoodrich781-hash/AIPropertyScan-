import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, MapPin, Calendar, TrendingUp, DollarSign, Home } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { YardAnalysis } from "@shared/schema";

export default function MyAnalyses() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const { data: analyses, isLoading, error } = useQuery<YardAnalysis[]>({
    queryKey: ['/api/my-analyses'],
    enabled: isAuthenticated,
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-16 text-center">
          <Home className="w-16 h-16 mx-auto mb-6 text-muted-foreground" />
          <h1 className="text-3xl font-bold mb-4">Sign in to View Your Analyses</h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Create an account or sign in to access your property analyses and track your improvement recommendations.
          </p>
          <a href="/api/login">
            <Button size="lg" className="rounded-full px-8" data-testid="button-signin-analyses">
              Sign In
            </Button>
          </a>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-my-analyses-title">My Property Analyses</h1>
            <p className="text-muted-foreground mt-1">
              View your property improvement recommendations and ROI estimates
            </p>
          </div>
          <Link href="/analysis">
            <Button className="rounded-full px-6 shadow-lg shadow-primary/20" data-testid="button-new-analysis">
              <Plus className="w-4 h-4 mr-2" />
              New Analysis
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="text-center">
              <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading your analyses...</p>
            </div>
          </div>
        ) : error ? (
          <Card className="border-destructive/50">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <p className="text-destructive mb-4">Something went wrong loading your analyses.</p>
                <Button variant="outline" onClick={() => window.location.reload()} data-testid="button-retry">
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : analyses && analyses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {analyses.map((analysis) => (
              <AnalysisCard key={analysis.id} analysis={analysis} />
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <div className="bg-muted/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Home className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Analyses Yet</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Upload photos of your property to get AI-powered improvement recommendations with cost estimates and ROI projections.
                </p>
                <Link href="/analysis">
                  <Button className="rounded-full px-8" data-testid="button-first-analysis">
                    <Plus className="w-4 h-4 mr-2" />
                    Start Your First Analysis
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Footer />
    </div>
  );
}

function AnalysisCard({ analysis }: { analysis: YardAnalysis }) {
  const analysisData = analysis.analysis;
  const totalValueIncrease = analysisData.suggestions?.reduce(
    (sum, s) => sum + (s.valueIncrease || 0), 0
  ) || 0;
  const totalCost = analysisData.suggestions?.reduce(
    (sum, s) => sum + (s.estimatedCost || 0), 0
  ) || 0;
  const profit = totalValueIncrease - totalCost;
  const roi = totalCost > 0 ? Math.round((profit / totalCost) * 100) : 0;

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow" data-testid={`card-analysis-${analysis.id}`}>
      <div className="aspect-video relative bg-muted">
        {analysis.imageUrl ? (
          <img 
            src={analysis.imageUrl} 
            alt="Property" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Home className="w-12 h-12 text-muted-foreground" />
          </div>
        )}
        {roi > 0 && (
          <Badge className="absolute top-3 right-3 bg-green-500 hover:bg-green-600">
            +{roi}% ROI
          </Badge>
        )}
      </div>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Property Analysis</CardTitle>
          {analysisData.suggestions && (
            <Badge variant="secondary">
              {analysisData.suggestions.length} Suggestions
            </Badge>
          )}
        </div>
        <CardDescription className="flex items-center gap-4 text-xs">
          {analysis.zipCode && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {analysis.zipCode}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(analysis.createdAt)}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
              <DollarSign className="w-3 h-3" />
              Est. Cost
            </div>
            <p className="font-semibold text-sm">{formatCurrency(totalCost)}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded-lg">
            <div className="flex items-center gap-1 text-xs text-green-600 mb-1">
              <TrendingUp className="w-3 h-3" />
              Value Increase
            </div>
            <p className="font-semibold text-sm text-green-600">{formatCurrency(totalValueIncrease)}</p>
          </div>
        </div>
        
        {analysisData.suggestions && analysisData.suggestions.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-medium">Top Suggestions:</p>
            <ul className="text-sm space-y-1">
              {analysisData.suggestions.slice(0, 3).map((suggestion, index) => (
                <li key={index} className="text-muted-foreground truncate">
                  • {suggestion.title}
                </li>
              ))}
              {analysisData.suggestions.length > 3 && (
                <li className="text-xs text-primary">
                  +{analysisData.suggestions.length - 3} more suggestions
                </li>
              )}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
