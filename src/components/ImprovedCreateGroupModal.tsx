import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import {
  Plus,
  ArrowLeft,
  ArrowRight,
  Copy,
  Check,
  Users,
  Shield,
  Globe,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { TREASURY_CONFIG } from "@/constants/treasury";
import { parseEther } from "viem";

interface CreateGroupFormData {
  name: string;
  description: string;
  type: "private" | "public" | "community";
  monthlyAmount: string;
  maxMembers: string;
  payoutOrder: "sequential" | "random" | "bidding";
  secretCode: string;
}

export const ImprovedCreateGroupModal = ({
  onGroupCreated,
}: {
  onGroupCreated?: () => void;
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);

  const [formData, setFormData] = useState<CreateGroupFormData>({
    name: "",
    description: "",
    type: "public",
    monthlyAmount: "",
    maxMembers: "",
    payoutOrder: "sequential",
    secretCode: "",
  });

  const totalSteps = 7;
  const progress = (currentStep / totalSteps) * 100;

  const groupTypeConfig = {
    private: {
      label: "Private Circle",
      description: "Invite-only among trusted people",
      icon: Shield,
      color: "bg-primary text-primary-foreground",
    },
    public: {
      label: "Public Circle",
      description: "Open to anyone with contribution caps",
      icon: Globe,
      color: "bg-trust-blue text-white",
    },
    community: {
      label: "Community Circle",
      description: "For vetted community members",
      icon: Users,
      color: "bg-warm-orange text-white",
    },
  };

  const generateSecretCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setFormData((prev) => ({ ...prev, secretCode: code }));
  };

  const generateInviteLink = (groupId: string) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/join/${groupId}${
      formData.type === "private" ? `?code=${formData.secretCode}` : ""
    }`;
  };

  const copyInviteLink = async () => {
    await navigator.clipboard.writeText(inviteLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
    toast({ title: "Invite link copied!" });
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create a circle",
        variant: "destructive",
      });
      return;
    }

    if (formData.type === "private" && !formData.secretCode.trim()) {
      toast({
        title: "Secret code required",
        description: "Private circles must have a secret code",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const groupData: {
        name: string;
        description: string;
        type: string;
        creator_id: string;
        monthly_amount: string;
        max_members: number;
        next_payout_date: string;
        secret_code?: string;
      } = {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        creator_id: user.id,
        monthly_amount: parseEther(formData.monthlyAmount).toString(),
        max_members: parseInt(formData.maxMembers),
        next_payout_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0], // 60 days from now (includes treasury month)
      };

      if (formData.type === "private") {
        groupData.secret_code = formData.secretCode.trim();
      }

      const { data: group, error: groupError } = await supabase
        .from("groups")
        .insert(groupData)
        .select()
        .single();

      if (groupError) throw groupError;

      // Add creator as first member
      const { error: memberError } = await supabase
        .from("group_members")
        .insert({
          group_id: group.id,
          user_id: user.id,
          payout_order: 1,
        });

      if (memberError) throw memberError;

      const link = generateInviteLink(group.id);
      setInviteLink(link);
      nextStep(); // Move to final step showing invite link

      toast({ title: "Circle created successfully!" });
      onGroupCreated?.();
    } catch (error: unknown) {
      toast({
        title: "Error creating circle",
        description:
          (error as Error)?.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setCurrentStep(1);
    setFormData({
      name: "",
      description: "",
      type: "public",
      monthlyAmount: "",
      maxMembers: "",
      payoutOrder: "sequential",
      secretCode: "",
    });
    setInviteLink("");
    setLinkCopied(false);
  };

  if (!user) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) resetModal();
      }}
    >
      <DialogTrigger asChild>
        <Button className="gradient-primary">
          <Plus className="w-4 h-4 mr-2" />
          Create Circle
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Savings Circle</DialogTitle>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>
                Step {currentStep} of {totalSteps}
              </span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Step 1: Group Name & Description */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold">
                  Let's name your circle
                </h3>
                <p className="text-sm text-muted-foreground">
                  Choose a name that reflects your group's purpose
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Circle Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Family Savings Circle"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the purpose and goals of your savings circle..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Step 2: Group Type */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold">
                  Choose your circle type
                </h3>
                <p className="text-sm text-muted-foreground">
                  This determines who can join your circle
                </p>
              </div>

              <div className="space-y-3">
                {Object.entries(groupTypeConfig).map(([type, config]) => {
                  const Icon = config.icon;
                  return (
                    <Card
                      key={type}
                      className={`cursor-pointer border-2 transition-colors ${
                        formData.type === type
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() =>
                        setFormData({
                          ...formData,
                          type: type as "private" | "public" | "community",
                        })
                      }
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Icon className="w-6 h-6 text-primary" />
                          <div className="flex-1">
                            <div className="font-medium">{config.label}</div>
                            <div className="text-sm text-muted-foreground">
                              {config.description}
                            </div>
                          </div>
                          {formData.type === type && (
                            <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                              <Check className="w-2 h-2 text-primary-foreground" />
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Member Limit */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold">Set member limit</h3>
                <p className="text-sm text-muted-foreground">
                  How many people can join this circle?
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxMembers">Maximum Members</Label>
                <Select
                  value={formData.maxMembers}
                  onValueChange={(value) =>
                    setFormData({ ...formData, maxMembers: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select maximum members" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from(
                      {
                        length:
                          TREASURY_CONFIG.MAX_GROUP_MEMBERS -
                          TREASURY_CONFIG.MIN_GROUP_MEMBERS +
                          1,
                      },
                      (_, i) => {
                        const value = TREASURY_CONFIG.MIN_GROUP_MEMBERS + i;
                        return (
                          <SelectItem key={value} value={value.toString()}>
                            {value} members
                          </SelectItem>
                        );
                      }
                    )}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Recommended: 6-12 members for optimal circle dynamics
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Monthly Contribution */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold">
                  Monthly contribution amount
                </h3>
                <p className="text-sm text-muted-foreground">
                  Set the monthly contribution amount in ETH.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="monthlyAmount">Monthly Amount (ETH)</Label>
                <Input
                  id="monthlyAmount"
                  type="number"
                  step="any"
                  placeholder="e.g., 0.1 ETH"
                  value={formData.monthlyAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, monthlyAmount: e.target.value })
                  }
                  className="text-lg"
                />
                {formData.monthlyAmount && formData.maxMembers && (
                  <div className="p-3 bg-trust-blue-light rounded-lg">
                    <div className="text-sm text-muted-foreground">
                      Monthly pot size:
                    </div>
                    <div className="text-lg font-bold text-trust-blue">
                      {(
                        parseFloat(formData.monthlyAmount) *
                        parseInt(formData.maxMembers)
                      ).toFixed(7)}{" "}
                      ETH
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 5: Payout Order Rules */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold">Payout order</h3>
                <p className="text-sm text-muted-foreground">
                  How should payout order be determined?
                </p>
              </div>

              <div className="space-y-3">
                <Card
                  className={`cursor-pointer border-2 transition-colors ${
                    formData.payoutOrder === "sequential"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() =>
                    setFormData({ ...formData, payoutOrder: "sequential" })
                  }
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">
                          Sequential (First-come, first-served)
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Members receive payouts in joining order
                        </div>
                      </div>
                      {formData.payoutOrder === "sequential" && (
                        <Check className="w-4 h-4 text-primary" />
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card
                  className={`cursor-pointer border-2 transition-colors ${
                    formData.payoutOrder === "random"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() =>
                    setFormData({ ...formData, payoutOrder: "random" })
                  }
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Random Draw</div>
                        <div className="text-sm text-muted-foreground">
                          Fair random selection each month
                        </div>
                      </div>
                      {formData.payoutOrder === "random" && (
                        <Check className="w-4 h-4 text-primary" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Step 6: Secret Code (for private groups) or Confirmation */}
          {currentStep === 6 && (
            <div className="space-y-4">
              {formData.type === "private" ? (
                <>
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold">Secret code</h3>
                    <p className="text-sm text-muted-foreground">
                      Create a secret code for your private circle
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secretCode">Secret Code</Label>
                    <div className="flex gap-2">
                      <Input
                        id="secretCode"
                        placeholder="Enter or generate a code"
                        value={formData.secretCode}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            secretCode: e.target.value,
                          })
                        }
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={generateSecretCode}
                      >
                        Generate
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Share this code with people you want to invite
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold">
                      Review your circle
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Confirm your circle details before creating
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="p-4 bg-muted rounded-lg space-y-2">
                      <div>
                        <strong>Name:</strong> {formData.name}
                      </div>
                      <div>
                        <strong>Type:</strong>{" "}
                        {groupTypeConfig[formData.type].label}
                      </div>
                      <div>
                        <strong>Members:</strong> {formData.maxMembers} people
                      </div>
                      <div>
                        <strong>Monthly:</strong> {formData.monthlyAmount} ETH
                        per person
                      </div>
                      <div>
                        <strong>Monthly Pot:</strong>{" "}
                        {(
                          parseFloat(formData.monthlyAmount || "0") *
                          parseInt(formData.maxMembers || "0")
                        ).toFixed(7)}{" "}
                        ETH
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 7: Invite Link (after creation) */}
          {currentStep === 7 && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold">Circle created! 🎉</h3>
                <p className="text-sm text-muted-foreground">
                  Share this link to invite members
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 text-sm font-mono break-all">
                      {inviteLink}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={copyInviteLink}
                    >
                      {linkCopied ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    setOpen(false);
                    resetModal();
                  }}
                  className="w-full"
                >
                  Done
                </Button>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            {currentStep < 6 && (
              <Button
                onClick={nextStep}
                disabled={
                  (currentStep === 1 &&
                    (!formData.name || !formData.description)) ||
                  (currentStep === 3 && !formData.maxMembers) ||
                  (currentStep === 4 && !formData.monthlyAmount)
                }
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}

            {currentStep === 6 && (
              <Button
                onClick={handleSubmit}
                disabled={
                  loading ||
                  (formData.type === "private" && !formData.secretCode)
                }
              >
                {loading ? "Creating..." : "Create Circle"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
