# Community Chit Fund App - Hackathon MVP

A modern platform for organizing group-based savings (chit funds), where members contribute monthly and one member receives the pooled amount in turn. Built for hackathon scope with a focus on treasury protection, group dynamics, and user experience.

## 🎯 Product Overview

This app implements a **focused, cleaned-up MVP** for community chit funds with three group types:

- **Private Groups** — invite-only among trusted people
- **Public Groups** — open to anyone with contribution caps
- **Community Groups** — for vetted community members (e.g., Discord-verified)

## 🏦 Treasury Model

- **First month contributions** go directly to a **treasury** (protocol reserve) to build confidence and provide initial stability
- From the **second month onward**, participants can begin to claim the pooled pot
- Members who claim later (e.g., 10th month) receive **interest on their pot** — fixed at 7% for demonstration

**Example**: If a participant claims the 10th month, they get the pooled pot plus 7% extra.

## ✨ Core Features

### 🚀 User Flows

1. **Onboarding** - Brief welcome with chit fund explanation and profile creation
2. **Home Dashboard** - Welcome header with Create Group and Join Group actions, plus featured groups list
3. **Join Group** - Choose from static list, see details, validate Community Group membership via Discord
4. **Create Group** - Step-by-step wizard with progress bar for all group settings
5. **Group Dashboard** - Member profiles, progress tracking, payout schedule, simple chat, contribution flow
6. **Payments** - Contribution flow with payment confirmation and payout receipts
7. **Notifications** - Reminders for contributions, payout alerts, group messages
8. **Profile & Account** - Contribution history, payouts received, basic settings

### 🛠 Technical Features

- **Treasury Logic** - First month contributions automatically go to treasury
- **Interest Calculation** - Later recipients earn up to 7% interest (mock for demo)
- **Group Management** - Create, join, and manage different circle types
- **Real-time Chat** - Simple group messaging system
- **Notification System** - Contextual alerts and reminders
- **Payment Flow** - Mock payment processing with status tracking
- **Responsive Design** - Modern UI with Tailwind CSS and shadcn components

## 🏗 Tech Stack

- **Frontend**: React 18, TypeScript, Next.js 15
- **Styling**: Tailwind CSS v4, shadcn/ui components
- **Backend**: Supabase (Database & Auth)
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Package Manager**: pnpm

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd round-up-together-now

# Install dependencies
pnpm install

# Start development server
pnpm run dev
```

### Environment Setup

The app uses Supabase for backend services. The configuration is already set up in the project.

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── ui/              # shadcn/ui components
│   ├── Dashboard.tsx    # Main dashboard
│   ├── GroupDashboard.tsx    # Individual group view
│   ├── ContributionCard.tsx  # Payment interface
│   ├── NotificationBell.tsx  # Notification system
│   └── ...
├── hooks/               # Custom React hooks
│   ├── useAuth.tsx      # Authentication
│   ├── useGroups.ts     # Group management
│   └── useNotifications.ts   # Notification system
├── constants/           # App constants
│   ├── treasury.ts      # Treasury logic & calculations
│   └── notifications.ts # Notification templates
├── integrations/        # External integrations
│   └── supabase/       # Supabase client & types
└── pages/              # Route pages
```

## 🎨 Design System

The app uses a cohesive design system with:

- **Custom Colors**: Primary green, trust blue, warm orange
- **Consistent Typography**: Inter font family
- **Component Library**: shadcn/ui with custom styling
- **Gradient Effects**: Beautiful gradients for call-to-action elements
- **Glass Effects**: Modern backdrop blur effects

## 🔧 Key Components

### Treasury Calculations

```typescript
// Calculate interest for later recipients
const calculatePayoutAmount = (
  monthlyContribution: number,
  totalMembers: number,
  payoutMonth: number
): number => {
  const basePot = monthlyContribution * totalMembers;
  const interestAmount = calculateInterestAmount(basePot, payoutMonth);
  return basePot + interestAmount;
};
```

### Group Types

- **Private**: Requires secret code, invite-only
- **Public**: Open joining with member limits
- **Community**: Verified members only (mock Discord integration)

### Notification System

- Real-time notifications for contributions, payouts, and group activities
- Contextual badges and alerts
- Persistent notification history

## 🚧 Hackathon Scope

**What's Included:**
✅ Complete UI/UX for all user flows  
✅ Treasury model with interest calculations  
✅ Group creation and management  
✅ Payment flow (mock processing)  
✅ Notification system  
✅ Profile management  
✅ Responsive design

**Simplified for Demo:**
⚡ Mock payment processing (no real payments)  
⚡ Mock Discord verification  
⚡ Fixed 7% interest rate  
⚡ In-memory notifications (no persistent storage)  
⚡ Basic chat without real-time sync

## 🎯 Future Enhancements

- Real payment integration (Stripe, etc.)
- Discord OAuth for community verification
- Advanced interest calculation algorithms
- Real-time chat with WebSockets
- Mobile app with React Native
- Advanced analytics and reporting
- Integration with DeFi protocols

## 📄 License

MIT License - see LICENSE file for details.

---

Built with ❤️ for the hackathon. This MVP demonstrates the core concepts of modern chit fund management with a focus on user experience and community trust.
