import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, Truck, Shield, Wrench, Headphones, Home as HomeIcon, Zap } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const features = [
  {
    icon: Clock,
    title: "Fast Turnaround",
    description: "Quick diagnosis and repair to minimize your downtime",
  },
  {
    icon: Truck,
    title: "Door-to-Door Service",
    description: "We pick up and deliver your repaired items at your convenience",
  },
  {
    icon: Shield,
    title: "Transparent Pricing",
    description: "No hidden fees. Clear quotes before any work begins",
  },
  {
    icon: CheckCircle,
    title: "Quality Guaranteed",
    description: "All repairs backed by our satisfaction guarantee",
  },
];

const categories = [
  { icon: Clock, name: "Timepieces", description: "Clocks and watches" },
  { icon: Zap, name: "Lighting Fixtures", description: "Lamps and fixtures" },
  { icon: Headphones, name: "Audio Devices", description: "Headphones & speakers" },
  { icon: HomeIcon, name: "Kitchen Appliances", description: "Grinders, mixers & more" },
  { icon: HomeIcon, name: "Household Appliances", description: "Irons, fans & more" },
  { icon: Wrench, name: "Power Tools", description: "Drills and equipment" },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative bg-primary py-20 md:py-32">
        <div className="container">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-6">
              Expert Repairs,
              <br />
              <span className="text-foreground">Delivered to Your Door</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-2xl">
              From kitchen appliances to power tools, we repair it all. Fast turnaround, 
              transparent pricing, and door-to-door service you can trust.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              {user ? (
                <Button size="lg" variant="secondary" asChild>
                  <Link to="/dashboard/book">Book a Repair</Link>
                </Button>
              ) : (
                <>
                  <Button size="lg" variant="secondary" asChild>
                    <Link to="/auth?mode=signup">Get Started</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild className="border-white/50 bg-transparent text-white hover:bg-white/10 hover:text-white">
                    <Link to="/services">View Services</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Why FixThis Section */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose fixthis?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              We make appliance repair simple, transparent, and hassle-free
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="border-border hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What We Repair</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              From small gadgets to large appliances, our expert technicians handle it all
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Card key={category.name} className="group hover:border-primary/50 transition-colors cursor-pointer">
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <category.icon className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button variant="outline" asChild>
              <Link to="/services">View All Services</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ready to Get Your Items Fixed?
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-8 max-w-2xl mx-auto">
            Book a repair request in minutes and we'll take care of the rest.
          </p>
          {user ? (
            <Button size="lg" variant="secondary" asChild>
              <Link to="/dashboard/book">Book a Repair Now</Link>
            </Button>
          ) : (
            <Button size="lg" variant="secondary" asChild>
              <Link to="/auth?mode=signup">Sign Up & Book</Link>
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}
