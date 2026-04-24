import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Video } from "lucide-react";
import { RoleSelection } from "./RoleSelection";

interface AuthFormProps {
  onDemoLoginStart?: () => void;
  onDemoLoginComplete?: (route: string) => void;
}

export const AuthForm = ({ onDemoLoginStart, onDemoLoginComplete }: AuthFormProps) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [pendingCredentials, setPendingCredentials] = useState<{
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  } | null>(null);
  const { toast } = useToast();
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Store credentials and show role selection without creating account yet
    setPendingCredentials({
      email,
      password,
      firstName,
      lastName,
    });
    setShowRoleSelection(true);
  };
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  const handleDemoLogin = async (email: string, password: string) => {
    setLoading(true);
    onDemoLoginStart?.();
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      // Reset demo data based on account type
      if (data.user) {
        if (email === "admin@mail.com") {
          // Admin: Reset entire database to demo state
          const { error: resetError } = await supabase.rpc("reset_demo_admin_data");
          if (resetError) {
            console.error("Failed to reset demo admin data:", resetError);
            toast({
              title: "Warning",
              description: "Failed to reset demo data, but you're logged in.",
              variant: "destructive",
            });
          }
          
          // Reset demo admin profile
          const { error: profileError } = await supabase
            .from('profiles')
            .update({
              name: 'Demo Admin',
              profile_image: 'https://tvzcziymvuxbmbjhezqi.supabase.co/storage/v1/object/public/profile-images/850587bd-a428-41df-ae3f-1e51ff7c0c16/1761567399652.png'
            })
            .eq('id', data.user.id);
            
          if (profileError) {
            console.error("Failed to reset demo admin profile:", profileError);
          }
        } else if (email === "test@mail.com") {
          // User: Reset only their own data
          const { error: resetError } = await supabase.rpc("reset_demo_data", {
            _user_id: data.user.id,
          });
          if (resetError) {
            console.error("Failed to reset demo data:", resetError);
            toast({
              title: "Warning",
              description: "Failed to reset demo data, but you're logged in.",
              variant: "destructive",
            });
          }
          
          // Reset demo user profile
          const { error: profileError } = await supabase
            .from('profiles')
            .update({
              name: 'Demo User',
              profile_image: 'https://tvzcziymvuxbmbjhezqi.supabase.co/storage/v1/object/public/profile-images/850587bd-a428-41df-ae3f-1e51ff7c0c16/1761567399652.png'
            })
            .eq('id', data.user.id);
            
          if (profileError) {
            console.error("Failed to reset demo profile:", profileError);
          }
        }

        // Fetch user role to determine navigation
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', data.user.id)
          .single();

        const route = roleData?.role === 'admin' ? '/admin' : '/dashboard';
        
        toast({
          title: "Welcome!",
          description: "You have successfully signed in with demo account.",
        });

        // Navigate after all operations complete
        onDemoLoginComplete?.(route);
      }
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleComplete = () => {
    setShowRoleSelection(false);
    setPendingCredentials(null);
    setEmail("");
    setPassword("");
    setFirstName("");
    setLastName("");
  };

  if (showRoleSelection && pendingCredentials) {
    return (
      <RoleSelection 
        email={pendingCredentials.email}
        password={pendingCredentials.password}
        firstName={pendingCredentials.firstName}
        lastName={pendingCredentials.lastName}
        onComplete={handleRoleComplete} 
      />
    );
  }

  return (
    <Card className="w-full max-w-md p-12 bg-[#1C1E2D] border border-[#5C5F78]">
      <div className="flex flex-col items-center gap-4 mb-6">
        <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
          <Video className="h-7 w-7 text-primary-foreground" />
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-bold">Video Editor</h1>
          <p className="text-muted-foreground">Create and edit professional video clips</p>
        </div>
      </div>

      <div className="mb-6 space-y-2">
        <p className="text-sm text-muted-foreground text-center mb-3">Try demo accounts:</p>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDemoLogin("admin@mail.com", "admin123")}
            disabled={loading}
          >
            Demo Admin
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDemoLogin("test@mail.com", "test1234")}
            disabled={loading}
          >
            Demo User
          </Button>
        </div>
      </div>

      <Tabs defaultValue="signin">
        <TabsList className="grid w-full grid-cols-2 bg-transparent h-[44px] p-1 gap-2 border border-[#5C5F78] rounded-md">
          <TabsTrigger
            value="signin"
            className="flex items-center justify-center border-0 bg-transparent h-[34px] px-1 py-[4px] data-[state=active]:bg-[#40CCB7]/30 leading-none"
          >
            Sign In
          </TabsTrigger>
          <TabsTrigger
            value="signup"
            className="flex items-center justify-center border-0 bg-transparent h-[34px] px-1 py-[4px] data-[state=active]:bg-[#40CCB7]/30 leading-none"
          >
            Sign Up
          </TabsTrigger>
        </TabsList>

        <TabsContent value="signin">
          <form onSubmit={handleSignIn} className="mx-0 my-0 py-0 mt-[28px]">
            {/* Email field */}
            <div className="mb-[24px]">
              <Input
                id="signin-email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password field */}
            <div className="mb-[28px]">
              <Input
                id="signin-password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              className="w-full bg-[#40CCB799] hover:bg-[#40CCB7]/90 text-white border border-[#40CCB7]"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="signup">
          <form onSubmit={handleSignUp} className="mx-0 my-0 py-0 mt-[28px]">
            <div className="mb-[24px]">
              <Input
                id="signup-firstname"
                type="text"
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="mb-[24px]">
              <Input
                id="signup-lastname"
                type="text"
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
            <div className="mb-[24px]">
              <Input
                id="signup-email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-[28px]">
              <Input
                id="signup-password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-[#40CCB799] hover:bg-[#40CCB7]/90 text-white border border-[#40CCB7]"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Sign Up"}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
