import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GroupCard } from "./GroupCard";
import { GroupDetailsModal } from "./GroupDetailsModal";
import { CreateGroupModal } from "./CreateGroupModal";
import { ImprovedCreateGroupModal } from "./ImprovedCreateGroupModal";
import { JoinGroupModal } from "./JoinGroupModal";
import { AuthButton } from "./AuthButton";
import { NotificationBell } from "./NotificationBell";
import { ContributionCard } from "./ContributionCard";
import {
  TrendingUp,
  Users,
  CircleDollarSign,
  Calendar,
  Copy,
  Wallet,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useGroups } from "@/hooks/useGroups";
import { useToast } from "@/hooks/use-toast";
import { useIntMaxContext } from "@/contexts/IntMaxContext";
import { calculatePayoutAmount } from "@/constants/treasury";

export const Dashboard = () => {
  const { user } = useAuth();
  const intmax = useIntMaxContext();
  const { groups, userGroups, loading, refetch, joinGroup } = useGroups();
  const { toast } = useToast();
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCopyAddress = () => {
    if (intmax.address) {
      navigator.clipboard.writeText(intmax.address);
      toast({
        title: "Address Copied!",
        description:
          "Your INTMAX wallet address has been copied to the clipboard.",
      });
    }
  };

  const handleGroupClick = (group: any) => {
    setSelectedGroup(group);
    setIsModalOpen(true);
  };

  const handleJoinGroup = async (groupId: string) => {
    try {
      const success = await joinGroup(groupId);
      if (success) {
        // Data is already refreshed in joinGroup function
        setIsModalOpen(false);
        toast({
          title: "Successfully joined circle!",
          description: "Welcome to your new savings circle.",
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Please try again later.";
      toast({
        title: "Failed to join circle",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Calculate user stats from real data
  const userStats = {
    totalSaved: userGroups.reduce(
      (sum, group) => sum + group.monthly_amount / 1e18,
      0
    ),
    activeCircles: userGroups.length,
    nextPayout:
      userGroups.reduce(
        (max, group) => Math.max(max, group.monthly_amount),
        0
      ) / 1e18,
    payoutDate: userGroups[0]?.next_payout_date || "No active circles",
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">
              Welcome to Community Pool
            </h1>
            <p className="text-muted-foreground mb-8">
              Join savings circles and achieve your financial goals together
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
              Welcome back,{" "}
              {user.user_metadata?.full_name || user.email?.split("@")[0]}! 👋
            </h1>
            <p className="text-muted-foreground">
              Your savings journey continues with your trusted community
            </p>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            {intmax.address && (
              <div className="flex items-center gap-4 bg-muted p-2 rounded-lg">
                <div className="flex items-center gap-2">
                  <span
                    className="text-sm font-mono truncate max-w-[150px]"
                    title={intmax.address}
                  >
                    {intmax.address}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCopyAddress}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2 border-l border-muted-foreground/20 pl-4">
                  <Wallet className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold">
                    {intmax.isBalanceLoading
                      ? "Loading..."
                      : intmax.formattedBalance}
                  </span>
                </div>
              </div>
            )}
            <AuthButton />
          </div>
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
                  <p className="text-sm text-muted-foreground">
                    Active Circles
                  </p>
                  <p className="text-2xl font-bold text-trust-blue">
                    {userStats.activeCircles}
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
                    {typeof userStats.payoutDate === "string"
                      ? userStats.payoutDate
                      : new Date(userStats.payoutDate).toLocaleDateString()}
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
                  <h3 className="text-lg font-semibold mb-2">
                    Ready to start saving?
                  </h3>
                  <p className="text-muted-foreground">
                    Join an existing circle or create your own savings circle
                  </p>
                </div>
                <div className="flex gap-3">
                  <JoinGroupModal onGroupJoined={refetch} />
                  <ImprovedCreateGroupModal onGroupCreated={refetch} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Your Circles - Payment Interface */}
        {userGroups.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">
                Your Circles - Monthly Contributions
              </h2>
              <Badge variant="outline" className="text-primary border-primary">
                {userGroups.length} active memberships
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userGroups.map((group, index) => {
                // Calculate next contribution due date (e.g., 1st of next month)
                const nextMonth = new Date();
                nextMonth.setMonth(nextMonth.getMonth() + 1);
                nextMonth.setDate(1);

                return (
                  <ContributionCard
                    key={group.id}
                    group={{
                      id: group.id,
                      name: group.name,
                      monthlyAmount: group.monthly_amount / 1e18, // Convert wei to ETH
                      totalMembers: group.current_members,
                      userPayoutOrder: index + 1, // Temporary - should come from member order
                      nextContributionDue: nextMonth.toLocaleDateString(),
                      contributionStatus: "pending", // TODO: Get real status from database
                    }}
                    onContribute={(groupId, amount) => {
                      console.log(
                        `Contribution successful for group ${groupId}: ${amount} ETH`
                      );
                      toast({
                        title: "Contribution Recorded! 🎉",
                        description: `Your ${amount} ETH contribution has been processed.`,
                      });
                      refetch(); // Refresh group data
                    }}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Available Circles */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Available Circles
              </h2>
              <p className="text-muted-foreground">
                Public and community circles you can join
              </p>
            </div>
            <Badge
              variant="outline"
              className="text-warm-orange border-warm-orange"
            >
              {groups.length} circles available
            </Badge>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading circles...</div>
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
                    monthlyAmount: group.monthly_amount / 1e18,
                    totalPot:
                      (group.monthly_amount / 1e18) * group.current_members,
                    nextPayout: new Date(
                      group.next_payout_date
                    ).toLocaleDateString(),
                    description: group.description || "",
                    verified: group.type === "community",
                  }}
                  onClick={() =>
                    handleGroupClick({
                      id: group.id,
                      name: group.name,
                      type: group.type,
                      members: group.current_members,
                      maxMembers: group.max_members,
                      monthlyAmount: group.monthly_amount / 1e18,
                      totalPot:
                        (group.monthly_amount / 1e18) * group.current_members,
                      nextPayout: new Date(
                        group.next_payout_date
                      ).toLocaleDateString(),
                      description: group.description || "",
                      verified: group.type === "community",
                    })
                  }
                />
              ))}
            </div>
          )}
        </div>

        {/* Circle Details Modal */}
        <GroupDetailsModal
          group={selectedGroup}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onJoin={handleJoinGroup}
        />
      </div>
    </div>
  );
};
