
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const CreateGroupModal = ({ onGroupCreated }: { onGroupCreated?: () => void }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'public',
    monthlyAmount: '',
    maxMembers: '',
    secretCode: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const groupData: any = {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        creator_id: user.id,
        monthly_amount: Math.round(parseFloat(formData.monthlyAmount) * 100), // Convert to cents
        max_members: parseInt(formData.maxMembers),
        next_payout_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days from now
      };

      if (formData.type === 'private' && formData.secretCode) {
        groupData.secret_code = formData.secretCode;
      }

      const { data: group, error: groupError } = await supabase
        .from('groups')
        .insert(groupData)
        .select()
        .single();

      if (groupError) throw groupError;

      // Add creator as first member
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          group_id: group.id,
          user_id: user.id,
          payout_order: 1
        });

      if (memberError) throw memberError;

      toast({ title: 'Group created successfully!' });
      setOpen(false);
      setFormData({
        name: '',
        description: '',
        type: 'public',
        monthlyAmount: '',
        maxMembers: '',
        secretCode: ''
      });
      onGroupCreated?.();
    } catch (error: any) {
      toast({
        title: 'Error creating group',
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
        <Button className="gradient-primary">
          <Plus className="w-4 h-4 mr-2" />
          Create Group
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Savings Group</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Group Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Tell people what this group is for..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Group Type</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public - Anyone can join</SelectItem>
                <SelectItem value="private">Private - Requires secret code</SelectItem>
                <SelectItem value="community">Community - Verified members</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.type === 'private' && (
            <div className="space-y-2">
              <Label htmlFor="secretCode">Secret Code</Label>
              <Input
                id="secretCode"
                value={formData.secretCode}
                onChange={(e) => setFormData({...formData, secretCode: e.target.value})}
                placeholder="Enter a secret code for joining"
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="monthlyAmount">Monthly Amount ($)</Label>
            <Input
              id="monthlyAmount"
              type="number"
              step="0.01"
              min="1"
              value={formData.monthlyAmount}
              onChange={(e) => setFormData({...formData, monthlyAmount: e.target.value})}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxMembers">Maximum Members</Label>
            <Input
              id="maxMembers"
              type="number"
              min="2"
              max="50"
              value={formData.maxMembers}
              onChange={(e) => setFormData({...formData, maxMembers: e.target.value})}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating...' : 'Create Group'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
