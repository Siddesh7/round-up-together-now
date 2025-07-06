
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AuthButton } from './AuthButton';
import { 
  Users, 
  TrendingUp, 
  Shield, 
  Globe, 
  CheckCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface OnboardingFlowProps {
  onComplete: () => void;
}

export const OnboardingFlow = ({ onComplete }: OnboardingFlowProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const features = [
    {
      icon: <Users className="w-6 h-6 text-primary" />,
      title: "Join Savings Circles",
      description: "Connect with trusted community members and save together"
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-success" />,
      title: "Achieve Goals Faster",
      description: "Reach your financial goals with structured group savings"
    },
    {
      icon: <Shield className="w-6 h-6 text-trust-blue" />,
      title: "Secure & Transparent",
      description: "Built on blockchain technology for maximum security"
    },
    {
      icon: <Globe className="w-6 h-6 text-warm-orange" />,
      title: "Global Community",
      description: "Join thousands of savers from around the world"
    }
  ];

  const steps = [
    {
      title: "Welcome to Community Pool",
      subtitle: "Your journey to collaborative savings starts here",
      content: (
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <div className="relative mx-auto w-24 h-24 bg-gradient-to-br from-primary via-accent to-success rounded-full flex items-center justify-center mb-6">
              <Sparkles className="w-12 h-12 text-white" />
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-success/20 rounded-full animate-pulse"></div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
              Community Pool
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join savings circles and achieve your financial goals together through the power of community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-gradient-to-br from-background to-muted rounded-lg">
                      {feature.icon}
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">{feature.title}</h3>
                      <p className="text-muted-foreground text-sm">{feature.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center space-y-4">
            <Button 
              onClick={() => setCurrentStep(1)} 
              size="lg"
              className="bg-gradient-to-r from-primary to-success hover:from-primary/90 hover:to-success/90 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Get Started
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <p className="text-sm text-muted-foreground">
              Join thousands of users already saving together
            </p>
          </div>
        </div>
      )
    },
    {
      title: "How It Works",
      subtitle: "Simple steps to start your savings journey",
      content: (
        <div className="space-y-8 max-w-3xl mx-auto">
          <div className="grid gap-6">
            {[
              {
                step: "1",
                title: "Create or Join a Circle",
                description: "Start your own savings group or join an existing community circle",
                color: "from-primary to-primary/80"
              },
              {
                step: "2", 
                title: "Make Monthly Contributions",
                description: "Each member contributes a fixed amount every month to the shared pool",
                color: "from-trust-blue to-trust-blue/80"
              },
              {
                step: "3",
                title: "Receive Your Payout",
                description: "Take turns receiving the full amount when it's your turn in the rotation",
                color: "from-success to-success/80"
              }
            ].map((item, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-6">
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
                      {item.step}
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-xl">{item.title}</h3>
                      <p className="text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center space-y-4">
            <Button 
              onClick={() => setCurrentStep(2)} 
              size="lg"
              className="bg-gradient-to-r from-primary to-success hover:from-primary/90 hover:to-success/90 text-white px-8 py-3 text-lg font-semibold"
            >
              Continue
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      )
    },
    {
      title: "Ready to Start?",
      subtitle: "Sign in to join your first savings circle",
      content: (
        <div className="space-y-8 max-w-md mx-auto">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-background via-background to-muted/20">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary to-success rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl">Join Community Pool</CardTitle>
              <p className="text-muted-foreground">
                Sign in to start your savings journey with trusted community members
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 bg-success/10 rounded-lg border border-success/20">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span className="text-sm">Secure blockchain-based savings</span>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-trust-blue/10 rounded-lg border border-trust-blue/20">
                  <CheckCircle className="w-5 h-5 text-trust-blue" />
                  <span className="text-sm">Transparent group management</span>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-warm-orange/10 rounded-lg border border-warm-orange/20">
                  <CheckCircle className="w-5 h-5 text-warm-orange" />
                  <span className="text-sm">Community-verified members</span>
                </div>
              </div>
              
              <div className="pt-4">
                <AuthButton />
              </div>
              
              <div className="text-center">
                <Button 
                  variant="ghost" 
                  onClick={onComplete}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Skip for now
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_70%)]"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Progress Indicator */}
        <div className="flex justify-center mb-12">
          <div className="flex space-x-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? 'bg-gradient-to-r from-primary to-success scale-125'
                    : index < currentStep
                    ? 'bg-success'
                    : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 text-primary border-primary">
              Step {currentStep + 1} of {steps.length}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {steps[currentStep].title}
            </h2>
            <p className="text-xl text-muted-foreground">
              {steps[currentStep].subtitle}
            </p>
          </div>
          
          <div className="animate-fade-in">
            {steps[currentStep].content}
          </div>
        </div>

        {/* Navigation */}
        {currentStep > 0 && (
          <div className="flex justify-center mt-12">
            <Button
              variant="ghost"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              className="text-muted-foreground hover:text-foreground"
            >
              ← Back
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
