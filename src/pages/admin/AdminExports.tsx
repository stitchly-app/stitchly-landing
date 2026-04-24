import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminSidebar } from "@/components/AdminSidebar";
import { ExportQueueStats } from "@/components/admin/ExportQueueStats";
import { RecentExportsTable } from "@/components/admin/RecentExportsTable";
import { Button } from "@/components/ui/button";
import { FileDown, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminExports() {
  const [exportStats, setExportStats] = useState({
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
  });
  const [recentExports, setRecentExports] = useState<any[]>([]);
  const [sortColumn, setSortColumn] = useState<string>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExports();
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel('exports-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'exports'
        },
        () => {
          fetchExports();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchExports = async () => {
    try {
      // Fetch all exports for statistics
      const { data: allExports } = await supabase
        .from('exports')
        .select('status');

      const exportStatusCounts = {
        pending: allExports?.filter(e => e.status === 'pending').length || 0,
        processing: allExports?.filter(e => e.status === 'processing').length || 0,
        completed: allExports?.filter(e => e.status === 'done').length || 0,
        failed: allExports?.filter(e => e.status === 'failed').length || 0,
      };

      setExportStats(exportStatusCounts);

      // Fetch recent exports with details
      const { data: exports } = await supabase
        .from('exports')
        .select(`
          id,
          status,
          format,
          created_at,
          completed_at,
          is_visitor,
          visitor_id,
          project_id,
          projects(
            name,
            user_id,
            profiles(name, email)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      setRecentExports(
        exports?.map((exp: any) => ({
          id: exp.id,
          project_name: exp.projects?.name || 'N/A',
          user_type: exp.is_visitor ? 'Visitor' : 'User',
          user_email: exp.is_visitor 
            ? `visitor: ${exp.visitor_id?.substring(0, 8)}...` 
            : exp.projects?.profiles?.email || 'N/A',
          format: exp.format,
          status: exp.status,
          created_at: exp.created_at,
          completed_at: exp.completed_at,
        })) || []
      );
    } catch (error) {
      console.error('Error fetching exports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSortExports = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedExports = [...recentExports].sort((a, b) => {
    let aValue: any = a[sortColumn as keyof typeof a];
    let bValue: any = b[sortColumn as keyof typeof b];

    if (sortColumn === 'created_at' || sortColumn === 'completed_at') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const { toast } = useToast();

  const exportToCSV = () => {
    const headers = ['Project', 'User Type', 'User Email', 'Format', 'Status', 'Created', 'Completed'];
    const rows = sortedExports.map(exp => [
      exp.project_name,
      exp.user_type,
      exp.user_email,
      exp.format,
      exp.status,
      new Date(exp.created_at).toLocaleString(),
      exp.completed_at ? new Date(exp.completed_at).toLocaleString() : 'N/A'
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `exports-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Report exported",
      description: "CSV file has been downloaded."
    });
  };

  const exportToPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Exports Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #1a1a1a; margin-bottom: 10px; }
            .date { color: #666; margin-bottom: 20px; }
            .export-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px; }
            .export-stat { border: 1px solid #ddd; padding: 12px; border-radius: 8px; text-align: center; }
            .stat-label { color: #666; font-size: 14px; }
            .stat-value { font-size: 24px; font-weight: bold; margin-top: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; font-size: 12px; }
            th { background-color: #f5f5f5; font-weight: 600; }
            .badge { padding: 4px 8px; border-radius: 12px; font-size: 11px; display: inline-block; }
            .badge-done { background: #40CCB74D; color: #40CCB7; }
            .badge-processing { background: #256FFF4D; color: #256FFF; }
            .badge-pending { background: #f0f0f0; color: #666; }
            .badge-failed { background: #FF46724D; color: #FF4672; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <h1>Exports Report</h1>
          <div class="date">Generated on ${new Date().toLocaleString()}</div>
          
          <h2>Export Queue Status</h2>
          <div class="export-stats">
            <div class="export-stat">
              <div class="stat-label">Pending</div>
              <div class="stat-value">${exportStats.pending}</div>
            </div>
            <div class="export-stat">
              <div class="stat-label">Processing</div>
              <div class="stat-value">${exportStats.processing}</div>
            </div>
            <div class="export-stat">
              <div class="stat-label">Completed</div>
              <div class="stat-value">${exportStats.completed}</div>
            </div>
            <div class="export-stat">
              <div class="stat-label">Failed</div>
              <div class="stat-value">${exportStats.failed}</div>
            </div>
          </div>
          
          <h2>Recent Exports</h2>
          <table>
            <thead>
              <tr>
                <th>Project</th>
                <th>User Type</th>
                <th>User Email</th>
                <th>Format</th>
                <th>Status</th>
                <th>Created</th>
                <th>Completed</th>
              </tr>
            </thead>
            <tbody>
              ${sortedExports.map(exp => `
                <tr>
                  <td>${exp.project_name}</td>
                  <td>${exp.user_type}</td>
                  <td>${exp.user_email}</td>
                  <td>${exp.format}</td>
                  <td>
                    <span class="badge badge-${exp.status}">
                      ${exp.status === 'done' ? 'Completed' : 
                        exp.status.charAt(0).toUpperCase() + exp.status.slice(1)}
                    </span>
                  </td>
                  <td>${new Date(exp.created_at).toLocaleString()}</td>
                  <td>${exp.completed_at ? new Date(exp.completed_at).toLocaleString() : 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <script>
            window.onload = () => {
              window.print();
              setTimeout(() => window.close(), 100);
            };
          </script>
        </body>
      </html>
    `;
    
    printWindow.document.write(html);
    printWindow.document.close();
    
    toast({
      title: "Generating PDF",
      description: "Print dialog opened for PDF export."
    });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-secondary">
      <AdminSidebar />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Exports</h1>
            <p className="text-muted-foreground mt-1">Monitor export queue and status</p>
          </div>

          {/* Export Queue Stats */}
          <div className="mb-8">
            <ExportQueueStats
              pending={exportStats.pending}
              processing={exportStats.processing}
              completed={exportStats.completed}
              failed={exportStats.failed}
            />
          </div>

          {/* Recent Exports */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">Recent Exports</h2>
              <div className="flex gap-2">
                <Button onClick={exportToCSV} variant="outline" size="sm">
                  <FileDown className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
                <Button onClick={exportToPDF} variant="outline" size="sm">
                  <FileText className="mr-2 h-4 w-4" />
                  Export PDF
                </Button>
              </div>
            </div>
            <RecentExportsTable
              exports={sortedExports}
              onSort={handleSortExports}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
