import { useState, useCallback, useEffect } from "react";
import { IntMaxClient } from "intmax2-client-sdk";
import { parseEther } from "viem";

// Real INTMAX client interface (matches the SDK)
interface IntMaxTransaction {
  txHash: string;
  amount: string;
  from: string;
  to: string;
  status: "pending" | "confirmed" | "failed";
  timestamp: number;
}

export type UseIntMaxReturnType = ReturnType<typeof useIntMax>;

export const useIntMax = () => {
  const [client, setClient] = useState<IntMaxClient | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>("0.00");
  const [transactions, setTransactions] = useState<IntMaxTransaction[]>([]);
  const [address, setAddress] = useState<string | null>(null);
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);

  // Refresh balance using available SDK methods
  const getBalances = useCallback(async () => {
    if (!client || !isLoggedIn) return;
    setIsBalanceLoading(true);
    setError(null);

    try {
      console.log("Fetching balances for address:", (client as any).address);
      const balanceData = await (client as any).fetchTokenBalances();
      console.log("Fetched balances data:", balanceData);

      if (balanceData?.balances) {
        const ethBalance = balanceData.balances.find(
          (b: { token: { symbol: string } }) => b.token.symbol === "ETH"
        );

        if (ethBalance) {
          const balanceInWei = BigInt(ethBalance.amount);
          // Format from wei to ETH, showing up to 8 decimal places
          const ethAmount = (Number(balanceInWei) / 1e18).toLocaleString(
            "en-US",
            {
              minimumFractionDigits: 2,
              maximumFractionDigits: 8,
            }
          );
          setBalance(ethAmount);
          console.log("Formatted ETH Balance:", ethAmount);
        } else {
          setBalance("0.00");
        }
      }
    } catch (err) {
      console.error("Failed to fetch balances:", err);
      setError("Failed to fetch balances.");
    } finally {
      setIsBalanceLoading(false);
    }
  }, [client, isLoggedIn]);

  // Initialize INTMAX client using real SDK
  const initializeClient = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Use real INTMAX SDK
      const newClient = await IntMaxClient.init({
        environment: "testnet", // Use testnet for development
      });
      console.log("newClient", newClient);
      setClient(newClient);
      console.log("INTMAX client initialized successfully");
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to initialize INTMAX client";
      setError(errorMessage);
      console.error("INTMAX Client initialization failed:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Login to INTMAX using real SDK
  const login = useCallback(async () => {
    if (!client) {
      setError("Client not initialized");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Real INTMAX login (documented method)
      await client.login();
      setIsLoggedIn(true);
      setAddress(client.address);

      console.log("INTMAX login successful, address:", client.address);

      // Fetch balance immediately after login
      await getBalances();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Login failed";
      setError(errorMessage);
      console.error("INTMAX login failed:", err);
    } finally {
      setLoading(false);
    }
  }, [client, getBalances]);

  // Logout from INTMAX using real SDK
  const logout = useCallback(async () => {
    if (!client) return;

    try {
      setLoading(true);

      // Real INTMAX logout (documented method)
      await client.logout();
      setIsLoggedIn(false);
      setError(null);
      setBalance("0");
      setTransactions([]);
      setAddress(null);

      console.log("INTMAX logout successful");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Logout failed";
      setError(errorMessage);
      console.error("INTMAX logout failed:", err);
    } finally {
      setLoading(false);
    }
  }, [client]);

  // Real deposit to treasury (contribution)
  const depositToTreasury = useCallback(
    async (amount: string, groupId: string) => {
      if (!client || !isLoggedIn) {
        throw new Error("INTMAX not connected");
      }

      try {
        setLoading(true);
        setError(null);

        // Treasury wallet address from running treasury service
        const TREASURY_WALLET =
          "T7QfxphC2QPMBBsBmf8w8XNCfk3cMB19Wa41aPQBAahfiLmVs9EZUzrJ1JJHAeda11NjCbjHpXpBGANu3N8mjixQ8DCs4s1";

        // Fetch native ETH token information from INTMAX
        const tokens = await (client as any).getTokensList();
        let token = tokens.find((t: any) => t.tokenIndex === 0);
        if (!token) {
          // Fallback token definition
          token = {
            tokenIndex: 0,
            symbol: "ETH",
            decimals: 18,
            contractAddress: "0x0000000000000000000000000000000000000000",
          };
        }
        token = { ...token, tokenType: 0 }; // TokenType.NATIVE = 0

        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
          throw new Error("Invalid amount provided");
        }

        // Prepare deposit param as per SDK docs
        const depositParams = {
          amount: numericAmount,
          token,
          address: TREASURY_WALLET,
        };

        console.log("🚀 Depositing to treasury via INTMAX:", depositParams);

        let result: any;
        try {
          result = await (client as any).deposit(depositParams);
        } catch (methodErr) {
          console.error("INTMAX deposit error:", methodErr);
          throw new Error(
            `Deposit failed: ${
              methodErr instanceof Error ? methodErr.message : "Unknown error"
            }`
          );
        }

        const txHash = result?.txHash || `intmax_${Date.now()}`;

        console.log("✅ INTMAX deposit successful:", {
          groupId,
          amount: numericAmount.toString() + " ETH",
          txHash,
          to: TREASURY_WALLET,
        });

        // Add to transactions history
        const newTx: IntMaxTransaction = {
          txHash,
          amount: numericAmount.toString(),
          from: client.address,
          to: TREASURY_WALLET,
          status: "confirmed",
          timestamp: Date.now(),
        };
        setTransactions((prev) => [newTx, ...prev]);

        // Refresh balance after transaction
        setTimeout(() => getBalances(), 2000);

        return {
          txHash,
          amount: numericAmount.toString(),
          to: TREASURY_WALLET,
          groupId,
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Deposit failed";
        setError(errorMessage);
        console.error("INTMAX deposit failed:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [client, isLoggedIn, getBalances]
  );

  // This method would be called by treasury service for payouts
  const sendPayout = useCallback(
    async (recipientAddress: string, amount: string, groupId: number) => {
      if (!client || !isLoggedIn) {
        throw new Error("INTMAX not connected");
      }

      try {
        setLoading(true);
        setError(null);

        // Use INTMAX transfer method
        let result: { txHash: string };

        try {
          if (typeof (client as any).transfer === "function") {
            result = await (client as any).transfer(recipientAddress, amount);
          } else {
            throw new Error("Transfer method not available");
          }
        } catch (methodErr) {
          console.error("INTMAX transfer method error:", methodErr);
          throw new Error(
            "INTMAX transfer not available. Please check SDK documentation."
          );
        }

        console.log("INTMAX payout successful:", {
          groupId,
          recipientAddress,
          amount,
          txHash: result.txHash,
        });

        // Add to transactions history
        const newTx: IntMaxTransaction = {
          txHash: result.txHash,
          amount,
          from: client.address,
          to: recipientAddress,
          status: "confirmed",
          timestamp: Date.now(),
        };
        setTransactions((prev) => [newTx, ...prev]);

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Payout failed";
        setError(errorMessage);
        console.error("INTMAX payout failed:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [client, isLoggedIn]
  );

  // Auto-refresh balance every 30 seconds
  useEffect(() => {
    if (!isLoggedIn) return;

    getBalances();
    const interval = setInterval(getBalances, 30000);
    return () => clearInterval(interval);
  }, [isLoggedIn, getBalances]);

  return {
    // State
    client,
    isLoggedIn,
    loading,
    error,
    balance,
    transactions,
    address,
    isBalanceLoading,

    // Actions
    initializeClient,
    login,
    logout,
    depositToTreasury,
    sendPayout,
    getBalances,

    // Computed
    formattedBalance: balance,
    hasBalance: parseFloat(balance) > 0,
  };
};
