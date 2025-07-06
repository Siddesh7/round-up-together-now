import { useState, useCallback } from "react";
import { CONTRACT_CONFIG } from "@/constants/contract";

// Treasury service configuration
const TREASURY_SERVICE_URL =
  import.meta.env.VITE_TREASURY_SERVICE_URL || "http://localhost:3001";

// Types for treasury operations
interface TreasuryContribution {
  groupId: string;
  memberAddress: string;
  amount: string;
  intmaxTxHash: string;
  isFirstMonth: boolean;
}

interface TreasuryPayout {
  groupId: string;
  recipientAddress: string;
  payoutOrder: number;
  baseAmount: string;
}

interface TreasuryResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export const useTreasury = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Record contribution on smart contract via treasury service
  const recordContribution = useCallback(
    async (contribution: TreasuryContribution) => {
      try {
        setLoading(true);
        setError(null);

        console.log(
          "🏦 Recording contribution via treasury service:",
          contribution
        );

        const response = await fetch(
          `${TREASURY_SERVICE_URL}/api/process-contribution`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              groupId: parseInt(contribution.groupId),
              memberAddress: contribution.memberAddress,
              amount: contribution.amount,
              intmaxTxHash: contribution.intmaxTxHash,
              isFirstMonth: contribution.isFirstMonth,
            }),
          }
        );

        const result: TreasuryResponse = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.error ||
              `HTTP ${response.status}: Failed to record contribution`
          );
        }

        console.log("✅ Contribution recorded successfully:", result.data);
        return result.data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to record contribution";
        console.error("❌ Treasury contribution error:", err);
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Process payout via treasury service
  const processPayout = useCallback(async (payout: TreasuryPayout) => {
    try {
      setLoading(true);
      setError(null);

      console.log("💰 Processing payout via treasury service:", payout);

      const response = await fetch(
        `${TREASURY_SERVICE_URL}/api/process-payout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            groupId: parseInt(payout.groupId),
            recipientAddress: payout.recipientAddress,
            payoutOrder: payout.payoutOrder,
            baseAmount: payout.baseAmount,
          }),
        }
      );

      const result: TreasuryResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || `HTTP ${response.status}: Failed to process payout`
        );
      }

      console.log("✅ Payout processed successfully:", result.data);
      return result.data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to process payout";
      console.error("❌ Treasury payout error:", err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get treasury service health status
  const checkTreasuryHealth = useCallback(async () => {
    try {
      const response = await fetch(`${TREASURY_SERVICE_URL}/health`);
      const health = await response.json();
      return health;
    } catch (err) {
      console.error("❌ Treasury health check failed:", err);
      return {
        status: "error",
        error: "Treasury service unreachable",
        contractConnected: false,
        intmaxConnected: false,
      };
    }
  }, []);

  // Get contract information
  const getContractInfo = useCallback(async () => {
    try {
      const response = await fetch(`${TREASURY_SERVICE_URL}/api/contract/info`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to get contract info");
      }

      return result.contract;
    } catch (err) {
      console.error("❌ Contract info error:", err);
      return null;
    }
  }, []);

  // Get group information from smart contract
  const getGroupFromContract = useCallback(async (groupId: string) => {
    try {
      const response = await fetch(
        `${TREASURY_SERVICE_URL}/api/contract/group/${groupId}`
      );
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to get group info");
      }

      return result.group;
    } catch (err) {
      console.error("❌ Group fetch error:", err);
      return null;
    }
  }, []);

  // Calculate interest amount using contract logic
  const calculateInterest = useCallback(
    (baseAmount: string, payoutOrder: number): string => {
      // Use contract constants for calculation
      if (payoutOrder <= 2) return "0";

      const base = parseFloat(baseAmount);
      const interest =
        (base * CONTRACT_CONFIG.CONSTANTS.INTEREST_RATE_BASIS_POINTS) / 10000;
      return interest.toString();
    },
    []
  );

  // Get treasury wallet balance
  const getTreasuryBalance = useCallback(async () => {
    try {
      const response = await fetch(
        `${TREASURY_SERVICE_URL}/api/treasury/balance`
      );
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to get treasury balance");
      }

      return result;
    } catch (err) {
      console.error("❌ Treasury balance error:", err);
      return null;
    }
  }, []);

  // Fund a user with test funds from treasury
  const fundUser = useCallback(async (userAddress: string) => {
    try {
      setLoading(true);
      setError(null);

      console.log("🎁 Funding user with test funds:", userAddress);

      const response = await fetch(
        `${TREASURY_SERVICE_URL}/api/treasury/fund-user`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userAddress,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to fund user");
      }

      console.log("✅ User funding successful:", result.data);
      return result.data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fund user";
      console.error("❌ Treasury funding error:", err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    // State
    loading,
    error,

    // Actions
    recordContribution,
    processPayout,
    checkTreasuryHealth,
    getContractInfo,
    getGroupFromContract,
    calculateInterest,
    getTreasuryBalance,
    fundUser,

    // Config
    treasuryServiceUrl: TREASURY_SERVICE_URL,
    contractAddress: CONTRACT_CONFIG.ADDRESS,
    isConnected: !error,
  };
};
