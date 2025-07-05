
import React, { useState } from 'react';
import { OnboardingFlow } from '@/components/OnboardingFlow';
import { Dashboard } from '@/components/Dashboard';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const navigate = useNavigate();

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    // In a real app, you might want to set a flag in localStorage or user preferences
    navigate('/dashboard');
  };

  if (showOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  return <Dashboard />;
};

export default Index;
