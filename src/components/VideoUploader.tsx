import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Video, Edit, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuditLog } from "@/hooks/useAuditLog";
import { generateVideoThumbnail } from "@/lib/thumbnailUtils";
interface VideoMetadata {
  duration: number;
  resolution: string;
  aspectRatio: string;
  size: number;
}
interface UploadedVideo {
  id: string;
  url: string;
  metadata: VideoMetadata;
  originalName: string;
}
interface VideoUploaderProps {
  onStartEditing?: (video: UploadedVideo) => void;
  visitorId?: string;
  disabled?: boolean;
  maxFileSize?: number;
}
const DEFAULT_MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_FORMATS = ['video/mp4', 'video/webm'];

// Sanitize filename to remove non-ASCII characters and make it storage-safe
const sanitizeFileName = (fileName: string): string => {
  const extension = fileName.substring(fileName.lastIndexOf('.'));
  const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));

  // Replace non-ASCII characters with hyphens, remove special chars except - and _
  const sanitized = nameWithoutExt.normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove diacritics
  .replace(/[^\w\s-]/g, '') // Remove special chars except word chars, spaces, hyphens
  .replace(/\s+/g, '-') // Replace spaces with hyphens
  .replace(/[^a-zA-Z0-9-_]/g, '') // Keep only ASCII alphanumeric, hyphens, underscores
  .replace(/-+/g, '-') // Replace multiple hyphens with single
  .substring(0, 100); // Limit length

  return sanitized + extension;
};
export const VideoUploader = ({
  onStartEditing,
  visitorId,
  disabled = false,
  maxFileSize = DEFAULT_MAX_FILE_SIZE
}: VideoUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedVideo, setUploadedVideo] = useState<UploadedVideo | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [fileSize, setFileSize] = useState<number>(0);
  const {
    toast
  } = useToast();
  const {
    logAction
  } = useAuditLog();
  const extractMetadata = (file: File, videoElement: HTMLVideoElement): Promise<VideoMetadata> => {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      videoElement.src = url;
      videoElement.onloadedmetadata = () => {
        const duration = videoElement.duration;
        const width = videoElement.videoWidth;
        const height = videoElement.videoHeight;
        const resolution = `${width}x${height}`;

        // Calculate aspect ratio
        const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
        const divisor = gcd(width, height);
        const aspectRatio = `${width / divisor}:${height / divisor}`;
        URL.revokeObjectURL(url);
        resolve({
          duration,
          resolution,
          aspectRatio,
          size: file.size
        });
      };
      videoElement.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Failed to load video metadata"));
      };
    });
  };
  const validateFile = (file: File): boolean => {
    if (!ALLOWED_FORMATS.includes(file.type)) {
      toast({
        title: "Invalid format",
        description: "Only MP4 and WebM formats are supported.",
        variant: "destructive"
      });
      return false;
    }
    if (file.size > maxFileSize) {
      const maxSizeMB = Math.round(maxFileSize / (1024 * 1024));
      const demoText = visitorId ? " for demo mode" : "";
      toast({
        title: "File too large",
        description: `Maximum file size is ${maxSizeMB}MB${demoText}.`,
        variant: "destructive"
      });
      return false;
    }

    // Check for non-ASCII characters in filename
    const hasNonASCII = /[^\x00-\x7F]/.test(file.name);
    if (hasNonASCII) {
      toast({
        title: "Filename contains special characters",
        description: "The file will be renamed for compatibility during upload.",
        duration: 3000
      });
    }
    return true;
  };
  const uploadVideo = async (file: File) => {
    if (!validateFile(file)) return;
    setUploading(true);
    setProgress(0);
    setFileSize(file.size);
    try {
      console.log('Starting upload process...');

      // Check if user is authenticated OR if visitor ID is provided
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      const isVisitor = !!visitorId && !user;
      if (!user && !visitorId) {
        toast({
          title: "Authentication required",
          description: "Please sign in to upload videos.",
          variant: "destructive"
        });
        setUploading(false);
        return;
      }
      const userId = isVisitor ? visitorId : user!.id;
      console.log(isVisitor ? 'Visitor mode:' : 'User authenticated:', userId);
      setProgress(10);

      // Extract metadata first
      console.log('Extracting metadata...');
      const videoElement = document.createElement('video');
      videoElement.preload = 'metadata';
      const metadata = await extractMetadata(file, videoElement);
      console.log('Metadata extracted:', metadata);
      setProgress(30);

      // Upload to storage with sanitized filename
      console.log('Uploading to storage...');
      const sanitizedName = sanitizeFileName(file.name);
      const fileName = `${userId}/${Date.now()}-${sanitizedName}`;
      console.log('Original filename:', file.name, 'Sanitized:', sanitizedName);
      console.log('File size:', file.size, 'bytes (', (file.size / (1024 * 1024)).toFixed(2), 'MB)');
      setProgress(50);
      const {
        data: uploadData,
        error: uploadError
      } = await supabase.storage.from('videos').upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });
      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        console.error('Error details:', JSON.stringify(uploadError, null, 2));
        throw new Error(`Upload failed: ${uploadError.message}`);
      }
      console.log('Upload successful:', uploadData);
      setProgress(70);

      // Get public URL
      const {
        data: {
          publicUrl
        }
      } = supabase.storage.from('videos').getPublicUrl(fileName);
      console.log('Public URL:', publicUrl);
      setProgress(80);

      // Generate thumbnail
      console.log('Generating thumbnail...');
      let thumbnailUrl: string | null = null;
      try {
        const thumbnailBlob = await generateVideoThumbnail(file, 1);
        console.log('Thumbnail generated, size:', thumbnailBlob.size);
        const thumbnailFileName = `${userId}/${Date.now()}-thumbnail.jpg`;
        const {
          data: thumbnailUploadData,
          error: thumbnailError
        } = await supabase.storage.from('videos').upload(thumbnailFileName, thumbnailBlob, {
          contentType: 'image/jpeg',
          cacheControl: '3600'
        });
        if (thumbnailError) {
          console.error('Thumbnail upload error:', thumbnailError);
          toast({
            title: "Thumbnail upload failed",
            description: thumbnailError.message,
            variant: "destructive"
          });
        } else {
          const {
            data: {
              publicUrl: thumbUrl
            }
          } = supabase.storage.from('videos').getPublicUrl(thumbnailFileName);
          thumbnailUrl = thumbUrl;
          console.log('Thumbnail uploaded successfully:', thumbnailUrl);
        }
      } catch (thumbnailError: any) {
        console.error('Error generating thumbnail:', thumbnailError);
        toast({
          title: "Thumbnail generation failed",
          description: thumbnailError.message || "Could not generate thumbnail",
          variant: "destructive"
        });
        // Continue without thumbnail - it's not critical
      }
      console.log('Final thumbnailUrl value:', thumbnailUrl);
      setProgress(85);

      // For visitors: save to database with visitor_id
      if (isVisitor) {
        console.log('Visitor mode:', visitorId);
        const {
          data: videoRecord,
          error: dbError
        } = await supabase.from('videos').insert({
          file_url: publicUrl,
          original_name: file.name,
          duration: metadata.duration,
          resolution: metadata.resolution,
          aspect_ratio: metadata.aspectRatio,
          size: metadata.size,
          thumbnail_url: thumbnailUrl,
          user_id: null,
          // NULL for visitors
          visitor_id: visitorId,
          is_visitor: true
        }).select().single();
        if (dbError) {
          console.error('Error creating visitor video record:', dbError);
          throw dbError;
        }
        setProgress(100);
        setUploadedVideo({
          id: videoRecord.id,
          url: publicUrl,
          metadata,
          originalName: file.name
        });
        toast({
          title: "Demo upload successful",
          description: "Your video is saved temporarily. Sign up to save your projects permanently.",
          duration: 5000
        });
      } else {
        // For authenticated users, save to database
        console.log('Saving to database...');
        const videoData = {
          file_url: publicUrl,
          original_name: file.name,
          duration: metadata.duration,
          resolution: metadata.resolution,
          aspect_ratio: metadata.aspectRatio,
          size: metadata.size,
          thumbnail_url: thumbnailUrl,
          status: 'uploaded' as const,
          user_id: user!.id,
          is_visitor: false
        };
        const {
          data: videoRecord,
          error: dbError
        } = await supabase.from('videos').insert([videoData]).select().single();
        if (dbError) {
          console.error('Database error:', dbError);
          throw dbError;
        }
        console.log('Database record created:', videoRecord);
        setProgress(100);
        setUploadedVideo({
          id: videoRecord.id,
          url: publicUrl,
          metadata,
          originalName: file.name
        });

        // Log the video upload
        await logAction({
          entity: 'video',
          action: 'created',
          entityId: videoRecord.id,
          payload: {
            original_name: file.name,
            size: metadata.size,
            resolution: metadata.resolution
          }
        });
        toast({
          title: "Upload successful",
          description: "Your video has been uploaded successfully."
        });
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload video. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadVideo(e.dataTransfer.files[0]);
    }
  }, []);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      uploadVideo(e.target.files[0]);
    }
  };
  const clearVideo = () => {
    setUploadedVideo(null);
  };
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  const formatFileSize = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };
  if (uploadedVideo) {
    return <div className="space-y-6">
        {/* Upload Complete Indicator */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <CheckCircle2 className="h-8 w-8 text-[#40CCB7]" />
          <h3 className="text-2xl font-semibold">Upload Complete</h3>
        </div>

        {/* Video Preview */}
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden border-2 border-border">
          <video src={uploadedVideo.url} controls className="w-full h-full object-contain" />
        </div>

        {/* Video Metadata Grid */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-6 p-6 bg-card rounded-lg border border-border">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">File Name</p>
            <p className="font-medium text-base truncate">{uploadedVideo.originalName}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Duration</p>
            <p className="font-medium text-base">{formatDuration(uploadedVideo.metadata.duration)}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Resolution</p>
            <p className="font-medium text-base">{uploadedVideo.metadata.resolution}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Aspect Ratio</p>
            <p className="font-medium text-base">{uploadedVideo.metadata.aspectRatio}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Format</p>
            <p className="font-medium text-base">{uploadedVideo.originalName.split('.').pop()?.toUpperCase()}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Size</p>
            <p className="font-medium text-base">{formatFileSize(uploadedVideo.metadata.size)}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end pt-4">
          <Button variant="secondary" size="lg" onClick={clearVideo} disabled={disabled} className="px-8">
            Back to Dashboard
          </Button>
          {onStartEditing && <Button size="lg" onClick={() => onStartEditing(uploadedVideo)} disabled={disabled} className="px-8 bg-[#40CCB799] hover:bg-[#40CCB7]/90 text-white border border-[#40CCB7]">
              Go to Editor
            </Button>}
        </div>
      </div>;
  }
  return <div className={`relative border-2 border-dashed rounded-lg p-12 transition-colors ${dragActive ? 'border-primary bg-accent' : 'border-[#40CCB7]'}`} onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}>
      <input type="file" id="video-upload" className="hidden" accept="video/mp4,video/webm" onChange={handleChange} disabled={uploading} />

      {uploading ? <div className="text-center space-y-4">
          <Video className="mx-auto h-12 w-12 text-primary animate-pulse" />
          <div className="space-y-2">
            <p className="text-sm font-medium">Uploading video...</p>
            <Progress value={progress} className="w-full" />
            <p className="text-xs text-muted-foreground">{Math.round(progress)}%</p>
            <p className="text-xs text-muted-foreground mt-2">
              {formatFileSize(fileSize)} • This may take a few minutes for large files
            </p>
          </div>
        </div> : <div className="text-center space-y-4">
          <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Upload your video</h3>
            
            <p className="text-xs text-muted-foreground my-[20px]">
              Supports MP4 and WebM • Max size {Math.round(maxFileSize / (1024 * 1024))}MB
            </p>
          </div>
          <label htmlFor="video-upload">
            <Button type="button" onClick={() => document.getElementById('video-upload')?.click()} disabled={disabled} className="my-[20px]">
              Choose File
            </Button>
          </label>
        </div>}
    </div>;
};