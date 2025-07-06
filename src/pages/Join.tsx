import { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useGroups } from "@/hooks/useGroups";
import { supabase } from "@/integrations/supabase/client";
import { TelegramVerificationModal } from "@/components/TelegramVerificationModal";
import {
  Users,
  CircleDollarSign,
  Calendar,
  Lock,
  Globe,
  Shield,
  ArrowLeft,
  CheckCircle,
  MessageCircle,
} from "lucide-react";

interface GroupDetails {
  id: string;
  name: string;
  description: string;
  type: string;
  monthly_amount: number;
  max_members: number;
  creator_id: string;
  current_members?: number;
  secret_code?: string;
  next_payout_date: string;
  telegram_group_handle?: string;
  telegram_verification_enabled?: boolean;
  min_membership_months?: number;
}

const Join = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { joinGroup } = useGroups();

  const [group, setGroup] = useState<GroupDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [secretCode, setSecretCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [alreadyMember, setAlreadyMember] = useState(false);
  const [showTelegramVerification, setShowTelegramVerification] = useState(false);
  const [telegramVerified, setTelegramVerified] = useState(false);

  const codeFromUrl = searchParams.get("code");

  useEffect(() => {
    if (codeFromUrl) {
      setSecretCode(codeFromUrl);
    }
  }, [codeFromUrl]);

  useEffect(() => {
    const fetchGroupDetails = async () => {
      if (!groupId) {
        setError("Invalid group link");
        setLoading(false);
        return;
      }

      try {
        // Fetch group details
        const { data: groupData, error: groupError } = await supabase
          .from("groups")
          .select("*")
          .eq("id", groupId)
          .single();

        if (groupError) {
          setError("Group not found");
          setLoading(false);
          return;
        }

        // Count current members
        const { count, error: countError } = await supabase
          .from("group_members")
          .select("*", { count: "exact" })
          .eq("group_id", groupId);

        if (countError) {
          console.error("Error counting members:", countError);
        }

        setGroup({
          ...groupData,
          current_members: count || 0,
        });

        // Check if user is already a member
        if (user) {
          const { data: memberData } = await supabase
            .from("group_members")
            .select("*")
            .eq("group_id", groupId)
            .eq("user_id", user.id)
            .single();

          if (memberData) {
            setAlreadyMember(true);
          }

          // Check Telegram verification status for community groups
          if (groupData.type === "community" && groupData.telegram_verification_enabled) {
            const { data: verificationData } = await supabase
              .from("user_telegram_verification")
              .select("*")
              .eq("user_id", user.id)
              .eq("group_id", groupId)
              .eq("verification_status", "verified")
              .single();

            if (verificationData && verificationData.expires_at && new Date(verificationData.expires_at) > new Date()) {
              setTelegramVerified(true);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching group:", err);
        setError("Failed to load group details");
      } finally {
        setLoading(false);
      }
    };

    fetchGroupDetails();
  }, [groupId, user]);

  const handleJoin = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to join this group",
        variant: "destructive",
      });
      return;
    }

    if (!group) return;

    // Check Telegram verification for community groups
    if (group.type === "community" && group.telegram_verification_enabled && !telegramVerified) {
      setShowTelegramVerification(true);
      return;
    }

    if (group.type === "private" && secretCode !== group.secret_code) {
      toast({
        title: "Invalid Secret Code",
        description: "The secret code you entered is incorrect",
        variant: "destructive",
      });
      return;
    }

    if ((group.current_members || 0) >= group.max_members) {
      toast({
        title: "Group Full",
        description: "This savings circle has reached its maximum capacity",
        variant: "destructive",
      });
      return;
    }

    setJoining(true);
    try {
      const success = await joinGroup(groupId!, secretCode || undefined);

      if (success) {
        toast({
          title: "Welcome to the Circle! 🎉",
          description: `You've successfully joined ${group.name}`,
        });
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Join error:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.";
      toast({
        title: "Failed to Join",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setJoining(false);
    }
  };

  const handleTelegramVerificationComplete = (verified: boolean) => {
    setTelegramVerified(verified);
    setShowTelegramVerification(false);
    if (verified) {
      // Automatically proceed with joining after successful verification
      setTimeout(() => handleJoin(), 500);
    }
  };

  const getGroupTypeIcon = (type: string) => {
    switch (type) {
      case "private":
        return <Lock className="w-4 h-4" />;
      case "community":
        return <Shield className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  const getGroupTypeBadge = (type: string) => {
    const variants = {
      private: "destructive",
      community: "default",
      public: "secondary",
    } as const;

    return (
      <Badge
        variant={variants[type as keyof typeof variants] || "secondary"}
        className="capitalize"
      >
        {getGroupTypeIcon(type)}
        <span className="ml-1">{type}</span>
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading group details...</p>
        </div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <div className="mb-4">
              <CircleDollarSign className="w-12 h-12 mx-auto text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Group Not Found</h2>
            <p className="text-muted-foreground mb-4">
              {error ||
                "The savings circle you're looking for doesn't exist or has been removed."}
            </p>
            <Button onClick={() => navigate("/")} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <CircleDollarSign className="w-6 h-6 text-primary" />
            <CardTitle className="text-2xl">Join Savings Circle</CardTitle>
          </div>
          {getGroupTypeBadge(group.type)}
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Group Information */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold">{group.name}</h3>
              <p className="text-muted-foreground mt-1">{group.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <CircleDollarSign className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Monthly Amount
                  </p>
                  <p className="font-semibold">
                    {(group.monthly_amount / 1e18).toFixed(7)} ETH
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Members</p>
                  <p className="font-semibold">
                    {group.current_members || 0} / {group.max_members}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 col-span-2">
                <Calendar className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Next Payout</p>
                  <p className="font-semibold">
                    {new Date(group.next_payout_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Telegram Verification Info for Community Groups */}
            {group.type === "community" && group.telegram_verification_enabled && (
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <MessageCircle className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-900">Telegram Verification Required</span>
                </div>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>• Must be a member of: <code>@{group.telegram_group_handle}</code></p>
                  <p>• Minimum membership: {group.min_membership_months || 6} months</p>
                  {telegramVerified && (
                    <div className="flex items-center gap-1 text-green-600 font-medium">
                      <CheckCircle className="w-4 h-4" />
                      <span>Telegram verification completed</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Status Messages */}
          {alreadyMember && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                You're already a member of this savings circle!
                <Button
                  variant="link"
                  className="p-0 ml-1 h-auto"
                  onClick={() => navigate("/dashboard")}
                >
                  Go to Dashboard
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {(group.current_members || 0) >= group.max_members &&
            !alreadyMember && (
              <Alert variant="destructive">
                <AlertDescription>
                  This savings circle has reached its maximum capacity and is no
                  longer accepting new members.
                </AlertDescription>
              </Alert>
            )}

          {/* Private Group Secret Code */}
          {group.type === "private" &&
            !alreadyMember &&
            (group.current_members || 0) < group.max_members && (
              <div className="space-y-2">
                <Label htmlFor="secretCode">Secret Code</Label>
                <Input
                  id="secretCode"
                  type="password"
                  placeholder="Enter the secret code"
                  value={secretCode}
                  onChange={(e) => setSecretCode(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  This is a private circle. You need the secret code to join.
                </p>
              </div>
            )}

          {/* Join Button */}
          {!alreadyMember &&
            (group.current_members || 0) < group.max_members && (
              <div className="space-y-4">
                {!user && (
                  <Alert>
                    <AlertDescription>
                      You need to sign in before you can join this savings
                      circle.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex space-x-2">
                  <Button
                    onClick={handleJoin}
                    disabled={
                      joining ||
                      !user ||
                      (group.type === "private" && !secretCode)
                    }
                    className="flex-1"
                  >
                    {joining ? "Joining..." : 
                     group.type === "community" && group.telegram_verification_enabled && !telegramVerified
                       ? "Verify & Join Circle"
                       : "Join Circle"}
                  </Button>

                  <Button variant="outline" onClick={() => navigate("/")}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
        </CardContent>
      </Card>

      {/* Telegram Verification Modal */}
      {group && showTelegramVerification && (
        <TelegramVerificationModal
          open={showTelegramVerification}
          onOpenChange={setShowTelegramVerification}
          groupId={group.id}
          groupName={group.name}
          telegramGroupHandle={group.telegram_group_handle || ""}
          minMembershipMonths={group.min_membership_months || 6}
          onVerificationComplete={handleTelegramVerificationComplete}
        />
      )}
    </div>
  );
};

export default Join;
