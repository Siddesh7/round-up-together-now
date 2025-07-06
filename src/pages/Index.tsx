
import React, { useState } from 'react';
import { OnboardingFlow } from '@/components/OnboardingFlow';
import { Dashboard } from '@/components/Dashboard';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    // In a real app, you might want to set a flag in localStorage or user preferences
    navigate('/dashboard');
  };

  // If user is logged in, redirect to dashboard
  if (user) {
    return <Dashboard />;
  }

  if (showOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  return <Dashboard />;
};

export default Index;
