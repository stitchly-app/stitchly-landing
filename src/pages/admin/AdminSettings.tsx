import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminSidebar } from "@/components/AdminSidebar";
import { SystemSettings } from "@/components/admin/SystemSettings";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccountSettings } from "@/components/admin/AccountSettings";
import { useNavigate } from "react-router-dom";

export default function AdminSettings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("system");

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

      setUser(session.user);
      setEmail(session.user.email || "");

      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) throw error;

      setProfile(profileData);
      setName(profileData.name || "");
      setProfileImage(profileData.profile_image || null);
    } catch (error: any) {
      console.error('Error fetching user data:', error);
      toast({
        title: "Error",
        description: "Failed to load user data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-secondary">
      <AdminSidebar />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-transparent border-b border-border rounded-none h-auto p-0 mb-8">
              <TabsTrigger
                value="system"
                className="bg-transparent data-[state=active]:bg-transparent rounded-none border-b-2 border-transparent data-[state=active]:border-[#45CE99] data-[state=active]:shadow-none px-4 py-3 text-muted-foreground data-[state=active]:text-foreground"
              >
                System Settings
              </TabsTrigger>
              <TabsTrigger
                value="account"
                className="bg-transparent data-[state=active]:bg-transparent rounded-none border-b-2 border-transparent data-[state=active]:border-[#45CE99] data-[state=active]:shadow-none px-4 py-3 text-muted-foreground data-[state=active]:text-foreground"
              >
                Account Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="system" className="mt-6">
              <SystemSettings />
            </TabsContent>

            <TabsContent value="account" className="mt-6">
              <AccountSettings
                user={user}
                profile={profile}
                name={name}
                setName={setName}
                email={email}
                profileImage={profileImage}
                setProfileImage={setProfileImage}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
