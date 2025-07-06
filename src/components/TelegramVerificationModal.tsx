
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, XCircle, MessageCircle, Clock, Shield } from 'lucide-react';

interface TelegramVerificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
  groupName: string;
  telegramGroupHandle: string;
  minMembershipMonths: number;
  onVerificationComplete: (verified: boolean) => void;
}

export const TelegramVerificationModal: React.FC<TelegramVerificationModalProps> = ({
  open,
  onOpenChange,
  groupId,
  groupName,
  telegramGroupHandle,
  minMembershipMonths,
  onVerificationComplete
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [telegramUsername, setTelegramUsername] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    verified: boolean;
    reason: string;
    data?: any;
  } | null>(null);

  const handleVerification = async () => {
    if (!user || !telegramUsername.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please enter your Telegram username',
        variant: 'destructive'
      });
      return;
    }

    setVerifying(true);
    setVerificationResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('telegram-verification', {
        body: {
          telegram_username: telegramUsername.trim(),
          telegram_group_handle: telegramGroupHandle,
          user_id: user.id,
          group_id: groupId
        }
      });

      if (error) {
        throw error;
      }

      setVerificationResult(data);
      
      if (data.verified) {
        toast({
          title: 'Verification Successful! 🎉',
          description: 'You can now join this community circle.',
        });
        onVerificationComplete(true);
      } else {
        toast({
          title: 'Verification Failed',
          description: data.reason,
          variant: 'destructive'
        });
      }

    } catch (error) {
      console.error('Verification error:', error);
      toast({
        title: 'Verification Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive'
      });
      setVerificationResult({
        verified: false,
        reason: 'Network error. Please try again.'
      });
    } finally {
      setVerifying(false);
    }
  };

  const getStatusIcon = () => {
    if (verifying) return <Loader2 className="w-4 h-4 animate-spin" />;
    if (verificationResult?.verified) return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (verificationResult && !verificationResult.verified) return <XCircle className="w-4 h-4 text-red-500" />;
    return <Shield className="w-4 h-4 text-blue-500" />;
  };

  const getStatusBadge = () => {
    if (verifying) return <Badge variant="secondary">Verifying...</Badge>;
    if (verificationResult?.verified) return <Badge variant="default" className="bg-green-500">Verified</Badge>;
    if (verificationResult && !verificationResult.verified) return <Badge variant="destructive">Failed</Badge>;
    return <Badge variant="outline">Ready to Verify</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <DialogTitle>Telegram Verification Required</DialogTitle>
          </div>
          <DialogDescription>
            This community circle requires Telegram verification to ensure member authenticity.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Group Info */}
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-primary" />
              <span className="font-medium">Circle: {groupName}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Telegram Group:</span>
              <Badge variant="outline">{telegramGroupHandle}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Minimum membership: {minMembershipMonths} months
              </span>
            </div>
          </div>

          {/* Verification Requirements */}
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Verification Requirements:</strong>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• You must be a member of {telegramGroupHandle}</li>
                <li>• Member for at least {minMembershipMonths} months</li>
                <li>• Active member status (not restricted or banned)</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Telegram Username Input */}
          <div className="space-y-2">
            <Label htmlFor="telegramUsername">Your Telegram Username</Label>
            <Input
              id="telegramUsername"
              placeholder="@yourusername or yourusername"
              value={telegramUsername}
              onChange={(e) => setTelegramUsername(e.target.value)}
              disabled={verifying}
            />
            <p className="text-xs text-muted-foreground">
              Enter your Telegram username (with or without @)
            </p>
          </div>

          {/* Verification Status */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <span className="text-sm font-medium">Verification Status:</span>
            {getStatusBadge()}
          </div>

          {/* Verification Result */}
          {verificationResult && (
            <Alert variant={verificationResult.verified ? "default" : "destructive"}>
              <AlertDescription>
                {verificationResult.reason}
                {verificationResult.data?.join_date && (
                  <p className="mt-1 text-xs">
                    Member since: {new Date(verificationResult.data.join_date).toLocaleDateString()}
                  </p>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleVerification}
              disabled={verifying || !telegramUsername.trim() || verificationResult?.verified}
              className="flex-1"
            >
              {verifying && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {verificationResult?.verified ? 'Verified!' : 'Verify Membership'}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {verificationResult?.verified ? 'Continue' : 'Cancel'}
            </Button>
          </div>

          {/* Help Text */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong>Having trouble?</strong></p>
            <p>• Make sure you're a member of {telegramGroupHandle}</p>
            <p>• Your Telegram username should be publicly visible</p>
            <p>• Contact the group creator if the bot needs to be added to the group</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
