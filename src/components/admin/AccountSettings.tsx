import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Pencil, LogOut, Trash2, Save } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface AccountSettingsProps {
  user: any;
  profile: any;
  name: string;
  setName: (name: string) => void;
  email: string;
  profileImage: string | null;
  setProfileImage: (url: string | null) => void;
}

export const AccountSettings = ({
  user,
  profile,
  name,
  setName,
  email,
  profileImage,
  setProfileImage
}: AccountSettingsProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const isRestrictedAccount = user?.email === 'test@mail.com' || user?.email === 'admin@mail.com';

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name,
          profile_image: profileImage
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully"
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(fileName);

      setProfileImage(publicUrl);
      toast({
        title: "Success",
        description: "Profile image uploaded. Click Save Changes to apply."
      });
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: oldPassword
      });

      if (signInError) throw new Error("Incorrect old password");

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Password changed successfully"
      });

      setPasswordDialogOpen(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleChangeEmail = async () => {
    if (!user) return;
    if (!newEmail || !emailPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: emailPassword
      });

      if (signInError) {
        toast({
          title: "Error",
          description: "Incorrect password",
          variant: "destructive"
        });
        return;
      }

      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', newEmail)
        .maybeSingle();

      if (existingProfile && existingProfile.id !== user.id) {
        toast({
          title: "Error",
          description: "This email is already registered",
          variant: "destructive"
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('change-user-email', {
        body: { newEmail }
      });

      if (error) {
        console.error('Error calling edge function:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to update email",
          variant: "destructive"
        });
        return;
      }

      if (data?.error) {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive"
        });
        return;
      }

      setEmailDialogOpen(false);
      setNewEmail("");
      setEmailPassword("");

      toast({
        title: "Success",
        description: "Email changed successfully. Sign in with your new email."
      });

      setTimeout(async () => {
        await supabase.auth.signOut();
        navigate('/auth');
      }, 1000);
    } catch (error: any) {
      console.error('Error changing email:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    // If restricted account, just sign out and navigate to landing
    if (isRestrictedAccount) {
      try {
        await supabase.auth.signOut();
        navigate('/');
      } catch (error) {
        console.error('Logout error:', error);
        navigate('/');
      }
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('delete-user-account', {
        body: { userId: user.id }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({
        title: "Account Deleted",
        description: "Your account has been deleted successfully"
      });

      await supabase.auth.signOut();
      navigate('/');
    } catch (error: any) {
      console.error('Error deleting account:', error);
      toast({
        title: "Error",
        description: "Failed to delete account. Please contact support.",
        variant: "destructive"
      });
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut({ scope: 'local' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      navigate('/');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      <Card className="border border-border rounded-lg bg-card p-6">
        <h3 className="text-xl font-semibold text-foreground mb-6">User Info</h3>

        <div className="mb-6 flex items-center gap-4">
          <div className="relative">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profileImage || undefined} />
              <AvatarFallback className="bg-muted text-foreground text-xl">
                {getInitials(name)}
              </AvatarFallback>
            </Avatar>
            <label
              htmlFor="profile-image-upload"
              className="absolute bottom-0 right-0 bg-[#343750] border border-[#343750] rounded-full p-2 cursor-pointer hover:bg-[#343750]/80 transition-colors"
            >
              <Pencil className="h-3 w-3 text-white" />
              <input
                id="profile-image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </label>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-sm text-muted-foreground mb-2 block">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-sm text-muted-foreground mb-2 block">Email</Label>
            <div className="flex gap-2">
              <Input
                id="email"
                value={email}
                disabled
                className="flex-1"
              />
              <Button
                variant="secondary"
                onClick={() => setEmailDialogOpen(true)}
                disabled={isRestrictedAccount}
              >
                Change Email
              </Button>
            </div>
          </div>

          <div>
            <Button
              variant="secondary"
              onClick={() => setPasswordDialogOpen(true)}
              disabled={isRestrictedAccount}
            >
              Reset Password
            </Button>
          </div>
        </div>
      </Card>

      <div className="flex justify-end mb-6">
        <Button
          onClick={handleSaveProfile}
          disabled={saving}
          className="bg-[#40CCB7] hover:bg-[#40CCB7]/90 text-white border border-[#40CCB7]"
        >
          {saving ? 'Saving...' : 'Save Changes'}
          <Save className="h-4 w-4 ml-2" />
        </Button>
      </div>

      <div className="flex gap-4 justify-end">
        <Button
          variant="destructive"
          onClick={() => setDeleteDialogOpen(true)}
          className="bg-transparent border-2 border-destructive text-white hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Account
        </Button>
        <Button variant="secondary" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Log Out
        </Button>
      </div>

      {/* Change Email Dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent className="bg-[#1A1D2E] border-[#343750]">
          <DialogHeader>
            <DialogTitle>Change Email</DialogTitle>
            <DialogDescription>
              Enter your new email and current password to confirm the change.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="new-email">New Email</Label>
              <Input
                id="new-email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email-password">Current Password</Label>
              <Input
                id="email-password"
                type="password"
                value={emailPassword}
                onChange={(e) => setEmailPassword(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleChangeEmail}>Confirm Change</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent className="bg-[#1A1D2E] border-[#343750]">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new one.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="old-password">Current Password</Label>
              <Input
                id="old-password"
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPasswordDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleChangePassword}>Change Password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#1A1D2E] border-[#343750]">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your account
              and remove all your data including projects, videos, and exports from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 border-2 border-destructive"
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
