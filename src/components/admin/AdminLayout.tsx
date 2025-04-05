
import { useState, useEffect } from "react";
import { Outlet, Navigate, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  LucideIcon,
  Home, 
  User, 
  Briefcase, 
  FolderKanban, 
  Lightbulb, 
  Award, 
  BookOpen, 
  Link as LinkIcon,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

// Mock auth for now - would be replaced with actual JWT auth
const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Check for token in localStorage
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    setIsAuthenticated(!!token);
  }, []);
  
  const login = (email: string, password: string) => {
    // This would be replaced with an actual API call
    if (email === "admin@abhinav.ai" && password === "admin123") {
      localStorage.setItem("adminToken", "mock-jwt-token");
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };
  
  const logout = () => {
    localStorage.removeItem("adminToken");
    setIsAuthenticated(false);
  };
  
  return { isAuthenticated, login, logout };
};

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  path: string;
  isActive: boolean;
  onClick: () => void;
}

const SidebarItem = ({ icon: Icon, label, path, isActive, onClick }: SidebarItemProps) => {
  return (
    <motion.div
      whileHover={{ x: 5 }}
      whileTap={{ scale: 0.97 }}
      className={`relative w-full ${isActive ? "font-medium" : ""}`}
    >
      {isActive && (
        <motion.div
          layoutId="sidebar-indicator"
          className="absolute left-0 w-1 h-full rounded-r-full bg-tech-accent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        />
      )}
      <Button
        variant="ghost" 
        className={`w-full justify-start px-4 py-6 h-auto ${
          isActive 
            ? "bg-tech-glass text-tech-accent" 
            : "hover:bg-tech-glass/40"
        }`}
        onClick={onClick}
      >
        <Icon size={18} className={`mr-3 ${isActive ? "text-tech-accent" : ""}`} />
        {label}
      </Button>
    </motion.div>
  );
};

const navigationItems = [
  { icon: Home, label: "Dashboard", path: "/admin" },
  { icon: User, label: "Hero & About", path: "/admin/hero" },
  { icon: Briefcase, label: "Experience", path: "/admin/experience" },
  { icon: FolderKanban, label: "Projects", path: "/admin/projects" },
  { icon: Lightbulb, label: "Skills", path: "/admin/skills" },
  { icon: Award, label: "Certifications", path: "/admin/certifications" },
  { icon: BookOpen, label: "Publications", path: "/admin/publications" },
  { icon: LinkIcon, label: "Social Links", path: "/admin/social" },
];

export function AdminLayout() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  
  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate("/admin/login");
  };
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  const handleNavigate = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="glass border-b border-white/10 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
            <motion.h1 
              className="text-xl font-semibold bg-gradient-tech bg-clip-text text-transparent"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              Admin Panel
            </motion.h1>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => navigate("/")}
            >
              <span>View Site</span>
            </Button>
            
            <Avatar className="w-8 h-8">
              <AvatarImage src="/lovable-uploads/0f976acc-d38b-4ac7-96a7-02ccc53846b5.png" alt="Admin" />
              <AvatarFallback>AS</AvatarFallback>
            </Avatar>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-muted-foreground hover:text-white hover:bg-destructive/10"
              onClick={handleLogout}
            >
              <LogOut size={18} />
            </Button>
          </div>
        </div>
      </header>
      
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Mobile Sidebar */}
        {isMobileMenuOpen && (
          <motion.div 
            className="md:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="h-full w-3/4 max-w-xs bg-background overflow-y-auto"
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <div className="p-4 space-y-1">
                {navigationItems.map((item) => (
                  <SidebarItem 
                    key={item.path}
                    icon={item.icon}
                    label={item.label}
                    path={item.path}
                    isActive={location.pathname === item.path}
                    onClick={() => handleNavigate(item.path)}
                  />
                ))}
                
                <Button
                  variant="ghost"
                  className="w-full justify-start mt-4 text-destructive"
                  onClick={handleLogout}
                >
                  <LogOut size={18} className="mr-3" />
                  Logout
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
        
        {/* Desktop Sidebar */}
        <motion.div 
          className="hidden md:block w-64 border-r border-white/10 glass h-[calc(100vh-4rem)] overflow-y-auto"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="p-4 space-y-1">
            {navigationItems.map((item) => (
              <SidebarItem 
                key={item.path}
                icon={item.icon}
                label={item.label}
                path={item.path}
                isActive={location.pathname === item.path}
                onClick={() => navigate(item.path)}
              />
            ))}
          </div>
        </motion.div>
        
        {/* Main Content */}
        <motion.div 
          className="flex-1 p-4 md:p-6 overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Outlet />
        </motion.div>
      </div>
    </div>
  );
}
