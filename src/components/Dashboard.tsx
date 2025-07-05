
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GroupCard } from './GroupCard';
import { Plus, TrendingUp, Users, CircleDollarSign, Calendar } from 'lucide-react';

const mockGroups = [
  {
    id: '1',
    name: 'Family Savings Circle',
    type: 'private' as const,
    members: 8,
    maxMembers: 10,
    monthlyAmount: 500,
    totalPot: 5000,
    nextPayout: 'Jan 15',
    description: 'Our family group saving for vacation and emergencies',
    verified: true
  },
  {
    id: '2',
    name: 'Young Professionals Network',
    type: 'community' as const,
    members: 15,
    maxMembers: 20,
    monthlyAmount: 200,
    totalPot: 4000,
    nextPayout: 'Jan 20',
    description: 'LinkedIn community members saving for career development',
    verified: true
  },
  {
    id: '3',
    name: 'Neighborhood Friends',
    type: 'public' as const,
    members: 6,
    maxMembers: 12,
    monthlyAmount: 100,
    totalPot: 1200,
    nextPayout: 'Jan 25',
    description: 'Local community members helping each other save',
    verified: false
  }
];

const userStats = {
  totalSaved: 2400,
  activeGroups: 3,
  nextPayout: 5000,
  payoutDate: 'March 15, 2024'
};

export const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, Sarah! 👋
          </h1>
          <p className="text-muted-foreground">
            Your savings journey continues with your trusted community
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Saved</p>
                  <p className="text-2xl font-bold text-success">
                    ${userStats.totalSaved.toLocaleString()}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Groups</p>
                  <p className="text-2xl font-bold text-trust-blue">
                    {userStats.activeGroups}
                  </p>
                </div>
                <Users className="w-8 h-8 text-trust-blue" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Next Payout</p>
                  <p className="text-2xl font-bold text-warm-orange">
                    ${userStats.nextPayout.toLocaleString()}
                  </p>
                </div>
                <CircleDollarSign className="w-8 h-8 text-warm-orange" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Payout Date</p>
                  <p className="text-sm font-semibold text-foreground">
                    {userStats.payoutDate}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <Card className="border-0 shadow-md bg-gradient-to-r from-primary/10 to-success/10">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Ready to start saving?</h3>
                  <p className="text-muted-foreground">
                    Join an existing group or create your own savings circle
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="hover:scale-105 transition-transform">
                    Browse Groups
                  </Button>
                  <Button className="gradient-primary hover:scale-105 transition-transform">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Group
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Your Groups */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Your Groups</h2>
            <Button variant="ghost" className="text-primary hover:text-primary/80">
              View All
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockGroups.map((group) => (
              <GroupCard 
                key={group.id} 
                group={group}
                onClick={() => console.log('Navigate to group:', group.id)}
              />
            ))}
          </div>
        </div>

        {/* Featured Groups */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Featured Groups</h2>
              <p className="text-muted-foreground">
                Popular groups you might want to join
              </p>
            </div>
            <Badge variant="outline" className="text-warm-orange border-warm-orange">
              New groups weekly
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GroupCard 
              group={{
                id: '4',
                name: 'Tech Startup Employees',
                type: 'community',
                members: 18,
                maxMembers: 25,
                monthlyAmount: 300,
                totalPot: 7500,
                nextPayout: 'Feb 1',
                description: 'Verified tech workers saving for side projects and education',
                verified: true
              }}
              onClick={() => console.log('Navigate to featured group')}
            />
            
            <GroupCard 
              group={{
                id: '5',
                name: 'College Alumni Network',
                type: 'community',
                members: 12,
                maxMembers: 15,
                monthlyAmount: 250,
                totalPot: 3750,
                nextPayout: 'Feb 5',
                description: 'University alumni helping each other with financial goals',
                verified: true
              }}
              onClick={() => console.log('Navigate to featured group')}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
