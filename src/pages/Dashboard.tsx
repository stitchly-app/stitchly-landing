import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Upload, FolderOpen, Video as VideoIcon, Upload as UploadIcon, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { UploadVideoDialog } from "@/components/UploadVideoDialog";
import { useAuditLog } from "@/hooks/useAuditLog";
import { useVideoEditor } from "@/hooks/useVideoEditor";
import { Progress } from "@/components/ui/progress";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

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
  videos?: {
    original_name: string;
    file_url: string;
    duration: number;
    thumbnail_url?: string | null;
  };
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [exportingProjectId, setExportingProjectId] = useState<string | null>(null);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStatus, setExportStatus] = useState("");
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalVideos: 0,
    completedExports: 0,
    teamMembers: 0,
  });
  const { toast } = useToast();
  const { logAction } = useAuditLog();
  const { trimVideo, loadFFmpeg, isFFmpegLoaded } = useVideoEditor();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate('/');
      } else {
        fetchDashboardData(session.user.id);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchDashboardData = async (userId: string) => {
    try {
      // Fetch projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select(`
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
            duration,
            thumbnail_url
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(3);

      if (projectsError) throw projectsError;
      setProjects((projectsData || []) as any);

      // Fetch stats
      const { count: projectCount } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      const { count: videoCount } = await supabase
        .from('videos')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      const { count: exportCount } = await supabase
        .from('exports')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'done')
        .in('project_id', projectsData?.map(p => p.id) || []);

      setStats({
        totalProjects: projectCount || 0,
        totalVideos: videoCount || 0,
        completedExports: exportCount || 0,
        teamMembers: 1,
      });
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' }) + ' ' +
           date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const handleExport = async (project: Project) => {
    setExportingProjectId(project.id);
    setExportProgress(0);
    setExportStatus("Starting export...");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to export videos",
          variant: "destructive",
        });
        return;
      }

      // Validate segments
      if (!project.edits_json || project.edits_json.length === 0) {
        toast({
          title: "No segments defined",
          description: "This project has no segments to export.",
          variant: "destructive"
        });
        return;
      }

      // Load FFmpeg if not already loaded
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
        description: "Downloading video file for processing.",
      });

      // Fetch video file
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

      // Process each segment
      for (let i = 0; i < totalSegments; i++) {
        const segment = project.edits_json[i];
        const segmentProgress = 10 + (i / totalSegments) * 70;
        
        setExportStatus(`Processing segment ${i + 1} of ${totalSegments}...`);
        setExportProgress(segmentProgress);
        
        const isDefaultFormat = formatSettings.aspectRatio === "16:9" && 
                               formatSettings.cropMode === "fit" && 
                               formatSettings.resolution === "1080p";

        toast({
          title: `Processing segment ${i + 1}/${totalSegments}`,
          description: isDefaultFormat 
            ? `Trimming from ${segment.start_time.toFixed(2)}s to ${segment.end_time.toFixed(2)}s` 
            : `Converting to ${formatSettings.aspectRatio} ${formatSettings.resolution} (${formatSettings.cropMode})`
        });

        const trimmedBlob = await trimVideo(
          videoFile, 
          segment.start_time, 
          segment.end_time, 
          formatSettings, 
          "quality"
        );

        if (!trimmedBlob) {
          throw new Error(`Failed to trim segment ${i + 1}`);
        }

        const uploadProgress = segmentProgress + (70 / totalSegments) * 0.5;
        setExportStatus(`Uploading segment ${i + 1} of ${totalSegments}...`);
        setExportProgress(uploadProgress);
        
        toast({
          title: `Uploading segment ${i + 1}/${totalSegments}`,
          description: "Saving to storage..."
        });

        const filePath = `${user.id}/${project.id}/trimmed_${Date.now()}_${i + 1}.mp4`;
        const { error: uploadError } = await supabase.storage
          .from('videos')
          .upload(filePath, trimmedBlob, {
            contentType: 'video/mp4',
            upsert: true
          });

        if (uploadError) {
          throw new Error(`Upload failed: ${uploadError.message}`);
        }

        const { data: { publicUrl } } = supabase.storage
          .from('videos')
          .getPublicUrl(filePath);

        trimmedUrls.push(publicUrl);
      }

      setExportStatus("Saving export record...");
      setExportProgress(85);
      
      // Validate project ownership before inserting export
      console.log('Export validation:', {
        userId: user.id,
        projectId: project.id,
        projectUserId: project.user_id
      });
      
      if (project.user_id !== user.id) {
        throw new Error('You do not have permission to export this project');
      }
      
      // Double-check project exists and belongs to user
      const { data: projectCheck } = await supabase
        .from('projects')
        .select('id, user_id')
        .eq('id', project.id)
        .eq('user_id', user.id)
        .single();
      
      if (!projectCheck) {
        throw new Error('Project ownership verification failed');
      }
      
      toast({
        title: "Finalizing export...",
        description: "Creating export record.",
      });

      const { data: exportData, error: exportError } = await supabase
        .from('exports')
        .insert([{
          project_id: project.id,
          video_id: project.video_id,
          status: 'done',
          format: 'mp4',
          aspect_ratio: formatSettings.aspectRatio,
          resolution: formatSettings.resolution,
          output_urls: trimmedUrls,
        }] as any)
        .select()
        .single();

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

      const { formatResolutionString } = await import('@/lib/videoFormatUtils');
      const resolutionStr = formatResolutionString(formatSettings);

      setExportStatus("Downloading segments...");
      setExportProgress(90);
      toast({
        title: "Downloading segments...",
        description: `Preparing ${trimmedUrls.length} segment${trimmedUrls.length > 1 ? 's' : ''} for download.`,
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
        description: trimmedUrls.length > 1 
          ? `${trimmedUrls.length} trimmed segments saved and downloaded!`
          : "Trimmed video saved and downloaded!"
      });

      fetchDashboardData(user.id);
      
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const videoUrl = project.videos!.file_url;
      const urlParts = videoUrl.split('/');
      const bucketPath = urlParts.slice(urlParts.indexOf('videos') + 1).join('/');

      const { error: projectError } = await supabase
        .from('projects')
        .delete()
        .eq('id', project.id);

      if (projectError) throw projectError;

      const { error: videoError } = await supabase
        .from('videos')
        .delete()
        .eq('id', project.video_id);

      if (videoError) throw videoError;

      const { error: storageError } = await supabase
        .storage
        .from('videos')
        .remove([bucketPath]);

      if (storageError) {
        console.error('Storage deletion error:', storageError);
      }

      await logAction({
        entity: 'project',
        action: 'deleted',
        entityId: project.id,
        payload: {
          name: project.name
        }
      });

      toast({
        title: "Project deleted",
        description: `"${project.name}" and its video have been permanently deleted.`
      });

      fetchDashboardData(user.id);
      setProjectToDelete(null);
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: "Delete failed",
        description: error.message || "An error occurred while deleting the project.",
        variant: "destructive"
      });
    }
  };

  const recentActivities = projects.slice(0, 4).map((project, index) => ({
    id: project.id,
    action: `Updated ${project.name}`,
    timestamp: formatDate(project.created_at),
  }));

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-secondary">
      <DashboardSidebar />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard</h1>
            <Button 
              className="bg-[#40CCB799] hover:bg-[#40CCB7]/90 text-white border border-[#40CCB7] w-full sm:w-auto"
              onClick={() => setUploadDialogOpen(true)}
            >
              New Upload
              <Upload className="h-4 w-4 ml-2" />
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
            <StatsCard title="Total Projects" value={stats.totalProjects} icon={FolderOpen} onClick={() => navigate('/projects-reports')} />
            <StatsCard title="Total Videos" value={stats.totalVideos} icon={VideoIcon} onClick={() => navigate('/projects-reports')} />
            <StatsCard title="Completed Exports" value={stats.completedExports} icon={UploadIcon} onClick={() => navigate('/projects-reports')} />
            <StatsCard title="Team Members" value={stats.teamMembers} icon={Users} onClick={() => navigate('/settings')} />
          </div>

          {/* Activity Feeds */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <ActivityFeed
              title="Your Activity"
              subtitle="Your latest actions"
              activities={recentActivities}
            />
            <ActivityFeed
              title="Team Activity"
              subtitle="Your team's latest actions"
              activities={recentActivities}
              showAvatar
            />
          </div>

          {/* Open Projects */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Open Projects</h2>
              <Button variant="secondary" onClick={() => navigate('/projects-reports')} className="w-full sm:w-auto text-sm sm:text-base">
                See All →
              </Button>
            </div>
            {exportingProjectId && (
              <div className="mb-6 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{exportStatus}</span>
                  <span className="text-muted-foreground">{exportProgress}%</span>
                </div>
                <Progress value={exportProgress} />
              </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  title={project.name}
                  thumbnail={project.videos?.thumbnail_url || project.videos?.file_url || "/placeholder.svg"}
                  duration={formatDuration(project.videos?.duration || 0)}
                  timestamp={formatDate(project.created_at)}
                  onEdit={() => navigate(`/editor/${project.id}`)}
                  onExport={() => handleExport(project)}
                  onDelete={() => setProjectToDelete(project)}
                />
              ))}
            </div>
          </div>
        </div>
      </main>

      <UploadVideoDialog 
        open={uploadDialogOpen} 
        onOpenChange={setUploadDialogOpen} 
      />

      <AlertDialog open={!!projectToDelete} onOpenChange={(open) => !open && setProjectToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{projectToDelete?.name}"? This action cannot be undone and will permanently delete the project and its associated video.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => projectToDelete && handleDeleteProject(projectToDelete)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard;
