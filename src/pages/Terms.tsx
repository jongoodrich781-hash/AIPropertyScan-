import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-16 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8" data-testid="text-terms-title">Terms of Service</h1>
        
        <Card>
          <CardContent className="prose prose-sm max-w-none p-6 space-y-6">
            <p className="text-muted-foreground">Last updated: December 2024</p>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground">
                By accessing or using Mypropertunity ("Service"), you agree to be bound by these Terms of Service. 
                If you do not agree to these terms, please do not use our Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Description of Service</h2>
              <p className="text-muted-foreground">
                Mypropertunity provides AI-powered property analysis services that help homeowners identify 
                profitable home repair and improvement opportunities. Our Service includes:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>AI analysis of property exterior photos</li>
                <li>Repair and improvement recommendations</li>
                <li>Cost estimates across multiple pricing tiers</li>
                <li>ROI calculations and projections</li>
                <li>Before and after visualizations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. User Accounts</h2>
              <p className="text-muted-foreground">
                To use certain features of our Service, you must create an account. You are responsible for 
                maintaining the confidentiality of your account credentials and for all activities that occur 
                under your account. You agree to notify us immediately of any unauthorized use of your account.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Subscription and Payments</h2>
              <p className="text-muted-foreground">
                We offer various subscription plans with different features and pricing. By subscribing to a 
                paid plan, you agree to pay the applicable fees. Subscriptions automatically renew unless 
                cancelled before the renewal date. Refunds are handled in accordance with our refund policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Free Trial</h2>
              <p className="text-muted-foreground">
                New users may be eligible for a free trial analysis. The free trial is limited to one 
                property analysis per user. After the free trial, continued use requires a paid subscription.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. User Content</h2>
              <p className="text-muted-foreground">
                You retain ownership of photos and content you upload to our Service. By uploading content, 
                you grant us a license to use, process, and analyze your content solely for the purpose of 
                providing the Service. You represent that you have the right to upload any content you submit.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. AI-Generated Content Disclaimer</h2>
              <p className="text-muted-foreground">
                Our Service uses artificial intelligence to generate recommendations and visualizations. 
                These are estimates and suggestions only, not professional advice. Cost estimates may vary 
                based on location, market conditions, and contractor availability. We recommend obtaining 
                professional quotes before undertaking any repairs or improvements. Mypropertunity is not 
                responsible for decisions made based on our AI-generated content.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Limitation of Liability</h2>
              <p className="text-muted-foreground">
                To the maximum extent permitted by law, Mypropertunity shall not be liable for any indirect, 
                incidental, special, consequential, or punitive damages resulting from your use of the Service. 
                Our total liability shall not exceed the amount you paid for the Service in the past 12 months.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">9. Prohibited Uses</h2>
              <p className="text-muted-foreground">You agree not to:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Use the Service for any unlawful purpose</li>
                <li>Upload content that infringes on others' rights</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Use automated systems to access the Service without permission</li>
                <li>Resell or redistribute our Service without authorization</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">10. Termination</h2>
              <p className="text-muted-foreground">
                We may terminate or suspend your account at any time for violations of these terms or for 
                any other reason at our discretion. Upon termination, your right to use the Service will 
                immediately cease.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">11. Changes to Terms</h2>
              <p className="text-muted-foreground">
                We reserve the right to modify these terms at any time. We will notify users of significant 
                changes via email or through the Service. Continued use after changes constitutes acceptance 
                of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">12. Contact Us</h2>
              <p className="text-muted-foreground">
                If you have questions about these Terms of Service, please contact us at{" "}
                <a href="mailto:support@mypropertunity.com" className="text-primary hover:underline">
                  support@mypropertunity.com
                </a>
              </p>
            </section>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
