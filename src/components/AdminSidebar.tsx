import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  LayoutDashboard, 
  Database, 
  FileText, 
  Users, 
  Settings,
  Video,
  User,
  LogOut
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useBrandName } from "@/hooks/useBrandName";
import { useToast } from "@/hooks/use-toast";

export const AdminSidebar = () => {
  const { brandName, logoUrl, loading: loadingBrand } = useBrandName();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [profileName, setProfileName] = useState<string>('');
  const [profileImage, setProfileImage] = useState<string>('');
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    setLoadingProfile(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoadingProfile(false);
      }
    });
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('name, profile_image')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      setProfileName(data.name);
      setProfileImage(data.profile_image || '');
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut({ scope: 'local' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      navigate('/');
    }
  };

  const menuItems = [
    {
      title: "Dashboard",
      path: "/admin",
      icon: LayoutDashboard
    },
    {
      title: "Exports",
      path: "/admin/exports",
      icon: FileText
    },
    {
      title: "Storage",
      path: "/admin/storage",
      icon: Database
    },
    {
      title: "Users",
      path: "/admin/users",
      icon: Users
    },
    {
      title: "Settings",
      path: "/admin/settings",
      icon: Settings
    }
  ];

  return (
    <div className="w-64 h-screen bg-background border-r border-border flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="p-6 flex items-center gap-2">
        {loadingBrand ? (
          <>
            <div className="h-6 w-6 rounded bg-muted animate-pulse" />
            <div className="h-5 bg-muted rounded w-32 animate-pulse" />
          </>
        ) : (
          <>
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="h-6 w-6 object-contain" />
            ) : (
              <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
                <Video className="h-4 w-4 text-primary-foreground" />
              </div>
            )}
            <span className="text-lg font-semibold text-sidebar-foreground">{brandName}</span>
          </>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                isActive
                  ? "bg-[#40CCB71A]"
                  : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={`h-5 w-5 ${isActive ? 'text-[#40CCB7]' : ''}`} />
                <span className={`text-sm font-medium ${isActive ? 'text-white' : ''}`}>{item.title}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-sidebar-border">
        {loadingProfile ? (
          <div className="flex items-center gap-3 animate-pulse">
            <div className="h-10 w-10 rounded-full bg-muted" />
            <div className="flex-1 min-w-0 space-y-2">
              <div className="h-4 bg-muted rounded w-24" />
              <div className="h-3 bg-muted rounded w-32" />
            </div>
          </div>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 w-full text-left hover:bg-sidebar-accent/50 rounded-lg p-2 transition-colors">
                <Avatar className="h-10 w-10">
                  {profileImage && <AvatarImage src={profileImage} alt={profileName} />}
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">
                    {profileName || user?.user_metadata?.first_name || user?.user_metadata?.name || "Admin User"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email}
                  </p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="gap-2 cursor-pointer">
                <LogOut className="h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
};
