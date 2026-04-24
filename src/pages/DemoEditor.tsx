import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { VideoEditor } from "@/components/video-editor/VideoEditor";
import { Button } from "@/components/ui/button";
import { Video, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useBrandName } from "@/hooks/useBrandName";

interface EditingProject {
  projectId?: string;
  videoId: string;
  videoUrl: string;
  duration: number;
  originalName: string;
  resolution?: string;
  projectName?: string;
  edits?: { start_time: number; end_time: number }[];
  formatSettings?: any;
}

const DemoEditor = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [project, setProject] = useState<EditingProject | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { brandName, logoUrl } = useBrandName();

  useEffect(() => {
    const loadProject = async () => {
      if (!projectId) {
        toast({
          title: "Error",
          description: "No project ID provided",
          variant: "destructive"
        });
        navigate('/demo');
        return;
      }

      const visitorId = localStorage.getItem('visitor_id');
      if (!visitorId) {
        toast({
          title: "Session expired",
          description: "Please start a new demo session",
          variant: "destructive"
        });
        navigate('/demo');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('projects')
          .select(`
            id,
            name,
            video_id,
            edits_json,
            format_settings_json,
            videos (
              original_name,
              file_url,
              duration,
              resolution
            )
          `)
          .eq('id', projectId)
          .eq('visitor_id', visitorId)
          .eq('is_visitor', true)
          .single();

        if (error) throw error;

        if (!data) {
          toast({
            title: "Project not found",
            description: "This project doesn't exist or you don't have access to it.",
            variant: "destructive"
          });
          navigate('/demo');
          return;
        }

        setProject({
          projectId: data.id,
          videoId: data.video_id,
          videoUrl: data.videos?.file_url || '',
          duration: data.videos?.duration || 0,
          originalName: data.videos?.original_name || '',
          resolution: data.videos?.resolution,
          projectName: data.name,
          edits: data.edits_json as { start_time: number; end_time: number }[] || [],
          formatSettings: data.format_settings_json as any || {}
        });
      } catch (error: any) {
        console.error('Error loading project:', error);
        toast({
          title: "Failed to load project",
          description: error.message || "An error occurred",
          variant: "destructive"
        });
        navigate('/demo');
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [projectId, navigate, toast]);

  const handleBack = () => {
    navigate('/demo');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {logoUrl && <img src={logoUrl} alt="Logo" className="h-6 w-6 object-contain" />}
            <Video className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">{brandName} - Demo</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              <Clock className="h-4 w-4 inline mr-1" />
              Demo expires in 24h
            </span>
            <Button onClick={() => navigate('/auth')}>
              Sign Up for Full Access
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <VideoEditor
            videoId={project.videoId}
            videoUrl={project.videoUrl}
            duration={project.duration}
            originalName={project.originalName}
            originalResolution={project.resolution}
            projectId={project.projectId}
            initialEdits={project.edits}
            initialProjectName={project.projectName}
            initialFormatSettings={project.formatSettings}
            onBack={handleBack}
            visitorId={localStorage.getItem('visitor_id') || undefined}
          />
        </div>
      </main>
    </div>
  );
};

export default DemoEditor;
