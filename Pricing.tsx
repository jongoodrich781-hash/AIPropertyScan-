import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Loader2, Sparkles, Building2, Home, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  freeAnalysesRemaining: number;
  isSubscribed: boolean;
  subscriptionTier: 'free' | 'basic' | 'pro' | 'enterprise';
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
}

interface Price {
  id: string;
  unit_amount: number;
  currency: string;
  recurring: { interval: string } | null;
  metadata: { tier?: string };
}

interface Product {
  id: string;
  name: string;
  description: string;
  metadata: { tier?: string };
  prices: Price[];
}

const TIER_FEATURES = {
  basic: {
    icon: Home,
    name: "Basic",
    tagline: "For homeowners who want simple repair insights",
    features: [
      { text: "Upload up to 10 photos/month", included: true },
      { text: "AI repair recommendations", included: true },
      { text: "Estimated repair costs", included: true },
      { text: "Basic ROI calculator", included: true },
      { text: "Before/after visualization", included: true },
      { text: "Email support", included: true },
      { text: "Single property only", included: true },
      { text: "High-res visualizations", included: false },
      { text: "PDF reports", included: false },
      { text: "Advanced ROI analysis", included: false },
    ],
    terms: ["Cancel anytime", "No commercial use"],
  },
  pro: {
    icon: Sparkles,
    name: "Pro",
    tagline: "For landlords & small investors managing multiple units",
    popular: true,
    features: [
      { text: "Upload up to 50 photos/month", included: true },
      { text: "AI repair recommendations", included: true },
      { text: "Advanced ROI analysis (cash flow, rent increase)", included: true },
      { text: "Portfolio dashboard for multiple properties", included: true },
      { text: "High-res before/after visualizations", included: true },
      { text: "Exportable PDF reports", included: true },
      { text: "Up to 10 properties", included: true },
      { text: "Priority email + chat support", included: true },
      { text: "Commercial use allowed", included: true },
      { text: "API access", included: false },
    ],
    terms: ["Cancel anytime", "10% discount on annual billing"],
  },
  enterprise: {
    icon: Building2,
    name: "Enterprise",
    tagline: "For large-scale investors, property managers, real estate firms",
    features: [
      { text: "Unlimited photo uploads", included: true },
      { text: "Custom ROI metrics (cap rate, IRR, payback period)", included: true },
      { text: "Team collaboration (multiple logins)", included: true },
      { text: "API access for integrations", included: true },
      { text: "Dedicated account manager", included: true },
      { text: "Contractor marketplace integration", included: true },
      { text: "White-label reporting", included: true },
      { text: "Unlimited properties", included: true },
      { text: "SLA-backed support", included: true },
      { text: "Custom contracts available", included: true },
    ],
    terms: ["Custom pricing for 50+ properties", "Annual commitment recommended"],
  },
};

export default function Pricing() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [checkingOut, setCheckingOut] = useState<string | null>(null);

  const { data: user } = useQuery<User | null>({
    queryKey: ['/api/auth/user'],
    queryFn: async () => {
      const res = await fetch('/api/auth/user', { credentials: 'include' });
      if (!res.ok) {
        if (res.status === 401) return null;
        throw new Error('Failed to fetch user');
      }
      return res.json();
    },
  });

  const { data: productsData, isLoading: productsLoading } = useQuery<{ data: Product[] }>({
    queryKey: ['/api/products-with-prices'],
    queryFn: async () => {
      const res = await fetch('/api/products-with-prices');
      if (!res.ok) throw new Error('Failed to fetch products');
      return res.json();
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: async (priceId: string) => {
      const res = await apiRequest('POST', '/api/checkout', { priceId });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: Error) => {
      setCheckingOut(null);
      toast({
        title: "Error",
        description: error.message || "Failed to start checkout",
        variant: "destructive",
      });
    },
  });

  const handleSubscribe = async (priceId: string, tier: string) => {
    if (!user) {
      window.location.href = '/api/login';
      return;
    }

    setCheckingOut(tier);
    checkoutMutation.mutate(priceId);
  };

  const portalMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/customer-portal', {});
      return res.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to open billing portal",
        variant: "destructive",
      });
    },
  });

  const products = productsData?.data || [];
  
  const getProductPrice = (tierName: string) => {
    // Match products by tier name at end of product name (e.g., "Mypropertunity Pro" ends with "Pro")
    let product = products.find(p => 
      p.name.toLowerCase().includes('mypropertunity') && 
      p.name.toLowerCase().endsWith(tierName.toLowerCase())
    );
    // Fallback to legacy products with tier at end
    if (!product) {
      product = products.find(p => p.name.toLowerCase().endsWith(tierName.toLowerCase()));
    }
    const price = product?.prices.find(p => p.recurring?.interval === 'month');
    return price;
  };

  // Format price as whole dollars (no cents)
  const formatPrice = (cents: number) => Math.round(cents / 100);

  const basicPrice = getProductPrice('basic');
  const proPrice = getProductPrice('pro');
  const enterprisePrice = getProductPrice('enterprise');

  const isCurrentTier = (tier: string) => user?.subscriptionTier === tier;
  const isSubscribed = user?.isSubscribed;

  const handleContactSales = () => {
    window.location.href = 'mailto:support@mypropertunity.com?subject=Enterprise%20Inquiry&body=I%27m%20interested%20in%20learning%20more%20about%20the%20Enterprise%20plan.';
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            1 Free Analysis Available - No Credit Card Required
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4" data-testid="text-pricing-title">
            Choose Your Plan
          </h1>
          <p className="text-muted-foreground text-lg">
            Start with a free analysis, then upgrade to unlock more property insights and maximize your ROI.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {/* Free Tier */}
          <Card className="relative overflow-hidden border-2" data-testid="card-plan-free">
            <CardHeader>
              <CardTitle className="text-xl">Free Trial</CardTitle>
              <CardDescription>Get started with one free analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold">
                $0
                <span className="text-sm font-normal text-muted-foreground">/analysis</span>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary shrink-0" />
                  <span>1 free property analysis</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary shrink-0" />
                  <span>AI-powered recommendations</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary shrink-0" />
                  <span>Before & after visualization</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary shrink-0" />
                  <span>Cost & profit breakdown</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              {user ? (
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => navigate('/analysis')}
                  disabled={user.freeAnalysesRemaining <= 0 && !isSubscribed}
                  data-testid="button-start-free"
                >
                  {user.freeAnalysesRemaining > 0 
                    ? `Start Free Analysis (${user.freeAnalysesRemaining} left)`
                    : isSubscribed 
                      ? 'Go to Analysis' 
                      : 'Free Analysis Used'
                  }
                </Button>
              ) : (
                <Button 
                  className="w-full" 
                  onClick={() => window.location.href = '/api/login'}
                  data-testid="button-signin-free"
                >
                  Try 1 Free Analysis
                </Button>
              )}
            </CardFooter>
          </Card>

          {/* Basic Tier */}
          <Card className="relative overflow-hidden border-2" data-testid="card-plan-basic">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Home className="w-5 h-5 text-primary" />
                Basic
              </CardTitle>
              <CardDescription>{TIER_FEATURES.basic.tagline}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold">
                ${basicPrice ? formatPrice(basicPrice.unit_amount) : '19'}
                <span className="text-sm font-normal text-muted-foreground">/month</span>
              </div>
              <ul className="space-y-2 text-sm">
                {TIER_FEATURES.basic.features.map((feature, i) => (
                  <li key={i} className={`flex items-center gap-2 ${!feature.included ? 'text-muted-foreground' : ''}`}>
                    {feature.included ? (
                      <Check className="w-4 h-4 text-primary shrink-0" />
                    ) : (
                      <X className="w-4 h-4 text-muted-foreground/50 shrink-0" />
                    )}
                    <span>{feature.text}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              {productsLoading ? (
                <Button className="w-full" disabled>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </Button>
              ) : isCurrentTier('basic') ? (
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => portalMutation.mutate()}
                  disabled={portalMutation.isPending}
                  data-testid="button-manage-basic"
                >
                  {portalMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Current Plan'
                  )}
                </Button>
              ) : basicPrice ? (
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => handleSubscribe(basicPrice.id, 'basic')}
                  disabled={checkingOut !== null}
                  data-testid="button-subscribe-basic"
                >
                  {checkingOut === 'basic' ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Starting checkout...
                    </>
                  ) : (
                    'Get Started'
                  )}
                </Button>
              ) : (
                <Button className="w-full" disabled>Coming Soon</Button>
              )}
            </CardFooter>
          </Card>

          {/* Pro Tier - Most Popular */}
          <Card className="relative overflow-hidden border-2 border-primary shadow-lg" data-testid="card-plan-pro">
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1 text-sm font-medium rounded-bl-lg">
              Most Popular
            </div>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Pro
              </CardTitle>
              <CardDescription>{TIER_FEATURES.pro.tagline}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold">
                ${proPrice ? formatPrice(proPrice.unit_amount) : '59'}
                <span className="text-sm font-normal text-muted-foreground">/month</span>
              </div>
              <ul className="space-y-2 text-sm">
                {TIER_FEATURES.pro.features.map((feature, i) => (
                  <li key={i} className={`flex items-center gap-2 ${!feature.included ? 'text-muted-foreground' : ''}`}>
                    {feature.included ? (
                      <Check className="w-4 h-4 text-primary shrink-0" />
                    ) : (
                      <X className="w-4 h-4 text-muted-foreground/50 shrink-0" />
                    )}
                    <span>{feature.text}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              {productsLoading ? (
                <Button className="w-full" disabled>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </Button>
              ) : isCurrentTier('pro') ? (
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => portalMutation.mutate()}
                  disabled={portalMutation.isPending}
                  data-testid="button-manage-pro"
                >
                  {portalMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Current Plan'
                  )}
                </Button>
              ) : proPrice ? (
                <Button 
                  className="w-full"
                  onClick={() => handleSubscribe(proPrice.id, 'pro')}
                  disabled={checkingOut !== null}
                  data-testid="button-subscribe-pro"
                >
                  {checkingOut === 'pro' ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Starting checkout...
                    </>
                  ) : (
                    'Start Free Trial'
                  )}
                </Button>
              ) : (
                <Button className="w-full" disabled>Coming Soon</Button>
              )}
            </CardFooter>
          </Card>

          {/* Enterprise Tier */}
          <Card className="relative overflow-hidden border-2 bg-gradient-to-b from-background to-muted/20" data-testid="card-plan-enterprise">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                Enterprise
              </CardTitle>
              <CardDescription>{TIER_FEATURES.enterprise.tagline}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold">
                ${enterprisePrice ? formatPrice(enterprisePrice.unit_amount) : '99'}
                <span className="text-sm font-normal text-muted-foreground">+/month</span>
              </div>
              <ul className="space-y-2 text-sm">
                {TIER_FEATURES.enterprise.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    <span>{feature.text}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              {isCurrentTier('enterprise') ? (
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => portalMutation.mutate()}
                  disabled={portalMutation.isPending}
                  data-testid="button-manage-enterprise"
                >
                  Current Plan
                </Button>
              ) : (
                <Button 
                  className="w-full" 
                  variant="secondary"
                  onClick={handleContactSales}
                  data-testid="button-contact-sales"
                >
                  Contact Sales
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>

        {/* Comparison note */}
        <div className="text-center mt-8 text-sm text-muted-foreground">
          All paid plans include a 7-day money-back guarantee. Cancel anytime.
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto mt-20">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">What's included in the free analysis?</h3>
              <p className="text-muted-foreground">
                Your free analysis includes a complete AI evaluation of your property's exterior, 
                personalized improvement recommendations with cost estimates, and a before/after visualization.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">How accurate are the cost estimates?</h3>
              <p className="text-muted-foreground">
                Our AI provides estimates based on national averages for materials and labor. 
                Actual costs may vary based on your location and specific property conditions.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">What's the difference between Basic and Pro?</h3>
              <p className="text-muted-foreground">
                Basic is perfect for single-property homeowners with 10 photos/month. Pro is designed 
                for investors managing multiple properties with 50 photos/month, advanced ROI analysis, 
                portfolio dashboards, and PDF reports for contractors.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Can I upgrade or downgrade my plan?</h3>
              <p className="text-muted-foreground">
                Yes! You can upgrade or downgrade at any time. Changes take effect on your next billing cycle, 
                and you'll be prorated for any differences.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">What does Enterprise include?</h3>
              <p className="text-muted-foreground">
                Enterprise is designed for property management companies and real estate firms. 
                It includes unlimited uploads, team collaboration, API access for integrations, 
                and a dedicated account manager. Contact us for custom pricing.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
