import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DemoDashboardSidebar } from "@/components/DemoDashboardSidebar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Edit2, Upload as UploadIcon, ArrowUpDown, Trash2, FolderOpen, Video, ChevronLeft, ChevronRight, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { VisitorBanner } from "@/components/VisitorBanner";
import { useVideoEditor } from "@/hooks/useVideoEditor";
import { VideoUploader } from "@/components/VideoUploader";
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

const DemoProjectsReports = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [sortColumn, setSortColumn] = useState<string>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [visitorId, setVisitorId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [exportingProjectId, setExportingProjectId] = useState<string | null>(null);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStatus, setExportStatus] = useState("");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalVideos: 0,
    completedExports: 0,
  });
  const [recentActivity, setRecentActivity] = useState<Array<{ id: string; action: string; timestamp: string }>>([]);
  const [formatData, setFormatData] = useState<Array<{ name: string; value: number; fill: string }>>([]);

  const { toast } = useToast();
  const { trimVideo, loadFFmpeg, isFFmpegLoaded } = useVideoEditor();
  
  const ITEMS_PER_PAGE = 15;

  useEffect(() => {
    const storedVisitorId = localStorage.getItem('visitor_id');
    if (!storedVisitorId) {
      navigate('/demo');
      return;
    }
    setVisitorId(storedVisitorId);
    fetchDemoProjects(storedVisitorId);
    fetchReportsData(storedVisitorId);
    setLoading(false);
  }, [navigate]);

  const fetchDemoProjects = async (visitorId: string) => {
    try {
      const { data: projectsData, error } = await supabase
        .from('projects')
        .select(`
          id,
          name,
          video_id,
          created_at,
          edits_json,
          format_settings_json,
          videos (
            original_name,
            file_url,
            duration
          )
        `)
        .eq('visitor_id', visitorId)
        .eq('is_visitor', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch export status for each project
      const projectsWithStatus = await Promise.all(
        (projectsData || []).map(async (project) => {
          const { data: exportData } = await supabase
            .from('exports')
            .select('status')
            .eq('project_id', project.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          return {
            ...project,
            export_status: exportData?.status || 'pending',
          };
        })
      );

      setProjects(projectsWithStatus as any || []);

      // Calculate stats
      const { count: videoCount } = await supabase
        .from('videos')
        .select('*', { count: 'exact', head: true })
        .eq('visitor_id', visitorId)
        .eq('is_visitor', true);

      const projectIds = (projectsData || []).map((p) => p.id);
      const { data: exportsData } = projectIds.length > 0
        ? await supabase
            .from('exports')
            .select('status')
            .eq('status', 'done')
            .in('project_id', projectIds)
        : { data: [] };

      setStats({
        totalProjects: projectsData?.length || 0,
        totalVideos: videoCount || 0,
        completedExports: exportsData?.length || 0,
      });
    } catch (error) {
      console.error('Error fetching demo projects:', error);
      toast({
        title: "Error loading projects",
        description: "Could not load your demo projects",
        variant: "destructive",
      });
    }
  };

  const fetchReportsData = async (visitorId: string) => {
    try {
      const { data: projectsData } = await supabase
        .from('projects')
        .select('id, name, created_at')
        .eq('visitor_id', visitorId)
        .eq('is_visitor', true)
        .order('created_at', { ascending: false })
        .limit(5);

      const activities = (projectsData || []).map(project => ({
        id: project.id,
        action: `Created ${project.name}`,
        timestamp: formatDate(project.created_at)
      }));
      setRecentActivity(activities);

      // Calculate format distribution
      const projectIds = projects.map(p => p.id);
      if (projectIds.length > 0) {
        const { data: exportsData } = await supabase
          .from('exports')
          .select('format')
          .eq('status', 'done')
          .in('project_id', projectIds);

        const formatCounts: Record<string, number> = {};
        (exportsData || []).forEach(exp => {
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
      }
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
      hour12: true,
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

    const displayLabel =
      status === 'done' ? 'Exported' : status.charAt(0).toUpperCase() + status.slice(1);

    return (
      <Badge className={`${getBadgeStyles()} rounded-full border`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5"></span>
        {displayLabel}
      </Badge>
    );
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

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProjects(sortedProjects.map((p) => p.id));
    } else {
      setSelectedProjects([]);
    }
  };

  const handleSelectProject = (projectId: string, checked: boolean) => {
    if (checked) {
      setSelectedProjects([...selectedProjects, projectId]);
    } else {
      setSelectedProjects(selectedProjects.filter((id) => id !== projectId));
    }
  };

  const handleExport = async (project: Project) => {
    setExportingProjectId(project.id);
    setExportProgress(0);
    setExportStatus("Starting export...");

    try {
      if (!project.edits_json || project.edits_json.length === 0) {
        toast({
          title: "No segments defined",
          description: "This project has no segments to export.",
          variant: "destructive"
        });
        setExportingProjectId(null);
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
        const segmentProgress = 10 + (i / totalSegments) * 70;
        
        setExportStatus(`Processing segment ${i + 1} of ${totalSegments}...`);
        setExportProgress(segmentProgress);

        const trimmedBlob = await trimVideo(
          videoFile,
          segment.start_time,
          segment.end_time,
          formatSettings
        );

        if (!trimmedBlob) {
          throw new Error(`Failed to trim segment ${i + 1}`);
        }

        const filePath = `${visitorId}/${Date.now()}_segment_${i + 1}.mp4`;
        const { error: uploadError } = await supabase.storage
          .from('videos')
          .upload(filePath, trimmedBlob, {
            contentType: 'video/mp4',
            upsert: false
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('videos')
          .getPublicUrl(filePath);

        trimmedUrls.push(publicUrl);

        // Download the segment
        const downloadUrl = URL.createObjectURL(trimmedBlob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `${project.name}_segment_${i + 1}.mp4`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(downloadUrl);
      }

      // Save export record
      await supabase.from('exports').insert([{
        project_id: project.id,
        video_id: project.video_id,
        status: 'done' as const,
        format: 'mp4',
        aspect_ratio: formatSettings.aspectRatio,
        resolution: formatSettings.resolution,
        visitor_id: visitorId,
        is_visitor: true,
        output_urls: trimmedUrls.map((url, idx) => ({
          url,
          segment_index: idx,
          start_time: project.edits_json[idx].start_time,
          end_time: project.edits_json[idx].end_time,
        })),
      }]);

      setExportProgress(100);
      setExportStatus("Export complete!");
      
      toast({
        title: "Export completed!",
        description: `${project.edits_json.length} trimmed video(s) exported successfully!`
      });

      if (visitorId) {
        fetchDemoProjects(visitorId);
        fetchReportsData(visitorId);
      }

      setTimeout(() => {
        setExportProgress(0);
        setExportStatus("");
      }, 2000);
    } catch (error: any) {
      console.error('Export error:', error);
      toast({
        title: "Export failed",
        description: error.message || "An error occurred while exporting.",
        variant: "destructive"
      });
    } finally {
      setExportingProjectId(null);
    }
  };

  const handleDelete = async () => {
    if (!projectToDelete || !visitorId) return;

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectToDelete.id)
        .eq('visitor_id', visitorId);

      if (error) throw error;

      toast({
        title: "Project deleted",
        description: "Demo project has been deleted successfully.",
      });

      fetchDemoProjects(visitorId);
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive",
      });
    } finally {
      setProjectToDelete(null);
    }
  };

  const handleStartEditing = async (video: any) => {
    if (!visitorId) return;

    try {
      const { data: newProject, error } = await supabase
        .from('projects')
        .insert([{
          name: `Project - ${video.originalName}`,
          video_id: video.id,
          visitor_id: visitorId,
          is_visitor: true,
          edits_json: [],
          format_settings_json: {}
        }])
        .select()
        .single();

      if (error) throw error;

      if (newProject) {
        navigate(`/demo/editor/${newProject.id}`);
      }
    } catch (error: any) {
      console.error('Error creating project:', error);
      toast({
        title: "Failed to create project",
        description: error.message || "An error occurred",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-secondary w-full">
      <DemoDashboardSidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-foreground">Demo Projects & Reports</h1>
          </div>

          {/* Demo Banner */}
          <div className="mb-8">
            <VisitorBanner />
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
                      You don't have any demo projects yet. Upload a file to get started.
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
                          <TableHead className="w-12 text-[hsl(233,20%,69%)]">
                            <Checkbox 
                              checked={selectedProjects.length === currentProjects.length && currentProjects.length > 0} 
                              onCheckedChange={handleSelectAll} 
                            />
                          </TableHead>
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
                        {currentProjects.map((project) => (
                          <TableRow key={project.id} className="border-[hsl(228,20%,25%)] hover:bg-[hsl(228,24%,17%)]">
                            <TableCell>
                              <Checkbox 
                                checked={selectedProjects.includes(project.id)} 
                                onCheckedChange={(checked) => handleSelectProject(project.id, checked as boolean)} 
                              />
                            </TableCell>
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
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 hover:bg-[hsl(228,20%,25%)] text-[hsl(233,20%,69%)] hover:text-foreground" 
                                  onClick={() => navigate(`/demo/editor/${project.id}`)} 
                                  disabled={exportingProjectId === project.id}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 hover:bg-[hsl(228,20%,25%)] text-[hsl(233,20%,69%)] hover:text-foreground" 
                                  onClick={() => handleExport(project)} 
                                  disabled={exportingProjectId !== null}
                                >
                                  <UploadIcon className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 hover:bg-[hsl(228,20%,25%)] text-[hsl(0,84%,60%)] hover:text-[hsl(0,84%,70%)]" 
                                  onClick={() => setProjectToDelete(project)} 
                                  disabled={exportingProjectId === project.id}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}

              {/* Pagination */}
              {projects.length > 0 && shouldShowPagination && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-[hsl(233,20%,69%)] hover:text-foreground hover:bg-[hsl(228,20%,25%)]" 
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} 
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button 
                      key={page} 
                      variant="ghost" 
                      size="icon" 
                      className={`h-8 w-8 ${currentPage === page ? 'bg-primary text-primary-foreground border border-primary' : 'text-[hsl(233,20%,69%)] hover:text-foreground hover:bg-[hsl(228,20%,25%)]'}`} 
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-[hsl(233,20%,69%)] hover:text-foreground hover:bg-[hsl(228,20%,25%)]" 
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} 
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="reports" className="mt-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <StatsCard title="Total Projects" value={stats.totalProjects} icon={FolderOpen} />
                <StatsCard title="Total Videos" value={stats.totalVideos} icon={Video} />
                <StatsCard title="Completed Exports" value={stats.completedExports} icon={UploadIcon} />
              </div>

              {/* Activity and Chart Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <Card className="p-6 bg-card border-border">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
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

      {/* Export Progress */}
      {exportingProjectId && (
        <div className="fixed bottom-4 right-4 bg-card border border-border rounded-lg p-4 w-80 shadow-lg">
          <p className="text-sm font-medium mb-2">{exportStatus}</p>
          <Progress value={exportProgress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">{exportProgress}%</p>
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Upload Demo Video</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <VideoUploader 
              onStartEditing={(video) => {
                handleStartEditing(video);
                setUploadDialogOpen(false);
              }}
              visitorId={visitorId || undefined}
              disabled={exportingProjectId !== null}
              maxFileSize={50 * 1024 * 1024}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!projectToDelete} onOpenChange={() => setProjectToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Demo Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{projectToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 border border-destructive">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DemoProjectsReports;
