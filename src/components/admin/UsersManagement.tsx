import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ArrowUpDown, Edit, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditUserDialog } from "./EditUserDialog";
import { InviteUsersDialog } from "./InviteUsersDialog";

interface UserData {
  id: string;
  email: string;
  name: string;
  profile_image: string | null;
  created_at: string;
  role: string;
  storageUsed: number;
  videoCount: number;
  projectCount: number;
  exportCount: number;
}

interface ActivityLog {
  id: string;
  user_email: string;
  action: string;
  entity: string;
  timestamp: string;
}

export const UsersManagement = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortColumn, setSortColumn] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [activitySortColumn, setActivitySortColumn] = useState<string>('timestamp');
  const [activitySortDirection, setActivitySortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [demoRoleOverrides, setDemoRoleOverrides] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const isDemoAccount = (email: string) => {
    return email === 'admin@mail.com' || email === 'test@mail.com';
  };

  const handleDemoRoleUpdate = (userId: string, newRole: string) => {
    setDemoRoleOverrides(prev => ({ ...prev, [userId]: newRole }));
  };

  useEffect(() => {
    fetchUsers();
    fetchActivities();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data: profiles } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          name,
          profile_image,
          created_at,
          user_roles!inner(role)
        `)
        .order('created_at', { ascending: false });

      if (profiles) {
        // Fetch storage and counts for each user
        const usersWithStats = await Promise.all(
          profiles.map(async (profile: any) => {
            const [videosData, projectsData, exportsData] = await Promise.all([
              supabase
                .from('videos')
                .select('size')
                .eq('user_id', profile.id),
              supabase
                .from('projects')
                .select('id', { count: 'exact', head: true })
                .eq('user_id', profile.id),
              supabase
                .from('exports')
                .select('id', { count: 'exact', head: true })
                .in('project_id', 
                  (await supabase.from('projects').select('id').eq('user_id', profile.id)).data?.map(p => p.id) || []
                )
            ]);

            const storageUsed = videosData.data?.reduce((sum, v) => sum + (v.size || 0), 0) || 0;
            const videoCount = videosData.data?.length || 0;
            const projectCount = projectsData.count || 0;
            const exportCount = exportsData.count || 0;

            // Handle user_roles - could be object or array depending on relationship
            const userRole = Array.isArray(profile.user_roles) 
              ? profile.user_roles[0]?.role 
              : profile.user_roles?.role;

            return {
              id: profile.id,
              email: profile.email,
              name: profile.name,
              profile_image: profile.profile_image,
              created_at: profile.created_at,
              role: userRole || 'visitor',
              storageUsed,
              videoCount,
              projectCount,
              exportCount,
            };
          })
        );

        setUsers(usersWithStats);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      const { data: logs } = await supabase
        .from('audit_log')
        .select(`
          id,
          action,
          entity,
          created_at,
          actor_id
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (logs) {
        // Get user emails for activities
        const actorIds = logs.map(log => log.actor_id).filter(Boolean);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, email')
          .in('id', actorIds);

        const profileMap = new Map(profiles?.map(p => [p.id, p.email]) || []);

        const formattedActivities = logs.map(log => ({
          id: log.id,
          user_email: log.actor_id ? profileMap.get(log.actor_id) || 'Unknown' : 'System',
          action: log.action,
          entity: log.entity,
          timestamp: log.created_at,
        }));

        setActivities(formattedActivities);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleActivitySort = (column: string) => {
    if (activitySortColumn === column) {
      setActivitySortDirection(activitySortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setActivitySortColumn(column);
      setActivitySortDirection('asc');
    }
  };

  const sortedUsers = [...users].sort((a, b) => {
    let aValue: any = a[sortColumn as keyof UserData];
    let bValue: any = b[sortColumn as keyof UserData];

    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const sortedActivities = [...activities].sort((a, b) => {
    let aValue: any = a[activitySortColumn as keyof ActivityLog];
    let bValue: any = b[activitySortColumn as keyof ActivityLog];

    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (aValue < bValue) return activitySortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return activitySortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Overview */}
      <Card className="border border-border rounded-lg bg-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-foreground">User Overview</h3>
          <Button onClick={() => setInviteDialogOpen(true)} className="gap-2">
            <UserPlus className="h-4 w-4" />
            Invite Users
          </Button>
        </div>
        <div className="rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-2 hover:text-foreground"
                  >
                    Name
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </TableHead>
                <TableHead className="text-muted-foreground">
                  <button
                    onClick={() => handleSort('email')}
                    className="flex items-center gap-2 hover:text-foreground"
                  >
                    Email
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </TableHead>
                <TableHead className="text-muted-foreground">
                  <button
                    onClick={() => handleSort('role')}
                    className="flex items-center gap-2 hover:text-foreground"
                  >
                    Role
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </TableHead>
                <TableHead className="text-muted-foreground">
                  <button
                    onClick={() => handleSort('projectCount')}
                    className="flex items-center gap-2 hover:text-foreground"
                  >
                    Projects
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </TableHead>
                <TableHead className="text-muted-foreground">
                  <button
                    onClick={() => handleSort('videoCount')}
                    className="flex items-center gap-2 hover:text-foreground"
                  >
                    Videos
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </TableHead>
                <TableHead className="text-muted-foreground">
                  <button
                    onClick={() => handleSort('exportCount')}
                    className="flex items-center gap-2 hover:text-foreground"
                  >
                    Exports
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </TableHead>
                <TableHead className="text-muted-foreground">
                  <button
                    onClick={() => handleSort('storageUsed')}
                    className="flex items-center gap-2 hover:text-foreground"
                  >
                    Storage Used
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                sortedUsers.map((user) => (
                  <TableRow key={user.id} className="border-border">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.profile_image || undefined} />
                          <AvatarFallback className="bg-muted text-foreground">
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-foreground">{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-foreground">{user.email}</TableCell>
                    <TableCell className="text-foreground capitalize">{demoRoleOverrides[user.id] || user.role}</TableCell>
                    <TableCell className="text-foreground">{user.projectCount}</TableCell>
                    <TableCell className="text-foreground">{user.videoCount}</TableCell>
                    <TableCell className="text-foreground">{user.exportCount}</TableCell>
                    <TableCell className="text-foreground">{formatBytes(user.storageUsed)}</TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => {
                          setSelectedUser(user);
                          setEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Recent System Activity */}
      <Card className="border border-border rounded-lg bg-card p-6">
        <h3 className="text-xl font-semibold text-foreground mb-6">Recent System Activity</h3>
        <div className="rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">
                  <button
                    onClick={() => handleActivitySort('user_email')}
                    className="flex items-center gap-2 hover:text-foreground"
                  >
                    User
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </TableHead>
                <TableHead className="text-muted-foreground">
                  <button
                    onClick={() => handleActivitySort('action')}
                    className="flex items-center gap-2 hover:text-foreground"
                  >
                    Action
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </TableHead>
                <TableHead className="text-muted-foreground">
                  <button
                    onClick={() => handleActivitySort('entity')}
                    className="flex items-center gap-2 hover:text-foreground"
                  >
                    Entity
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </TableHead>
                <TableHead className="text-muted-foreground">
                  <button
                    onClick={() => handleActivitySort('timestamp')}
                    className="flex items-center gap-2 hover:text-foreground"
                  >
                    Time
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedActivities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No recent activity
                  </TableCell>
                </TableRow>
              ) : (
                sortedActivities.map((activity) => (
                  <TableRow key={activity.id} className="border-border">
                    <TableCell className="text-foreground">{activity.user_email}</TableCell>
                    <TableCell className="text-foreground capitalize">{activity.action}</TableCell>
                    <TableCell className="text-foreground capitalize">{activity.entity}</TableCell>
                    <TableCell className="text-foreground">{formatTimestamp(activity.timestamp)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <EditUserDialog
        user={selectedUser}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onUserUpdated={() => {
          fetchUsers();
          fetchActivities();
        }}
        isDemoAccount={selectedUser ? isDemoAccount(selectedUser.email) : false}
        onDemoRoleUpdate={handleDemoRoleUpdate}
      />

      <InviteUsersDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
      />
    </div>
  );
};
