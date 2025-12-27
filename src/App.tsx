import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Analysis from "@/pages/Analysis";
import AnalysisDemo from "@/pages/AnalysisDemo";
import Pricing from "@/pages/Pricing";
import CheckoutSuccess from "@/pages/CheckoutSuccess";
import Plantopedia from "@/pages/Plantopedia";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import MyAnalyses from "@/pages/MyAnalyses";
import FAQ from "@/pages/FAQ";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/analysis" component={Analysis} />
      <Route path="/analysis-demo" component={AnalysisDemo} />
      <Route path="/my-analyses" component={MyAnalyses} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/plantopedia" component={Plantopedia} />
      <Route path="/checkout/success" component={CheckoutSuccess} />
      <Route path="/terms" component={Terms} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/faq" component={FAQ} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;