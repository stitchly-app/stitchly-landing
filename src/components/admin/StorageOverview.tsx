import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Cloud, Users, Video, Upload, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StorageStats {
  totalSize: number;
  videoCount: number;
  exportCount: number;
  userCount: number;
  storageByRole: {
    visitor: number;
    user: number;
    admin: number;
  };
}

interface SystemSettings {
  storage_limit_gb: number;
}

export const StorageOverview = () => {
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [storageLimitGB, setStorageLimitGB] = useState(10);

  useEffect(() => {
    fetchStorageStats();
    fetchStorageLimit();

    // Set up realtime subscription for videos table
    const channel = supabase
      .channel('storage-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'videos'
        },
        () => {
          fetchStorageStats();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'exports'
        },
        () => {
          fetchStorageStats();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'system_settings'
        },
        () => {
          fetchStorageLimit();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchStorageLimit = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('storage_limit_gb')
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0 && data[0]?.storage_limit_gb) {
        setStorageLimitGB(data[0].storage_limit_gb);
      }
    } catch (error) {
      console.error('Error fetching storage limit:', error);
    }
  };

  const fetchStorageStats = async (manual = false) => {
    if (manual) setRefreshing(true);
    try {
      // Get all videos
      const { data: videos } = await supabase
        .from('videos')
        .select('size, user_id, is_visitor');

      // Get all user roles
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('user_id, role');

      // Get total counts
      const { count: videoCount } = await supabase
        .from('videos')
        .select('*', { count: 'exact', head: true });

      const { count: exportCount } = await supabase
        .from('exports')
        .select('*', { count: 'exact', head: true });

      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Create a map of user_id to role
      const roleMap = new Map(
        userRoles?.map(ur => [ur.user_id, ur.role]) || []
      );

      // Calculate storage by role
      const storageByRole = {
        visitor: 0,
        user: 0,
        admin: 0,
      };

      let totalSize = 0;

      videos?.forEach((video: any) => {
        const size = video.size || 0;
        totalSize += size;
        
        // Check if it's a visitor video or get role from map
        const role = video.is_visitor ? 'visitor' : roleMap.get(video.user_id);
        if (role && role in storageByRole) {
          storageByRole[role as keyof typeof storageByRole] += size;
        }
      });

      setStats({
        totalSize,
        videoCount: videoCount || 0,
        exportCount: exportCount || 0,
        userCount: userCount || 0,
        storageByRole,
      });
    } catch (error) {
      console.error('Error fetching storage stats:', error);
    } finally {
      setLoading(false);
      if (manual) setRefreshing(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-64" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!stats) return null;

  const storageLimit = storageLimitGB * 1024 * 1024 * 1024; // Convert GB to bytes
  const storagePercent = (stats.totalSize / storageLimit) * 100;

  return (
    <div className="space-y-6">
      {/* Cloud Storage Usage Card */}
      <Card className="border border-border rounded-lg bg-card p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-3">
            <div className="p-3 border-2 border-teal-500/30 rounded-lg bg-teal-500/10">
              <Cloud className="h-6 w-6 text-teal-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Cloud Storage Usage</h2>
              <p className="text-sm text-muted-foreground mt-0.5">Real-time monitoring of total storage consumption</p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fetchStorageStats(true)}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-foreground">{formatBytes(stats.totalSize)}</span>
            <span className="text-lg text-muted-foreground">used</span>
          </div>
          
          <div className="flex justify-between items-center text-sm mb-2">
            <span className="text-muted-foreground">Plan limit: {storageLimitGB}GB</span>
            <span className="text-muted-foreground">
              {storagePercent.toFixed(1)}% utilized
            </span>
          </div>
          
          <Progress 
            value={storagePercent} 
            className="h-2 bg-[#343750] [&>div]:bg-[#A3A8C1]"
          />
          
          <div className="flex justify-between text-sm text-muted-foreground pt-2">
            <span>{stats.videoCount} videos stored</span>
            <span>{stats.exportCount} exports created</span>
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border border-border rounded-lg bg-card p-6">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-base font-medium text-foreground">Total Videos</h3>
            <div className="p-2.5 border-2 border-teal-500/30 rounded-lg bg-teal-500/10">
              <Video className="h-5 w-5 text-teal-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground">{stats.videoCount}</p>
        </Card>

        <Card className="border border-border rounded-lg bg-card p-6">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-base font-medium text-foreground">Completed Exports</h3>
            <div className="p-2.5 border-2 border-teal-500/30 rounded-lg bg-teal-500/10">
              <Upload className="h-5 w-5 text-teal-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground">{stats.exportCount}</p>
        </Card>

        <Card className="border border-border rounded-lg bg-card p-6">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-base font-medium text-foreground">Total Users</h3>
            <div className="p-2.5 border-2 border-teal-500/30 rounded-lg bg-teal-500/10">
              <Users className="h-5 w-5 text-teal-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground">{stats.userCount}</p>
        </Card>
      </div>

      {/* Storage Usage Breakdown */}
      <Card className="border border-border rounded-lg bg-card p-6">
        <h3 className="text-xl font-semibold text-foreground mb-6">Storage Usage</h3>
        <div className="space-y-6">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-muted-foreground">Overall usage</span>
              <span className="text-sm text-muted-foreground">
                {formatBytes(stats.totalSize)} / {storageLimitGB}GB ({storagePercent.toFixed(1)}%)
              </span>
            </div>
            <Progress value={storagePercent} className="h-2 bg-[#343750] [&>div]:bg-[#A3A8C1]" />
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">Visitors</span>
                <span className="text-sm text-muted-foreground">{formatBytes(stats.storageByRole.visitor)}</span>
              </div>
              <Progress 
                value={stats.totalSize > 0 ? (stats.storageByRole.visitor / stats.totalSize) * 100 : 0} 
                className="h-2 bg-[#343750] [&>div]:bg-[#A3A8C1]" 
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">Users</span>
                <span className="text-sm text-muted-foreground">{formatBytes(stats.storageByRole.user)}</span>
              </div>
              <Progress 
                value={stats.totalSize > 0 ? (stats.storageByRole.user / stats.totalSize) * 100 : 0} 
                className="h-2 bg-[#343750] [&>div]:bg-[#A3A8C1]" 
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">Admins</span>
                <span className="text-sm text-muted-foreground">{formatBytes(stats.storageByRole.admin)}</span>
              </div>
              <Progress 
                value={stats.totalSize > 0 ? (stats.storageByRole.admin / stats.totalSize) * 100 : 0} 
                className="h-2 bg-[#343750] [&>div]:bg-[#A3A8C1]" 
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
