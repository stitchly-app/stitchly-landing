import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Play, Pause, Save, ArrowLeft, Plus, Trash2, Edit2, Monitor, Download } from "lucide-react";
import { useVideoEditor } from "@/hooks/useVideoEditor";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Timeline } from "./Timeline";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { useUserRole } from "@/hooks/useUserRole";
import { VisitorBanner } from "../VisitorBanner";
import { useAuditLog } from "@/hooks/useAuditLog";
interface Segment {
  id: string;
  start_time: number;
  end_time: number;
}
interface FormatSettings {
  aspectRatio: "16:9" | "9:16" | "1:1";
  cropMode: "fit" | "fill";
  resolution: "480p" | "720p" | "1080p" | "1440p" | "4k";
}
interface VideoEditorProps {
  videoId: string;
  videoUrl: string;
  duration: number;
  originalName: string;
  originalResolution?: string;
  projectId?: string;
  initialEdits?: {
    start_time: number;
    end_time: number;
  }[];
  initialProjectName?: string;
  initialFormatSettings?: FormatSettings;
  onBack: () => void;
  visitorId?: string;
}
export const VideoEditor = ({
  videoId,
  videoUrl,
  duration,
  originalName,
  originalResolution,
  projectId,
  initialEdits,
  initialProjectName,
  initialFormatSettings,
  visitorId,
  onBack
}: VideoEditorProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoFileRef = useRef<File | null>(null);
  const {
    toast
  } = useToast();
  const {
    logAction
  } = useAuditLog();
  const {
    trimVideo,
    loadFFmpeg,
    isLoading: isTrimming,
    isFFmpegLoaded,
    progress
  } = useVideoEditor();
  const defaultProjectName = initialProjectName || originalName.replace(/\.[^/.]+$/, "") + " - Edited";
  const defaultFormatSettings: FormatSettings = {
    aspectRatio: initialFormatSettings?.aspectRatio || "16:9",
    cropMode: initialFormatSettings?.cropMode || "fit",
    resolution: initialFormatSettings?.resolution || "1080p"
  };

  // Convert initial edits to segments with IDs
  const initialSegments: Segment[] = initialEdits && initialEdits.length > 0 ? initialEdits.map((edit, index) => ({
    id: `segment-${index}`,
    start_time: edit.start_time,
    end_time: edit.end_time
  })) : [{
    id: 'segment-0',
    start_time: 0,
    end_time: duration
  }];
  const [projectName, setProjectName] = useState(defaultProjectName);
  const [segments, setSegments] = useState<Segment[]>(initialSegments);
  const [activeSegmentId, setActiveSegmentId] = useState<string>(initialSegments[0].id);
  const [editingSegmentId, setEditingSegmentId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [formatSettings, setFormatSettings] = useState<FormatSettings>(defaultFormatSettings);
  const [loadingVideo, setLoadingVideo] = useState(false);
  const [exportSpeed, setExportSpeed] = useState<"quality" | "fast">("quality");
  const [exportMode, setExportMode] = useState<"combined" | "separate">("separate");
  const [videoPlayerWidth, setVideoPlayerWidth] = useState(40);
  const {
    isVisitor
  } = useUserRole();
  const activeSegment = segments.find(s => s.id === activeSegmentId) || segments[0];

  // Load video file once for trimming
  useEffect(() => {
    const loadVideoFile = async () => {
      if (videoFileRef.current) return; // Already loaded

      setLoadingVideo(true);
      try {
        const response = await fetch(videoUrl);
        const blob = await response.blob();
        const file = new File([blob], originalName, {
          type: 'video/mp4'
        });
        videoFileRef.current = file;
      } catch (error) {
        console.error('Failed to load video file:', error);
        toast({
          title: "Error",
          description: "Failed to load video file for editing",
          variant: "destructive"
        });
      } finally {
        setLoadingVideo(false);
      }
    };
    loadVideoFile();
  }, [videoUrl, originalName, toast]);
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const handleTimeUpdate = () => {
      const time = video.currentTime;
      setCurrentTime(time);

      // Check if we've passed the end of the active segment
      if (time >= activeSegment.end_time) {
        // Find next segment in sequence
        const currentIndex = segments.findIndex(s => s.id === activeSegmentId);
        const nextSegment = segments[currentIndex + 1];
        if (nextSegment && isPlaying) {
          // Jump to next segment
          video.currentTime = nextSegment.start_time;
          setActiveSegmentId(nextSegment.id);
        } else {
          // No more segments, loop back to first segment
          video.currentTime = segments[0].start_time;
          setActiveSegmentId(segments[0].id);
          if (!isPlaying) {
            video.pause();
          }
        }
      } else if (time < activeSegment.start_time) {
        // Jumped outside segment bounds, reset to start
        video.currentTime = activeSegment.start_time;
      }
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [activeSegment, activeSegmentId, segments, isPlaying]);
  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
    } else {
      // Start from beginning of active segment if at the end or outside
      if (video.currentTime >= activeSegment.end_time || video.currentTime < activeSegment.start_time) {
        video.currentTime = activeSegment.start_time;
      }
      video.play();
    }
  };
  const handleSeek = (time: number, segmentId?: string) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = time;
    setCurrentTime(time);
    if (segmentId) {
      setActiveSegmentId(segmentId);
    }
  };
  const handleAddSegment = () => {
    const newSegment: Segment = {
      id: `segment-${Date.now()}`,
      start_time: 0,
      end_time: Math.min(10, duration)
    };
    setSegments([...segments, newSegment]);
    setActiveSegmentId(newSegment.id);
    setEditingSegmentId(newSegment.id);
    toast({
      title: "Segment added",
      description: "New segment created. Adjust the markers to set the range."
    });
  };
  const handleRemoveSegment = (segmentId: string) => {
    if (segments.length === 1) {
      toast({
        title: "Cannot remove",
        description: "At least one segment is required.",
        variant: "destructive"
      });
      return;
    }
    const newSegments = segments.filter(s => s.id !== segmentId);
    setSegments(newSegments);
    if (activeSegmentId === segmentId) {
      setActiveSegmentId(newSegments[0].id);
    }
    toast({
      title: "Segment removed",
      description: "Segment has been deleted."
    });
  };
  const handleSegmentTimeChange = (segmentId: string, start: number, end: number) => {
    setSegments(segments.map(s => s.id === segmentId ? {
      ...s,
      start_time: start,
      end_time: end
    } : s));
  };
  const handleSaveProject = async () => {
    if (!projectName.trim()) {
      toast({
        title: "Project name required",
        description: "Please enter a name for your project.",
        variant: "destructive"
      });
      return;
    }
    setSaving(true);
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      const isVisitor = !!visitorId && !user;
      const editsData = segments.map(segment => ({
        start_time: segment.start_time,
        end_time: segment.end_time
      }));
      if (isVisitor) {
        // For visitors: update existing or create new project
        console.log('Visitor mode: Saving project with visitor_id', visitorId, 'projectId', projectId);
        if (projectId) {
          // Update existing visitor project
          const {
            error
          } = await supabase.from('projects').update({
            name: projectName,
            edits_json: editsData as any,
            format_settings_json: formatSettings as any
          }).eq('id', projectId);
          if (error) throw error;
          toast({
            title: "Demo project updated",
            description: "Your changes have been saved.",
            duration: 5000
          });
        } else {
          // Create new visitor project
          const projectData = {
            video_id: videoId,
            name: projectName,
            edits_json: editsData as any,
            format_settings_json: formatSettings as any,
            user_id: null,
            // NULL for visitors
            visitor_id: visitorId,
            is_visitor: true
          };
          const {
            error
          } = await supabase.from('projects').insert([projectData]);
          if (error) throw error;
          toast({
            title: "Demo project saved",
            description: "Your project is saved temporarily. Sign up to save permanently.",
            duration: 5000
          });
        }
        setSaving(false);
        onBack(); // Navigate back to show projects list
        return;
      }

      // For authenticated users: proceed with database operations
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to save projects.",
          variant: "destructive"
        });
        setSaving(false);
        return;
      }
      if (projectId) {
        // Update existing project
        const {
          error
        } = await supabase.from('projects').update({
          name: projectName,
          edits_json: editsData as any,
          format_settings_json: formatSettings as any
        }).eq('id', projectId);
        if (error) throw error;

        // Log project update
        await logAction({
          entity: 'project',
          action: 'updated',
          entityId: projectId,
          payload: {
            name: projectName,
            segments_count: segments.length
          }
        });
        toast({
          title: "Project updated",
          description: `"${projectName}" has been updated successfully.`
        });
      } else {
        // Create new project
        const projectData = {
          video_id: videoId,
          name: projectName,
          edits_json: editsData as any,
          format_settings_json: formatSettings as any,
          user_id: user.id,
          is_visitor: false
        };
        const {
          data: newProject,
          error
        } = await supabase.from('projects').insert([projectData]).select().single();
        if (error) throw error;

        // Log project creation
        if (newProject) {
          await logAction({
            entity: 'project',
            action: 'created',
            entityId: newProject.id,
            payload: {
              name: projectName,
              segments_count: segments.length
            }
          });
        }
        toast({
          title: "Project saved",
          description: `"${projectName}" has been saved successfully.`
        });
      }
      onBack();
    } catch (error: any) {
      console.error('Save project error:', error);
      toast({
        title: "Failed to save project",
        description: error.message || "An error occurred while saving the project.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };
  const handleSaveTrimmedVideo = async () => {
    if (!videoFileRef.current) {
      toast({
        title: "Error",
        description: "Video file not loaded yet",
        variant: "destructive"
      });
      return;
    }
    if (segments.length === 0) {
      toast({
        title: "No segments defined",
        description: "Create at least one segment to trim",
        variant: "destructive"
      });
      return;
    }
    setSaving(true);
    try {
      // Load FFmpeg if not already loaded
      if (!isFFmpegLoaded) {
        toast({
          title: "Loading video editor",
          description: "Initializing FFmpeg library..."
        });
        const loaded = await loadFFmpeg();
        if (!loaded) {
          throw new Error('Failed to initialize video editor');
        }
      }
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      const isVisitorMode = !!visitorId && !user;

      const {
        formatResolutionString
      } = await import('@/lib/videoFormatUtils');
      const resolutionStr = formatResolutionString(formatSettings);

      if (exportMode === "separate") {
        // Export each segment as a separate file
        for (let i = 0; i < segments.length; i++) {
          const segment = segments[i];
          const isDefaultFormat = formatSettings.aspectRatio === "16:9" && formatSettings.cropMode === "fit" && formatSettings.resolution === "1080p";
          toast({
            title: `Processing segment ${i + 1}/${segments.length}`,
            description: isDefaultFormat ? `Trimming from ${segment.start_time.toFixed(2)}s to ${segment.end_time.toFixed(2)}s` : `Converting to ${formatSettings.aspectRatio} ${formatSettings.resolution} (${formatSettings.cropMode})`
          });

          // Trim the video with format settings and export speed
          const trimmedBlob = await trimVideo(videoFileRef.current, segment.start_time, segment.end_time, formatSettings, exportSpeed);
          if (!trimmedBlob) {
            throw new Error(`Failed to trim segment ${i + 1}`);
          }
          toast({
            title: `Uploading segment ${i + 1}/${segments.length}`,
            description: "Saving to storage..."
          });

          // Upload to storage
          const filePath = isVisitorMode ? `${visitorId}/${projectId || videoId}/trimmed_${Date.now()}_${i + 1}.mp4` : `${user?.id}/${projectId || videoId}/trimmed_${Date.now()}_${i + 1}.mp4`;
          const {
            error: uploadError
          } = await supabase.storage.from('videos').upload(filePath, trimmedBlob, {
            contentType: 'video/mp4',
            upsert: true
          });
          if (uploadError) {
            throw new Error(`Upload failed: ${uploadError.message}`);
          }

          // Download the segment locally with format info in filename
          const downloadUrl = URL.createObjectURL(trimmedBlob);
          const a = document.createElement('a');
          a.href = downloadUrl;
          a.download = `${projectName}_${resolutionStr}_${formatSettings.aspectRatio.replace(':', 'x')}_segment_${i + 1}.mp4`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(downloadUrl);
        }
        toast({
          title: "Success!",
          description: `${segments.length} trimmed video(s) saved and downloaded`
        });
      } else {
        // Export all segments as one combined file
        toast({
          title: "Processing segments",
          description: "Trimming and preparing segments for merging..."
        });

        // First, process all segments
        const trimmedBlobs: Blob[] = [];
        for (let i = 0; i < segments.length; i++) {
          const segment = segments[i];
          toast({
            title: `Processing segment ${i + 1}/${segments.length}`,
            description: `Trimming from ${segment.start_time.toFixed(2)}s to ${segment.end_time.toFixed(2)}s`
          });

          const trimmedBlob = await trimVideo(videoFileRef.current, segment.start_time, segment.end_time, formatSettings, exportSpeed);
          if (!trimmedBlob) {
            throw new Error(`Failed to trim segment ${i + 1}`);
          }
          trimmedBlobs.push(trimmedBlob);
        }

        // Now concatenate all segments
        toast({
          title: "Merging segments",
          description: "Combining all segments into one video..."
        });

        const { concatenateVideos } = await import('@/hooks/useVideoEditor');
        const combinedBlob = await concatenateVideos(trimmedBlobs);

        toast({
          title: "Uploading combined video",
          description: "Saving to storage..."
        });

        // Upload to storage
        const filePath = isVisitorMode ? `${visitorId}/${projectId || videoId}/combined_${Date.now()}.mp4` : `${user?.id}/${projectId || videoId}/combined_${Date.now()}.mp4`;
        const {
          error: uploadError
        } = await supabase.storage.from('videos').upload(filePath, combinedBlob, {
          contentType: 'video/mp4',
          upsert: true
        });
        if (uploadError) {
          throw new Error(`Upload failed: ${uploadError.message}`);
        }

        // Download the combined video
        const downloadUrl = URL.createObjectURL(combinedBlob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `${projectName}_${resolutionStr}_${formatSettings.aspectRatio.replace(':', 'x')}_combined.mp4`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(downloadUrl);

        toast({
          title: "Success!",
          description: "Combined video saved and downloaded"
        });
      }

      // Log action for authenticated users
      if (!isVisitorMode && projectId) {
        await logAction({
          entity: 'project',
          action: 'exported',
          entityId: projectId,
          payload: {
            name: projectName,
            segments_count: segments.length,
            export_mode: exportMode
          }
        });
      }
    } catch (error) {
      console.error('Error saving trimmed video:', error);
      const message = error instanceof Error ? error.message : "Failed to process video trim";
      toast({
        title: "Error",
        description: message,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };
  const handleExport = handleSaveTrimmedVideo; // Alias for backward compatibility

  const getTotalDuration = () => {
    return segments.reduce((total, segment) => {
      return total + (segment.end_time - segment.start_time);
    }, 0);
  };
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  const getAvailableResolutions = () => {
    const resolutions = [{
      value: "480p",
      label: "480p (854x480)",
      height: 480
    }, {
      value: "720p",
      label: "720p (1280x720)",
      height: 720
    }, {
      value: "1080p",
      label: "1080p (1920x1080)",
      height: 1080
    }, {
      value: "1440p",
      label: "1440p (2560x1440)",
      height: 1440
    }, {
      value: "4k",
      label: "4K (3840x2160)",
      height: 2160
    }];
    if (!originalResolution) return resolutions;

    // Parse original resolution to get height
    const heightMatch = originalResolution.match(/(\d+)x(\d+)/);
    if (!heightMatch) return resolutions;
    const originalHeight = parseInt(heightMatch[2]);

    // Filter resolutions to only show options up to the original video quality
    return resolutions.filter(res => res.height <= originalHeight);
  };
  const getVideoContainerStyle = () => {
    const aspectRatios = {
      "16:9": 16 / 9,
      "9:16": 9 / 16,
      "1:1": 1
    };
    const ratio = aspectRatios[formatSettings.aspectRatio] || aspectRatios["16:9"];
    return {
      aspectRatio: ratio.toString(),
      maxWidth: "100%",
      margin: "0 auto"
    };
  };
  const getVideoStyle = () => {
    return {
      objectFit: formatSettings.cropMode === "fill" ? "cover" : "contain"
    } as React.CSSProperties;
  };
  return <Card className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h2 className="text-2xl font-bold">Edit Video</h2>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSaveTrimmedVideo} disabled={isTrimming || saving || loadingVideo || !projectId} variant="default" className="gap-2">
            <Download className="h-4 w-4" />
            {isTrimming || saving ? "Processing..." : isVisitor ? "Export (Watermarked)" : "Export"}
          </Button>
          <Button onClick={handleSaveProject} disabled={saving} variant="secondary" className="gap-2">
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {isTrimming && <Card className="p-6 bg-primary/5 border-primary/20">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Exporting Video</h3>
              <Badge variant="secondary">{Math.round(progress)}%</Badge>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground">
              {progress < 30 && "Initializing encoding..."}
              {progress >= 30 && progress < 70 && "Encoding video frames..."}
              {progress >= 70 && progress < 95 && "Finalizing video..."}
              {progress >= 95 && "Almost done..."}
            </p>
            <p className="text-sm font-medium text-primary">⚠️ Do not close this window until the export is complete.</p>
          </div>
        </Card>}

      <div className="space-y-2">
        <Label htmlFor="project-name">Project Name</Label>
        <Input id="project-name" value={projectName} onChange={e => setProjectName(e.target.value)} placeholder="Enter project name..." />
      </div>

      <div className="space-y-4">
        <h3 className="text-base font-normal text-[hsl(var(--label))]">Format Settings</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="aspect-ratio">Aspect Ratio</Label>
            <Select value={formatSettings.aspectRatio} onValueChange={(value: FormatSettings["aspectRatio"]) => setFormatSettings({
            ...formatSettings,
            aspectRatio: value
          })}>
              <SelectTrigger id="aspect-ratio">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="16:9">16:9 (Horizontal)</SelectItem>
                <SelectItem value="9:16">9:16 (Vertical)</SelectItem>
                <SelectItem value="1:1">1:1 (Square)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="crop-mode">Crop Mode</Label>
            <Select value={formatSettings.cropMode} onValueChange={(value: FormatSettings["cropMode"]) => setFormatSettings({
            ...formatSettings,
            cropMode: value
          })}>
              <SelectTrigger id="crop-mode">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fit">Fit (Add Bars)</SelectItem>
                <SelectItem value="fill">Fill (Crop Edges)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {formatSettings.cropMode === "fit" ? "Video will be letterboxed/pillarboxed to fit" : "Video will be cropped to fill the frame"}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="resolution">Resolution</Label>
            <Select value={formatSettings.resolution} onValueChange={(value: FormatSettings["resolution"]) => setFormatSettings({
            ...formatSettings,
            resolution: value
          })}>
              <SelectTrigger id="resolution">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {getAvailableResolutions().map(res => <SelectItem key={res.value} value={res.value}>
                    {res.label}
                  </SelectItem>)}
              </SelectContent>
            </Select>
            {originalResolution && <p className="text-xs text-muted-foreground">
                Original: {originalResolution}
              </p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
          <div className="space-y-2">
            <Label htmlFor="export-speed">Export Speed</Label>
            <Select value={exportSpeed} onValueChange={(value: "quality" | "fast") => setExportSpeed(value)}>
              <SelectTrigger id="export-speed">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="quality">Quality (Recommended)</SelectItem>
                <SelectItem value="fast">Fast Export (2x faster)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {exportSpeed === "quality" ? "Best quality with superfast encoding" : "Fastest processing with ultrafast encoding"}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="export-mode">Export Mode</Label>
            <Select value={exportMode} onValueChange={(value: "combined" | "separate") => setExportMode(value)}>
              <SelectTrigger id="export-mode">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="separate">Separate Files</SelectItem>
                <SelectItem value="combined">One Combined File</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {exportMode === "separate" 
                ? `Export ${segments.length} separate video file${segments.length > 1 ? 's' : ''}` 
                : `Merge all ${segments.length} segment${segments.length > 1 ? 's' : ''} into one video`}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base font-normal text-[hsl(var(--label))]">Video Preview</h3>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[hsl(var(--label))]">Video player size</span>
            <Slider 
              value={[videoPlayerWidth]} 
              onValueChange={value => setVideoPlayerWidth(value[0])} 
              min={30} 
              max={70} 
              step={5} 
              className="w-32 [&_.absolute.h-full]:bg-[#A3A8C1] [&_.h-5.w-5]:border-[#A3A8C1]" 
            />
            
          </div>
        </div>
        <div className="relative bg-black rounded-lg overflow-hidden mx-auto" style={{
        width: `${videoPlayerWidth}%`,
        ...getVideoContainerStyle()
      }}>
          <video ref={videoRef} src={videoUrl} className="w-full h-full" style={getVideoStyle()} onLoadedMetadata={() => {
          if (videoRef.current && segments.length > 0) {
            videoRef.current.currentTime = segments[0].start_time;
          }
        }} />
        </div>
        
        {/* Multi-segment timeline visualization */}
        <div className="space-y-2 px-4">
          <div className="flex items-center justify-between text-xs text-[hsl(var(--label))]">
            <span>0:00</span>
            <span>Timeline Overview</span>
            <span>{formatTime(duration)}</span>
          </div>
          <div className="relative h-8 bg-muted rounded-md overflow-hidden">
            {segments.map((segment, index) => {
              const startPercent = (segment.start_time / duration) * 100;
              const widthPercent = ((segment.end_time - segment.start_time) / duration) * 100;
              return (
                <div
                  key={segment.id}
                  className="absolute top-0 bottom-0 bg-[#A3A8C1] hover:bg-[#A3A8C1]/90 transition-colors cursor-pointer border-l-2 border-r-2 border-primary-foreground/20"
                  style={{
                    left: `${startPercent}%`,
                    width: `${widthPercent}%`
                  }}
                  title={`Segment ${index + 1}: ${formatTime(segment.start_time)} - ${formatTime(segment.end_time)}`}
                  onClick={() => setActiveSegmentId(segment.id)}
                >
                  <div className="flex items-center justify-center h-full text-[10px] font-semibold text-white">
                    {index + 1}
                  </div>
                </div>
              );
            })}
            {/* Current playback position indicator */}
            {currentTime > 0 && (
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
                style={{
                  left: `${(currentTime / duration) * 100}%`
                }}
              />
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-[#A3A8C1] rounded-sm"></div>
              <span>Kept segments</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-muted rounded-sm border border-border"></div>
              <span>Trimmed parts</span>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button size="lg" variant="secondary" onClick={handlePlayPause} className="gap-2">
            {isPlaying ? <>
                <Pause className="h-5 w-5" />
                Pause
              </> : <>
                <Play className="h-5 w-5" />
                Play Preview
              </>}
          </Button>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-normal text-[hsl(var(--label))]">Segments</h3>
          <Button onClick={handleAddSegment} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Segment
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">Click on a segment below to select it and to adjust start and end times using the timeline. You can add multiple segments to create a compilation from different parts of your video.</p>

        <div className="space-y-2 max-h-48 overflow-y-auto">
          {segments.map((segment, index) => <div key={segment.id} className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${activeSegmentId === segment.id ? 'border-border bg-[#101321] text-white' : 'border-border hover:border-primary/50'}`} onClick={() => {
          setActiveSegmentId(segment.id);
          handleSeek(segment.start_time, segment.id);
        }}>
              <Badge variant={activeSegmentId === segment.id ? "default" : "secondary"}>
                #{index + 1}
              </Badge>
              <div className="flex-1 text-sm">
                <span className="font-medium">
                  {formatTime(segment.start_time)} - {formatTime(segment.end_time)}
                </span>
                <span className={activeSegmentId === segment.id ? "text-white/70 ml-2" : "text-muted-foreground ml-2"}>
                  ({formatTime(segment.end_time - segment.start_time)})
                </span>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={e => {
              e.stopPropagation();
              setEditingSegmentId(segment.id === editingSegmentId ? null : segment.id);
              setActiveSegmentId(segment.id);
            }}>
                  <Edit2 className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={e => {
              e.stopPropagation();
              handleRemoveSegment(segment.id);
            }} disabled={segments.length === 1}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>)}
        </div>
      </div>

      {editingSegmentId && <Timeline duration={duration} currentTime={currentTime} startTime={activeSegment.start_time} endTime={activeSegment.end_time} onStartTimeChange={time => handleSegmentTimeChange(activeSegmentId, time, activeSegment.end_time)} onEndTimeChange={time => handleSegmentTimeChange(activeSegmentId, activeSegment.start_time, time)} onSeek={time => handleSeek(time, activeSegmentId)} videoElement={videoRef.current} />}

      <div className="flex gap-4 text-sm text-muted-foreground">
        <div>
          <span className="font-medium">Original Duration:</span> {formatTime(duration)}
        </div>
        <div>
          <span className="font-medium">Total Output Duration:</span> {formatTime(getTotalDuration())}
        </div>
        <div>
          <span className="font-medium">Segments:</span> {segments.length}
        </div>
      </div>


    </Card>;
};