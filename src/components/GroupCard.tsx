
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, CircleDollarSign, Calendar, Shield } from 'lucide-react';

interface GroupCardProps {
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
  };
  onClick?: () => void;
}

const typeConfig = {
  private: {
    label: 'Private Circle',
    color: 'bg-primary text-primary-foreground',
    icon: Shield
  },
  public: {
    label: 'Public Circle',
    color: 'bg-trust-blue text-white',
    icon: Users
  },
  community: {
    label: 'Community Circle',
    color: 'bg-warm-orange text-white',
    icon: Users
  }
};

export const GroupCard: React.FC<GroupCardProps> = ({ group, onClick }) => {
  const config = typeConfig[group.type];
  const Icon = config.icon;
  const progress = (group.members / group.maxMembers) * 100;

  return (
    <Card 
      className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer border-0 shadow-md"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <Icon className="w-5 h-5 text-muted-foreground" />
            <Badge className={config.color}>
              {config.label}
            </Badge>
            {group.verified && (
              <Badge variant="outline" className="text-success border-success">
                ✓ Verified
              </Badge>
            )}
          </div>
        </div>
        
        <h3 className="font-semibold text-lg leading-tight mt-2">
          {group.name}
        </h3>
        
        <p className="text-muted-foreground text-sm leading-relaxed">
          {group.description}
        </p>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Circle Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
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
        <div className="mb-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Circle Progress</span>
            <span>{Math.round(progress)}% full</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-primary to-success h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Total Pot */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Next payout: {group.nextPayout}
            </span>
          </div>
          
          <div className="text-right">
            <div className="text-lg font-bold text-success">
              ${group.totalPot.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">
              Total pot
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
