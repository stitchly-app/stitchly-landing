import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
export const VisitorBanner = () => {
  return <Alert className="border-primary/50 bg-primary/5">
      <AlertCircle className="h-4 w-4" style={{ color: '#40CCB7' }} />
      <AlertDescription className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span>Projects will auto-delete after 24 hrs. Create an account to permanently save and export in all formats.</span>
        </div>
        <Link to="/auth">
          <Button size="sm" className="whitespace-nowrap">Sign Up Now</Button>
        </Link>
      </AlertDescription>
    </Alert>;
};