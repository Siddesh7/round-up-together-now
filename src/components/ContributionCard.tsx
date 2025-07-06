import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CircleDollarSign,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Zap,
  Shield,
  Wallet,
} from "lucide-react";
import { calculatePayoutAmount } from "@/constants/treasury";
import { useToast } from "@/hooks/use-toast";
import { useIntMax } from "@/hooks/use-intmax";
import { useTreasury } from "@/hooks/use-treasury";
import { formatUnits, parseEther } from "viem";
import { useIntMaxContext } from "@/contexts/IntMaxContext";

interface ContributionCardProps {
  group: {
    id: string;
    name: string;
    monthlyAmount: number;
    totalMembers: number;
    userPayoutOrder: number;
    nextContributionDue: string;
    contributionStatus: "pending" | "paid" | "overdue";
  };
  onContribute?: (groupId: string, amount: number) => void;
}

function formatEth(amountInWei: bigint | number | string) {
  const amount =
    typeof amountInWei === "string" ? amountInWei : BigInt(amountInWei);
  return formatUnits(BigInt(amount), 18);
}

export const ContributionCard: React.FC<ContributionCardProps> = ({
  group,
  onContribute,
}) => {
  const { toast } = useToast();
  const intmax = useIntMaxContext();
  const treasury = useTreasury();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("intmax");

  const potentialPayout = calculatePayoutAmount(
    group.monthlyAmount,
    group.totalMembers,
    group.userPayoutOrder
  );

  const interestAmount =
    potentialPayout - group.monthlyAmount * group.totalMembers;

  const handlePayment = async () => {
    if (!intmax.isLoggedIn || !intmax.client) {
      toast({
        title: "INTMAX Not Connected",
        description: "Please connect your INTMAX wallet first.",
        variant: "destructive",
      });
      return;
    }

    console.log("intmax", intmax);

    if (intmax.isBalanceLoading || !intmax.hasBalance) {
      toast({
        title: "Insufficient Balance",
        description:
          "Your INTMAX balance is too low to make this contribution.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("🚀 Starting real INTMAX payment...");

      // Step 1: Make INTMAX transfer to treasury
      toast({
        title: "Processing Payment...",
        description: "Transferring funds via INTMAX L2...",
      });

      // Convert amount to string for the hook
      const amountAsString = group.monthlyAmount.toString();

      const transferResult = await intmax.depositToTreasury(
        amountAsString,
        group.id
      );

      console.log("✅ INTMAX transfer successful:", transferResult);

      // Step 2: Record contribution on smart contract via treasury service
      console.log("📄 Recording contribution on smart contract...");
      await treasury.recordContribution({
        groupId: group.id,
        memberAddress: intmax.address || "unknown",
        amount: parseEther(amountAsString).toString(), // Send amount in wei to backend
        intmaxTxHash: transferResult.txHash,
        isFirstMonth: false, // This should be dynamic based on group state
      });

      toast({
        title: "Payment Complete! 🎉",
        description: `Your ${amountAsString} ETH contribution has been successfully transferred. TX: ${transferResult.txHash.slice(
          0,
          10
        )}...`,
      });

      onContribute?.(group.id, group.monthlyAmount);
      setIsPaymentModalOpen(false);
    } catch (error) {
      console.error("Payment failed:", error);
      toast({
        title: "Payment Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = () => {
    switch (group.contributionStatus) {
      case "paid":
        return (
          <Badge className="bg-success text-white">
            <CheckCircle className="w-3 h-3 mr-1" />
            Paid
          </Badge>
        );
      case "overdue":
        return (
          <Badge variant="destructive">
            <AlertCircle className="w-3 h-3 mr-1" />
            Overdue
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <Clock className="w-3 h-3 mr-1" />
            Due
          </Badge>
        );
    }
  };

  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{group.name}</CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Contribution Amount */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CircleDollarSign className="w-5 h-5 text-primary" />
            <span className="font-medium">Monthly Contribution</span>
          </div>
          <span className="text-xl font-bold text-success">
            {group.monthlyAmount.toString()} ETH
          </span>
        </div>

        {/* Due Date */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>Due: {group.nextContributionDue}</span>
        </div>

        {/* Potential Payout with Interest */}
        {interestAmount > 0 && (
          <div className="bg-trust-blue-light rounded-lg p-3">
            <div className="text-sm text-muted-foreground mb-1">
              Your potential payout (position #{group.userPayoutOrder}):
            </div>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-trust-blue">
                {potentialPayout.toString()} ETH
              </span>
              <Badge className="bg-warm-orange text-white">
                +{interestAmount.toString()} ETH interest
              </Badge>
            </div>
          </div>
        )}

        {/* Payment Button */}
        {group.contributionStatus !== "paid" && (
          <Dialog
            open={isPaymentModalOpen}
            onOpenChange={setIsPaymentModalOpen}
          >
            <DialogTrigger asChild>
              <Button
                className="w-full"
                variant={
                  group.contributionStatus === "overdue"
                    ? "destructive"
                    : "default"
                }
              >
                {group.contributionStatus === "overdue"
                  ? "Pay Overdue Amount"
                  : "Pay Now"}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Contribute to {group.name}</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <span>Contribution Amount:</span>
                  <span className="text-xl font-bold">
                    {group.monthlyAmount.toString()} ETH
                  </span>
                </div>

                {/* INTMAX Payment Method */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg bg-blue-50">
                    <div className="flex items-center gap-3">
                      <Zap className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium">INTMAX L2 Payment</p>
                        <p className="text-sm text-gray-600">
                          Real payment via INTMAX Layer 2
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          intmax.isLoggedIn ? "bg-green-500" : "bg-yellow-500"
                        }`}
                      />
                      <span
                        className={`text-sm ${
                          intmax.isLoggedIn
                            ? "text-green-600"
                            : "text-yellow-600"
                        }`}
                      >
                        {intmax.isLoggedIn ? "Connected" : "Connect Required"}
                      </span>
                    </div>
                  </div>

                  {!intmax.isLoggedIn && (
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-yellow-700 mb-1">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          Connect INTMAX Wallet
                        </span>
                      </div>
                      <p className="text-xs text-yellow-600 mb-2">
                        You need to connect your INTMAX wallet before making
                        contributions.
                      </p>
                      <div className="flex gap-2">
                        {!intmax.client ? (
                          <Button
                            onClick={intmax.initializeClient}
                            disabled={intmax.loading}
                            className="flex-1"
                            size="sm"
                          >
                            {intmax.loading
                              ? "Initializing..."
                              : "Initialize INTMAX"}
                          </Button>
                        ) : (
                          <Button
                            onClick={intmax.login}
                            disabled={intmax.loading}
                            className="flex-1"
                            size="sm"
                          >
                            {intmax.loading
                              ? "Connecting..."
                              : "Login to INTMAX"}
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  {intmax.isLoggedIn && (
                    <>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 text-green-700 mb-1">
                          <Shield className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            INTMAX Native Payment
                          </span>
                        </div>
                        <p className="text-xs text-green-600">
                          Transfer directly from your INTMAX wallet to the group
                          treasury. Instant processing with minimal fees
                          (~$0.01).
                        </p>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Wallet className="w-4 h-4 text-gray-600" />
                          <span className="text-sm text-gray-600">
                            Your INTMAX Balance:
                          </span>
                        </div>
                        <span className="font-mono text-sm">
                          {intmax.formattedBalance}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                <Button
                  onClick={handlePayment}
                  className="w-full"
                  disabled={treasury.loading || !intmax.isLoggedIn}
                >
                  {treasury.loading
                    ? "Recording on Blockchain..."
                    : intmax.loading
                    ? "Processing Payment..."
                    : !intmax.isLoggedIn
                    ? "Connect INTMAX to Pay"
                    : `Pay ${group.monthlyAmount.toString()} ETH via INTMAX`}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {group.contributionStatus === "paid" && (
          <div className="text-center text-success text-sm">
            ✅ Contribution paid for this month
          </div>
        )}
      </CardContent>
    </Card>
  );
};
