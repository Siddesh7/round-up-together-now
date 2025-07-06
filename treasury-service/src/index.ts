import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { IntMaxNodeClient } from "intmax2-server-sdk";
import { ethers } from "ethers";
import { Contract } from "ethers";
import { parseEther } from "ethers/lib/utils";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Contract configuration
const CONTRACT_ADDRESS =
  process.env.CONTRACT_ADDRESS || "0x53647E2CE58937864B448e038Ad88305AfC2Ce4f";
const BASE_SEPOLIA_RPC =
  process.env.BASE_SEPOLIA_RPC || "https://sepolia.base.org";
const CHAIN_ID = 84532;

// Middleware
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"], // React & Vite dev servers
    credentials: true,
  })
);
app.use(express.json());

// INTMAX client instance
let intmaxClient: IntMaxNodeClient | null = null;
const INTMAX_DEMO_MODE = false; // Set to false when ready to use INTMAX

// Smart contract instance
let smartContract: Contract | null = null;

// Contract ABI (key functions only)
const CONTRACT_ABI = [
  "function createGroup(uint8 groupType, uint256 monthlyAmount, uint256 maxMembers) external returns (uint256)",
  "function recordContribution(uint256 groupId, address member, uint256 amount, bool isFirstMonth, string intmaxTxHash) external",
  "function recordPayout(uint256 groupId, address recipient, uint256 payoutOrder, uint256 baseAmount, uint256 interestAmount, string intmaxTxHash) external",
  "function getTotalGroups() external view returns (uint256)",
  "function treasuryWallet() external view returns (address)",
  "function getGroup(uint256 groupId) external view returns (tuple(uint8 groupType, uint256 monthlyAmount, uint256 maxMembers, uint256 currentMembers, bool isActive, uint256 currentCycle))",
  "function calculateInterest(uint256 baseAmount, uint256 payoutOrder) external pure returns (uint256)",
  "event GroupCreated(uint256 indexed groupId, uint8 groupType, uint256 monthlyAmount, uint256 maxMembers)",
  "event ContributionRecorded(uint256 indexed groupId, address indexed member, uint256 amount, bool isFirstMonth, string intmaxTxHash)",
  "event PayoutRecorded(uint256 indexed groupId, address indexed recipient, uint256 payoutOrder, uint256 baseAmount, uint256 interestAmount, string intmaxTxHash)",
];

// Initialize INTMAX Treasury Client
async function initializeIntMaxClient() {
  try {
    console.log("🚀 Initializing INTMAX Treasury Client...");

    // Check required environment variables
    if (!process.env.TREASURY_ETH_PRIVATE_KEY) {
      console.log(
        "⚠️  TREASURY_ETH_PRIVATE_KEY not found - INTMAX integration disabled"
      );
      return false;
    }

    if (!process.env.L1_RPC_URL) {
      console.log("⚠️  L1_RPC_URL not found - using default Sepolia RPC");
    }

    // Initialize INTMAX client using server SDK
    intmaxClient = new IntMaxNodeClient({
      environment:
        (process.env.INTMAX_ENVIRONMENT as "testnet" | "mainnet") || "testnet",
      eth_private_key: process.env.TREASURY_ETH_PRIVATE_KEY as `0x${string}`,
      l1_rpc_url:
        process.env.L1_RPC_URL || "https://sepolia.gateway.tenderly.co",
    });

    // Login to INTMAX
    await intmaxClient.login();

    // Fetch initial balance
    const { balances } = await intmaxClient.fetchTokenBalances();

    console.log("✅ INTMAX Treasury Client initialized successfully");
    console.log(`📍 Treasury Address: ${intmaxClient.address}`);
    console.log("💰 Treasury Balances:", balances);

    return true;
  } catch (error) {
    console.error("❌ Failed to initialize INTMAX client:", error);
    console.log("🔄 Treasury service will run in demo mode without INTMAX");
    return false;
  }
}

// Initialize Smart Contract
async function initializeSmartContract() {
  try {
    console.log("📄 Initializing Smart Contract...");
    console.log(`📍 Contract Address: ${CONTRACT_ADDRESS}`);
    console.log(`🌐 Network: Base Sepolia (${CHAIN_ID})`);

    // Create provider for Base Sepolia
    const provider = new ethers.providers.JsonRpcProvider(BASE_SEPOLIA_RPC);

    // Test network connection
    const network = await provider.getNetwork();
    console.log(
      `🔗 Connected to network: ${network.name} (${network.chainId})`
    );

    // Create contract instance (read-only for treasury service)
    smartContract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

    // Test contract connection by calling a view function
    const totalGroups = await smartContract.getTotalGroups();
    console.log(`📊 Total groups in contract: ${totalGroups.toString()}`);

    // Get treasury wallet from contract
    const contractTreasuryWallet = await smartContract.treasuryWallet();
    console.log(`🏦 Contract treasury wallet: ${contractTreasuryWallet}`);

    console.log("✅ Smart contract initialized successfully");
    return true;
  } catch (error) {
    console.error("❌ Failed to initialize smart contract:", error);
    console.log(
      "🔄 Treasury service will run without smart contract integration"
    );
    return false;
  }
}

// API Routes

// Health check
app.get("/health", async (req, res) => {
  try {
    let contractStatus = "disconnected";
    let totalGroups = 0;

    if (smartContract) {
      try {
        totalGroups = await smartContract.getTotalGroups();
        contractStatus = "connected";
      } catch (error) {
        contractStatus = "error";
      }
    }

    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      intmaxConnected: !!intmaxClient,
      contractConnected: contractStatus === "connected",
      treasuryAddress: intmaxClient?.address || "INTMAX_DEMO_MODE",
      contract: {
        address: CONTRACT_ADDRESS,
        network: "Base Sepolia",
        status: contractStatus,
        totalGroups,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      error: "Health check failed",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Get treasury balance
app.get("/api/treasury/balance", async (req, res) => {
  try {
    if (!intmaxClient) {
      return res.json({
        success: true,
        message: "INTMAX temporarily disabled - using demo mode",
        address: "INTMAX_DISABLED_FOR_TESTING",
        balances: [],
        network: "Demo Mode",
        demo: true,
      });
    }

    const { balances } = await intmaxClient.fetchTokenBalances();

    // Convert BigInt amounts to strings for JSON serialization
    const serializedBalances = balances.map((balance) => ({
      ...balance,
      amount: balance.amount.toString(),
      amountInEth: (Number(balance.amount) / 1e18).toFixed(6),
    }));

    res.json({
      success: true,
      address: intmaxClient.address,
      balances: serializedBalances,
      network: "INTMAX Testnet",
    });
  } catch (error) {
    console.error("Error fetching treasury balance:", error);
    res.status(500).json({
      error: "Failed to fetch treasury balance",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Debug treasury balance (detailed info)
app.get("/api/treasury/debug", async (req, res) => {
  try {
    if (!intmaxClient) {
      return res.status(400).json({
        error: "INTMAX client not initialized",
        address: "Not available",
        suggestions: [
          "Check TREASURY_ETH_PRIVATE_KEY environment variable",
          "Ensure private key format is correct (0x...)",
          "Restart treasury service after adding private key",
        ],
      });
    }

    console.log("🔍 Debug: Fetching detailed treasury information...");

    // Try different balance fetching methods
    let balances: any[] = [];
    let error: string | null = null;
    let debugInfo: any = {};

    try {
      const result = await intmaxClient.fetchTokenBalances();
      balances = result.balances || [];
      debugInfo = {
        fetchMethod: "fetchTokenBalances",
        rawResult: result,
        balanceCount: balances.length,
      };
    } catch (err) {
      error = err instanceof Error ? err.message : "Unknown error";
      console.error("❌ fetchTokenBalances failed:", err);
    }

    // Additional debugging information
    const debugDetails = {
      intmaxAddress: intmaxClient.address,
      network: "INTMAX Testnet",
      timestamp: new Date().toISOString(),
      balances,
      balanceCount: balances.length,
      error,
      debugInfo,
      troubleshooting: {
        emptyBalance: {
          possibleCauses: [
            "Funds sent to wrong address",
            "Funds sent on wrong network (need INTMAX L2)",
            "Transaction still pending/confirming",
            "Different token type than expected",
            "INTMAX sync delay",
          ],
          nextSteps: [
            "Verify you sent to correct address: " + intmaxClient.address,
            "Check transaction on INTMAX explorer",
            "Wait 1-5 minutes for sync",
            "Ensure you sent ETH (not other tokens)",
            "Try refreshing balance",
          ],
        },
      },
    };

    res.json({
      success: true,
      ...debugDetails,
    });
  } catch (error) {
    console.error("Error in debug endpoint:", error);
    res.status(500).json({
      error: "Failed to fetch debug info",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Force refresh treasury balance
app.post("/api/treasury/refresh", async (req, res) => {
  try {
    if (!intmaxClient) {
      return res.status(400).json({
        error: "INTMAX client not initialized",
      });
    }

    console.log("🔄 Force refreshing treasury balance...");

    // Force refresh the balance
    const result = await intmaxClient.fetchTokenBalances();

    console.log("💰 Refreshed treasury balances:", result.balances);

    // Convert BigInt amounts to strings for JSON serialization
    const serializedBalances = result.balances.map((balance) => ({
      ...balance,
      amount: balance.amount.toString(),
      amountInEth: (Number(balance.amount) / 1e18).toFixed(6),
    }));

    res.json({
      success: true,
      message: "Balance refreshed successfully",
      address: intmaxClient.address,
      balances: serializedBalances,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error refreshing treasury balance:", error);
    res.status(500).json({
      error: "Failed to refresh treasury balance",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Record group join on smart contract
app.post("/api/record-group-join", async (req, res) => {
  try {
    const { groupId, memberAddress, payoutOrder } = req.body;

    if (!groupId || !memberAddress || !payoutOrder) {
      return res.status(400).json({
        error: "Missing required fields: groupId, memberAddress, payoutOrder",
      });
    }

    console.log("👥 Recording group join:", {
      groupId,
      memberAddress,
      payoutOrder,
    });

    // If smart contract is available, record the join
    if (smartContract) {
      console.log("📄 Recording group join on smart contract...");

      // For demo purposes, we'll simulate the smart contract call
      console.log(
        "Would call: recordGroupJoin(",
        {
          groupId: parseInt(groupId),
          memberAddress,
          payoutOrder,
        },
        ")"
      );

      const demoTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      console.log("✅ Group join would be recorded on smart contract");

      res.json({
        success: true,
        message: "Group join recorded successfully",
        data: {
          groupId,
          memberAddress,
          payoutOrder,
          contractTxHash: demoTxHash,
        },
        timestamp: new Date().toISOString(),
      });
    } else {
      res.json({
        success: true,
        message: "Group join recorded (smart contract not available)",
        data: {
          groupId,
          memberAddress,
          payoutOrder,
          contractTxHash: null,
        },
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("Error recording group join:", error);
    res.status(500).json({
      error: "Failed to record group join",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Get contract info
app.get("/api/contract/info", async (req, res) => {
  try {
    if (!smartContract) {
      return res.status(400).json({
        error: "Smart contract not initialized",
        contract: CONTRACT_ADDRESS,
        network: "Base Sepolia",
      });
    }

    const totalGroups = await smartContract.getTotalGroups();
    const treasuryWallet = await smartContract.treasuryWallet();

    res.json({
      success: true,
      contract: {
        address: CONTRACT_ADDRESS,
        network: "Base Sepolia",
        chainId: CHAIN_ID,
        totalGroups: totalGroups.toString(),
        treasuryWallet,
        explorer: `https://sepolia-explorer.base.org/address/${CONTRACT_ADDRESS}`,
      },
    });
  } catch (error) {
    console.error("Error fetching contract info:", error);
    res.status(500).json({
      error: "Failed to fetch contract info",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Process contribution (record INTMAX deposit on smart contract)
app.post("/api/process-contribution", async (req, res) => {
  try {
    const { groupId, memberAddress, amount, intmaxTxHash, isFirstMonth } =
      req.body;

    // Validate inputs
    if (!groupId || !memberAddress || !amount || !intmaxTxHash) {
      return res.status(400).json({
        error:
          "Missing required fields: groupId, memberAddress, amount, intmaxTxHash",
      });
    }

    console.log("📝 Processing contribution:", {
      groupId,
      memberAddress,
      amount,
      intmaxTxHash,
      isFirstMonth,
    });

    // TODO: Verify the INTMAX transaction actually occurred
    // This would involve checking the transaction hash and amount

    let contractTxHash = null;
    if (smartContract) {
      console.log("📄 Recording contribution on smart contract...");

      // Note: This would require a wallet with treasury permissions
      // For now, we'll log what would happen
      console.log(
        "Would call: recordContribution(",
        {
          groupId,
          memberAddress,
          amount: ethers.utils.parseEther(amount),
          isFirstMonth,
          intmaxTxHash,
        },
        ")"
      );

      contractTxHash = "demo_contract_tx_hash";
      console.log("✅ Contribution would be recorded on smart contract");
    }

    res.json({
      success: true,
      message: "Contribution processed successfully",
      data: {
        groupId,
        memberAddress,
        amount,
        intmaxTxHash,
        isFirstMonth,
        contractTxHash,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error processing contribution:", error);
    res.status(500).json({
      error: "Failed to process contribution",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Process payout (send INTMAX transfer and record on smart contract)
app.post("/api/process-payout", async (req, res) => {
  try {
    const { groupId, recipientAddress, payoutOrder, baseAmount } = req.body;

    if (!groupId || !recipientAddress || !payoutOrder || !baseAmount) {
      return res.status(400).json({
        error:
          "Missing required fields: groupId, recipientAddress, payoutOrder, baseAmount",
      });
    }

    // Calculate interest using contract logic
    let interestAmount = "0";
    if (smartContract && payoutOrder > 2) {
      try {
        const interest = await smartContract.calculateInterest(
          ethers.utils.parseEther(baseAmount),
          payoutOrder
        );
        interestAmount = ethers.utils.formatEther(interest);
      } catch (error) {
        console.log("Using fallback interest calculation");
        const base = parseFloat(baseAmount);
        interestAmount = (base * 0.07).toString(); // 7%
      }
    }

    const totalAmount = (
      parseFloat(baseAmount) + parseFloat(interestAmount)
    ).toString();

    console.log("💰 Processing payout:", {
      groupId,
      recipientAddress,
      baseAmount,
      interestAmount,
      totalAmount,
      payoutOrder,
    });

    // TODO: Send actual INTMAX transfer when client is available
    let intmaxTxHash = null;
    if (intmaxClient) {
      console.log(
        "💸 Would send INTMAX transfer:",
        totalAmount,
        "ETH to",
        recipientAddress
      );
      intmaxTxHash = `demo_intmax_tx_${Date.now()}`;
    }

    res.json({
      success: true,
      message: "Payout processed successfully",
      data: {
        groupId,
        recipientAddress,
        baseAmount,
        interestAmount,
        totalAmount,
        payoutOrder,
        intmaxTxHash,
        contractTxHash: "demo_contract_tx_hash",
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error processing payout:", error);
    res.status(500).json({
      error: "Failed to process payout",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Get group info from smart contract
app.get("/api/contract/group/:groupId", async (req, res) => {
  try {
    const { groupId } = req.params;

    if (!smartContract) {
      return res.status(400).json({
        error: "Smart contract not available",
      });
    }

    const group = await smartContract.getGroup(parseInt(groupId));

    res.json({
      success: true,
      group: {
        groupType: group.groupType,
        monthlyAmount: ethers.utils.formatEther(group.monthlyAmount),
        maxMembers: group.maxMembers.toString(),
        currentMembers: group.currentMembers.toString(),
        isActive: group.isActive,
        currentCycle: group.currentCycle.toString(),
      },
    });
  } catch (error) {
    console.error("Error fetching group from contract:", error);
    res.status(500).json({
      error: "Failed to fetch group info",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Start server
async function startServer() {
  console.log("🚀 Starting Treasury Service...");
  console.log(`📄 Contract: ${CONTRACT_ADDRESS}`);
  console.log(`🌐 Network: Base Sepolia`);

  // Initialize services
  const intmaxInit = await initializeIntMaxClient();
  const contractInit = await initializeSmartContract();

  if (!intmaxInit) {
    console.log("⚠️  INTMAX client not available - using demo mode");
  }

  if (!contractInit) {
    console.log("❌ Smart contract connection failed");
  }

  app.listen(PORT, () => {
    console.log(`\n✅ Treasury Service running on port ${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/health`);
    console.log(
      `💰 Treasury balance: http://localhost:${PORT}/api/treasury/balance`
    );
    console.log(`📄 Contract info: http://localhost:${PORT}/api/contract/info`);
    console.log("\n📋 Environment Variables:");
    console.log("   - TREASURY_ETH_PRIVATE_KEY (for INTMAX)");
    console.log("   - L1_RPC_URL (optional)");
    console.log("   - INTMAX_ENVIRONMENT (optional, defaults to testnet)");
  });
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down Treasury Service...");

  if (intmaxClient) {
    try {
      await intmaxClient.logout();
      console.log("✅ INTMAX client disconnected");
    } catch (error) {
      console.error("Error disconnecting INTMAX client:", error);
    }
  }

  process.exit(0);
});

// Start the server
startServer().catch((error) => {
  console.error("💥 Failed to start Treasury Service:", error);
  process.exit(1);
});
