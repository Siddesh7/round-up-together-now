import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import {
  User,
  CircleDollarSign,
  Calendar,
  TrendingUp,
  Shield,
  Award,
  Settings,
  Bell,
} from "lucide-react";

const contributionHistory = [
  {
    id: "1",
    groupName: "Family Savings Circle",
    amount: 500,
    date: "Jan 1, 2024",
    status: "completed",
    type: "contribution",
  },
  {
    id: "2",
    groupName: "Young Professionals Network",
    amount: 4000,
    date: "Dec 15, 2023",
    status: "received",
    type: "payout",
  },
  {
    id: "3",
    groupName: "Neighborhood Friends",
    amount: 100,
    date: "Dec 1, 2023",
    status: "completed",
    type: "contribution",
  },
  {
    id: "4",
    groupName: "Family Savings Circle",
    amount: 500,
    date: "Dec 1, 2023",
    status: "completed",
    type: "contribution",
  },
];

const achievements = [
  {
    title: "Early Adopter",
    description: "One of the first 1000 users",
    icon: "🌟",
    earned: true,
  },
  {
    title: "Reliable Contributor",
    description: "12 consecutive months of on-time payments",
    icon: "⏰",
    earned: true,
  },
  {
    title: "Community Builder",
    description: "Created 3 successful groups",
    icon: "🏗️",
    earned: false,
  },
  {
    title: "Savings Champion",
    description: "Saved over $10,000 through groups",
    icon: "🏆",
    earned: false,
  },
];

export const ProfilePage = () => {
  const { user } = useAuth();

  const userStats = {
    totalContributed: 8400,
    totalReceived: 4000,
    activeGroups: 3,
    completedGroups: 2,
    trustScore: 98,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-foreground">Your Profile</h1>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <Card className="border-0 shadow-md">
              <CardContent className="p-6 text-center">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                    SJ
                  </AvatarFallback>
                </Avatar>

                <h2 className="text-xl font-bold mb-1">Sarah Johnson</h2>
                <p className="text-muted-foreground mb-4">
                  sarah.johnson@email.com
                </p>

                <div className="flex items-center justify-center gap-2 mb-4">
                  <Shield className="w-5 h-5 text-success" />
                  <span className="text-sm font-medium text-success">
                    Verified Member
                  </span>
                </div>

                <div className="bg-success-light rounded-lg p-3">
                  <div className="text-2xl font-bold text-success">
                    {userStats.trustScore}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Trust Score
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Overview */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Total Contributed
                  </span>
                  <span className="font-semibold">
                    ${userStats.totalContributed.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Received</span>
                  <span className="font-semibold text-success">
                    ${userStats.totalReceived.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active Groups</span>
                  <span className="font-semibold">
                    {userStats.activeGroups}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Completed Groups
                  </span>
                  <span className="font-semibold">
                    {userStats.completedGroups}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Activity & Achievements */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contribution History */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contributionHistory.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            transaction.type === "payout"
                              ? "bg-success-light text-success"
                              : "bg-trust-blue-light text-trust-blue"
                          }`}
                        >
                          <CircleDollarSign className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-medium">
                            {transaction.groupName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {transaction.date}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div
                          className={`font-semibold ${
                            transaction.type === "payout"
                              ? "text-success"
                              : "text-foreground"
                          }`}
                        >
                          {transaction.type === "payout" ? "+" : "-"}$
                          {transaction.amount}
                        </div>
                        <Badge
                          variant={
                            transaction.status === "completed"
                              ? "default"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {transaction.type === "payout"
                            ? "Received"
                            : "Contributed"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>

                <Button variant="outline" className="w-full mt-4">
                  View Full History
                </Button>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {achievements.map((achievement, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                        achievement.earned
                          ? "border-success bg-success-light hover:scale-105"
                          : "border-muted bg-muted/30 opacity-60"
                      }`}
                    >
                      <div className="text-2xl mb-2">{achievement.icon}</div>
                      <div className="font-semibold mb-1">
                        {achievement.title}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {achievement.description}
                      </div>
                      {achievement.earned && (
                        <Badge className="mt-2 bg-success text-white">
                          Earned
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
