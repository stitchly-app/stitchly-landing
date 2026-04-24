import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { Skeleton } from "@/components/ui/skeleton";
import { Database, Users, FolderOpen, Video as VideoIcon, Download } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { AdminSidebar } from "@/components/AdminSidebar";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ExportQueueStatsList } from "@/components/admin/ExportQueueStatsList";
import { TeamActivity } from "@/components/admin/TeamActivity";
import { RecentExportsTable } from "@/components/admin/RecentExportsTable";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { role, loading, isAdmin } = useUserRole();
  const [checking, setChecking] = useState(true);
  const { toast } = useToast();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProjects: 0,
    totalVideos: 0,
    storageUsed: 0,
  });
  const [exportStats, setExportStats] = useState({
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [recentExports, setRecentExports] = useState<any[]>([]);
  const [sortColumn, setSortColumn] = useState<string>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/auth');
        return;
      }

      if (!loading && !isAdmin) {
        navigate('/');
        return;
      }

      setChecking(false);
      fetchAdminStats();
    };

    checkAuth();
  }, [navigate, loading, isAdmin]);

  const fetchAdminStats = async () => {
    try {
      // Fetch total users
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch total projects
      const { count: projectCount } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true });

      // Fetch total videos
      const { count: videoCount } = await supabase
        .from('videos')
        .select('*', { count: 'exact', head: true });

      // Fetch storage usage
      const { data: storageData } = await supabase
        .from('videos')
        .select('size');

      const totalStorage = storageData?.reduce((sum, video) => sum + (video.size || 0), 0) || 0;

      // Fetch export statistics
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

      // Fetch recent activities from audit log with user details
      const { data: activities } = await supabase
        .from('audit_log')
        .select(`
          id, 
          action, 
          entity, 
          created_at,
          actor_id,
          payload_json
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch user profiles for activities
      const actorIds = activities?.map(a => a.actor_id).filter(Boolean) || [];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, email, profile_image')
        .in('id', actorIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      setRecentActivities(
        activities?.map((activity) => {
          const profile = activity.actor_id ? profileMap.get(activity.actor_id) : null;
          const entityName = (activity.payload_json as any)?.name || activity.entity;
          return {
            id: activity.id,
            user_name: profile?.name || 'Unknown User',
            user_email: profile?.email || '',
            profile_image: profile?.profile_image,
            action: `${activity.action} ${entityName}`,
            timestamp: new Date(activity.created_at).toLocaleString('en-US', {
              month: 'short',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            }),
          };
        }) || []
      );

      // Fetch recent exports
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

      setStats({
        totalUsers: userCount || 0,
        totalProjects: projectCount || 0,
        totalVideos: videoCount || 0,
        storageUsed: totalStorage,
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
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
    link.download = `admin-exports-report-${new Date().toISOString().split('T')[0]}.csv`;
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
          <title>Admin Dashboard Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #1a1a1a; margin-bottom: 10px; }
            .date { color: #666; margin-bottom: 20px; }
            .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
            .stat-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
            .stat-label { color: #666; font-size: 14px; }
            .stat-value { font-size: 24px; font-weight: bold; margin-top: 5px; }
            .export-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px; }
            .export-stat { border: 1px solid #ddd; padding: 12px; border-radius: 8px; text-align: center; }
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
          <h1>Admin Dashboard Report</h1>
          <div class="date">Generated on ${new Date().toLocaleString()}</div>
          
          <h2>System Statistics</h2>
          <div class="stats">
            <div class="stat-card">
              <div class="stat-label">Total Projects</div>
              <div class="stat-value">${stats.totalProjects}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Total Videos</div>
              <div class="stat-value">${stats.totalVideos}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Total Users</div>
              <div class="stat-value">${stats.totalUsers}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Storage Used</div>
              <div class="stat-value">${formatBytes(stats.storageUsed)}</div>
            </div>
          </div>
          
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

  if (loading || checking) {
    return (
      <div className="flex h-screen overflow-hidden bg-secondary">
        <AdminSidebar />
        <div className="flex-1 p-8">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex h-screen overflow-hidden bg-secondary">
        <AdminSidebar />
        <div className="flex-1 p-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Access denied. Admin privileges required.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-secondary">
      <AdminSidebar />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground mt-1">System management and monitoring</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={exportToCSV} variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
              <Button onClick={exportToPDF} variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export PDF
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <StatsCard
              title="Total Projects"
              value={stats.totalProjects}
              icon={FolderOpen}
              onClick={() => navigate('/admin/exports')}
            />
            <StatsCard
              title="Total Videos"
              value={stats.totalVideos}
              icon={VideoIcon}
              onClick={() => navigate('/admin/storage')}
            />
            <StatsCard
              title="Total Users"
              value={stats.totalUsers}
              icon={Users}
              onClick={() => navigate('/admin/users')}
            />
            <StatsCard
              title="Storage Used"
              value={formatBytes(stats.storageUsed)}
              icon={Database}
              onClick={() => navigate('/admin/storage')}
            />
          </div>

          {/* Export Queue Stats and Team Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <ExportQueueStatsList
              pending={exportStats.pending}
              processing={exportStats.processing}
              completed={exportStats.completed}
              failed={exportStats.failed}
            />
            <TeamActivity activities={recentActivities} />
          </div>

          {/* Recent Exports */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Recent Exports</h2>
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
