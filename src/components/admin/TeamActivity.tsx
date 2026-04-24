import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";

interface TeamActivityProps {
  activities: Array<{
    id: string;
    user_name: string;
    user_email: string;
    action: string;
    timestamp: string;
    profile_image?: string;
  }>;
}

export const TeamActivity = ({ activities }: TeamActivityProps) => {
  return (
    <Card className="border border-border rounded-lg bg-card p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">Team Activity</h3>
        <p className="text-sm text-muted-foreground">Your team's latest actions</p>
      </div>
      
      <div className="space-y-4">
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent activity</p>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  {activity.profile_image && (
                    <AvatarImage src={activity.profile_image} alt={activity.user_name} />
                  )}
                  <AvatarFallback className="bg-primary/10 text-primary">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="text-sm text-foreground">
                  <span className="font-medium">{activity.user_name}</span> {activity.action}
                </div>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {activity.timestamp}
              </span>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
