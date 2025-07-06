// Notification constants and templates
export const NOTIFICATION_TYPES = {
  CONTRIBUTION_REMINDER: "contribution_reminder",
  PAYOUT_ALERT: "payout_alert",
  GROUP_MESSAGE: "group_message",
  MEMBER_JOINED: "member_joined",
  PAYOUT_RECEIVED: "payout_received",
  CONTRIBUTION_RECEIVED: "contribution_received",
  GROUP_FULL: "group_full",
} as const;

export const NOTIFICATION_TEMPLATES = {
  [NOTIFICATION_TYPES.CONTRIBUTION_REMINDER]: {
    title: "Monthly Contribution Due",
    message: (groupName: string, amount: number) =>
      `Your ${amount} contribution for ${groupName} is due in 3 days.`,
  },
  [NOTIFICATION_TYPES.PAYOUT_ALERT]: {
    title: "Payout Ready!",
    message: (groupName: string, amount: number) =>
      `Your payout of $${amount} from ${groupName} is ready for collection.`,
  },
  [NOTIFICATION_TYPES.GROUP_MESSAGE]: {
    title: "New Group Message",
    message: (groupName: string, sender: string) =>
      `${sender} sent a message in ${groupName}`,
  },
  [NOTIFICATION_TYPES.MEMBER_JOINED]: {
    title: "New Member Joined",
    message: (groupName: string, memberName: string) =>
      `${memberName} joined ${groupName}`,
  },
  [NOTIFICATION_TYPES.PAYOUT_RECEIVED]: {
    title: "Payout Received",
    message: (amount: number, groupName: string) =>
      `You received $${amount} from ${groupName}!`,
  },
  [NOTIFICATION_TYPES.CONTRIBUTION_RECEIVED]: {
    title: "Contribution Confirmed",
    message: (amount: number, groupName: string) =>
      `Your $${amount} contribution to ${groupName} has been confirmed.`,
  },
  [NOTIFICATION_TYPES.GROUP_FULL]: {
    title: "Group Complete",
    message: (groupName: string) =>
      `${groupName} is now full and ready to start!`,
  },
};
