
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GroupCard } from './GroupCard';
import { CreateGroupModal } from './CreateGroupModal';
import { JoinGroupModal } from './JoinGroupModal';
import { AuthButton } from './AuthButton';
import { TrendingUp, Users, CircleDollarSign, Calendar } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useGroups } from '@/hooks/useGroups';

export const Dashboard = () => {
  const { user } = useAuth();
  const { groups, userGroups, loading, refetch, joinGroup } = useGroups();

  const handleJoinGroup = async (groupId: string) => {
    const success = await joinGroup(groupId);
    if (success) {
      refetch();
    }
  };

  // Calculate user stats from real data
  const userStats = {
    totalSaved: userGroups.reduce((sum, group) => sum + (group.monthly_amount / 100), 0),
    activeGroups: userGroups.length,
    nextPayout: userGroups.reduce((max, group) => Math.max(max, group.monthly_amount), 0) / 100,
    payoutDate: userGroups[0]?.next_payout_date || 'No active groups'
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Welcome to Community Pool</h1>
            <p className="text-muted-foreground mb-8">
              Join savings groups and achieve your financial goals together
            </p>
          </div>
          <div className="flex justify-center">
            <AuthButton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome back! 👋
            </h1>
            <p className="text-muted-foreground">
              Your savings journey continues with your trusted community
            </p>
          </div>
          <AuthButton />
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
                  <p className="text-sm text-muted-foreground">Next Payout</p>
                  <p className="text-sm font-semibold text-foreground">
                    {typeof userStats.payoutDate === 'string' ? userStats.payoutDate : new Date(userStats.payoutDate).toLocaleDateString()}
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
                  <JoinGroupModal onGroupJoined={refetch} />
                  <CreateGroupModal onGroupCreated={refetch} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Your Groups */}
        {userGroups.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Your Groups</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userGroups.map((group) => (
                <GroupCard 
                  key={group.id} 
                  group={{
                    id: group.id,
                    name: group.name,
                    type: group.type,
                    members: group.current_members,
                    maxMembers: group.max_members,
                    monthlyAmount: group.monthly_amount / 100,
                    totalPot: (group.monthly_amount / 100) * group.current_members,
                    nextPayout: new Date(group.next_payout_date).toLocaleDateString(),
                    description: group.description || '',
                    verified: true
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Available Groups */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Available Groups</h2>
              <p className="text-muted-foreground">
                Public and community groups you can join
              </p>
            </div>
            <Badge variant="outline" className="text-warm-orange border-warm-orange">
              {groups.length} groups available
            </Badge>
          </div>
          
          {loading ? (
            <div className="text-center py-8">Loading groups...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map((group) => (
                <GroupCard 
                  key={group.id} 
                  group={{
                    id: group.id,
                    name: group.name,
                    type: group.type,
                    members: group.current_members,
                    maxMembers: group.max_members,
                    monthlyAmount: group.monthly_amount / 100,
                    totalPot: (group.monthly_amount / 100) * group.current_members,
                    nextPayout: new Date(group.next_payout_date).toLocaleDateString(),
                    description: group.description || '',
                    verified: group.type === 'community'
                  }}
                  onClick={() => handleJoinGroup(group.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
