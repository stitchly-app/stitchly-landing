import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";

interface Activity {
  id: string;
  action: string;
  timestamp: string;
  user?: {
    name: string;
    avatar?: string;
  };
}

interface ActivityFeedProps {
  title: string;
  subtitle: string;
  activities: Activity[];
  showAvatar?: boolean;
}

export const ActivityFeed = ({ title, subtitle, activities, showAvatar = false }: ActivityFeedProps) => {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              {showAvatar && activity.user && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-muted">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
              <span className="text-sm text-foreground">{activity.action}</span>
            </div>
            <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
