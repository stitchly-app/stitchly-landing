import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, X } from "lucide-react";

interface UserData {
  id: string;
  email: string;
  name: string;
  profile_image: string | null;
  role: string;
}

interface EditUserDialogProps {
  user: UserData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserUpdated: () => void;
  isDemoAccount?: boolean;
  onDemoRoleUpdate?: (userId: string, newRole: string) => void;
}

export const EditUserDialog = ({ user, open, onOpenChange, onUserUpdated, isDemoAccount, onDemoRoleUpdate }: EditUserDialogProps) => {
  const [selectedRole, setSelectedRole] = useState<'admin' | 'user' | 'visitor'>(user?.role as 'admin' | 'user' | 'visitor' || 'user');
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSaveChanges = async () => {
    if (!user) return;

    // Handle demo account - only update local state
    if (isDemoAccount && onDemoRoleUpdate) {
      onDemoRoleUpdate(user.id, selectedRole);
      toast({
        title: "Success",
        description: "Demo account role updated (local only)",
      });
      onOpenChange(false);
      return;
    }

    // Handle regular account - update database
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: selectedRole })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User role updated successfully",
      });

      onUserUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveUser = async () => {
    if (!user) return;

    // Handle demo account - show message and close
    if (isDemoAccount) {
      setShowRemoveDialog(false);
      return;
    }

    // Handle regular account - delete from database
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-delete-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      toast({
        title: "Success",
        description: "User removed successfully",
      });

      setShowRemoveDialog(false);
      onUserUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error removing user:', error);
      toast({
        title: "Error",
        description: "Failed to remove user",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] bg-[#1A1D2E] border-[#343750] text-foreground">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Edit User</DialogTitle>
          </DialogHeader>

          <div className="flex items-start gap-6 py-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.profile_image || undefined} />
              <AvatarFallback className="bg-muted text-foreground text-xl">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-1">{user.name}</h3>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
            <div className="flex-1">
              <label className="text-sm text-muted-foreground mb-2 block">Role</label>
              <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as 'admin' | 'user' | 'visitor')}>
                <SelectTrigger className="bg-[#343750] border-[#343750] text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1D2E] border-[#343750]">
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              variant="destructive"
              onClick={() => setShowRemoveDialog(true)}
              disabled={isLoading}
              className="flex-1 bg-transparent border-2 border-destructive text-white hover:bg-destructive/10"
            >
              Remove from Team
            </Button>
            <Button
              onClick={handleSaveChanges}
              disabled={isLoading}
              className="flex-1"
            >
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent className="bg-[#1A1D2E] border-[#343750] text-foreground max-w-md">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowRemoveDialog(false)}
            className="absolute right-4 top-4 h-8 w-8 rounded-lg"
          >
            <X className="h-4 w-4" />
          </Button>
          <AlertDialogHeader className="text-center">
            <div className="flex justify-center mb-4">
              <AlertCircle className="h-16 w-16 text-destructive" />
            </div>
            <AlertDialogTitle className="text-xl text-center">
              {isDemoAccount ? 'Demo Account' : 'Remove User'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-white">
              {isDemoAccount 
                ? 'Demo accounts cannot be removed from the team.' 
                : 'Are you sure you want to remove this user? This cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-3 sm:gap-3">
            {isDemoAccount ? (
              <AlertDialogCancel
                className="flex-1"
              >
                OK
              </AlertDialogCancel>
            ) : (
              <>
                <AlertDialogAction
                  onClick={handleRemoveUser}
                  disabled={isLoading}
                  className="flex-1 bg-transparent border-2 border-destructive text-white hover:bg-destructive hover:text-white"
                >
                  Remove from Team
                </AlertDialogAction>
                <AlertDialogCancel
                  disabled={isLoading}
                  className="flex-1"
                >
                  Cancel
                </AlertDialogCancel>
              </>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
