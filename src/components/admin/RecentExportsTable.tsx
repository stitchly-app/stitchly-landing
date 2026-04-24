import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown } from "lucide-react";

interface ExportItem {
  id: string;
  project_name: string;
  user_type: 'User' | 'Visitor';
  user_email: string;
  format: string;
  status: string;
  created_at: string;
  completed_at: string | null;
}

interface RecentExportsTableProps {
  exports: ExportItem[];
  onSort: (column: string) => void;
}

export const RecentExportsTable = ({ 
  exports, 
  onSort
}: RecentExportsTableProps) => {
  
  const getStatusBadge = (status: string) => {
    const getBadgeStyles = () => {
      if (status === 'done') {
        return "bg-[#40CCB74D] text-[hsl(171,52%,53%)] border-[hsl(171,52%,53%)]/30";
      }
      if (status === 'processing') {
        return "bg-[#256FFF4D] text-[hsl(217,91%,60%)] border-[hsl(217,91%,60%)]/30";
      }
      if (status === 'failed') {
        return "bg-[#FF46724D] text-[hsl(0,84%,60%)] border-[hsl(0,84%,60%)]/30";
      }
      return "bg-[hsl(228,20%,25%)] text-[hsl(233,20%,69%)] border-[hsl(228,20%,30%)]";
    };
    
    const displayLabel = status === 'done' ? 'Complete' : 
                        status === 'pending' ? 'Pending' : 
                        status.charAt(0).toUpperCase() + status.slice(1);
    
    return (
      <Badge className={`${getBadgeStyles()} rounded-full border`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5"></span>
        {displayLabel}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="text-muted-foreground">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => onSort('project_name')}>
                Project Name
                <ArrowUpDown className="h-4 w-4" />
              </div>
            </TableHead>
            <TableHead className="text-muted-foreground">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => onSort('user_type')}>
                User Type
                <ArrowUpDown className="h-4 w-4" />
              </div>
            </TableHead>
            <TableHead className="text-muted-foreground">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => onSort('user_email')}>
                User
                <ArrowUpDown className="h-4 w-4" />
              </div>
            </TableHead>
            <TableHead className="text-muted-foreground">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => onSort('format')}>
                Format
                <ArrowUpDown className="h-4 w-4" />
              </div>
            </TableHead>
            <TableHead className="text-muted-foreground">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => onSort('status')}>
                Status
                <ArrowUpDown className="h-4 w-4" />
              </div>
            </TableHead>
            <TableHead className="text-muted-foreground">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => onSort('created_at')}>
                Date Created
                <ArrowUpDown className="h-4 w-4" />
              </div>
            </TableHead>
            <TableHead className="text-muted-foreground">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => onSort('completed_at')}>
                Date Completed
                <ArrowUpDown className="h-4 w-4" />
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {exports.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                No exports found
              </TableCell>
            </TableRow>
          ) : (
            exports.map((exp) => (
              <TableRow key={exp.id} className="border-border hover:bg-muted/50">
                <TableCell className="font-medium text-foreground">{exp.project_name}</TableCell>
                <TableCell>
                  <Badge variant={exp.user_type === 'Visitor' ? "secondary" : "default"}>
                    {exp.user_type}
                  </Badge>
                </TableCell>
                <TableCell className="text-foreground">{exp.user_email}</TableCell>
                <TableCell className="text-foreground uppercase">{exp.format}</TableCell>
                <TableCell>{getStatusBadge(exp.status)}</TableCell>
                <TableCell className="text-muted-foreground">{formatDate(exp.created_at)}</TableCell>
                <TableCell className="text-muted-foreground">
                  {exp.completed_at ? formatDate(exp.completed_at) : formatDate(exp.created_at)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
