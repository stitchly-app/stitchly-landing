import { Video, BarChart3, FolderOpen, Sparkles, ArrowLeft } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useBrandName } from "@/hooks/useBrandName";
import { Button } from "@/components/ui/button";

export const DemoDashboardSidebar = () => {
  const { brandName, logoUrl, loading: loadingBrand } = useBrandName();
  const navigate = useNavigate();

  const menuItems = [
    { title: "Dashboard", path: "/demo", icon: FolderOpen },
    { title: "Projects & Reports", path: "/demo/projects-reports", icon: BarChart3 },
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
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="w-full justify-start mb-4"
        >
          <ArrowLeft className="h-5 w-5 mr-3" />
          <span className="text-sm font-medium">Back to Landing</span>
        </Button>
        
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
                <span className={`text-sm font-medium ${isActive ? 'text-white' : ''}`}>
                  {item.title}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Unlock All Features Button */}
      <div className="px-4 pb-4">
        <Button
          onClick={() => navigate('/auth')}
          className="w-full"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Unlock All Features
        </Button>
      </div>

      {/* Demo User Info */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#40CCB7] to-[#256FFF] flex items-center justify-center">
            <span className="text-white font-semibold text-sm">DEMO</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">Demo User</p>
            <p className="text-xs text-muted-foreground truncate">Limited access</p>
          </div>
        </div>
      </div>
    </div>
  );
};
