import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AuthForm } from "@/components/auth/AuthForm";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, ArrowLeft } from "lucide-react";
export default function Auth() {
  const navigate = useNavigate();
  const isDemoLoginInProgress = useRef(false);
  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(async ({
      data: {
        session
      }
    }) => {
      if (session) {
        // Check if user is admin
        const {
          data: roles
        } = await supabase.from('user_roles').select('role').eq('user_id', session.user.id).single();
        if (roles?.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }
    });

    // Listen for auth changes
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      // Skip navigation if demo login is handling it
      if (isDemoLoginInProgress.current) {
        return;
      }
      
      if (session) {
        // Check if user is admin
        const {
          data: roles
        } = await supabase.from('user_roles').select('role').eq('user_id', session.user.id).single();
        if (roles?.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);
  return <div className="min-h-screen bg-[#101321] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <AuthForm 
          onDemoLoginStart={() => { isDemoLoginInProgress.current = true; }}
          onDemoLoginComplete={(route: string) => {
            isDemoLoginInProgress.current = false;
            navigate(route);
          }}
        />

        
      </div>
    </div>;
}