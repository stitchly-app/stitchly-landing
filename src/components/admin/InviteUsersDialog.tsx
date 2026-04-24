import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { X } from "lucide-react";

const emailSchema = z.string().trim().email({ message: "Invalid email address" });

interface InviteEntry {
  email: string;
  role: "user" | "admin";
}

interface InviteUsersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const InviteUsersDialog = ({ open, onOpenChange }: InviteUsersDialogProps) => {
  const [invites, setInvites] = useState<InviteEntry[]>([{ email: "", role: "user" }]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAddInvite = () => {
    setInvites([...invites, { email: "", role: "user" }]);
  };

  const handleRemoveInvite = (index: number) => {
    setInvites(invites.filter((_, i) => i !== index));
  };

  const handleEmailChange = (index: number, value: string) => {
    const newInvites = [...invites];
    newInvites[index].email = value;
    setInvites(newInvites);
  };

  const handleRoleChange = (index: number, value: "user" | "admin") => {
    const newInvites = [...invites];
    newInvites[index].role = value;
    setInvites(newInvites);
  };

  const handleInvite = async () => {
    try {
      setLoading(true);

      // Validate invites
      const validInvites = invites.filter(invite => invite.email.trim() !== "");
      const invalidEmails: string[] = [];
      
      validInvites.forEach(invite => {
        const result = emailSchema.safeParse(invite.email);
        if (!result.success) {
          invalidEmails.push(invite.email);
        }
      });

      if (invalidEmails.length > 0) {
        toast({
          title: "Invalid emails",
          description: `Please fix these emails: ${invalidEmails.join(", ")}`,
          variant: "destructive"
        });
        return;
      }

      if (validInvites.length === 0) {
        toast({
          title: "No invites",
          description: "Please enter at least one email address",
          variant: "destructive"
        });
        return;
      }

      // Send invitations via edge function
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          variant: "destructive"
        });
        return;
      }

      const response = await supabase.functions.invoke('send-invitation', {
        body: { invites: validInvites }
      });

      if (response.error) {
        throw response.error;
      }

      toast({
        title: "Invitations sent",
        description: `Successfully sent ${validInvites.length} invitation${validInvites.length > 1 ? 's' : ''}`
      });

      setInvites([{ email: "", role: "user" }]);
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error sending invitations:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send invitations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Invite Users</DialogTitle>
          <DialogDescription>
            Send email invitations to new users. They will receive a link to create their account.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {invites.map((invite, index) => (
            <div key={index} className="flex items-end gap-2">
              <div className="flex-1 space-y-2">
                <Label htmlFor={`email-${index}`}>
                  Email {index + 1}
                </Label>
                <Input
                  id={`email-${index}`}
                  type="email"
                  placeholder="user@example.com"
                  value={invite.email}
                  onChange={(e) => handleEmailChange(index, e.target.value)}
                />
              </div>
              
              <div className="w-32 space-y-2">
                <Label htmlFor={`role-${index}`}>
                  Role
                </Label>
                <Select
                  value={invite.role}
                  onValueChange={(value: "user" | "admin") => handleRoleChange(index, value)}
                >
                  <SelectTrigger id={`role-${index}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {invites.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveInvite(index)}
                  className="mb-0.5"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={handleAddInvite}
            className="w-full"
          >
            + Add another invitation
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleInvite} disabled={loading}>
            {loading ? "Sending..." : "Send Invitations"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
