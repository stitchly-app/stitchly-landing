import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { VideoEditor } from "@/components/video-editor/VideoEditor";
import { useToast } from "@/hooks/use-toast";
import { DashboardSidebar } from "@/components/DashboardSidebar";

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

const Editor = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [project, setProject] = useState<EditingProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Authenticating...');
  const { toast } = useToast();

  useEffect(() => {
    const loadProjectWithRetry = async (userId: string, retryCount = 0): Promise<boolean> => {
      const maxRetries = 3;
      const delays = [500, 1000, 1500];

      if (import.meta.env.DEV) {
        console.log(`[Editor] Loading project attempt ${retryCount + 1}/${maxRetries + 1}`, { projectId, userId });
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
          .eq('user_id', userId)
          .maybeSingle();

        if (error) {
          console.error('[Editor] Query error:', error);
          throw error;
        }

        if (!data) {
          if (import.meta.env.DEV) {
            console.log('[Editor] No data returned, retry count:', retryCount);
          }

          // Retry if we haven't exhausted attempts
          if (retryCount < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, delays[retryCount]));
            return loadProjectWithRetry(userId, retryCount + 1);
          }

          // All retries exhausted
          return false;
        }

        // Success - set project data
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

        return true;
      } catch (error: any) {
        console.error('[Editor] Error loading project:', error);
        throw error;
      }
    };

    const initializeEditor = async () => {
      if (!projectId) {
        navigate('/dashboard');
        return;
      }

      try {
        setLoadingMessage('Authenticating...');
        
        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          if (import.meta.env.DEV) {
            console.log('[Editor] Auth failed, redirecting to /auth', authError);
          }
          navigate('/auth');
          return;
        }

        if (import.meta.env.DEV) {
          console.log('[Editor] Auth successful, user ID:', user.id);
        }

        setLoadingMessage('Loading project...');

        // Load project with retry logic
        const success = await loadProjectWithRetry(user.id);

        if (!success) {
          toast({
            title: "Project not found",
            description: "This project doesn't exist or you don't have access to it.",
            variant: "destructive"
          });
          navigate('/dashboard');
        }
      } catch (error: any) {
        console.error('[Editor] Initialization error:', error);
        toast({
          title: "Failed to load project",
          description: error.message || "An error occurred",
          variant: "destructive"
        });
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    initializeEditor();
  }, [projectId, navigate, toast]);

  const handleBack = () => {
    navigate('/dashboard');
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut({ scope: 'local' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">{loadingMessage}</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-secondary">
      <DashboardSidebar />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="max-w-6xl mx-auto">
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
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Editor;
