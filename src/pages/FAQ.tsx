import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Upload, MessageCircle, HelpCircle, DollarSign, Shield, Users, Headphones } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSection {
  title: string;
  icon: React.ReactNode;
  items: FAQItem[];
}

const faqSections: FAQSection[] = [
  {
    title: "General Questions",
    icon: <HelpCircle className="w-5 h-5" />,
    items: [
      {
        question: "What is AIPropertyScan and who is it for?",
        answer: "AIPropertyScan analyzes a curb photo or address to identify exterior issues, estimate repair costs using regional baselines, rank fixes by expected ROI, and produce an exportable contractor scope. Ideal users: flippers, portfolio investors, real estate agents, homeowners, and contractors looking for scoped, budgeted leads."
      },
      {
        question: "How long does a report take?",
        answer: "Most reports are ready in about 3 minutes from upload. We show a progress indicator while the analysis runs."
      },
      {
        question: "Do I need to sign up to try a sample?",
        answer: "Yes. You can generate one free report after signing up. Saving, exporting, or running portfolio scans requires an account."
      }
    ]
  },
  {
    title: "Reports & Accuracy",
    icon: <MessageCircle className="w-5 h-5" />,
    items: [
      {
        question: "What does the report include?",
        answer: "Top fixes ranked by ROI; estimated cost ranges with confidence bands; projected resale or rental uplift; before/after mockups where available; and a contractor-ready PDF scope listing tasks and budget ranges."
      },
      {
        question: "See how we estimate costs and confidence ranges",
        answer: "We use regional cost baselines and local comps to produce conservative ranges and a confidence indicator for each estimate. Estimates are designed to guide decisions and speed contractor quoting, not to replace an on-site inspection."
      }
    ]
  },
  {
    title: "Pricing & Plans",
    icon: <DollarSign className="w-5 h-5" />,
    items: [
      {
        question: "What pricing plans do you offer?",
        answer: "We offer a $19 Basic plan for one single curbview report & one full property report, a $59 Pro plan for frequent users and teams with 5 curbside and 5 full property reports, and a $99 Enterprise portfolio plan. To discuss enterprise plan please contact us. Visit our Pricing page for current rates and trial offers."
      },
      {
        question: "Is there a free tier?",
        answer: "You can generate one free curb report. Full exports, portfolio features, and team seats require a paid plan."
      },
      {
        question: "How do I upgrade or cancel?",
        answer: "Upgrade or cancel from your account settings. Billing details and invoices are available in the dashboard."
      }
    ]
  },
  {
    title: "Privacy & Data",
    icon: <Shield className="w-5 h-5" />,
    items: [
      {
        question: "Is my photo private?",
        answer: "Yes. Reports are private by default and only shared when you export or explicitly send a link. We do not publish your photos without permission."
      },
      {
        question: "Do you use my photos to train models?",
        answer: "We surface data sources and confidence ranges on every report. For details about how we handle data, please review our privacy statement on the site."
      },
      {
        question: "How long are reports stored?",
        answer: "Reports are retained in your account until you delete them. Shared links may expire; check the share dialog for expiry settings."
      }
    ]
  },
  {
    title: "Contractors & Partners",
    icon: <Users className="w-5 h-5" />,
    items: [
      {
        question: "Can I invite my contractor to view a report?",
        answer: "Yes. Export the PDF or share a private report link so your contractor can review the scope."
      }
    ]
  },
  {
    title: "Support & Next Steps",
    icon: <Headphones className="w-5 h-5" />,
    items: [
      {
        question: "What if the photo fails to analyze?",
        answer: "Try a clearer curb shot with the full front elevation visible, or enter the property address so we can pull Street View. If issues persist, contact support with the report ID."
      },
      {
        question: "How can I get help or request a demo?",
        answer: "Use the Contact link in the footer to request a demo, or email support. For investors, request a portfolio demo and we'll walk you through bulk import and the dashboard."
      }
    ]
  }
];

export default function FAQ() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4" data-testid="text-faq-title">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
              MyPropertunities AI Property Scan turns your photos into a prioritized, budget-aware exterior rehab plan — cost ranges, projected resale and a contractor-ready scope delivered fast.
            </p>
            <Link href="/analysis">
              <Button size="lg" className="rounded-full gap-2" data-testid="button-faq-cta">
                <Upload className="w-4 h-4" />
                Upload a photo — get a prioritized ROI plan in ~3 minutes
              </Button>
            </Link>
          </div>

          <div className="space-y-8">
            {faqSections.map((section, sectionIndex) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: sectionIndex * 0.1 }}
                className="bg-card rounded-2xl border p-6"
                data-testid={`section-faq-${sectionIndex}`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    {section.icon}
                  </div>
                  <h2 className="text-xl font-semibold">{section.title}</h2>
                </div>
                
                <Accordion type="single" collapsible className="w-full">
                  {section.items.map((item, itemIndex) => (
                    <AccordionItem 
                      key={itemIndex} 
                      value={`${sectionIndex}-${itemIndex}`}
                      className="border-b last:border-0"
                    >
                      <AccordionTrigger 
                        className="text-left hover:no-underline py-4"
                        data-testid={`accordion-trigger-${sectionIndex}-${itemIndex}`}
                      >
                        <span className="font-medium pr-4">{item.question}</span>
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground pb-4">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-12 text-center bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl p-8 border"
          >
            <h3 className="text-2xl font-bold mb-3">Ready to try it?</h3>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              Upload a photo or enter an address to get your free sample report and see prioritized fixes, cost ranges, and projected uplift.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/analysis">
                <Button size="lg" className="rounded-full gap-2" data-testid="button-get-started">
                  <Upload className="w-4 h-4" />
                  Get Started Free
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="rounded-full gap-2"
                data-testid="button-contact-support"
              >
                <Headphones className="w-4 h-4" />
                Request a Demo
              </Button>
            </div>
          </motion.div>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>
              Need help? Request a demo or contact support.
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
