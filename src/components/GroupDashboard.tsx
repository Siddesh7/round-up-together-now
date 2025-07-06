import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Users,
  CircleDollarSign,
  Calendar,
  MessageSquare,
  Clock,
  TrendingUp,
  ArrowLeft,
  Send,
  Crown,
  CheckCircle,
  AlertCircle,
  Trophy,
} from "lucide-react";
import { calculatePayoutAmount } from "@/constants/treasury";
import { ContributionCard } from "./ContributionCard";

interface GroupMember {
  id: string;
  name: string;
  avatar?: string;
  payoutOrder: number;
  contributionStatus: "paid" | "pending" | "overdue";
  hasReceivedPayout: boolean;
  joinedDate: string;
  isCreator?: boolean;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: string;
}

interface GroupDashboardProps {
  group: {
    id: string;
    name: string;
    description: string;
    type: "private" | "public" | "community";
    monthlyAmount: number;
    maxMembers: number;
    currentMembers: number;
    nextPayoutDate: string;
    currentCycle: number;
    totalCycles: number;
    nextPayoutRecipient?: string;
  };
  members: GroupMember[];
  currentUserId: string;
  onBack: () => void;
}

export const GroupDashboard: React.FC<GroupDashboardProps> = ({
  group,
  members,
  currentUserId,
  onBack,
}) => {
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      senderId: "user-1",
      senderName: "Sarah Johnson",
      message:
        "Hey everyone! Looking forward to our savings journey together 🎯",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "2",
      senderId: "user-2",
      senderName: "Mike Chen",
      message: "Thanks for setting this up! When is the next contribution due?",
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "3",
      senderId: currentUserId,
      senderName: "You",
      message:
        "The next contribution is due on the 15th. Looking forward to reaching our goals!",
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
  ]);

  const currentUser = members.find((m) => m.id === currentUserId);
  const nextRecipient = members.find(
    (m) => m.payoutOrder === group.currentCycle + 1
  );

  // Calculate collection progress
  const paidMembers = members.filter(
    (m) => m.contributionStatus === "paid"
  ).length;
  const collectionProgress = (paidMembers / group.currentMembers) * 100;

  // Recent payouts - will be populated from real data when available
  const recentPayouts: Array<{
    recipientName: string;
    month: string;
    amount: number;
    avatar?: string;
  }> = [];

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: currentUserId,
      senderName: "You",
      message: chatMessage,
      timestamp: new Date().toISOString(),
    };

    setChatMessages((prev) => [...prev, newMessage]);
    setChatMessage("");
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {group.name}
              </h1>
              <p className="text-muted-foreground">{group.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge
                  variant={group.type === "community" ? "default" : "secondary"}
                >
                  {group.type.charAt(0).toUpperCase() + group.type.slice(1)}{" "}
                  Circle
                </Badge>
                <Badge variant="outline">
                  {group.currentMembers}/{group.maxMembers} members
                </Badge>
              </div>
            </div>

            <div className="text-right">
              <div className="text-2xl font-bold text-success">
                ${(group.monthlyAmount * group.currentMembers).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Monthly pot</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Collection Progress & Contribution */}
          <div className="lg:col-span-2 space-y-6">
            {/* Monthly Collection Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Monthly Collection Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm text-muted-foreground mb-2">
                      <span>Collection Status</span>
                      <span>
                        {paidMembers}/{group.currentMembers} members paid
                      </span>
                    </div>
                    <Progress value={collectionProgress} className="h-3" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 bg-success-light rounded-lg">
                      <div className="text-2xl font-bold text-success">
                        ${(paidMembers * group.monthlyAmount).toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Collected
                      </div>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-muted-foreground">
                        $
                        {(
                          (group.currentMembers - paidMembers) *
                          group.monthlyAmount
                        ).toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Remaining
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Next Payout */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Next Payout
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {nextRecipient && (
                      <>
                        <Avatar>
                          <AvatarFallback>
                            {nextRecipient.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold">
                            {nextRecipient.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Position #{nextRecipient.payoutOrder}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="text-right">
                    <div className="text-xl font-bold text-primary">
                      $
                      {calculatePayoutAmount(
                        group.monthlyAmount,
                        group.currentMembers,
                        group.currentCycle + 1
                      ).toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(group.nextPayoutDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Payouts */}
            {recentPayouts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-warm-orange" />
                    Recent Payouts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentPayouts.map((payout, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={payout.avatar} />
                            <AvatarFallback>
                              {payout.recipientName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {payout.recipientName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {payout.month}
                            </div>
                          </div>
                        </div>
                        <div className="text-lg font-bold text-success">
                          ${payout.amount.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Your Contribution */}
            {currentUser && (
              <ContributionCard
                group={{
                  id: group.id,
                  name: group.name,
                  monthlyAmount: group.monthlyAmount,
                  totalMembers: group.currentMembers,
                  userPayoutOrder: currentUser.payoutOrder,
                  nextContributionDue: new Date(
                    Date.now() + 5 * 24 * 60 * 60 * 1000
                  ).toLocaleDateString(),
                  contributionStatus: currentUser.contributionStatus,
                }}
                onContribute={(groupId, amount) => {
                  console.log(`Contributed $${amount} to group ${groupId}`);
                }}
              />
            )}
          </div>

          {/* Right Column - Members & Chat */}
          <div className="space-y-6">
            {/* Group Members */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Members ({members.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback>
                              {member.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-1">
                              <span className="font-medium text-sm">
                                {member.name}
                              </span>
                              {member.isCreator && (
                                <Crown className="w-3 h-3 text-warm-orange" />
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Position #{member.payoutOrder}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          {member.contributionStatus === "paid" ? (
                            <CheckCircle className="w-4 h-4 text-success" />
                          ) : member.contributionStatus === "overdue" ? (
                            <AlertCircle className="w-4 h-4 text-destructive" />
                          ) : (
                            <Clock className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Group Chat */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  Group Chat
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-64 p-4">
                  <div className="space-y-3">
                    {chatMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-2 ${
                          message.senderId === currentUserId
                            ? "justify-end"
                            : ""
                        }`}
                      >
                        {message.senderId !== currentUserId && (
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="text-xs">
                              {message.senderName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={`max-w-[70%] ${
                            message.senderId === currentUserId
                              ? "order-first"
                              : ""
                          }`}
                        >
                          <div
                            className={`p-2 rounded-lg text-sm ${
                              message.senderId === currentUserId
                                ? "bg-primary text-primary-foreground ml-auto"
                                : "bg-muted"
                            }`}
                          >
                            {message.senderId !== currentUserId && (
                              <div className="font-medium text-xs mb-1">
                                {message.senderName}
                              </div>
                            )}
                            {message.message}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {formatTimeAgo(message.timestamp)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleSendMessage()
                      }
                    />
                    <Button size="sm" onClick={handleSendMessage}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
