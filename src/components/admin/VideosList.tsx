import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Video, RefreshCw, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoItem {
  id: string;
  original_name: string;
  file_url: string;
  thumbnail_url: string | null;
  size: number | null;
  duration: number | null;
  resolution: string | null;
  aspect_ratio: string | null;
  created_at: string;
  user_email: string | null;
  is_visitor: boolean;
}

export const VideosList = () => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async (manual = false) => {
    if (manual) setRefreshing(true);
    try {
      const { data, error } = await supabase
        .from('videos')
        .select(`
          id,
          original_name,
          file_url,
          thumbnail_url,
          size,
          duration,
          resolution,
          aspect_ratio,
          created_at,
          is_visitor,
          user_id,
          profiles!videos_user_id_fkey(email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedVideos = data?.map((video: any) => ({
        id: video.id,
        original_name: video.original_name,
        file_url: video.file_url,
        thumbnail_url: video.thumbnail_url,
        size: video.size,
        duration: video.duration,
        resolution: video.resolution,
        aspect_ratio: video.aspect_ratio,
        created_at: video.created_at,
        user_email: video.profiles?.email || null,
        is_visitor: video.is_visitor,
      })) || [];

      setVideos(formattedVideos);
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
      if (manual) setRefreshing(false);
    }
  };

  const formatBytes = (bytes: number | null) => {
    if (!bytes || bytes === 0) return '-';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Card className="border border-border rounded-lg bg-card p-6">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-64" />
      </Card>
    );
  }

  return (
    <Card className="border border-border rounded-lg bg-card p-6">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-3">
          <div className="p-3 border-2 border-teal-500/30 rounded-lg bg-teal-500/10">
            <Video className="h-6 w-6 text-teal-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">All Videos</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {videos.length} video{videos.length !== 1 ? 's' : ''} in storage
            </p>
          </div>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => fetchVideos(true)}
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {videos.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No videos found
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-muted/50">
                <TableHead className="font-semibold">Thumbnail</TableHead>
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Owner</TableHead>
                <TableHead className="font-semibold">Size</TableHead>
                <TableHead className="font-semibold">Duration</TableHead>
                <TableHead className="font-semibold">Resolution</TableHead>
                <TableHead className="font-semibold">Created</TableHead>
                <TableHead className="font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {videos.map((video) => (
                <TableRow key={video.id} className="hover:bg-muted/30">
                  <TableCell>
                    {video.thumbnail_url ? (
                      <img
                        src={video.thumbnail_url}
                        alt={video.original_name}
                        className="w-16 h-10 object-cover rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-16 h-10 bg-muted rounded flex items-center justify-center">
                        <Video className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium max-w-[200px] truncate">
                    {video.original_name}
                  </TableCell>
                  <TableCell>
                    {video.is_visitor ? (
                      <span className="text-muted-foreground italic">Visitor</span>
                    ) : (
                      <span className="text-foreground">{video.user_email || '-'}</span>
                    )}
                  </TableCell>
                  <TableCell>{formatBytes(video.size)}</TableCell>
                  <TableCell>{formatDuration(video.duration)}</TableCell>
                  <TableCell>{video.resolution || '-'}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(video.created_at)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                    >
                      <a href={video.file_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  );
};
