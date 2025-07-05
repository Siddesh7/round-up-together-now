
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Group {
  id: string;
  name: string;
  description: string;
  type: 'private' | 'public' | 'community';
  creator_id: string;
  monthly_amount: number;
  max_members: number;
  current_members: number;
  next_payout_date: string;
  status: string;
  created_at: string;
  secret_code?: string;
}

export const useGroups = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [userGroups, setUserGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPublicGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .in('type', ['public', 'community'])
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      // Type assertion to ensure proper typing
      setGroups((data as Group[]) || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const fetchUserGroups = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('group_members')
        .select(`
          group_id,
          groups (*)
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      
      const userGroupsData = data?.map(item => item.groups).filter(Boolean) || [];
      // Type assertion to ensure proper typing
      setUserGroups(userGroupsData as Group[]);
    } catch (error) {
      console.error('Error fetching user groups:', error);
    }
  };

  const joinGroup = async (groupId: string) => {
    if (!user) return false;

    try {
      // Get group details
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .select('*')
        .eq('id', groupId)
        .single();

      if (groupError || !group) {
        throw new Error('Group not found');
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

      return true;
    } catch (error) {
      console.error('Error joining group:', error);
      return false;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchPublicGroups(), fetchUserGroups()]);
      setLoading(false);
    };

    loadData();
  }, [user]);

  const refetch = () => {
    fetchPublicGroups();
    fetchUserGroups();
  };

  return {
    groups,
    userGroups,
    loading,
    refetch,
    joinGroup
  };
};
