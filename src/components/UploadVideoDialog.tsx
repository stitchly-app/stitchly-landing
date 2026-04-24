import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { VideoUploader } from "@/components/VideoUploader";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

interface UploadVideoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UploadVideoDialog = ({ open, onOpenChange }: UploadVideoDialogProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);

  useState(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  });

  const handleStartEditing = async (video: UploadedVideo) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          user_id: user?.id,
          video_id: video.id,
          name: 'New Project'
        })
        .select()
        .single();

      if (error) throw error;

      onOpenChange(false);
      navigate(`/editor/${data.id}`);
    } catch (error: any) {
      console.error('Error creating project:', error);
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Upload Your Video</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <VideoUploader onStartEditing={handleStartEditing} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
