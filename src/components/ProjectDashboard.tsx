import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Download, Play, Upload, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useUserRole } from "@/hooks/useUserRole";
import { VisitorBanner } from "./VisitorBanner";
import { useAuditLog } from "@/hooks/useAuditLog";
import { useVideoEditor } from "@/hooks/useVideoEditor";
import { Progress } from "@/components/ui/progress";

interface FormatSettings {
  aspectRatio: "16:9" | "9:16" | "1:1";
  cropMode: "fit" | "fill";
  resolution: "480p" | "720p" | "1080p" | "1440p" | "4k";
}

interface Project {
  id: string;
  name: string;
  video_id: string;
  edits_json: any;
  format_settings_json: FormatSettings;
  created_at: string;
  videos: {
    original_name: string;
    file_url: string;
    duration: number;
  };
  exports: {
    status: string;
    output_urls?: any;
    format: string;
  }[];
}

interface ProjectDashboardProps {
  onEditProject: (project: Project) => void;
  onNewUpload: () => void;
  exportingProjectId: string | null;
  setExportingProjectId: (id: string | null) => void;
  exportProgress: number;
  setExportProgress: (progress: number) => void;
  exportStatus: string;
  setExportStatus: (status: string) => void;
}

export const ProjectDashboard = ({ 
  onEditProject, 
  onNewUpload,
  exportingProjectId,
  setExportingProjectId,
  exportProgress,
  setExportProgress,
  exportStatus,
  setExportStatus
}: ProjectDashboardProps) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { role, isVisitor, isUser, isAdmin } = useUserRole();
  const { logAction } = useAuditLog();
  const { trimVideo, loadFFmpeg, isFFmpegLoaded } = useVideoEditor();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

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
            resolution
          ),
          exports (
            id,
            status,
            output_urls,
            format,
            completed_at
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects((data || []) as unknown as Project[]);
    } catch (error: any) {
      toast({
        title: "Failed to load projects",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
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
      const response = await fetch(project.videos.file_url);
      const blob = await response.blob();
      const videoFile = new File([blob], project.videos.original_name, {
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
        const segmentProgress = 10 + (i / totalSegments) * 70; // Progress from 10% to 80%
        
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

        // Trim the video with format settings
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

        // Upload to storage
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
      toast({
        title: "Finalizing export...",
        description: "Creating export record.",
      });

      // Create export record with trimmed video URLs
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

      // Log export action
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

      // Download all trimmed segments automatically with format info in filename
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
        
        // Fetch the video as a blob to force download instead of opening
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
          
          // Clean up blob URL after download
          setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
        }, i * 500); // Stagger downloads
      }

      setExportProgress(100);
      setExportStatus("Export complete!");
      
      toast({
        title: "Export completed",
        description: trimmedUrls.length > 1 
          ? `${trimmedUrls.length} trimmed segments saved and downloaded!`
          : "Trimmed video saved and downloaded!"
      });

      fetchProjects();
      
      // Reset progress after a short delay
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

      // Get the video file path from the URL
      const videoUrl = project.videos.file_url;
      const urlParts = videoUrl.split('/');
      const bucketPath = urlParts.slice(urlParts.indexOf('videos') + 1).join('/');

      // Delete the project (this will cascade delete exports due to foreign key)
      const { error: projectError } = await supabase
        .from('projects')
        .delete()
        .eq('id', project.id);

      if (projectError) throw projectError;

      // Delete the video record
      const { error: videoError } = await supabase
        .from('videos')
        .delete()
        .eq('id', project.video_id);

      if (videoError) throw videoError;

      // Delete the video file from storage
      const { error: storageError } = await supabase
        .storage
        .from('videos')
        .remove([bucketPath]);

      if (storageError) {
        console.error('Storage deletion error:', storageError);
        // Don't throw here - project and DB record are already deleted
      }

      // Log deletion
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

      fetchProjects();
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: "Delete failed",
        description: error.message || "An error occurred while deleting the project.",
        variant: "destructive"
      });
    }
  };

  const getExportStatus = (exports: any[]) => {
    if (!exports || exports.length === 0) return null;
    // Get most recent export
    const latest = exports.sort((a, b) => 
      new Date(b.completed_at || 0).getTime() - new Date(a.completed_at || 0).getTime()
    )[0];
    return latest;
  };

  const getLatestExport = (exports: any[]) => {
    if (!exports || exports.length === 0) return null;
    return exports.sort((a, b) => 
      new Date(b.completed_at || 0).getTime() - new Date(a.completed_at || 0).getTime()
    )[0];
  };

  const getSegmentsCount = (editsJson: any[]) => {
    return Array.isArray(editsJson) ? editsJson.length : 0;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </Card>
    );
  }

  if (projects.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="space-y-4">
          <div className="flex justify-center">
            <Upload className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold">No projects yet</h3>
          <p className="text-muted-foreground">
            Upload your first video to get started
          </p>
          <Button onClick={onNewUpload} className="gap-2">
            <Upload className="h-4 w-4" />
            Upload Video
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <>
      {isVisitor && <VisitorBanner />}
      
      <Card className="p-6 mt-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">My Projects</h2>
          <Button onClick={onNewUpload} disabled={exportingProjectId !== null} className="gap-2">
            <Upload className="h-4 w-4" />
            New Upload
          </Button>
        </div>

        <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project Name</TableHead>
              <TableHead>Video</TableHead>
              <TableHead>Segments</TableHead>
              <TableHead>Format</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => (
              <TableRow key={project.id}>
                <TableCell className="font-medium">{project.name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <a
                      href={project.videos.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline flex items-center gap-1 text-sm text-muted-foreground"
                    >
                      <Play className="h-3 w-3" />
                      {project.videos.original_name}
                    </a>
                  </div>
                </TableCell>
                <TableCell>{getSegmentsCount(project.edits_json)}</TableCell>
                <TableCell>
                  MP4
                </TableCell>
                <TableCell>
                  {(() => {
                    const latestExport = getLatestExport(project.exports);
                    if (!latestExport) {
                      return <span className="text-sm text-muted-foreground">Not exported</span>;
                    }
                    return (
                      <Badge
                        variant={
                          latestExport.status === 'done'
                            ? 'default'
                            : latestExport.status === 'failed'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {latestExport.status}
                      </Badge>
                    );
                  })()}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(project.created_at)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditProject(project)}
                      disabled={exportingProjectId !== null}
                      className="gap-2"
                    >
                      <Edit className="h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExport(project)}
                      disabled={exportingProjectId !== null}
                      className="gap-2"
                    >
                      <Download className="h-3 w-3" />
                      {exportingProjectId === project.id ? 'Processing...' : 'Export'}
                    </Button>
                    {!isVisitor && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={exportingProjectId !== null}
                            className="gap-2 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete project?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete "{project.name}" and its associated video file. 
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteProject(project)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
      </Card>
    </>
  );
};
