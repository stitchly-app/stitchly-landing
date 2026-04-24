import { Card } from "@/components/ui/card";

interface ExportQueueStatsListProps {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
}

export const ExportQueueStatsList = ({ pending, processing, completed, failed }: ExportQueueStatsListProps) => {
  return (
    <Card className="border border-border rounded-lg bg-card p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">Export Queue Statistics</h3>
        <p className="text-sm text-muted-foreground">Current status of all exports</p>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[hsl(233,20%,69%)]"></span>
            <span className="text-sm text-foreground">Pending</span>
          </div>
          <span className="text-sm font-medium text-foreground">{pending}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[hsl(217,91%,60%)]"></span>
            <span className="text-sm text-foreground">Processing</span>
          </div>
          <span className="text-sm font-medium text-foreground">{processing}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[hsl(171,52%,53%)]"></span>
            <span className="text-sm text-foreground">Completed</span>
          </div>
          <span className="text-sm font-medium text-foreground">{completed}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[hsl(0,84%,60%)]"></span>
            <span className="text-sm text-foreground">Failed</span>
          </div>
          <span className="text-sm font-medium text-foreground">{failed}</span>
        </div>
      </div>
    </Card>
  );
};
