// import IndiaMap from "@/components/ResearchMap";
import IndiaMap from "@/components/Map";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertTriangle,
  Camera,
  Clock,
  Globe,
  MapPin,
  MessageSquare,
  Shield,
  TrendingUp,
  Users,
  Waves,
} from "lucide-react";

export default function INCOISLandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Mission & Branding */}
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge
                  variant="secondary"
                  className="bg-secondary text-secondary-foreground border-border">
                  <Shield className="w-3 h-3 mr-1" />
                  <span className="font-medium">
                    Ministry of Earth Sciences
                  </span>
                </Badge>
                <h1 className="text-5xl lg:text-6xl font-semibold text-foreground leading-tight">
                  Protecting India's Coastline Together
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Join thousands of citizens in reporting ocean hazards like
                  tsunamis, storm surges, and coastal damage. Your real-time
                  observations help save lives and protect communities.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Camera className="w-5 h-5 mr-2" />
                  Start Reporting
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-border text-foreground hover:bg-accent hover:text-accent-foreground bg-transparent">
                  <Globe className="w-5 h-5 mr-2" />
                  View Live Map
                </Button>
              </div>
            </div>

            {/* Right: Interactive Map */}
            <Card className="shadow-enterprise">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Live Hazard Map
                </CardTitle>
                <CardDescription>
                  Real-time ocean hazard reports across India's coastline
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96 rounded-md overflow-hidden border border-border">
                  {/* <IndiaMap /> */}
                  <IndiaMap mapType="publicMap" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-semibold text-foreground">
              Comprehensive Ocean Hazard Platform
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Advanced technology meets community reporting to create India's
              most comprehensive ocean safety network
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="shadow-enterprise hover:shadow-enterprise-lg transition-all duration-200">
              <CardHeader>
                <div className="w-12 h-12 bg-accent rounded-md flex items-center justify-center mb-4">
                  <Camera className="w-6 h-6 text-accent-foreground" />
                </div>
                <CardTitle className="text-foreground">
                  Geotagged Reporting
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Submit photos, videos, and observations with precise location
                  data for accurate hazard mapping.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-enterprise hover:shadow-enterprise-lg transition-all duration-200">
              <CardHeader>
                <div className="w-12 h-12 bg-accent rounded-md flex items-center justify-center mb-4">
                  <MessageSquare className="w-6 h-6 text-accent-foreground" />
                </div>
                <CardTitle className="text-foreground">
                  Social Media Integration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  AI-powered analysis of social media trends to detect and
                  verify ocean hazard discussions.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-enterprise hover:shadow-enterprise-lg transition-all duration-200">
              <CardHeader>
                <div className="w-12 h-12 bg-accent rounded-md flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-accent-foreground" />
                </div>
                <CardTitle className="text-foreground">
                  Dynamic Hotspots
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Real-time hotspot generation based on report density and
                  verified threat indicators.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-enterprise hover:shadow-enterprise-lg transition-all duration-200">
              <CardHeader>
                <div className="w-12 h-12 bg-accent rounded-md flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-accent-foreground" />
                </div>
                <CardTitle className="text-foreground">
                  Role-Based Access
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Specialized interfaces for citizens, officials, and analysts
                  with appropriate access levels.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-enterprise hover:shadow-enterprise-lg transition-all duration-200">
              <CardHeader>
                <div className="w-12 h-12 bg-accent rounded-md flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6 text-accent-foreground" />
                </div>
                <CardTitle className="text-foreground">
                  Multilingual Support
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Available in multiple regional languages for better
                  accessibility across coastal communities.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-enterprise hover:shadow-enterprise-lg transition-all duration-200">
              <CardHeader>
                <div className="w-12 h-12 bg-accent rounded-md flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-accent-foreground" />
                </div>
                <CardTitle className="text-foreground">
                  Offline Capability
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Collect data offline in remote areas and sync automatically
                  when connection is restored.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-semibold text-foreground">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Simple steps to contribute to India's ocean safety network
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-semibold text-accent-foreground">
                  1
                </span>
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                Observe & Report
              </h3>
              <p className="text-muted-foreground">
                Notice unusual ocean behavior? Take photos, record videos, and
                submit your observations through our app.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-semibold text-accent-foreground">
                  2
                </span>
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                AI Analysis
              </h3>
              <p className="text-muted-foreground">
                Our AI systems analyze your reports alongside social media data
                to identify patterns and verify threats.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-semibold text-accent-foreground">
                  3
                </span>
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                Emergency Response
              </h3>
              <p className="text-muted-foreground">
                Verified reports are immediately shared with emergency agencies
                for rapid response and community alerts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Hazard Types Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-semibold text-foreground">
              Ocean Hazards We Monitor
            </h2>
            <p className="text-xl text-muted-foreground">
              Help us track and respond to various ocean-related threats
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                name: "Tsunamis",
                icon: Waves,
                description: "Seismic sea waves",
              },
              {
                name: "Storm Surges",
                icon: AlertTriangle,
                description: "Hurricane-driven flooding",
              },
              {
                name: "High Waves",
                icon: TrendingUp,
                description: "Dangerous wave conditions",
              },
              {
                name: "Coastal Damage",
                icon: Shield,
                description: "Erosion and infrastructure damage",
              },
            ].map((hazard, index) => (
              <Card
                key={index}
                className="shadow-enterprise text-center hover:shadow-enterprise-lg transition-all duration-200">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-accent rounded-md flex items-center justify-center mx-auto mb-4">
                    <hazard.icon className="w-6 h-6 text-accent-foreground" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">
                    {hazard.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {hazard.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center space-y-8">
          <h2 className="text-4xl font-semibold">
            Join India's Ocean Safety Network
          </h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Every report matters. Help protect coastal communities by sharing
            your observations of ocean hazards.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              className="bg-card text-card-foreground hover:bg-card/90">
              <Camera className="w-5 h-5 mr-2" />
              Download Mobile App
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary bg-transparent">
              <Globe className="w-5 h-5 mr-2" />
              Access Web Platform
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                  <Waves className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">INCOIS</h3>
                  <p className="text-xs text-muted-foreground">
                    Ministry of Earth Sciences
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Protecting India's coastline through community-driven ocean
                hazard reporting and advanced early warning systems.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Platform</h4>
              <div className="space-y-2 text-sm">
                <a
                  href="#"
                  className="block text-muted-foreground hover:text-foreground transition-colors">
                  Mobile App
                </a>
                <a
                  href="#"
                  className="block text-muted-foreground hover:text-foreground transition-colors">
                  Web Dashboard
                </a>
                <a
                  href="#"
                  className="block text-muted-foreground hover:text-foreground transition-colors">
                  API Documentation
                </a>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Resources</h4>
              <div className="space-y-2 text-sm">
                <a
                  href="#"
                  className="block text-muted-foreground hover:text-foreground transition-colors">
                  User Guide
                </a>
                <a
                  href="#"
                  className="block text-muted-foreground hover:text-foreground transition-colors">
                  Safety Guidelines
                </a>
                <a
                  href="#"
                  className="block text-muted-foreground hover:text-foreground transition-colors">
                  Training Materials
                </a>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Contact</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Emergency: 1077</p>
                <p>Support: help@incois.gov.in</p>
                <p>Hyderabad, India</p>
              </div>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center">
            <p className="text-sm text-muted-foreground">
              © 2025 Indian National Centre for Ocean Information Services. All
              rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
