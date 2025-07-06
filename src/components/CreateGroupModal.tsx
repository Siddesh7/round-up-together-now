
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export const CreateGroupModal = ({
  onGroupCreated,
}: {
  onGroupCreated?: () => void;
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "public",
    monthlyAmount: "",
    maxMembers: "",
    secretCode: "",
    telegramGroupHandle: "",
    telegramVerificationEnabled: false,
    minMembershipMonths: "6",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      console.error("No user found in auth context");
      toast({
        title: "Authentication required",
        description: "Please sign in to create a circle",
        variant: "destructive",
      });
      return;
    }

    // Validate private group secret code before proceeding
    if (formData.type === "private") {
      if (!formData.secretCode || formData.secretCode.trim() === "") {
        toast({
          title: "Secret code required",
          description: "Private circles must have a secret code",
          variant: "destructive",
        });
        return;
      }
    }

    // Validate community group Telegram settings
    if (formData.type === "community" && formData.telegramVerificationEnabled) {
      if (!formData.telegramGroupHandle || formData.telegramGroupHandle.trim() === "") {
        toast({
          title: "Telegram group required",
          description: "Please specify the Telegram group handle for verification",
          variant: "destructive",
        });
        return;
      }
      
      // Validate Telegram handle format
      const telegramHandle = formData.telegramGroupHandle.trim();
      if (!telegramHandle.match(/^@?[a-zA-Z][a-zA-Z0-9_]{4,31}$/)) {
        toast({
          title: "Invalid Telegram handle",
          description: "Telegram handle should be 5-32 characters, starting with a letter",
          variant: "destructive",
        });
        return;
      }
    }

    console.log("Starting group creation with user:", {
      userId: user.id,
      userEmail: user.email,
      formData: formData,
    });

    setLoading(true);
    try {
      // Check current session
      const { data: session, error: sessionError } =
        await supabase.auth.getSession();
      console.log("Current session check:", {
        session: session?.session,
        error: sessionError,
      });

      const groupData: any = {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        creator_id: user.id, // Explicitly set the creator_id
        monthly_amount: Math.round(parseFloat(formData.monthlyAmount) * 1e18), // Convert to wei
        max_members: parseInt(formData.maxMembers),
        next_payout_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0], // 30 days from now
      };

      // Add secret_code for private groups
      if (formData.type === "private") {
        groupData.secret_code = formData.secretCode.trim();
        console.log(
          "Adding secret code for private group:",
          formData.secretCode
        );
      }

      // Add Telegram verification fields for community groups
      if (formData.type === "community") {
        groupData.telegram_verification_enabled = formData.telegramVerificationEnabled;
        if (formData.telegramVerificationEnabled) {
          groupData.telegram_group_handle = formData.telegramGroupHandle.trim().replace(/^@/, '');
          groupData.min_membership_months = parseInt(formData.minMembershipMonths);
          console.log("Adding Telegram verification settings:", {
            telegram_group_handle: groupData.telegram_group_handle,
            min_membership_months: groupData.min_membership_months
          });
        }
      }

      console.log("Group data being inserted:", groupData);
      console.log("RLS check - auth.uid() should equal creator_id:", user.id);

      const { data: group, error: groupError } = await supabase
        .from("groups")
        .insert(groupData)
        .select()
        .single();

      if (groupError) {
        console.error("Detailed group creation error:", {
          error: groupError,
          code: groupError.code,
          message: groupError.message,
          details: groupError.details,
          hint: groupError.hint,
        });
        throw groupError;
      }

      console.log("Group created successfully:", group);

      // Add creator as first member
      const { error: memberError } = await supabase
        .from("group_members")
        .insert({
          group_id: group.id,
          user_id: user.id,
          payout_order: 1,
        });

      if (memberError) {
        console.error("Member addition error:", memberError);
        throw memberError;
      }

      toast({ 
        title: "Circle created successfully!",
        description: formData.type === "community" && formData.telegramVerificationEnabled 
          ? "Community circle with Telegram verification is now active"
          : undefined
      });
      
      setOpen(false);
      setFormData({
        name: "",
        description: "",
        type: "public",
        monthlyAmount: "",
        maxMembers: "",
        secretCode: "",
        telegramGroupHandle: "",
        telegramVerificationEnabled: false,
        minMembershipMonths: "6",
      });
      onGroupCreated?.();
    } catch (error: any) {
      console.error("Complete error creating circle:", error);
      toast({
        title: "Error creating circle",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
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
          Create Circle
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Savings Circle</DialogTitle>
          <DialogDescription>
            Set up a new savings circle by providing the details below. Choose
            between public, private, or community circles.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Circle Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Tell people what this circle is for..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Circle Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) =>
                setFormData({ ...formData, type: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">
                  Public Circle - Anyone can join
                </SelectItem>
                <SelectItem value="private">
                  Private Circle - Requires secret code
                </SelectItem>
                <SelectItem value="community">
                  Community Circle - Verified members
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.type === "private" && (
            <div className="space-y-2">
              <Label htmlFor="secretCode">Secret Code</Label>
              <Input
                id="secretCode"
                value={formData.secretCode}
                onChange={(e) =>
                  setFormData({ ...formData, secretCode: e.target.value })
                }
                placeholder="Enter a secret code for joining"
                required
              />
            </div>
          )}

          {formData.type === "community" && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-primary" />
                  <Label htmlFor="telegramVerification">Telegram Verification</Label>
                </div>
                <Switch
                  id="telegramVerification"
                  checked={formData.telegramVerificationEnabled}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, telegramVerificationEnabled: checked })
                  }
                />
              </div>
              
              {formData.telegramVerificationEnabled && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="telegramGroupHandle">Telegram Group Handle</Label>
                    <Input
                      id="telegramGroupHandle"
                      value={formData.telegramGroupHandle}
                      onChange={(e) =>
                        setFormData({ ...formData, telegramGroupHandle: e.target.value })
                      }
                      placeholder="@yourgroup or yourgroup"
                      required={formData.telegramVerificationEnabled}
                    />
                    <p className="text-xs text-muted-foreground">
                      The Telegram group users must be members of to join this circle
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="minMembershipMonths">Minimum Membership (months)</Label>
                    <Select
                      value={formData.minMembershipMonths}
                      onValueChange={(value) =>
                        setFormData({ ...formData, minMembershipMonths: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 month</SelectItem>
                        <SelectItem value="3">3 months</SelectItem>
                        <SelectItem value="6">6 months</SelectItem>
                        <SelectItem value="12">12 months</SelectItem>
                        <SelectItem value="24">24 months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
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
              onChange={(e) =>
                setFormData({ ...formData, monthlyAmount: e.target.value })
              }
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
              onChange={(e) =>
                setFormData({ ...formData, maxMembers: e.target.value })
              }
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating..." : "Create Circle"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
