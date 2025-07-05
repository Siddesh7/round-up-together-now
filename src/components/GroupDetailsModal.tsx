
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, CircleDollarSign, Calendar, Shield } from 'lucide-react';

interface GroupDetailsModalProps {
  group: {
    id: string;
    name: string;
    type: 'private' | 'public' | 'community';
    members: number;
    maxMembers: number;
    monthlyAmount: number;
    totalPot: number;
    nextPayout: string;
    description: string;
    verified?: boolean;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onJoin: (groupId: string) => void;
}

const typeConfig = {
  private: {
    label: 'Private',
    color: 'bg-primary text-primary-foreground',
    icon: Shield
  },
  public: {
    label: 'Public',
    color: 'bg-trust-blue text-white',
    icon: Users
  },
  community: {
    label: 'Community',
    color: 'bg-warm-orange text-white',
    icon: Users
  }
};

export const GroupDetailsModal: React.FC<GroupDetailsModalProps> = ({ 
  group, 
  isOpen, 
  onClose, 
  onJoin 
}) => {
  if (!group) return null;

  const config = typeConfig[group.type];
  const Icon = config.icon;
  const progress = (group.members / group.maxMembers) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="w-5 h-5" />
            {group.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Group Type and Status */}
          <div className="flex items-center gap-2">
            <Badge className={config.color}>
              {config.label}
            </Badge>
            {group.verified && (
              <Badge variant="outline" className="text-success border-success">
                ✓ Verified
              </Badge>
            )}
          </div>

          {/* Description */}
          <p className="text-muted-foreground text-sm">
            {group.description}
          </p>

          {/* Group Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">
                {group.members}/{group.maxMembers} members
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <CircleDollarSign className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                ${group.monthlyAmount}/month
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Group Progress</span>
              <span>{Math.round(progress)}% full</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-primary to-success h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Total Pot and Next Payout */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total pot:</span>
              <span className="text-lg font-bold text-success">
                ${group.totalPot.toLocaleString()}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Next payout: {group.nextPayout}
              </span>
            </div>
          </div>

          {/* Join Button */}
          <Button 
            onClick={() => onJoin(group.id)} 
            className="w-full"
            disabled={group.members >= group.maxMembers}
          >
            {group.members >= group.maxMembers ? 'Group Full' : 'Join Group'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
