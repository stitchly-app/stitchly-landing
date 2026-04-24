import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Upload, Filter, Edit2, Upload as UploadIcon, Trash2, ChevronLeft, ChevronRight, ArrowUpDown, FolderOpen, Video as VideoIcon, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { UploadVideoDialog } from "@/components/UploadVideoDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useAuditLog } from "@/hooks/useAuditLog";
import { useVideoEditor } from "@/hooks/useVideoEditor";
import { Progress } from "@/components/ui/progress";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell } from "recharts";
interface FormatSettings {
  aspectRatio: "16:9" | "9:16" | "1:1";
  cropMode: "fit" | "fill";
  resolution: "480p" | "720p" | "1080p" | "1440p" | "4k";
}
interface Project {
  id: string;
  name: string;
  video_id: string;
  user_id: string;
  created_at: string;
  edits_json: any;
  format_settings_json: FormatSettings;
  export_status?: string;
  videos?: {
    original_name: string;
    file_url: string;
    duration: number;
  };
}
const ProjectsReports = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [exportingProjectId, setExportingProjectId] = useState<string | null>(null);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStatus, setExportStatus] = useState("");
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [sortColumn, setSortColumn] = useState<string>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalVideos: 0,
    completedExports: 0,
  });
  const [recentActivity, setRecentActivity] = useState<Array<{ id: string; action: string; timestamp: string }>>([]);
  const [formatData, setFormatData] = useState<Array<{ name: string; value: number; fill: string }>>([]);
  const {
    toast
  } = useToast();
  const {
    logAction
  } = useAuditLog();
  const {
    trimVideo,
    loadFFmpeg,
    isFFmpegLoaded
  } = useVideoEditor();
  const ITEMS_PER_PAGE = 15;
  useEffect(() => {
    supabase.auth.getSession().then(({
      data: {
        session
      }
    }) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate('/');
      } else {
        fetchProjects(session.user.id);
        fetchReportsData(session.user.id);
      }
      setLoading(false);
    });
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate('/');
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);
  const fetchProjects = async (userId: string) => {
    try {
      const {
        data: projectsData,
        error
      } = await supabase.from('projects').select(`
          id,
          name,
          video_id,
          user_id,
          created_at,
          edits_json,
          format_settings_json,
          videos (
            original_name,
            file_url,
            duration
          )
        `).eq('user_id', userId).order('created_at', {
        ascending: false
      });
      if (error) throw error;

      // Fetch export status for each project
      const projectsWithStatus = await Promise.all((projectsData || []).map(async project => {
        const {
          data: exportData
        } = await supabase.from('exports').select('status').eq('project_id', project.id).order('created_at', {
          ascending: false
        }).limit(1).maybeSingle();
        return {
          ...project,
          export_status: exportData?.status || 'pending'
        };
      }));
      setProjects(projectsWithStatus as any || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: "Error loading projects",
        description: "Could not load your projects",
        variant: "destructive"
      });
    }
  };

  const fetchReportsData = async (userId: string) => {
    try {
      // Fetch stats
      const { count: projectCount } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      const { count: videoCount } = await supabase
        .from('videos')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      const { data: exportsData } = await supabase
        .from('exports')
        .select('project_id, format')
        .eq('status', 'done');

      // Filter exports that belong to user's projects
      const userProjectIds = new Set();
      const { data: userProjects } = await supabase
        .from('projects')
        .select('id')
        .eq('user_id', userId);
      
      userProjects?.forEach(p => userProjectIds.add(p.id));
      const userExports = exportsData?.filter(e => userProjectIds.has(e.project_id)) || [];

      setStats({
        totalProjects: projectCount || 0,
        totalVideos: videoCount || 0,
        completedExports: userExports.length || 0,
      });

      // Fetch recent activity from audit log
      const { data: activityData } = await supabase
        .from('audit_log')
        .select('id, action, entity, created_at, payload_json')
        .eq('actor_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      const activities = (activityData || []).map(log => {
        const entityName = (log.payload_json as any)?.name || log.entity;
        return {
          id: log.id,
          action: `${log.action.charAt(0).toUpperCase() + log.action.slice(1)} ${entityName}`,
          timestamp: formatDate(log.created_at)
        };
      });
      setRecentActivity(activities);

      // Calculate format distribution
      const formatCounts: Record<string, number> = {};
      userExports.forEach(exp => {
        const format = exp.format?.toUpperCase() || 'MP4';
        formatCounts[format] = (formatCounts[format] || 0) + 1;
      });

      const colors = ['hsl(217, 91%, 60%)', 'hsl(171, 52%, 53%)', 'hsl(280, 80%, 60%)'];
      const chartData = Object.entries(formatCounts).map(([name, value], index) => ({
        name,
        value,
        fill: colors[index % colors.length]
      }));
      
      setFormatData(chartData);
    } catch (error) {
      console.error('Error fetching reports data:', error);
    }
  };
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };
  const getSegmentCount = (editsJson: any) => {
    if (!editsJson || !Array.isArray(editsJson)) return 0;
    return editsJson.length;
  };
  const getFormat = (formatSettings: any) => {
    if (!formatSettings?.aspectRatio) return 'MP4';
    return formatSettings.aspectRatio === '9:16' ? 'WebM' : 'MP4';
  };
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
    const displayLabel = status === 'done' ? 'Exported' : status.charAt(0).toUpperCase() + status.slice(1);
    return <Badge className={`${getBadgeStyles()} rounded-full border`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5"></span>
        {displayLabel}
      </Badge>;
  };
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };
  const sortedProjects = [...projects].sort((a, b) => {
    let aValue: any;
    let bValue: any;
    switch (sortColumn) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'video':
        aValue = a.videos?.original_name?.toLowerCase() || '';
        bValue = b.videos?.original_name?.toLowerCase() || '';
        break;
      case 'segments':
        aValue = getSegmentCount(a.edits_json);
        bValue = getSegmentCount(b.edits_json);
        break;
      case 'format':
        aValue = getFormat(a.format_settings_json);
        bValue = getFormat(b.format_settings_json);
        break;
      case 'status':
        aValue = a.export_status || 'pending';
        bValue = b.export_status || 'pending';
        break;
      case 'created_at':
        aValue = new Date(a.created_at).getTime();
        bValue = new Date(b.created_at).getTime();
        break;
      default:
        return 0;
    }
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedProjects.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentProjects = sortedProjects.slice(startIndex, endIndex);
  const shouldShowPagination = sortedProjects.length > ITEMS_PER_PAGE;
  const handleExport = async (project: Project) => {
    setExportingProjectId(project.id);
    setExportProgress(0);
    setExportStatus("Starting export...");
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to export videos",
          variant: "destructive"
        });
        return;
      }
      if (!project.edits_json || project.edits_json.length === 0) {
        toast({
          title: "No segments defined",
          description: "This project has no segments to export.",
          variant: "destructive"
        });
        return;
      }
      if (!isFFmpegLoaded) {
        setExportStatus("Loading video editor...");
        setExportProgress(5);
        toast({
          title: "Loading video editor",
          description: "Initializing FFmpeg library..."
        });
        const loaded = await loadFFmpeg();
        if (!loaded) {
          throw new Error('Failed to initialize video editor');
        }
      }
      setExportStatus("Downloading video...");
      setExportProgress(10);
      toast({
        title: "Loading video...",
        description: "Downloading video file for processing."
      });
      const response = await fetch(project.videos!.file_url);
      const blob = await response.blob();
      const videoFile = new File([blob], project.videos!.original_name, {
        type: 'video/mp4'
      });
      const formatSettings: FormatSettings = project.format_settings_json || {
        aspectRatio: "16:9",
        cropMode: "fit",
        resolution: "1080p"
      };
      const trimmedUrls: string[] = [];
      const totalSegments = project.edits_json.length;
      for (let i = 0; i < totalSegments; i++) {
        const segment = project.edits_json[i];
        const segmentProgress = 10 + i / totalSegments * 70;
        setExportStatus(`Processing segment ${i + 1} of ${totalSegments}...`);
        setExportProgress(segmentProgress);
        const isDefaultFormat = formatSettings.aspectRatio === "16:9" && formatSettings.cropMode === "fit" && formatSettings.resolution === "1080p";
        toast({
          title: `Processing segment ${i + 1}/${totalSegments}`,
          description: isDefaultFormat ? `Trimming from ${segment.start_time.toFixed(2)}s to ${segment.end_time.toFixed(2)}s` : `Converting to ${formatSettings.aspectRatio} ${formatSettings.resolution} (${formatSettings.cropMode})`
        });
        const trimmedBlob = await trimVideo(videoFile, segment.start_time, segment.end_time, formatSettings, "quality");
        if (!trimmedBlob) {
          throw new Error(`Failed to trim segment ${i + 1}`);
        }
        const uploadProgress = segmentProgress + 70 / totalSegments * 0.5;
        setExportStatus(`Uploading segment ${i + 1} of ${totalSegments}...`);
        setExportProgress(uploadProgress);
        toast({
          title: `Uploading segment ${i + 1}/${totalSegments}`,
          description: "Saving to storage..."
        });
        const filePath = `${user.id}/${project.id}/trimmed_${Date.now()}_${i + 1}.mp4`;
        const {
          error: uploadError
        } = await supabase.storage.from('videos').upload(filePath, trimmedBlob, {
          contentType: 'video/mp4',
          upsert: true
        });
        if (uploadError) {
          throw new Error(`Upload failed: ${uploadError.message}`);
        }
        const {
          data: {
            publicUrl
          }
        } = supabase.storage.from('videos').getPublicUrl(filePath);
        trimmedUrls.push(publicUrl);
      }
      setExportStatus("Saving export record...");
      setExportProgress(85);
      toast({
        title: "Finalizing export...",
        description: "Creating export record."
      });
      const {
        data: exportData,
        error: exportError
      } = await supabase.from('exports').insert([{
        project_id: project.id,
        video_id: project.video_id,
        status: 'done',
        format: 'mp4',
        aspect_ratio: formatSettings.aspectRatio,
        resolution: formatSettings.resolution,
        output_urls: trimmedUrls
      }] as any).select().single();
      if (exportError) throw new Error(`Database error: ${exportError.message}`);
      if (exportData) {
        await logAction({
          entity: 'export',
          action: 'exported',
          entityId: exportData.id,
          payload: {
            project_id: project.id,
            segments_count: project.edits_json.length
          }
        });
      }
      const {
        formatResolutionString
      } = await import('@/lib/videoFormatUtils');
      const resolutionStr = formatResolutionString(formatSettings);
      setExportStatus("Downloading segments...");
      setExportProgress(90);
      toast({
        title: "Downloading segments...",
        description: `Preparing ${trimmedUrls.length} segment${trimmedUrls.length > 1 ? 's' : ''} for download.`
      });
      for (let i = 0; i < trimmedUrls.length; i++) {
        const url = trimmedUrls[i];
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        setTimeout(() => {
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = `${project.name}_${resolutionStr}_${formatSettings.aspectRatio.replace(':', 'x')}_segment_${i + 1}.mp4`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
        }, i * 500);
      }
      setExportProgress(100);
      setExportStatus("Export complete!");
      toast({
        title: "Export completed",
        description: trimmedUrls.length > 1 ? `${trimmedUrls.length} trimmed segments saved and downloaded!` : "Trimmed video saved and downloaded!"
      });
      if (user) {
        fetchProjects(user.id);
        fetchReportsData(user.id);
      }
      setTimeout(() => {
        setExportProgress(0);
        setExportStatus("");
      }, 2000);
    } catch (error: any) {
      console.error('Export error:', error);
      let errorMessage = "An error occurred while exporting.";
      if (error.message?.includes('Failed to initialize')) {
        errorMessage = error.message;
      } else if (error.message?.includes('Upload failed')) {
        errorMessage = error.message + ". Please check your internet connection.";
      } else if (error.message?.includes('Database error')) {
        errorMessage = error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      toast({
        title: "Export failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setExportingProjectId(null);
      setTimeout(() => {
        setExportProgress(0);
        setExportStatus("");
      }, 2000);
    }
  };
  const handleDeleteProject = async (project: Project) => {
    try {
      setProjectToDelete(null);
      const {
        error: deleteError
      } = await supabase.from('projects').delete().eq('id', project.id);
      if (deleteError) throw deleteError;
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          variant: "destructive"
        });
        return;
      }
      await logAction({
        entity: 'project',
        action: 'deleted',
        entityId: project.id,
        payload: {
          name: project.name
        }
      });
      setProjects(projects.filter(p => p.id !== project.id));
      fetchReportsData(user.id);
      toast({
        title: "Project deleted",
        description: "The project has been successfully deleted."
      });
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: "Error deleting project",
        description: "Could not delete the project.",
        variant: "destructive"
      });
    }
  };

  const exportToCSV = () => {
    const headers = ['Project Name', 'Video', 'Segments', 'Format', 'Status', 'Created'];
    const rows = sortedProjects.map(project => [
      project.name,
      project.videos?.original_name || 'N/A',
      getSegmentCount(project.edits_json).toString(),
      getFormat(project.format_settings_json),
      project.export_status || 'pending',
      formatDate(project.created_at)
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `projects-report-${new Date().toISOString().split('T')[0]}.csv`;
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
          <title>Projects Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #1a1a1a; margin-bottom: 10px; }
            .date { color: #666; margin-bottom: 20px; }
            .stats { display: flex; gap: 20px; margin-bottom: 30px; }
            .stat-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; flex: 1; }
            .stat-label { color: #666; font-size: 14px; }
            .stat-value { font-size: 24px; font-weight: bold; margin-top: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f5f5f5; font-weight: 600; }
            .badge { padding: 4px 8px; border-radius: 12px; font-size: 12px; display: inline-block; }
            .badge-done { background: #40CCB74D; color: #40CCB7; }
            .badge-processing { background: #256FFF4D; color: #256FFF; }
            .badge-pending { background: #f0f0f0; color: #666; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>Projects Report</h1>
          <div class="date">Generated on ${new Date().toLocaleString()}</div>
          
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
              <div class="stat-label">Completed Exports</div>
              <div class="stat-value">${stats.completedExports}</div>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Project Name</th>
                <th>Video</th>
                <th>Segments</th>
                <th>Format</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              ${sortedProjects.map(project => `
                <tr>
                  <td>${project.name}</td>
                  <td>${project.videos?.original_name || 'N/A'}</td>
                  <td>${getSegmentCount(project.edits_json)}</td>
                  <td>${getFormat(project.format_settings_json)}</td>
                  <td>
                    <span class="badge badge-${project.export_status || 'pending'}">
                      ${project.export_status === 'done' ? 'Exported' : 
                        (project.export_status || 'pending').charAt(0).toUpperCase() + 
                        (project.export_status || 'pending').slice(1)}
                    </span>
                  </td>
                  <td>${formatDate(project.created_at)}</td>
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
  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse">Loading...</div>
      </div>;
  }
  if (!user) {
    return null;
  }
  return <div className="flex h-screen overflow-hidden bg-secondary">
      <DashboardSidebar />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-foreground">Projects & Reports</h1>
            {projects.length > 0 && (
              <div className="flex gap-3">
                <Button onClick={exportToCSV} variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export CSV
                </Button>
                <Button onClick={exportToPDF} variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export PDF
                </Button>
                <Button className="bg-[#40CCB799] hover:bg-[#40CCB7]/90 text-white border border-[#40CCB7]" onClick={() => setUploadDialogOpen(true)}>
                  New Upload
                  <Upload className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
          </div>

          {/* Tabs */}
          <Tabs defaultValue="projects" className="space-y-6">
            <TabsList className="bg-transparent rounded-none p-0 h-auto">
              <TabsTrigger value="projects" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 text-[hsl(var(--label))]">
                Projects
              </TabsTrigger>
              <TabsTrigger value="reports" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 text-[hsl(var(--label))]">
                Reports
              </TabsTrigger>
            </TabsList>

            <TabsContent value="projects" className="mt-6">
              {projects.length === 0 ? (
                <Card className="border border-[hsl(228,20%,25%)] rounded-lg bg-background p-12">
                  <div className="flex flex-col items-center justify-center text-center space-y-6">
                    <p className="text-foreground text-lg">
                      You don't have any projects yet. Upload a file to get started.
                    </p>
                    <Button 
                      className="bg-[#40CCB799] hover:bg-[#40CCB7]/90 text-white border border-[#40CCB7]" 
                      onClick={() => setUploadDialogOpen(true)}
                    >
                      New Upload
                      <Upload className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </Card>
              ) : (
                <>
                  <div className="border border-[hsl(228,20%,25%)] rounded-lg overflow-hidden bg-[hsl(228,24%,15%)]">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-[hsl(228,20%,25%)] hover:bg-transparent">
                          <TableHead className="text-[hsl(233,20%,69%)]">
                            <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleSort('name')}>
                              Project Name
                              <ArrowUpDown className="h-4 w-4" />
                            </div>
                          </TableHead>
                          <TableHead className="text-[hsl(233,20%,69%)]">
                            <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleSort('video')}>
                              Video
                              <ArrowUpDown className="h-4 w-4" />
                            </div>
                          </TableHead>
                          <TableHead className="text-[hsl(233,20%,69%)]">
                            <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleSort('segments')}>
                              Segments
                              <ArrowUpDown className="h-4 w-4" />
                            </div>
                          </TableHead>
                          <TableHead className="text-[hsl(233,20%,69%)]">
                            <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleSort('format')}>
                              Format
                              <ArrowUpDown className="h-4 w-4" />
                            </div>
                          </TableHead>
                          <TableHead className="text-[hsl(233,20%,69%)]">
                            <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleSort('status')}>
                              Status
                              <ArrowUpDown className="h-4 w-4" />
                            </div>
                          </TableHead>
                          <TableHead className="text-[hsl(233,20%,69%)]">
                            <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleSort('created_at')}>
                              Date Created
                              <ArrowUpDown className="h-4 w-4" />
                            </div>
                          </TableHead>
                          <TableHead className="w-32"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentProjects.map(project => <TableRow key={project.id} className="border-[hsl(228,20%,25%)] hover:bg-[hsl(228,24%,17%)]">
                            <TableCell className="font-medium text-foreground">{project.name}</TableCell>
                            <TableCell className="text-[hsl(233,20%,69%)] truncate max-w-xs">
                              {project.videos?.original_name || 'N/A'}
                            </TableCell>
                            <TableCell className="text-foreground">{getSegmentCount(project.edits_json)}</TableCell>
                            <TableCell className="text-foreground">{getFormat(project.format_settings_json)}</TableCell>
                            <TableCell>{getStatusBadge(project.export_status || 'pending')}</TableCell>
                            <TableCell className="text-[hsl(233,20%,69%)]">
                              {formatDate(project.created_at)}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1 justify-end">
                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-[hsl(228,20%,25%)] text-[hsl(233,20%,69%)] hover:text-foreground" onClick={() => navigate(`/editor/${project.id}`)} disabled={exportingProjectId === project.id}>
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-[hsl(228,20%,25%)] text-[hsl(233,20%,69%)] hover:text-foreground" onClick={() => handleExport(project)} disabled={exportingProjectId !== null}>
                                  <UploadIcon className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-[hsl(228,20%,25%)] text-[hsl(0,84%,60%)] hover:text-[hsl(0,84%,70%)]" onClick={() => setProjectToDelete(project)} disabled={exportingProjectId === project.id}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>)}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}

              {/* Pagination - only show if needed */}
              {projects.length > 0 && shouldShowPagination && <div className="flex items-center justify-center gap-2 mt-6">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-[hsl(233,20%,69%)] hover:text-foreground hover:bg-[hsl(228,20%,25%)]" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {Array.from({
                length: totalPages
              }, (_, i) => i + 1).map(page => <Button key={page} variant="ghost" size="icon" className={`h-8 w-8 ${currentPage === page ? 'bg-primary text-primary-foreground border border-primary' : 'text-[hsl(233,20%,69%)] hover:text-foreground hover:bg-[hsl(228,20%,25%)]'}`} onClick={() => setCurrentPage(page)}>
                      {page}
                    </Button>)}
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-[hsl(233,20%,69%)] hover:text-foreground hover:bg-[hsl(228,20%,25%)]" onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>}
            </TabsContent>

            <TabsContent value="reports" className="mt-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <StatsCard title="Total Projects" value={stats.totalProjects} icon={FolderOpen} />
                <StatsCard title="Total Videos" value={stats.totalVideos} icon={VideoIcon} />
                <StatsCard title="Completed Exports" value={stats.completedExports} icon={UploadIcon} />
              </div>

              {/* Activity and Chart Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <Card className="p-6 bg-card border-border">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Your Recent Activity</h3>
                  <div className="space-y-3">
                    {recentActivity.length > 0 ? (
                      recentActivity.map((activity) => (
                        <div key={activity.id} className="flex items-center justify-between py-2">
                          <span className="text-foreground">{activity.action}</span>
                          <span className="text-sm text-muted-foreground">{activity.timestamp}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-center py-4">No recent activity</p>
                    )}
                  </div>
                </Card>

                {/* Export Formats Chart */}
                <Card className="p-6 bg-card border-border">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Export Formats Used</h3>
                  {formatData.length > 0 ? (
                    <div className="flex items-center justify-between">
                      <ChartContainer
                        config={{}}
                        className="h-[200px] w-[200px]"
                      >
                        <PieChart>
                          <Pie
                            data={formatData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {formatData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <ChartTooltip content={<ChartTooltipContent />} />
                        </PieChart>
                      </ChartContainer>
                      <div className="space-y-2">
                        {formatData.map((entry, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-sm"
                              style={{ backgroundColor: entry.fill }}
                            />
                            <span className="text-sm text-foreground">
                              {entry.name} - {entry.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">No export data available</p>
                  )}
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <UploadVideoDialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen} />

      {/* Export Progress */}
      {exportingProjectId && <div className="fixed bottom-4 right-4 bg-card border border-border rounded-lg p-4 w-80 shadow-lg">
          <p className="text-sm font-medium mb-2">{exportStatus}</p>
          <Progress value={exportProgress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">{exportProgress}%</p>
        </div>}

      {/* Delete Confirmation */}
      <AlertDialog open={!!projectToDelete} onOpenChange={open => !open && setProjectToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{projectToDelete?.name}"? This action cannot be undone and will permanently delete the project and its associated video.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => projectToDelete && handleDeleteProject(projectToDelete)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>;
};
export default ProjectsReports;