import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Video } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type UserRole = "user" | "admin";

interface RoleSelectionProps {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  onComplete: () => void;
}

export const RoleSelection = ({ email, password, firstName, lastName, onComplete }: RoleSelectionProps) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>("user");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleContinue = async () => {
    setLoading(true);
    try {
      // Create the account with user metadata
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error("Failed to create account");

      // Insert the selected role (trigger no longer creates default role)
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({ 
          user_id: authData.user.id,
          role: selectedRole 
        });

      if (roleError) throw roleError;

      toast({
        title: "Account created successfully",
        description: `You are now registered as ${selectedRole === "admin" ? "an admin" : "a standard user"}.`,
      });

      onComplete();
    } catch (error: any) {
      toast({
        title: "Failed to create account",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md p-12 bg-[#1C1E2D] border border-[#5C5F78]">
      <div className="flex flex-col items-center gap-4 mb-6">
        <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
          <Video className="h-7 w-7 text-primary-foreground" />
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-bold">VideoEditor</h1>
          <p className="text-muted-foreground">Create and edit professional video clips</p>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-center">Choose your demo:</h2>

        <RadioGroup value={selectedRole} onValueChange={(value) => setSelectedRole(value as UserRole)}>
          <div className="flex items-center space-x-3 mb-4">
            <RadioGroupItem value="user" id="user" />
            <Label htmlFor="user" className="text-base cursor-pointer">
              Standard User
            </Label>
          </div>
          <div className="flex items-center space-x-3">
            <RadioGroupItem value="admin" id="admin" />
            <Label htmlFor="admin" className="text-base cursor-pointer">
              Admin User
            </Label>
          </div>
        </RadioGroup>

        <Button
          onClick={handleContinue}
          className="w-full bg-[#40CCB799] hover:bg-[#40CCB7]/90 text-white border border-[#40CCB7]"
          disabled={loading}
        >
          {loading ? "Setting up..." : "Continue"}
        </Button>
      </div>
    </Card>
  );
};
