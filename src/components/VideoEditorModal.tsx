import { useEffect, useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogAction } from '@/components/ui/alert-dialog';
import { useVideoEditor } from '@/hooks/useVideoEditor';
import { Loader2, Play, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface VideoEditorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoFile: File | null;
  onSave: (trimmedVideo: Blob) => Promise<void>;
}

export const VideoEditorModal = ({ open, onOpenChange, videoFile, onSave }: VideoEditorModalProps) => {
  const { trimVideo, generateThumbnails, isLoading, progress, error } = useVideoEditor();
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [duration, setDuration] = useState(0);
  const [range, setRange] = useState<[number, number]>([0, 0]);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [showError, setShowError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Format time to MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Load video and generate thumbnails
  useEffect(() => {
    if (videoFile && open) {
      // Create video URL
      const url = URL.createObjectURL(videoFile);
      setVideoUrl(url);

      // Get video duration
      const video = document.createElement('video');
      video.src = url;
      video.onloadedmetadata = () => {
        const dur = video.duration;
        setDuration(dur);
        setRange([0, dur]);
      };

      // Generate thumbnails
      generateThumbnails(videoFile, 10)
        .then(setThumbnails)
        .catch((err) => {
          console.error('Failed to generate thumbnails:', err);
          toast({
            title: 'Warning',
            description: 'Could not generate thumbnails, but you can still trim the video.',
            variant: 'destructive',
          });
        });

      return () => {
        URL.revokeObjectURL(url);
        thumbnails.forEach(thumb => URL.revokeObjectURL(thumb));
      };
    }
  }, [videoFile, open]);

  // Show error dialog
  useEffect(() => {
    if (error) {
      setShowError(true);
    }
  }, [error]);

  // Seek video when range changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = range[0];
    }
  }, [range[0]]);

  const handlePreview = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = range[0];
      videoRef.current.play();
      
      // Stop at end time
      const checkTime = setInterval(() => {
        if (videoRef.current && videoRef.current.currentTime >= range[1]) {
          videoRef.current.pause();
          clearInterval(checkTime);
        }
      }, 100);
    }
  };

  const handleSave = async () => {
    if (!videoFile) return;

    setIsSaving(true);
    try {
      toast({
        title: 'Processing',
        description: 'Trimming your video...',
      });

      const trimmedBlob = await trimVideo(videoFile, range[0], range[1]);
      
      toast({
        title: 'Uploading',
        description: 'Saving trimmed video...',
      });

      await onSave(trimmedBlob);
      
      toast({
        title: 'Success',
        description: 'Video trimmed and saved successfully!',
      });
      
      onOpenChange(false);
    } catch (err) {
      console.error('Failed to save:', err);
      toast({
        title: 'Error',
        description: 'Failed to save the trimmed video. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = range[0] !== 0 || range[1] !== duration;
  const selectedDuration = range[1] - range[0];

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Trim Video</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Video Player */}
            <div className="relative bg-black rounded-lg overflow-hidden">
              {videoUrl && (
                <video
                  ref={videoRef}
                  src={videoUrl}
                  controls
                  className="w-full"
                  style={{ maxHeight: '400px' }}
                />
              )}
            </div>

            {/* Thumbnail Strip */}
            {thumbnails.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {thumbnails.map((thumb, idx) => (
                  <img
                    key={idx}
                    src={thumb}
                    alt={`Thumbnail ${idx + 1}`}
                    className="h-16 rounded border border-border"
                  />
                ))}
              </div>
            )}

            {/* Info Cards */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground">From</div>
                  <div className="text-2xl font-semibold">{formatTime(range[0])}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground">Duration</div>
                  <div className="text-2xl font-semibold">{formatTime(selectedDuration)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground">To</div>
                  <div className="text-2xl font-semibold">{formatTime(range[1])}</div>
                </CardContent>
              </Card>
            </div>

            {/* Range Slider */}
            <div className="space-y-4">
              <div className="text-sm font-medium">Select Trim Range</div>
              <Slider
                min={0}
                max={duration}
                step={0.1}
                value={range}
                onValueChange={(value) => setRange(value as [number, number])}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatTime(0)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Progress Bar */}
            {(isLoading || isSaving) && (
              <div className="space-y-2">
                <Progress value={progress} />
                <p className="text-sm text-center text-muted-foreground">
                  {progress}% - {isSaving ? 'Saving...' : 'Processing...'}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={handlePreview}
                disabled={isLoading || isSaving}
              >
                <Play className="w-4 h-4 mr-2" />
                Preview Selection
              </Button>
              <Button
                onClick={handleSave}
                disabled={!hasChanges || isLoading || isSaving}
              >
                {(isLoading || isSaving) ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Trimmed Video
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Error Dialog */}
      <AlertDialog open={showError} onOpenChange={setShowError}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Error</AlertDialogTitle>
            <AlertDialogDescription>{error}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowError(false)}>
              Close
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
