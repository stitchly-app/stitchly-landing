import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { VideoUploader } from "@/components/VideoUploader";
import { Button } from "@/components/ui/button";
import { Video, Upload, FolderOpen, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useVideoEditor } from "@/hooks/useVideoEditor";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { DemoDashboardSidebar } from "@/components/DemoDashboardSidebar";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { VisitorBanner } from "@/components/VisitorBanner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface UploadedVideo {
  id: string;
  url: string;
  metadata: {
    duration: number;
    resolution: string;
    aspectRatio: string;
    size: number;
  };
  originalName: string;
}

const Demo = () => {
  const navigate = useNavigate();
  const [visitorProjects, setVisitorProjects] = useState<any[]>([]);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [exportingProjectId, setExportingProjectId] = useState<string | null>(null);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStatus, setExportStatus] = useState("");
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalVideos: 0,
    completedExports: 0,
    demoTimeLeft: "24h",
  });
  const { toast } = useToast();
  const { trimVideo, loadFFmpeg, isLoading, progress, isFFmpegLoaded } = useVideoEditor();

  useEffect(() => {
    // Initialize visitor ID if not exists
    let visitorId = localStorage.getItem('visitor_id');
    if (!visitorId) {
      visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      localStorage.setItem('visitor_id', visitorId);
      localStorage.setItem('visitor_started_at', new Date().toISOString());
      
      toast({
        title: "Demo mode activated!",
        description: "Try our video editor. Exports will be watermarked and deleted in 24h."
      });
    }
    
    fetchVisitorProjects();
  }, []);

  const handleStartEditing = async (video: UploadedVideo) => {
    // Create a new project for this video
    const visitorId = localStorage.getItem('visitor_id');
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

  const fetchVisitorProjects = async () => {
    const visitorId = localStorage.getItem('visitor_id');
    if (!visitorId) return;
    
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          id,
          name,
          video_id,
          edits_json,
          format_settings_json,
          created_at,
          videos (
            original_name,
            file_url,
            duration,
            resolution,
            thumbnail_url
          ),
          exports (
            id,
            status,
            output_urls,
            format,
            completed_at
          )
        `)
        .eq('visitor_id', visitorId)
        .eq('is_visitor', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVisitorProjects(data || []);

      // Calculate stats
      const completedExports = (data || []).filter((p: any) => 
        p.exports && p.exports.some((e: any) => e.status === 'done')
      ).length;

      const uniqueVideos = new Set((data || []).map((p: any) => p.video_id));

      setStats({
        totalProjects: data?.length || 0,
        totalVideos: uniqueVideos.size,
        completedExports,
        demoTimeLeft: "24h",
      });
    } catch (error: any) {
      console.error('Error fetching visitor projects:', error);
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

  const handleEditProject = (project: any) => {
    navigate(`/demo/editor/${project.id}`);
  };

  const handleDeleteProject = async (projectId: string, projectName: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;

      toast({
        title: "Project deleted",
        description: `"${projectName}" has been removed successfully.`
      });

      fetchVisitorProjects();
    } catch (error: any) {
      console.error('Delete project error:', error);
      toast({
        title: "Failed to delete project",
        description: error.message || "An error occurred while deleting the project.",
        variant: "destructive"
      });
    }
  };

  const handleExportProject = async (project: any) => {
    setExportingProjectId(project.id);
    setExportProgress(0);
    setExportStatus("Initializing export...");

    try {
      const visitorId = localStorage.getItem('visitor_id');
      
      if (!project.edits_json || project.edits_json.length === 0) {
        toast({
          title: "No segments defined",
          description: "This project has no segments to export.",
          variant: "destructive"
        });
        setExportingProjectId(null);
        return;
      }

      // Wait for FFmpeg to load if not already loaded
      if (!isFFmpegLoaded) {
        console.log('[Export] FFmpeg not loaded, initializing...');
        setExportStatus("Loading video editor...");
        toast({
          title: "Loading video editor",
          description: "Initializing FFmpeg library..."
        });
        
        const loaded = await loadFFmpeg();
        if (!loaded) {
          throw new Error('Failed to initialize video editor');
        }
        console.log('[Export] FFmpeg loaded successfully');
      }

      console.log('[Export] Starting export process for', project.edits_json.length, 'segments');
      
      setExportStatus(`Processing ${project.edits_json.length} video segment(s)...`);
      toast({
        title: "Starting export",
        description: `Processing ${project.edits_json.length} video segment(s)...`
      });

      // Fetch the original video file
      const videoUrl = project.videos?.file_url;
      if (!videoUrl) {
        throw new Error("Video URL not found");
      }

      const response = await fetch(videoUrl);
      const videoBlob = await response.blob();
      const videoFile = new File([videoBlob], project.videos?.original_name || 'video.mp4', { 
        type: 'video/mp4' 
      });

      const trimmedVideoUrls: string[] = [];

      // Process each segment
      for (let i = 0; i < project.edits_json.length; i++) {
        const segment = project.edits_json[i];
        
        const segmentProgress = ((i + 1) / project.edits_json.length) * 100;
        setExportProgress(segmentProgress);
        setExportStatus(`Trimming segment ${i + 1}/${project.edits_json.length} (${segment.start_time.toFixed(2)}s - ${segment.end_time.toFixed(2)}s)`);
        
        toast({
          title: `Trimming segment ${i + 1}/${project.edits_json.length}`,
          description: `From ${segment.start_time.toFixed(2)}s to ${segment.end_time.toFixed(2)}s`
        });

        // Trim and reformat the video segment with format settings
        const formatSettings = project.format_settings_json && 
          Object.keys(project.format_settings_json).length > 0
          ? {
              aspectRatio: project.format_settings_json.aspectRatio || "16:9",
              cropMode: project.format_settings_json.cropMode || "fit",
              resolution: project.format_settings_json.resolution || "1080p"
            }
          : undefined;

        const trimmedBlob = await trimVideo(
          videoFile,
          segment.start_time,
          segment.end_time,
          formatSettings
        );

        // Upload trimmed segment to storage
        const fileName = `${visitorId}/${Date.now()}_segment_${i + 1}.mp4`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('videos')
          .upload(fileName, trimmedBlob, {
            contentType: 'video/mp4',
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('videos')
          .getPublicUrl(fileName);

        trimmedVideoUrls.push(publicUrl);

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

      // Save export record to database
      const { error: exportError } = await supabase
        .from('exports')
        .insert([{
          project_id: project.id,
          video_id: project.video_id,
          status: 'done' as const,
          format: 'mp4',
          aspect_ratio: project.format_settings_json?.aspectRatio || '16:9',
          resolution: project.format_settings_json?.resolution || '1080p',
          visitor_id: visitorId,
          is_visitor: true,
          output_urls: trimmedVideoUrls.map((url, idx) => ({
            url,
            segment_index: idx,
            start_time: project.edits_json[idx].start_time,
            end_time: project.edits_json[idx].end_time,
          })),
        }]);

      if (exportError) throw exportError;

      setExportProgress(100);
      setExportStatus("Export completed!");
      
      toast({
        title: "Export completed!",
        description: `${project.edits_json.length} trimmed video(s) exported and downloaded successfully!`
      });

      fetchVisitorProjects();
    } catch (error: any) {
      console.error('[Export] Export error:', error);
      console.error('[Export] Error stack:', error.stack);
      toast({
        title: "Export failed",
        description: error.message || "An error occurred while exporting.",
        variant: "destructive"
      });
    } finally {
      setExportingProjectId(null);
      setExportProgress(0);
      setExportStatus("");
    }
  };

  const getLatestExport = (exports: any[]) => {
    if (!exports || exports.length === 0) return null;
    return exports.sort((a: any, b: any) => 
      new Date(b.completed_at || 0).getTime() - new Date(a.completed_at || 0).getTime()
    )[0];
  };

  const recentActivities = visitorProjects.slice(0, 5).map((project) => ({
    id: project.id,
    action: `Created ${project.name}`,
    timestamp: formatDate(project.created_at),
  }));

  return (
    <div className="flex h-screen overflow-hidden bg-secondary w-full">
      <DemoDashboardSidebar />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-foreground">Demo Dashboard</h1>
            <Button 
              className="bg-[#40CCB799] hover:bg-[#40CCB7]/90 text-white border border-[#40CCB7]"
              onClick={() => setUploadDialogOpen(true)}
            >
              New Upload
              <Upload className="h-4 w-4 ml-2" />
            </Button>
          </div>

          {/* Demo Banner */}
          <div className="mb-8">
            <VisitorBanner />
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Projects"
              value={stats.totalProjects}
              icon={FolderOpen}
            />
            <StatsCard
              title="Total Videos"
              value={stats.totalVideos}
              icon={Video}
            />
            <StatsCard
              title="Completed Exports"
              value={stats.completedExports}
              icon={Upload}
            />
            <StatsCard
              title="Demo Time Left"
              value={stats.demoTimeLeft}
              icon={Clock}
            />
          </div>

          {/* Activity Feed */}
          {recentActivities.length > 0 && (
            <div className="grid grid-cols-1 gap-6 mb-8">
              <ActivityFeed
                title="Recent Activity"
                subtitle="Your latest demo actions"
                activities={recentActivities}
                showAvatar={false}
              />
            </div>
          )}

          {/* Export Progress */}
          {exportingProjectId && (
            <Card className="p-6 bg-primary/5 border-primary/20 mb-8">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Exporting Video</h3>
                  <Badge variant="secondary">{Math.round(exportProgress)}%</Badge>
                </div>
                <Progress value={exportProgress} className="h-2" />
                <p className="text-sm text-muted-foreground">{exportStatus}</p>
                <p className="text-sm font-medium text-primary">⚠️ Do not close this window until the export is complete.</p>
              </div>
            </Card>
          )}

          {/* Demo Projects Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-foreground">Demo Projects</h2>
              <span className="text-sm text-muted-foreground">
                {visitorProjects.length} {visitorProjects.length === 1 ? 'project' : 'projects'}
              </span>
            </div>

            {visitorProjects.length === 0 ? (
              <Card className="p-12 text-center">
                <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No demo projects yet</h3>
                <p className="text-muted-foreground mb-4">
                  Upload a video to get started with your first demo project
                </p>
                <Button onClick={() => setUploadDialogOpen(true)}>
                  Upload Video
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {visitorProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    title={project.name}
                    thumbnail={project.videos?.thumbnail_url || project.videos?.file_url || "/placeholder.svg"}
                    duration={project.videos?.duration ? formatDuration(project.videos.duration) : "0:00"}
                    timestamp={formatDate(project.created_at)}
                    onEdit={() => handleEditProject(project)}
                    onExport={() => handleExportProject(project)}
                    onDelete={() => handleDeleteProject(project.id, project.name)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

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
              visitorId={localStorage.getItem('visitor_id') || undefined}
              disabled={exportingProjectId !== null}
              maxFileSize={50 * 1024 * 1024}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Demo;
