import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import FeatureCard from "@/components/FeatureCard";
import { Wand2, TrendingUp, Home as HomeIcon, Hammer, PaintBucket, TreeDeciduous } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />

      <section id="features" className="py-24 px-4 md:px-8 bg-secondary/30">
        <div className="container mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Profitable Home Improvements</h2>
            <p className="text-muted-foreground text-lg">
              Our AI analyzes your property from multiple angles to identify repairs that will generate real profit when you sell or refinance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard 
              icon={<Wand2 className="w-6 h-6" />}
              title="Before & After AI Visuals"
              description="See realistic previews of your home after repairs. Our AI shows exactly how improvements will look while preserving your home's unique character."
              delay={0.1}
            />
            <FeatureCard 
              icon={<TrendingUp className="w-6 h-6" />}
              title="Profit Per Repair"
              description="Every suggestion shows the repair cost AND the property value increase - so you know exactly how much profit each improvement generates."
              delay={0.2}
            />
            <FeatureCard 
              icon={<HomeIcon className="w-6 h-6" />}
              title="Complete Exterior Analysis"
              description="We analyze everything: roof, siding, windows, doors, porch, steps, railings, driveway, and landscaping from 3 different angles."
              delay={0.3}
            />
            <FeatureCard 
              icon={<Hammer className="w-6 h-6" />}
              title="3 Pricing Tiers"
              description="Get costs for DIY, budget contractor, and premium contractor options so you can choose what fits your budget and timeline."
              delay={0.4}
            />
            <FeatureCard 
              icon={<PaintBucket className="w-6 h-6" />}
              title="Curb Appeal Focus"
              description="Prioritized recommendations that maximize curb appeal and first impressions - the biggest factor in property value."
              delay={0.5}
            />
            <FeatureCard 
              icon={<TreeDeciduous className="w-6 h-6" />}
              title="Landscaping & Hardscape"
              description="Not just the house - we analyze walkways, driveways, lawns, and gardens to give you the complete picture."
              delay={0.6}
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 px-4 md:px-8">
        <div className="container mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg">
              Three simple steps to discover your property's hidden profit potential.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-primary">
                1
              </div>
              <h3 className="text-xl font-bold mb-2">Upload 3 Photos</h3>
              <p className="text-muted-foreground">
                Take photos from the front center, right side, and left side of your property for complete coverage.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-primary">
                2
              </div>
              <h3 className="text-xl font-bold mb-2">AI Analyzes Everything</h3>
              <p className="text-muted-foreground">
                Our AI examines the roof, siding, porch, driveway, landscaping and more to find profitable repairs.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-primary">
                3
              </div>
              <h3 className="text-xl font-bold mb-2">See Your Profit</h3>
              <p className="text-muted-foreground">
                Get a detailed breakdown showing each repair's cost, value increase, and your profit - plus before/after visuals.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}