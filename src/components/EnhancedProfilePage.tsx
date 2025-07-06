import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  User,
  Settings,
  CircleDollarSign,
  TrendingUp,
  Calendar,
  Trophy,
  Eye,
  EyeOff,
  Download,
  Bell,
  Shield,
  LogOut,
  Users,
  History,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { calculatePayoutAmount } from "@/constants/treasury";

interface GroupMembership {
  id: string;
  name: string;
  type: "private" | "public" | "community";
  joinedDate: string;
  monthlyAmount: number;
  totalMembers: number;
  myPosition: number;
  status: "active" | "completed" | "pending";
  totalContributed: number;
  payoutReceived?: number;
  payoutMonth?: string;
}

interface ContributionHistory {
  id: string;
  groupName: string;
  amount: number;
  date: string;
  status: "completed" | "pending" | "failed";
  transactionId: string;
}

interface PayoutHistory {
  id: string;
  groupName: string;
  amount: number;
  receivedDate: string;
  cycle: number;
  interestEarned: number;
}

export const EnhancedProfilePage = () => {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "overview" | "groups" | "contributions" | "payouts" | "settings"
  >("overview");
  const [showBalance, setShowBalance] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Real data - will be populated from user's actual groups and transactions
  const userStats = {
    totalSaved: 0,
    totalEarned: 0,
    activeGroups: 0,
    completedGroups: 0,
    totalContributions: 0,
    averageReturn: 0,
  };

  const groupMemberships: GroupMembership[] = [];

  const contributionHistory: ContributionHistory[] = [];

  const payoutHistory: PayoutHistory[] = [];

  const handleSignOut = async () => {
    await signOut();
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: User },
    { id: "groups", label: "My Groups", icon: Users },
    { id: "contributions", label: "Contributions", icon: CircleDollarSign },
    { id: "payouts", label: "Payouts", icon: Trophy },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="w-16 h-16">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback className="text-lg">
                {user?.user_metadata?.full_name
                  ?.split(" ")
                  .map((n: string) => n[0])
                  .join("") || user?.email?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">
                {user?.user_metadata?.full_name || user?.email?.split("@")[0]}
              </h1>
              <p className="text-muted-foreground">{user?.email}</p>
              <Badge variant="outline" className="mt-1">
                Member since{" "}
                {new Date(user?.created_at || "").toLocaleDateString()}
              </Badge>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-muted p-1 rounded-lg">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() =>
                    setActiveTab(
                      tab.id as
                        | "overview"
                        | "groups"
                        | "contributions"
                        | "payouts"
                        | "settings"
                    )
                  }
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Stats Cards */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Saved</p>
                    <p className="text-2xl font-bold text-success">
                      {showBalance
                        ? `$${userStats.totalSaved.toLocaleString()}`
                        : "****"}
                    </p>
                  </div>
                  <CircleDollarSign className="w-8 h-8 text-success" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Earned
                    </p>
                    <p className="text-2xl font-bold text-primary">
                      {showBalance
                        ? `$${userStats.totalEarned.toLocaleString()}`
                        : "****"}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Active Groups
                    </p>
                    <p className="text-2xl font-bold text-trust-blue">
                      {userStats.activeGroups}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-trust-blue" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg. Return</p>
                    <p className="text-2xl font-bold text-warm-orange">
                      {userStats.averageReturn}%
                    </p>
                  </div>
                  <Trophy className="w-8 h-8 text-warm-orange" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "groups" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">My Groups</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBalance(!showBalance)}
              >
                {showBalance ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </Button>
            </div>

            {groupMemberships.map((group) => (
              <Card key={group.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <h3 className="font-semibold">{group.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant={
                              group.status === "active"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {group.status}
                          </Badge>
                          <Badge variant="outline">{group.type} circle</Badge>
                          <span className="text-sm text-muted-foreground">
                            Position #{group.myPosition}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-semibold">
                        {showBalance
                          ? `$${group.monthlyAmount}/month`
                          : "****/month"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Contributed:{" "}
                        {showBalance
                          ? `$${group.totalContributed.toLocaleString()}`
                          : "****"}
                      </div>
                      {group.payoutReceived && (
                        <div className="text-sm text-success font-medium">
                          Received:{" "}
                          {showBalance
                            ? `$${group.payoutReceived.toLocaleString()}`
                            : "****"}{" "}
                          in {group.payoutMonth}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeTab === "contributions" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Contribution History</h2>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <ScrollArea className="h-96">
                  <div className="p-6">
                    {contributionHistory.map((contribution, index) => (
                      <div key={contribution.id}>
                        <div className="flex items-center justify-between py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                contribution.status === "completed"
                                  ? "bg-success"
                                  : contribution.status === "pending"
                                  ? "bg-warning"
                                  : "bg-destructive"
                              }`}
                            />
                            <div>
                              <div className="font-medium">
                                {contribution.groupName}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {contribution.transactionId} •{" "}
                                {new Date(
                                  contribution.date
                                ).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">
                              {showBalance ? `$${contribution.amount}` : "***"}
                            </div>
                            <Badge
                              variant={
                                contribution.status === "completed"
                                  ? "default"
                                  : contribution.status === "pending"
                                  ? "secondary"
                                  : "destructive"
                              }
                              className="text-xs"
                            >
                              {contribution.status}
                            </Badge>
                          </div>
                        </div>
                        {index < contributionHistory.length - 1 && (
                          <Separator />
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "payouts" && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Payout History</h2>

            {payoutHistory.length > 0 ? (
              payoutHistory.map((payout) => (
                <Card key={payout.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Trophy className="w-8 h-8 text-warm-orange" />
                        <div>
                          <div className="font-semibold">
                            {payout.groupName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Cycle #{payout.cycle} •{" "}
                            {new Date(payout.receivedDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-2xl font-bold text-success">
                          {showBalance
                            ? `$${payout.amount.toLocaleString()}`
                            : "****"}
                        </div>
                        <div className="text-sm text-warm-orange">
                          +${payout.interestEarned} interest earned
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No payouts yet</h3>
                  <p className="text-muted-foreground">
                    Your payouts will appear here when you receive them from
                    your circles.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Account Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Account Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Full Name</Label>
                    <Input value={user?.user_metadata?.full_name || ""} />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input value={user?.email || ""} disabled />
                  </div>
                  <Button>Update Profile</Button>
                </CardContent>
              </Card>

              {/* Privacy & Security */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Privacy & Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Show Balance</div>
                      <div className="text-sm text-muted-foreground">
                        Display financial amounts in the app
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowBalance(!showBalance)}
                    >
                      {showBalance ? "Hide" : "Show"}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Notifications</div>
                      <div className="text-sm text-muted-foreground">
                        Receive app notifications
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setNotificationsEnabled(!notificationsEnabled)
                      }
                    >
                      {notificationsEnabled ? "Enabled" : "Disabled"}
                    </Button>
                  </div>

                  <Separator />

                  <Button variant="outline" className="w-full">
                    Change Password
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Danger Zone */}
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Sign Out</div>
                    <div className="text-sm text-muted-foreground">
                      Sign out of your account
                    </div>
                  </div>
                  <Button variant="destructive" onClick={handleSignOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
