// Contract configuration for ChitFundLedger
export const CONTRACT_CONFIG = {
  // Deployed contract address on Base Sepolia
  ADDRESS: "0x53647E2CE58937864B448e038Ad88305AfC2Ce4f",

  // Network configuration
  NETWORK: {
    name: "Base Sepolia",
    chainId: 84532,
    rpcUrl: "https://sepolia.base.org",
    blockExplorer: "https://sepolia-explorer.base.org",
  },

  // Contract ABI (simplified for key functions)
  ABI: [
    // View functions
    "function getTotalGroups() external view returns (uint256)",
    "function getGroup(uint256 groupId) external view returns (tuple(uint256 id, string name, uint8 groupType, address creator, uint256 monthlyAmount, uint256 maxMembers, uint256 currentMembers, uint256 currentCycle, bool active, uint256 createdAt))",
    "function getGroupMembers(uint256 groupId) external view returns (address[])",
    "function getMember(uint256 groupId, address memberAddress) external view returns (tuple(address memberAddress, uint256 payoutOrder, bool hasReceivedPayout, bool active))",
    "function getContribution(uint256 contributionId) external view returns (tuple(uint256 id, uint256 groupId, address member, uint256 amount, uint8 status, bool isTreasury, string intmaxTxHash))",
    "function getPayout(uint256 payoutId) external view returns (tuple(uint256 id, uint256 groupId, address recipient, uint256 baseAmount, uint256 interestAmount, uint8 status, string intmaxTxHash))",
    "function calculateInterest(uint256 baseAmount, uint256 payoutOrder) external pure returns (uint256)",
    "function treasuryWallet() external view returns (address)",

    // State changing functions
    "function createGroup(string memory _name, uint8 _groupType, uint256 _monthlyAmount, uint256 _maxMembers) external returns (uint256)",
    "function joinGroup(uint256 groupId) external",
    "function recordContribution(uint256 groupId, address member, uint256 amount, bool isTreasury, string memory intmaxTxHash) external",
    "function recordPayout(uint256 groupId, address recipient, uint256 baseAmount, uint256 interestAmount, string memory intmaxTxHash) external",

    // Owner functions
    "function updateTreasuryWallet(address newTreasuryWallet) external",
    "function pauseGroup(uint256 groupId) external",
    "function resumeGroup(uint256 groupId) external",

    // Events
    "event GroupCreated(uint256 indexed groupId, address indexed creator, string name)",
    "event MemberJoined(uint256 indexed groupId, address indexed member)",
    "event ContributionRecorded(uint256 indexed contributionId, uint256 indexed groupId, address indexed member, uint256 amount)",
    "event PayoutRecorded(uint256 indexed payoutId, uint256 indexed groupId, address indexed recipient, uint256 totalAmount)",
  ],

  // Constants from contract
  CONSTANTS: {
    INTEREST_RATE_BASIS_POINTS: 700, // 7%
    MIN_MEMBERS: 3,
    MAX_MEMBERS: 50,
  },
};

// Group types enum
export enum GroupType {
  PRIVATE = 0,
  PUBLIC = 1,
  COMMUNITY = 2,
}

// Contract helper functions
export const formatGroupType = (type: number): string => {
  switch (type) {
    case 0:
      return "Private";
    case 1:
      return "Public";
    case 2:
      return "Community";
    default:
      return "Unknown";
  }
};

export const calculateInterestAmount = (
  baseAmount: string,
  payoutOrder: number
): string => {
  if (payoutOrder <= 2) return "0";

  const base = parseFloat(baseAmount);
  const interest = (base * 700) / 10000; // 7%
  return interest.toString();
};
