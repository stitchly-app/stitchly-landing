import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Circle } from "lucide-react";

interface ExportQueueStatsProps {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
}

export const ExportQueueStats = ({ pending, processing, completed, failed }: ExportQueueStatsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      {/* Pending Card */}
      <Card className="border border-border rounded-lg bg-card p-6">
        <Badge variant="outline" className="mb-4 gap-1.5 bg-muted/50 text-foreground border-border">
          <Circle className="h-3 w-3 fill-current" />
          Pending
        </Badge>
        <div className="text-2xl font-bold text-foreground">{pending}</div>
      </Card>

      {/* Processing Card */}
      <Card className="border border-border rounded-lg bg-card p-6">
        <Badge className="mb-4 gap-1.5 bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/20">
          <Circle className="h-3 w-3 fill-current" />
          Processing
        </Badge>
        <div className="text-2xl font-bold text-foreground">{processing}</div>
      </Card>

      {/* Complete Card */}
      <Card className="border border-border rounded-lg bg-card p-6">
        <Badge className="mb-4 gap-1.5 bg-teal-500/20 text-teal-400 border-teal-500/30 hover:bg-teal-500/20">
          <Circle className="h-3 w-3 fill-current" />
          Complete
        </Badge>
        <div className="text-2xl font-bold text-foreground">{completed}</div>
      </Card>

      {/* Failed Card */}
      <Card className="border border-border rounded-lg bg-card p-6">
        <Badge className="mb-4 gap-1.5 bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/20">
          <Circle className="h-3 w-3 fill-current" />
          Failed
        </Badge>
        <div className="text-2xl font-bold text-foreground">{failed}</div>
      </Card>
    </div>
  );
};
