import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface Group {
  id: string;
  name: string;
  description: string;
  type: "private" | "public" | "community";
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
        .from("groups")
        .select("*")
        .in("type", ["public", "community"])
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) throw error;
      // Type assertion to ensure proper typing
      setGroups((data as Group[]) || []);
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };

  const fetchUserGroups = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("group_members")
        .select(
          `
          group_id,
          groups (*)
        `
        )
        .eq("user_id", user.id);

      if (error) throw error;

      const userGroupsData =
        data?.map((item) => item.groups).filter(Boolean) || [];
      // Type assertion to ensure proper typing
      setUserGroups(userGroupsData as Group[]);
    } catch (error) {
      console.error("Error fetching user groups:", error);
    }
  };

  const joinGroup = async (groupId: string, secretCode?: string) => {
    if (!user) {
      throw new Error("You must be logged in to join a group");
    }

    try {
      // Get group details with current member count
      const { data: group, error: groupError } = await supabase
        .from("groups")
        .select("*")
        .eq("id", groupId)
        .single();

      if (groupError || !group) {
        throw new Error("Group not found");
      }

      // Get current member count
      const { count: currentMembers, error: countError } = await supabase
        .from("group_members")
        .select("*", { count: "exact" })
        .eq("group_id", groupId);

      if (countError) {
        console.error("Error counting members:", countError);
      }

      const actualMemberCount = currentMembers || 0;

      // Check if group is full
      if (actualMemberCount >= group.max_members) {
        throw new Error("This group has reached its maximum capacity");
      }

      // Validate secret code for private groups
      if (group.type === "private") {
        if (!secretCode || secretCode !== group.secret_code) {
          throw new Error("Invalid secret code for this private group");
        }
      }

      // Check if user is already a member
      const { data: existingMember } = await supabase
        .from("group_members")
        .select("id")
        .eq("group_id", group.id)
        .eq("user_id", user.id)
        .single();

      if (existingMember) {
        throw new Error("You are already a member of this group");
      }

      // Start transaction: Add user to group
      const nextPayoutOrder = actualMemberCount + 1;

      const { error: memberError } = await supabase
        .from("group_members")
        .insert({
          group_id: group.id,
          user_id: user.id,
          payout_order: nextPayoutOrder,
          joined_at: new Date().toISOString(),
        });

      if (memberError) {
        throw new Error(`Failed to join group: ${memberError.message}`);
      }

      // Record group join on smart contract (if enabled)
      try {
        const response = await fetch(
          "http://localhost:3001/api/record-group-join",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              groupId: group.id,
              memberAddress: user.email, // Using email as identifier for now
              payoutOrder: nextPayoutOrder,
            }),
          }
        );

        if (response.ok) {
          console.log("✅ Group join recorded on smart contract");
        } else {
          console.log("⚠️ Smart contract recording failed (continuing anyway)");
        }
      } catch (contractError) {
        console.log("⚠️ Smart contract not available (continuing anyway)");
      }

      // Refresh data after successful join
      await Promise.all([fetchPublicGroups(), fetchUserGroups()]);

      return true;
    } catch (error) {
      console.error("Error joining group:", error);
      throw error;
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
    joinGroup,
  };
};
