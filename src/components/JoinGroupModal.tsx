
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { TelegramVerificationModal } from '@/components/TelegramVerificationModal';

export const JoinGroupModal = ({ onGroupJoined }: { onGroupJoined?: () => void }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [secretCode, setSecretCode] = useState('');
  const [showTelegramVerification, setShowTelegramVerification] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);

  const handleJoinPrivateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !secretCode) return;

    setLoading(true);
    try {
      // Find group with secret code
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .select('*')
        .eq('secret_code', secretCode)
        .single();

      if (groupError || !group) {
        throw new Error('Invalid secret code or circle not found');
      }

      // Check if group is full
      if (group.current_members >= group.max_members) {
        throw new Error('Circle is full');
      }

      // Check if user is already a member
      const { data: existingMember } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', group.id)
        .eq('user_id', user.id)
        .single();

      if (existingMember) {
        throw new Error('You are already a member of this circle');
      }

      // Check if this is a community group that requires Telegram verification
      if (group.type === 'community' && group.telegram_verification_enabled) {
        // Check if user is already verified for this group
        const { data: verificationData } = await supabase
          .from('user_telegram_verification')
          .select('*')
          .eq('user_id', user.id)
          .eq('group_id', group.id)
          .eq('verification_status', 'verified')
          .single();

        if (!verificationData || (verificationData.expires_at && new Date(verificationData.expires_at) < new Date())) {
          // Need to verify first
          setSelectedGroup(group);
          setShowTelegramVerification(true);
          return;
        }
      }

      // Add user to group directly (for private groups or already verified users)
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          group_id: group.id,
          user_id: user.id,
          payout_order: group.current_members + 1
        });

      if (memberError) throw memberError;

      toast({ title: `Successfully joined ${group.name}!` });
      setOpen(false);
      setSecretCode('');
      onGroupJoined?.();
    } catch (error: any) {
      toast({
        title: 'Error joining circle',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTelegramVerificationComplete = async (verified: boolean) => {
    setShowTelegramVerification(false);
    
    if (verified && selectedGroup) {
      try {
        // Now add user to group after successful verification
        const { error: memberError } = await supabase
          .from('group_members')
          .insert({
            group_id: selectedGroup.id,
            user_id: user!.id,
            payout_order: selectedGroup.current_members + 1
          });

        if (memberError) throw memberError;

        toast({ title: `Successfully joined ${selectedGroup.name}!` });
        setOpen(false);
        setSecretCode('');
        setSelectedGroup(null);
        onGroupJoined?.();
      } catch (error: any) {
        toast({
          title: 'Error joining circle',
          description: error.message,
          variant: 'destructive'
        });
      }
    }
    
    setSelectedGroup(null);
  };

  if (!user) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Users className="w-4 h-4 mr-2" />
            Join Private Circle
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Join Private Circle</DialogTitle>
            <DialogDescription>
              Enter the secret code provided by the circle creator to join a private savings circle.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleJoinPrivateGroup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="secretCode">Secret Code</Label>
              <Input
                id="secretCode"
                value={secretCode}
                onChange={(e) => setSecretCode(e.target.value)}
                placeholder="Enter the circle's secret code"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Joining...' : 'Join Circle'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Telegram Verification Modal */}
      {selectedGroup && showTelegramVerification && (
        <TelegramVerificationModal
          open={showTelegramVerification}
          onOpenChange={setShowTelegramVerification}
          groupId={selectedGroup.id}
          groupName={selectedGroup.name}
          telegramGroupHandle={selectedGroup.telegram_group_handle || ""}
          minMembershipMonths={selectedGroup.min_membership_months || 6}
          onVerificationComplete={handleTelegramVerificationComplete}
        />
      )}
    </>
  );
};
