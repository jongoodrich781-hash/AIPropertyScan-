import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-16 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8" data-testid="text-privacy-title">Privacy Policy</h1>
        
        <Card>
          <CardContent className="prose prose-sm max-w-none p-6 space-y-6">
            <p className="text-muted-foreground">Last updated: December 2024</p>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
              <p className="text-muted-foreground">
                Mypropertunity ("we," "our," or "us") is committed to protecting your privacy. This Privacy 
                Policy explains how we collect, use, disclose, and safeguard your information when you use 
                our property analysis service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Information We Collect</h2>
              
              <h3 className="text-lg font-medium mb-2">Personal Information</h3>
              <p className="text-muted-foreground">When you create an account, we collect:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Name and email address</li>
                <li>Account credentials</li>
                <li>Payment information (processed securely by Stripe)</li>
              </ul>

              <h3 className="text-lg font-medium mb-2 mt-4">Property Information</h3>
              <p className="text-muted-foreground">When you use our Service, we collect:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Photos of your property exterior</li>
                <li>Property ZIP code for location-based pricing</li>
                <li>Analysis results and recommendations</li>
              </ul>

              <h3 className="text-lg font-medium mb-2 mt-4">Usage Information</h3>
              <p className="text-muted-foreground">We automatically collect:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Device and browser information</li>
                <li>IP address and location data</li>
                <li>Usage patterns and feature interactions</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. How We Use Your Information</h2>
              <p className="text-muted-foreground">We use your information to:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Provide and improve our property analysis services</li>
                <li>Process your photos through our AI analysis system</li>
                <li>Generate personalized repair recommendations and cost estimates</li>
                <li>Process payments and manage subscriptions</li>
                <li>Send service-related communications</li>
                <li>Respond to your inquiries and support requests</li>
                <li>Improve and optimize our Service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. AI Processing</h2>
              <p className="text-muted-foreground">
                Your property photos are processed using artificial intelligence (OpenAI) to generate 
                analysis results. By using our Service, you consent to this AI processing. Photos and 
                analysis data may be used to improve our AI models, but personal identifying information 
                is not shared with AI providers beyond what is necessary to process your request.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Data Sharing</h2>
              <p className="text-muted-foreground">We may share your information with:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li><strong>Service Providers:</strong> Third parties who help us operate our Service (e.g., payment processors, cloud hosting)</li>
                <li><strong>AI Partners:</strong> For processing property photos and generating recommendations</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              </ul>
              <p className="text-muted-foreground mt-2">
                We do not sell your personal information to third parties.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Data Security</h2>
              <p className="text-muted-foreground">
                We implement appropriate technical and organizational measures to protect your information, 
                including encryption of data in transit and at rest, secure authentication, and regular 
                security assessments. However, no method of transmission over the Internet is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Data Retention</h2>
              <p className="text-muted-foreground">
                We retain your information for as long as your account is active or as needed to provide 
                our services. Property photos and analysis results are retained to allow you to access 
                your history. You may request deletion of your data at any time by contacting us.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Your Rights</h2>
              <p className="text-muted-foreground">Depending on your location, you may have the right to:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Access your personal information</li>
                <li>Correct inaccurate data</li>
                <li>Delete your account and associated data</li>
                <li>Export your data in a portable format</li>
                <li>Opt out of marketing communications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">9. Cookies</h2>
              <p className="text-muted-foreground">
                We use cookies and similar technologies to maintain your session, remember your preferences, 
                and analyze usage patterns. You can control cookies through your browser settings.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">10. Children's Privacy</h2>
              <p className="text-muted-foreground">
                Our Service is not intended for children under 18. We do not knowingly collect information 
                from children. If you believe we have collected information from a child, please contact us.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">11. Changes to This Policy</h2>
              <p className="text-muted-foreground">
                We may update this Privacy Policy from time to time. We will notify you of material changes 
                by posting the new policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">12. Contact Us</h2>
              <p className="text-muted-foreground">
                If you have questions about this Privacy Policy or your data, please contact us at{" "}
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
