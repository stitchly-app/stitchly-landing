import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart3, Clock, FileVideo, TrendingUp } from 'lucide-react';

interface UserStats {
  totalProjects: number;
  totalVideos: number;
  totalExports: number;
  formatBreakdown: Record<string, number>;
  recentActivity: Array<{
    action: string;
    entity: string;
    timestamp: string;
  }>;
}

export const UserReports = () => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch project count
      const { count: projectCount } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Fetch video count
      const { count: videoCount } = await supabase
        .from('videos')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Fetch user's project IDs first
      const { data: userProjects } = await supabase
        .from('projects')
        .select('id')
        .eq('user_id', user.id);

      const projectIds = (userProjects || []).map(p => p.id);

      // Fetch export count and format breakdown
      const { data: exports } = projectIds.length > 0 ? await supabase
        .from('exports')
        .select('format')
        .eq('status', 'done')
        .in('project_id', projectIds) : { data: [] };

      const formatBreakdown = (exports || []).reduce((acc: Record<string, number>, exp) => {
        acc[exp.format] = (acc[exp.format] || 0) + 1;
        return acc;
      }, {});

      // Fetch recent activity from audit log
      const { data: recentLogs } = await supabase
        .from('audit_log')
        .select('action, entity, created_at')
        .eq('actor_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      setStats({
        totalProjects: projectCount || 0,
        totalVideos: videoCount || 0,
        totalExports: exports?.length || 0,
        formatBreakdown,
        recentActivity: (recentLogs || []).map(log => ({
          action: log.action,
          entity: log.entity,
          timestamp: log.created_at,
        })),
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Videos</CardTitle>
            <FileVideo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVideos}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Exports</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalExports}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activity</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentActivity.length}</div>
            <p className="text-xs text-muted-foreground">Recent actions</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Export Formats Used</CardTitle>
            <CardDescription>Breakdown of export formats</CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(stats.formatBreakdown).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(stats.formatBreakdown).map(([format, count]) => (
                  <div key={format} className="flex items-center justify-between">
                    <span className="text-sm font-medium uppercase">{format}</span>
                    <span className="text-sm text-muted-foreground">{count} exports</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No exports yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest actions</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentActivity.length > 0 ? (
              <div className="space-y-2">
                {stats.recentActivity.slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span>
                      <span className="font-medium capitalize">{activity.action}</span>{' '}
                      <span className="text-muted-foreground">{activity.entity}</span>
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No recent activity</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
