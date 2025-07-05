
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const JoinGroupModal = ({ onGroupJoined }: { onGroupJoined?: () => void }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [secretCode, setSecretCode] = useState('');

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
        .eq('type', 'private')
        .single();

      if (groupError || !group) {
        throw new Error('Invalid secret code or group not found');
      }

      // Check if group is full
      if (group.current_members >= group.max_members) {
        throw new Error('Group is full');
      }

      // Check if user is already a member
      const { data: existingMember } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', group.id)
        .eq('user_id', user.id)
        .single();

      if (existingMember) {
        throw new Error('You are already a member of this group');
      }

      // Add user to group
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
        title: 'Error joining group',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Users className="w-4 h-4 mr-2" />
          Join Private Group
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Join Private Group</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleJoinPrivateGroup} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="secretCode">Secret Code</Label>
            <Input
              id="secretCode"
              value={secretCode}
              onChange={(e) => setSecretCode(e.target.value)}
              placeholder="Enter the group's secret code"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Joining...' : 'Join Group'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
