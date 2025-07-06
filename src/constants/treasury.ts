// Treasury model constants for chit fund app
export const TREASURY_CONFIG = {
  // First month contributions go to treasury
  TREASURY_MONTHS: 1,

  // Interest rate for later recipients (mockup for hackathon)
  INTEREST_RATE: 0.07, // 7% interest for demonstration

  // Treasury fee (if any)
  TREASURY_FEE_PERCENT: 0.01, // 1% platform fee

  // Minimum months before payouts start
  MIN_MONTHS_BEFORE_PAYOUT: 2,

  // Default group settings
  DEFAULT_GROUP_DURATION_MONTHS: 12,
  MIN_GROUP_MEMBERS: 3,
  MAX_GROUP_MEMBERS: 50,

  // Payment statuses
  PAYMENT_STATUS: {
    PENDING: "pending",
    PAID: "paid",
    OVERDUE: "overdue",
    TREASURY: "treasury",
  } as const,

  // Group statuses
  GROUP_STATUS: {
    DRAFT: "draft",
    ACTIVE: "active",
    FULL: "full",
    COMPLETED: "completed",
    PAUSED: "paused",
  } as const,
};

// Calculate interest amount for a given month position
export const calculateInterestAmount = (
  baseAmount: number,
  month: number
): number => {
  if (month <= TREASURY_CONFIG.MIN_MONTHS_BEFORE_PAYOUT) {
    return 0; // No interest for early months
  }

  // Simple interest calculation for demo purposes
  const interestMultiplier = Math.max(
    0,
    (month - TREASURY_CONFIG.MIN_MONTHS_BEFORE_PAYOUT) / 10
  );
  return Math.round(
    baseAmount * TREASURY_CONFIG.INTEREST_RATE * interestMultiplier
  );
};

// Calculate total payout amount including interest
export const calculatePayoutAmount = (
  monthlyContribution: number,
  totalMembers: number,
  payoutMonth: number
): number => {
  const basePot = monthlyContribution * totalMembers;
  const interestAmount = calculateInterestAmount(basePot, payoutMonth);
  return basePot + interestAmount;
};
