import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Alert, AlertDescription } from "./ui/alert";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Shield,
  Clock,
  Zap,
} from "lucide-react";
import { useTreasury } from "../hooks/use-treasury";

export const TreasuryDashboard: React.FC = () => {
  const treasury = useTreasury();
  const [selectedGroupId, setSelectedGroupId] = useState<number>(1);

  useEffect(() => {
    // Initialize INTMAX on component mount
    if (!treasury.intmaxConnected) {
      treasury.connectIntmax();
    }
  }, []);

  const handleConnectIntmax = async () => {
    try {
      await treasury.connectIntmax();
      await treasury.loginIntmax();
    } catch (error) {
      console.error("Failed to connect INTMAX:", error);
    }
  };

  const handleProcessContribution = async () => {
    try {
      const result = await treasury.processContribution(
        selectedGroupId,
        "0x742d35Cc6Fc9Aa45f3b4Ea94747e230fE8b5e1d8",
        "0.1", // 0.1 ETH
        false // Not first month
      );
      console.log("Contribution processed:", result);
    } catch (error) {
      console.error("Failed to process contribution:", error);
    }
  };

  const handleProcessPayout = async () => {
    try {
      const result = await treasury.processPayout(
        selectedGroupId,
        "0x742d35Cc6Fc9Aa45f3b4Ea94747e230fE8b5e1d8",
        3 // Payout order 3 (will get interest)
      );
      console.log("Payout processed:", result);
    } catch (error) {
      console.error("Failed to process payout:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Treasury Dashboard</h1>
          <p className="text-gray-600">INTMAX Layer 2 Payment Management</p>
        </div>

        {!treasury.intmaxConnected ? (
          <Button
            onClick={handleConnectIntmax}
            className="flex items-center gap-2"
          >
            <Wallet className="w-4 h-4" />
            Connect INTMAX
          </Button>
        ) : (
          <Badge
            variant="outline"
            className="flex items-center gap-2 px-3 py-2"
          >
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            INTMAX Connected
          </Badge>
        )}
      </div>

      {/* Connection Status */}
      {treasury.intmaxConnected && (
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Treasury Balance: <strong>{treasury.formattedBalance}</strong> |
            Last Operation: {treasury.lastOperation || "None"}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="contributions">Process Contributions</TabsTrigger>
          <TabsTrigger value="payouts">Process Payouts</TabsTrigger>
          <TabsTrigger value="transactions">INTMAX Transactions</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Treasury Balance
                </CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {treasury.formattedBalance}
                </div>
                <p className="text-xs text-muted-foreground">
                  Available for payouts
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Processing Status
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {treasury.processing ? "Processing" : "Ready"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {treasury.processing
                    ? "Transaction in progress"
                    : "Ready for operations"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Transactions
                </CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {treasury.intmaxTransactions.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  INTMAX transactions processed
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Architecture Info */}
          <Card>
            <CardHeader>
              <CardTitle>Treasury Architecture</CardTitle>
              <CardDescription>
                How INTMAX Layer 2 integrates with our smart contract ledger
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <ArrowDownLeft className="w-4 h-4 text-blue-500" />
                    Contributions (Deposits)
                  </h4>
                  <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                    <li>User deposits via INTMAX to treasury wallet</li>
                    <li>Treasury records contribution on smart contract</li>
                    <li>Smart contract tracks member contribution status</li>
                    <li>Treasury protection applied for first month</li>
                  </ol>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <ArrowUpRight className="w-4 h-4 text-green-500" />
                    Payouts (Withdrawals)
                  </h4>
                  <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                    <li>Treasury calculates base amount + interest</li>
                    <li>INTMAX transfer from treasury to member</li>
                    <li>Smart contract records payout with interest</li>
                    <li>Member marked as received in group cycle</li>
                  </ol>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm">
                  <strong>Key Benefits:</strong> INTMAX handles fast, low-cost
                  Layer 2 transfers while our smart contract provides
                  transparent, immutable record-keeping. Members can verify all
                  group activity on-chain while enjoying instant payment
                  processing.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contributions Tab */}
        <TabsContent value="contributions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Process Member Contribution</CardTitle>
              <CardDescription>
                Handle monthly contributions via INTMAX deposit + smart contract
                recording
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Group ID</label>
                  <select
                    value={selectedGroupId}
                    onChange={(e) =>
                      setSelectedGroupId(parseInt(e.target.value))
                    }
                    className="w-full mt-1 p-2 border rounded"
                  >
                    <option value={1}>Group 1 - Family Savings</option>
                    <option value={2}>Group 2 - Friends Circle</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Amount</label>
                  <input
                    type="text"
                    value="0.1 ETH"
                    readOnly
                    className="w-full mt-1 p-2 border rounded bg-gray-50"
                  />
                </div>
              </div>

              <Button
                onClick={handleProcessContribution}
                disabled={treasury.processing || !treasury.intmaxConnected}
                className="w-full"
              >
                {treasury.processing ? "Processing..." : "Process Contribution"}
              </Button>

              {treasury.processing && (
                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertDescription>
                    Processing INTMAX deposit and updating smart contract...
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payouts Tab */}
        <TabsContent value="payouts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Process Member Payout</CardTitle>
              <CardDescription>
                Send monthly payout with interest via INTMAX withdrawal
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Group ID</label>
                  <select
                    value={selectedGroupId}
                    onChange={(e) =>
                      setSelectedGroupId(parseInt(e.target.value))
                    }
                    className="w-full mt-1 p-2 border rounded"
                  >
                    <option value={1}>Group 1 - Family Savings</option>
                    <option value={2}>Group 2 - Friends Circle</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Payout Order</label>
                  <select className="w-full mt-1 p-2 border rounded">
                    <option value={3}>
                      Position 3 (0.1 ETH + 7% interest)
                    </option>
                    <option value={4}>
                      Position 4 (0.1 ETH + 14% interest)
                    </option>
                  </select>
                </div>
              </div>

              <div className="bg-green-50 p-3 rounded">
                <p className="text-sm">
                  <strong>Calculation:</strong> Base 0.1 ETH + 0.007 ETH
                  interest (7% for position 3) = 0.107 ETH total
                </p>
              </div>

              <Button
                onClick={handleProcessPayout}
                disabled={treasury.processing || !treasury.intmaxConnected}
                className="w-full"
              >
                {treasury.processing ? "Processing..." : "Process Payout"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>INTMAX Transaction History</CardTitle>
              <CardDescription>
                Real-time view of all Layer 2 payments processed
              </CardDescription>
            </CardHeader>
            <CardContent>
              {treasury.intmaxTransactions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No transactions yet
                </p>
              ) : (
                <div className="space-y-3">
                  {treasury.intmaxTransactions.map((tx) => (
                    <div
                      key={tx.txHash}
                      className="flex items-center justify-between p-3 border rounded"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          {tx.from === "treasury_wallet" ? (
                            <ArrowUpRight className="w-4 h-4 text-green-500" />
                          ) : (
                            <ArrowDownLeft className="w-4 h-4 text-blue-500" />
                          )}
                          <span className="font-medium">
                            {tx.from === "treasury_wallet"
                              ? "Payout"
                              : "Contribution"}
                          </span>
                          <Badge
                            variant={
                              tx.status === "confirmed"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {tx.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {tx.from} → {tx.to}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(tx.timestamp).toLocaleString()}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-bold">{tx.amount} ETH</p>
                        <p className="text-xs text-gray-500">
                          {tx.txHash.slice(0, 10)}...
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
