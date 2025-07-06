import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Users,
  CircleDollarSign,
  Shield,
  Heart,
  Zap,
} from "lucide-react";

interface OnboardingStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  illustration: string;
}

const onboardingSteps: OnboardingStep[] = [
  {
    title: "Welcome to Community Chit Fund",
    description:
      "Modern group-based savings where members contribute monthly and take turns receiving the pooled amount. Your community, your growth.",
    icon: <Heart className="w-8 h-8 text-primary" />,
    illustration: "🤝",
  },
  {
    title: "Powered by INTMAX Layer 2",
    description:
      "All contributions and payouts happen instantly via INTMAX Layer 2. Make sure you have ETH in your INTMAX wallet to participate in chit fund groups.",
    icon: <Zap className="w-8 h-8 text-blue-500" />,
    illustration: "⚡",
  },
  {
    title: "Treasury Protection",
    description:
      "First month contributions go to our treasury for stability. From month 2 onwards, members start receiving payouts with potential interest.",
    icon: <CircleDollarSign className="w-8 h-8 text-success" />,
    illustration: "🏦",
  },
  {
    title: "Three Circle Types",
    description:
      "Choose from Private (invite-only), Public (open to all), or Community (verified members) circles that match your trust level.",
    icon: <Users className="w-8 h-8 text-trust-blue" />,
    illustration: "🔒",
  },
  {
    title: "Interest on Later Payouts",
    description:
      "Members who wait longer for their payout earn interest! Later recipients can earn up to 7% extra on their pot.",
    icon: <Shield className="w-8 h-8 text-warm-orange" />,
    illustration: "📈",
  },
];

export const OnboardingFlow = ({ onComplete }: { onComplete: () => void }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const step = onboardingSteps[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-success-light via-trust-blue-light to-warm-orange-light flex items-center justify-center p-4">
      <Card className="w-full max-w-md glass-effect border-0 shadow-2xl animate-fade-in">
        <CardContent className="p-8 text-center">
          {/* Progress Indicator */}
          <div className="flex justify-center mb-8">
            {onboardingSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full mx-1 transition-all duration-300 ${
                  index <= currentStep ? "bg-primary scale-125" : "bg-muted"
                }`}
              />
            ))}
          </div>

          {/* Illustration */}
          <div className="text-6xl mb-6 animate-scale-in">
            {step.illustration}
          </div>

          {/* Icon */}
          <div className="flex justify-center mb-4">{step.icon}</div>

          {/* Content */}
          <h2 className="text-2xl font-bold text-foreground mb-4 animate-slide-up">
            {step.title}
          </h2>

          <p className="text-muted-foreground text-base leading-relaxed mb-8 animate-slide-up">
            {step.description}
          </p>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              className={`text-muted-foreground hover:text-foreground transition-colors ${
                currentStep === 0 ? "invisible" : ""
              }`}
            >
              Back
            </button>

            <Button
              onClick={nextStep}
              className="gradient-primary shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              {currentStep === onboardingSteps.length - 1
                ? "Get Started"
                : "Next"}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
