import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Sparkles, ArrowRight } from "lucide-react";

export default function CheckoutSuccess() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
  }, [queryClient]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[calc(100vh-80px)]">
        <Card className="max-w-md w-full text-center" data-testid="card-checkout-success">
          <CardHeader className="pb-4">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-12 h-12 text-primary" />
            </div>
            <CardTitle className="text-2xl" data-testid="text-success-title">
              Welcome to Pro!
            </CardTitle>
            <CardDescription className="text-lg">
              Your subscription is now active
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-secondary/50 rounded-lg p-4">
              <div className="flex items-center justify-center gap-2 text-primary mb-2">
                <Sparkles className="w-5 h-5" />
                <span className="font-semibold">Unlimited Analyses Unlocked</span>
              </div>
              <p className="text-sm text-muted-foreground">
                You can now analyze as many properties as you want with our AI-powered recommendations.
              </p>
            </div>

            <div className="space-y-3">
              <Button 
                className="w-full" 
                onClick={() => navigate('/analysis')}
                data-testid="button-start-analyzing"
              >
                Start Analyzing Properties
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => navigate('/')}
                data-testid="button-go-home"
              >
                Go to Home
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              You can manage your subscription at any time from your account settings.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
